export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return `${hours}h ${remainingMinutes}m`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days < 31) {
    return `${days}d ${remainingHours}h`;
  }

  const months = Math.floor(days / 31);
  const remainingDays = days % 31;

  return `${months}m ${remainingDays}d`;
}
