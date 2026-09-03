export function formatDate(dateString: string | Date): string {
  return new Intl.DateTimeFormat('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function formatDateShort(dateString: string | Date): string {
  return new Intl.DateTimeFormat('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}
