import { Employee, Payroll, Contract } from '../types/hrm';

/**
 * Generates and downloads a Word-compatible .doc file with full HTML/CSS formatting.
 */
export function downloadWordDoc(filename: string, title: string, htmlBody: string) {
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body { font-family: 'Times New Roman', 'Arial', sans-serif; font-size: 13pt; line-height: 1.5; color: #111; margin: 20mm; }
        h1, h2, h3 { text-align: center; color: #0F291E; }
        h1 { font-size: 18pt; font-weight: bold; margin-bottom: 4px; }
        h2 { font-size: 14pt; font-weight: bold; margin-top: 4px; margin-bottom: 12px; }
        .company-header { text-align: center; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 16px; }
        th, td { border: 1px solid #777; padding: 6px 10px; font-size: 11pt; }
        th { background-color: #f1f5f9; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature-box { width: 45%; text-align: center; float: left; }
      </style>
    </head>
    <body>
      ${htmlBody}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Triggers browser print preview for A4/A5 PDF export.
 */
export function printHtmlContent(title: string, htmlBody: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Vui lòng cho phép popup để xem bản in / xuất PDF');
    return;
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #1e293b; line-height: 1.4; padding: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          th, td { border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 12px; }
          th { background: #f8fafc; font-weight: 600; text-align: left; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${htmlBody}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Generates Google Calendar event link.
 */
export function createGoogleCalendarUrl(
  title: string,
  details: string,
  dateStr: string,
  location: string = 'Văn phòng Công ty A - Phòng Họp 1'
): string {
  // Format date to YYYYMMDDTHHmmssZ
  let startFormatted = '';
  let endFormatted = '';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      startFormatted = `${year}${month}${day}T090000`;
      endFormatted = `${year}${month}${day}T100000`;
    }
  } catch (e) {
    // fallback
  }

  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const params = new URLSearchParams({
    text: title,
    details: details,
    location: location,
    dates: startFormatted && endFormatted ? `${startFormatted}/${endFormatted}` : ''
  });

  return `${base}&${params.toString()}`;
}

/**
 * Generates Gmail Web Compose URL.
 */
export function createGmailDraftUrl(
  toEmail: string,
  subject: string,
  body: string
): string {
  const base = 'https://mail.google.com/mail/?view=cm&fs=1';
  const params = new URLSearchParams({
    to: toEmail,
    su: subject,
    body: body
  });
  return `${base}&${params.toString()}`;
}

/**
 * Copies formatted text report to clipboard.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

/**
 * Formats VND currency
 */
export function formatVND(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
