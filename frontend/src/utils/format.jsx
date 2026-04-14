export const formatPrice = (price) => {
  if (price === undefined || price === null) return '0 Ft';
  return `${price.toLocaleString('hu-HU')} Ft`;
};