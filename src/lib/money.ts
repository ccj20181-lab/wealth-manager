/**
 * Money formatting helpers (zh-CN first).
 * Keep this lightweight and deterministic for UI usage.
 */

export function formatCNY(value: number, opts?: { compact?: boolean; minimumFractionDigits?: number; maximumFractionDigits?: number }): string {
  const v = Number(value);
  if (!Number.isFinite(v)) return '¥0';

  const sign = v < 0 ? '-' : '';
  const abs = Math.abs(v);

  const compact = opts?.compact ?? true;
  const minFd = opts?.minimumFractionDigits;
  const maxFd = opts?.maximumFractionDigits;

  if (compact) {
    if (abs >= 100000000) {
      return `${sign}¥${(abs / 100000000).toFixed(2)}亿`;
    }
    if (abs >= 10000) {
      return `${sign}¥${(abs / 10000).toFixed(1)}万`;
    }
  }

  return (
    sign +
    new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: minFd ?? (abs % 1 === 0 ? 0 : 2),
      maximumFractionDigits: maxFd ?? 2,
    }).format(abs)
  );
}

