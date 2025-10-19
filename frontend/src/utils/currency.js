/**
 * Currency formatting utilities
 */

/**
 * Format a price value with Euro symbol and proper decimal places
 * @param {number|string} value - The price value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted price string
 */
export const formatPrice = (value, decimals = 2) => {
  if (value === null || value === undefined || value === '') {
    return '€0.00'
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue)) {
    return '€0.00'
  }
  
  return `€${numValue.toFixed(decimals)}`
}

/**
 * Format a price value with custom currency symbol
 * @param {number|string} value - The price value to format
 * @param {string} symbol - Currency symbol (default: '€')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} - Formatted price string
 */
export const formatPriceWithSymbol = (value, symbol = '€', decimals = 2) => {
  if (value === null || value === undefined || value === '') {
    return `${symbol}0.00`
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue)) {
    return `${symbol}0.00`
  }
  
  return `${symbol}${numValue.toFixed(decimals)}`
}

/**
 * Parse a price string and return the numeric value
 * @param {string} priceString - The price string to parse
 * @returns {number} - Parsed numeric value
 */
export const parsePrice = (priceString) => {
  if (!priceString) return 0
  
  // Remove currency symbols and spaces
  const cleaned = priceString.replace(/[€$£¥₹\s]/g, '')
  const parsed = parseFloat(cleaned)
  
  return isNaN(parsed) ? 0 : parsed
}

export default {
  formatPrice,
  formatPriceWithSymbol,
  parsePrice
}
