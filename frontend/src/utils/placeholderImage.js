// Utility function to generate text-based placeholder images
export const getPlaceholderImage = (width = 300, height = 300, text = 'Product', bgColor = 'f0f0f0', textColor = '666666') => {
  // Create a pure SVG placeholder with no external dependencies
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#${textColor}" text-anchor="middle" dy=".3em">${text}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Alternative placeholder images for different product types
export const getProductPlaceholder = (productName = 'Product', width = 300, height = 300) => {
  const text = productName.length > 10 ? productName.substring(0, 10) + '...' : productName;
  return getPlaceholderImage(width, height, text);
};

// Fallback image for when external service fails
export const getFallbackImage = (width = 300, height = 300) => {
  // Create a simple SVG placeholder as fallback
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#666666" text-anchor="middle" dy=".3em">Product Image</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
