import React, { useState } from 'react';
import { getProductPlaceholder, getFallbackImage } from '../utils/placeholderImage';

const ProductImage = ({ 
  src, 
  alt, 
  productName, 
  className = "w-full h-48 object-cover",
  fallbackWidth = 300,
  fallbackHeight = 300,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  const handleImageError = (e) => {
    if (!imageError) {
      // First error - try placeholder
      setImageError(true);
      e.target.src = getProductPlaceholder(productName || alt, fallbackWidth, fallbackHeight);
    } else if (!fallbackError) {
      // Second error - try fallback SVG
      setFallbackError(true);
      e.target.src = getFallbackImage(fallbackWidth, fallbackHeight);
    } else {
      // Final fallback - use a simple data URI
      e.target.src = `data:image/svg+xml;base64,${btoa(`
        <svg width="${fallbackWidth}" height="${fallbackHeight}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f0f0f0"/>
          <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#666666" text-anchor="middle" dy=".3em">Image</text>
        </svg>
      `)}`;
    }
  };

  const imageSrc = src || getProductPlaceholder(productName || alt, fallbackWidth, fallbackHeight);

  return (
    <img
      src={imageSrc}
      alt={alt || productName || 'Product'}
      className={className}
      onError={handleImageError}
      {...props}
    />
  );
};

export default ProductImage;
