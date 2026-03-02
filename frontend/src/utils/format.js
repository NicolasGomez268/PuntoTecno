/**
 * Formatea un número con puntos de miles (formato argentino)
 * Ej: 10000 → "10.000" | 10000.50 → "10.000,50"
 */
export const formatPrice = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  return num.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};
