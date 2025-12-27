// Converts date input to number of days since Unix Epoch
export function toDays(date) {
  if (!date) return null;
  const dt = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(dt.getTime())) return null;
  return Math.floor(dt.getTime() / (1000 * 60 * 60 * 24)); // milliseconds → days
}