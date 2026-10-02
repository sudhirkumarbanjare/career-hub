export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  try {
    const num = Number(amount);
    return `₹${num.toLocaleString('en-IN')}`;
  } catch {
    return `₹${amount}`;
  }
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = (phone || '').replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    return `+91 ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }
  return phone || '';
}
