export function formatDate(input: string | number | Date): string {
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return String(input);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(input);
  }
}

export function formatDateTime(input: string | number | Date): string {
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return String(input);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(input);
  }
}

export function formatRelativeTime(input: string | number | Date): string {
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return String(input);
    const now = Date.now();
    const diff = Math.floor((now - d.getTime()) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return formatDate(d);
  } catch {
    return String(input);
  }
}
