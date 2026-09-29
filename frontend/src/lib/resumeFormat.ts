export function formatDateRange(start: string, end: string): string {
  if (start && end) return `${start} - ${end}`;
  if (start) return `${start} - Present`;
  return end;
}
