import { HRSystemData } from '../types/hrm';
import { formatVND } from './docExporter';

export interface AiAnalysisResult {
  markdown: string;
  modelUsed: string;
  source: 'gemini' | 'local_fallback';
  timestamp: string;
  error?: string;
}

export function getStoredApiKey(): string {
  const local = localStorage.getItem('gemini_api_key');
  if (local && local.trim()) return local.trim();
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  return '';
}

export function saveStoredApiKey(key: string): void {
  if (key) {
    localStorage.setItem('gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('gemini_api_key');
  }
}

/**
 * Intelligent local analysis as an immediate baseline / offline fallback.
 */
export function generateLocalHRAnalysis(data: HRSystemData, period: string = '09/2026'): string {
  // Aggregate payroll by month
  const currentPayrolls = data.payrolls.filter((p) => p.thang === period);
  const totalNet = currentPayrolls.reduce((sum, p) => sum + p.thucLinh, 0);
  const totalGross = currentPayrolls.reduce((sum, p) => sum + p.tongThuNhap, 0);
  const totalOT = currentPayrolls.reduce((sum, p) => sum + p.tienOT, 0);

  // Compare with 08/2026 or 07/2026
  const prevPeriod = period === '10/2026' ? '09/2026' : period === '09/2026' ? '08/2026' : '07/2026';
  const prevPayrolls = data.payrolls.filter((p) => p.thang === prevPeriod);
  const prevTotalNet = prevPayrolls.reduce((sum, p) => sum + p.thucLinh, 0);
  const netDiff = prevTotalNet > 0 ? ((totalNet - prevTotalNet) / prevTotalNet) * 100 : 0;

  // High OT employees (> 15 hours or > 1.000.000 VND)
  const highOtList = currentPayrolls
    .filter((p) => p.tienOT > 700000)
    .sort((a, b) => b.tienOT - a.tienOT)
    .slice(0, 5);

  // Department payroll breakdown
  const deptSpending: Record<string, number> = {};
  currentPayrolls.forEach((p) => {
    deptSpending[p.phongBan] = (deptSpending[p.phongBan] || 0) + p.thucLinh;
  });

  const sortedDepts = Object.entries(deptSpending).sort((a, b) => b[1] - a[1]);
  const topDept = sortedDepts[0] || ['Xưởng Sản xuất & Vận hành', 0];

  return `### 📊 BÁO CÁO PHÂN TÍCH QUỸ LƯƠNG & THAM MƯU NHÂN SỰ (KỲ ${period})

#### 1. 3 Nhận xét biến động quỹ lương đáng chú ý nhất:
- **Tổng quỹ lương thực lĩnh**: Đạt **${formatVND(totalNet)}** (Tổng thu nhập: **${formatVND(totalGross)}**). ${
    prevTotalNet > 0
      ? `Biến động **${netDiff >= 0 ? '+' : ''}${netDiff.toFixed(1)}%** so với kỳ trước (${prevPeriod} đạt ${formatVND(prevTotalNet)}).`
      : 'Quỹ lương duy trì ổn định theo kế hoạch ngân sách năm.'
  }
- **Bộ phận chiếm tỷ trọng quỹ lương cao nhất**: **${topDept[0]}** chiếm **${formatVND(topDept[1])}** (~${((topDept[1] / (totalNet || 1)) * 100).toFixed(1)}% toàn công ty) do đặc thù quy mô định biên lớn nhất (${data.departments.find((d) => d.name === topDept[0])?.dinhBien || 18} nhân sự).
- **Chi phí làm thêm giờ (OT)**: Tổng tiền chi trả OT trong kỳ là **${formatVND(totalOT)}**, tập trung cao điểm vào giai đoạn hoàn tất đơn hàng và bảo trì công nghệ cuối quý.

#### 2. Danh sách nhân sự tăng ca cao bất thường (Cần rà soát):
${
  highOtList.length > 0
    ? highOtList
        .map(
          (p, i) =>
            `${i + 1}. **${p.maNV} - ${p.hoTen}** (${p.phongBan}): Tiền OT **${formatVND(p.tienOT)}** - Cần kiểm tra định mức an toàn lao động.`
        )
        .join('\n')
    : '- Không có nhân sự nào vượt ngưỡng cảnh báo tăng ca nguy hiểm.'
}

#### 3. Đề xuất hành động cho Trưởng phòng HCNS:
1. **Đối soát hợp đồng hết hạn**: Ưu tiên tái ký hợp đồng lao động cho **TP0021 (Đinh Tuấn Anh)** và **TP0035 (Đặng Minh Thịnh)** trước ngày hết hạn để tránh rủi ro pháp lý theo Điều 20 Bộ luật Lao động.
2. **Ký chính thức nhân sự thử việc**: Hoàn tất tờ trình đánh giá năng lực cho **TP0008 (Hoàng Thu Thảo)** và **TP0049 (Hoàng Văn Nam)** sau khi hoàn thành 60 ngày thử việc với mức lương 100% chính thức.
3. **Phê duyệt đơn nghỉ phép**: Xử lý 3 đơn xin nghỉ phép đang tồn đọng (**NP-2026-0515, NP-2026-0518, NP-2026-0520**) để kịp chốt công kỳ tới.
`;
}

/**
 * Calls Gemini API with automatic model fallback & exponential backoff.
 */
export async function analyzeWithGemini(
  prompt: string,
  data: HRSystemData,
  period: string = '09/2026'
): Promise<AiAnalysisResult> {
  const apiKey = getStoredApiKey();

  if (!apiKey) {
    return {
      markdown: generateLocalHRAnalysis(data, period),
      modelUsed: 'Local Rules Engine (Chưa cấu hình API Key)',
      source: 'local_fallback',
      timestamp: new Date().toLocaleTimeString('vi-VN')
    };
  }

  // Model fallback order as requested: gemini-3-flash -> gemini-3.1-flash-lite -> gemini-2.0-flash -> gemini-2.5-flash
  const models = ['gemini-3-flash', 'gemini-3.1-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];

  const systemContext = `
Bạn là Giám đốc Nhân sự & Tài chính cấp cao của "Công ty A".
Nhiệm vụ: Phân tích số liệu nhân sự & tiền lương Quý 3/2026, đưa ra tham mưu chiến lược, ngắn gọn, súc tích cho Ban Giám đốc và Trưởng phòng HCNS.
Quy tắc:
1. Luôn trả lời bằng tiếng Việt chuyên nghiệp, số liệu minh chứng cụ thể (VNĐ, %).
2. Trả về đúng cấu trúc markdown gồm:
   - 1. 3 Nhận xét biến động quỹ lương đáng chú ý nhất
   - 2. Danh sách nhân sự tăng ca cao bất thường (kèm Mã NV, số tiền OT và khuyến nghị)
   - 3. Đề xuất hành động cho Trưởng phòng Nhân sự (liệt kê hành động cụ thể cho các hợp đồng, thử việc, đơn nghỉ phép cần xử lý).
3. Tiết kiệm tối đa Output Token, tập trung giải quyết nỗi đau quản trị.

Số liệu hiện tại kỳ ${period}:
- Tổng nhân sự: ${data.employees.length}
- Số phòng ban: ${data.departments.length}
- Tổng quỹ lương thực lĩnh: ${formatVND(data.payrolls.filter((p) => p.thang === period).reduce((s, p) => s + p.thucLinh, 0))}
- Tổng tiền OT: ${formatVND(data.payrolls.filter((p) => p.thang === period).reduce((s, p) => s + p.tienOT, 0))}
- Các việc khẩn cấp: TP0021 & TP0035 sắp hết hạn HĐ; TP0008 & TP0049 hết hạn 2 tháng thử việc; đơn nghỉ NP-2026-0515, NP-2026-0518, NP-2026-0520 chờ duyệt.
`;

  const fullPrompt = `${systemContext}\n\nYêu cầu phân tích: ${prompt || 'Phân tích tổng quan quỹ lương kỳ ' + period + ' và các rủi ro nhân sự cần xử lý gấp.'}`;

  for (let mIndex = 0; mIndex < models.length; mIndex++) {
    const model = models[mIndex];
    let retries = 2;
    let delay = 1000;

    while (retries >= 0) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1024
            }
          })
        });

        if (response.status === 429) {
          // Rate limit exceeded, backoff and retry or fallback to next model
          if (retries > 0) {
            await new Promise((r) => setTimeout(r, delay));
            delay *= 2;
            retries--;
            continue;
          } else {
            // Next model
            break;
          }
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${response.status}`);
        }

        const dataRes = await response.json();
        const text = dataRes.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            markdown: text,
            modelUsed: model,
            source: 'gemini',
            timestamp: new Date().toLocaleTimeString('vi-VN')
          };
        }
      } catch (err: any) {
        console.warn(`Lỗi khi gọi model ${model}:`, err);
        if (retries > 0) {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          retries--;
        } else {
          break;
        }
      }
    }
  }

  // Fallback to local intelligent analysis if all API models fail
  return {
    markdown: generateLocalHRAnalysis(data, period),
    modelUsed: 'Local Fallback Engine (Đã kích hoạt sau lỗi mạng/quota)',
    source: 'local_fallback',
    timestamp: new Date().toLocaleTimeString('vi-VN'),
    error: 'Đã tự động chuyển sang mô hình xử lý nội bộ do API vượt hạn mức hoặc lỗi kết nối.'
  };
}
