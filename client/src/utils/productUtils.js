/**
 * Utility functions for product management and trending logic
 */

// Threshold for a product to be considered trending
export const TRENDING_THRESHOLD = 70;

/**
 * Check if a product is trending based on its demand value
 * @param {Object} product - Product object
 * @param {number} threshold - Demand threshold (0-100)
 * @returns {boolean} - True if demand >= threshold
 */
export const isTrending = (product, threshold = TRENDING_THRESHOLD) => {
    return (product.demand || 0) >= threshold;
};

/**
 * Sort products by demand value (highest to lowest)
 * @param {Array} products - Array of product objects
 * @returns {Array} - Sorted array of products
 */
export const sortByDemand = (products) => {
    return [...products].sort((a, b) => (b.demand || 0) - (a.demand || 0));
};

/**
 * Get only trending products from a list
 * @param {Array} products - Array of product objects
 * @param {number} threshold - Demand threshold
 * @returns {Array} - Array of trending products
 */
export const getTrendingProducts = (products, threshold = TRENDING_THRESHOLD) => {
    return products.filter(product => isTrending(product, threshold));
};

/**
 * Filter products by category (case insensitive)
 * @param {Array} products - Array of product objects
 * @param {string} category - Category to filter by (e.g., "men", "women", "shoes")
 * @returns {Array} - Filtered products
 */
export const filterByCategory = (products, category) => {
    if (!category) return products;

    const normalizedCategory = category.toLowerCase();

    return products.filter(product => {
        // Check exact match on category fields
        if (product.category?.toLowerCase() === normalizedCategory) return true;

        // Check top/second/third level categories
        if (product.topLavelCategory?.toLowerCase() === normalizedCategory) return true;
        if (product.secondLavelCategory?.toLowerCase() === normalizedCategory) return true;
        if (product.thirdLavelCategory?.toLowerCase() === normalizedCategory) return true;

        // Special case mappings
        if (normalizedCategory === 'footwear' && product.category === 'shoes') return true;
        if (normalizedCategory === 'clothing' &&
            ['men', 'women', 'mens_kurta', 'women_dress', 'saree'].includes(product.category)) return true;

        return false;
    });
};
