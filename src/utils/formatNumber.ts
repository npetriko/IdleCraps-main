/**
 * Formats a number to display more gracefully with appropriate suffixes
 * Examples:
 * - 1430 -> 1.43k
 * - 14350 -> 14.3k
 * - 1435650 -> 1.43m
 * 
 * @param value The number to format
 * @param includePrefix Whether to include the dollar sign prefix (default: true)
 * @param decimalPlaces Number of decimal places to show (default: 2)
 * @returns Formatted string
 */
export const formatNumber = (
  value: number,
  includePrefix: boolean = true,
  decimalPlaces: number = 2
): string => {
  const prefix = includePrefix ? '$' : '';
  
  // Handle negative numbers
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  
  // Format based on magnitude
  if (absValue >= 1_000_000_000) {
    // Convert to billions (b)
    const formatted = (absValue / 1_000_000_000).toFixed(decimalPlaces);
    // Remove trailing zeros after decimal point
    const cleanFormatted = formatted.replace(/\.?0+$/, '');
    return `${isNegative ? '-' : ''}${prefix}${cleanFormatted}b`;
  } else if (absValue >= 1_000_000) {
    // Convert to millions (m)
    const formatted = (absValue / 1_000_000).toFixed(decimalPlaces);
    // Remove trailing zeros after decimal point
    const cleanFormatted = formatted.replace(/\.?0+$/, '');
    return `${isNegative ? '-' : ''}${prefix}${cleanFormatted}m`;
  } else if (absValue >= 1_000) {
    // Convert to thousands (k)
    const formatted = (absValue / 1_000).toFixed(decimalPlaces);
    // Remove trailing zeros after decimal point
    const cleanFormatted = formatted.replace(/\.?0+$/, '');
    return `${isNegative ? '-' : ''}${prefix}${cleanFormatted}k`;
  } else {
    // Keep as is for small numbers
    const formatted = absValue.toFixed(decimalPlaces);
    // Remove trailing zeros after decimal point
    const cleanFormatted = formatted.replace(/\.?0+$/, '');
    return `${isNegative ? '-' : ''}${prefix}${cleanFormatted}`;
  }
};