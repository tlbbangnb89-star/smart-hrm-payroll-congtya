import React, { useEffect, useState } from 'react';

interface CountUpNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  value,
  duration = 1200,
  prefix = '',
  suffix = '',
  isCurrency = false
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(startValue + (value - startValue) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  const formatted = isCurrency
    ? new Intl.NumberFormat('vi-VN').format(displayValue)
    : displayValue.toLocaleString('vi-VN');

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
