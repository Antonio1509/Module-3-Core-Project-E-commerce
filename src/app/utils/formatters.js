export function formatMoney(value) {
  return `R${Number(value || 0).toFixed(2)}`;
}

export function initialsFor(name) {
  return String(name || 'Guest')
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}