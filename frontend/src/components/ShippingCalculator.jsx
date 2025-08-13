import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const ShippingCalculator = ({ cartItems, onShippingSelect }) => {
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('US');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate total weight and dimensions
  const calculateTotals = () => {
    let totalWeight = 0;
    let totalVolume = 0;
    
    cartItems.forEach(item => {
      // Assume average weight per item (in lbs)
      const itemWeight = item.weight || 1;
      totalWeight += itemWeight * item.quantity;
      
      // Assume average volume per item (in cubic inches)
      const itemVolume = item.dimensions ? 
        (item.dimensions.length * item.dimensions.width * item.dimensions.height) : 100;
      totalVolume += itemVolume * item.quantity;
    });
    
    return { totalWeight, totalVolume };
  };

  const calculateShipping = async () => {
    if (!zipCode.trim()) {
      toast.error('Please enter a valid ZIP code');
      return;
    }

    setIsCalculating(true);
    
    try {
      const { totalWeight, totalVolume } = calculateTotals();
      
      // Simulate API call to shipping service
      // In production, this would call a real shipping API (FedEx, UPS, etc.)
      const options = await simulateShippingCalculation(zipCode, country, totalWeight, totalVolume);
      
      setShippingOptions(options);
      
      if (options.length > 0) {
        setSelectedShipping(options[0]);
        onShippingSelect(options[0]);
      }
      
    } catch (error) {
      console.error('Shipping calculation error:', error);
      toast.error('Failed to calculate shipping options');
    } finally {
      setIsCalculating(false);
    }
  };

  const simulateShippingCalculation = async (zip, countryCode, weight, volume) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const baseRate = 5.99;
    const weightRate = weight * 0.5;
    const volumeRate = volume * 0.01;
    const distanceMultiplier = getDistanceMultiplier(zip);
    
    return [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: '5-7 business days',
        price: (baseRate + weightRate + volumeRate) * distanceMultiplier,
        estimatedDays: '5-7',
        tracking: true
      },
      {
        id: 'express',
        name: 'Express Shipping',
        description: '2-3 business days',
        price: (baseRate + weightRate + volumeRate) * distanceMultiplier * 1.8,
        estimatedDays: '2-3',
        tracking: true
      },
      {
        id: 'overnight',
        name: 'Overnight Shipping',
        description: 'Next business day',
        price: (baseRate + weightRate + volumeRate) * distanceMultiplier * 3.5,
        estimatedDays: '1',
        tracking: true
      },
      {
        id: 'free',
        name: 'Free Shipping',
        description: 'Orders over $50',
        price: 0,
        estimatedDays: '7-10',
        tracking: false,
        minOrder: 50
      }
    ];
  };

  const getDistanceMultiplier = (zip) => {
    // Simple distance calculation based on ZIP code
    // In production, this would use a real geocoding service
    const zipNum = parseInt(zip);
    if (zipNum >= 10000 && zipNum <= 19999) return 1.0; // Northeast
    if (zipNum >= 20000 && zipNum <= 29999) return 1.1; // Southeast
    if (zipNum >= 30000 && zipNum <= 39999) return 1.2; // Southeast
    if (zipNum >= 40000 && zipNum <= 49999) return 1.1; // Midwest
    if (zipNum >= 50000 && zipNum <= 59999) return 1.0; // Midwest
    if (zipNum >= 60000 && zipNum <= 69999) return 1.0; // Midwest
    if (zipNum >= 70000 && zipNum <= 79999) return 1.1; // South
    if (zipNum >= 80000 && zipNum <= 89999) return 1.2; // Mountain
    if (zipNum >= 90000 && zipNum <= 99999) return 1.3; // West Coast
    return 1.0;
  };

  const handleShippingSelect = (option) => {
    setSelectedShipping(option);
    onShippingSelect(option);
  };

  const handleZipCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZipCode(value);
  };

  useEffect(() => {
    if (shippingOptions.length > 0 && !selectedShipping) {
      setSelectedShipping(shippingOptions[0]);
      onShippingSelect(shippingOptions[0]);
    }
  }, [shippingOptions, selectedShipping, onShippingSelect]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Calculator</h3>
      
      {/* Location Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ZIP Code
          </label>
          <input
            type="text"
            value={zipCode}
            onChange={handleZipCodeChange}
            placeholder="Enter ZIP code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={5}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="MX">Mexico</option>
            <option value="UK">United Kingdom</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
          </select>
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculateShipping}
        disabled={isCalculating || !zipCode.trim()}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
      >
        {isCalculating ? 'Calculating...' : 'Calculate Shipping'}
      </button>

      {/* Shipping Options */}
      {shippingOptions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Available Options:</h4>
          {shippingOptions.map((option) => (
            <div
              key={option.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedShipping?.id === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleShippingSelect(option)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={selectedShipping?.id === option.id}
                      onChange={() => handleShippingSelect(option)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <h5 className="font-medium text-gray-900">{option.name}</h5>
                      <p className="text-sm text-gray-600">{option.description}</p>
                      {option.minOrder && (
                        <p className="text-xs text-gray-500">
                          Minimum order: ${option.minOrder}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    {option.price === 0 ? 'FREE' : `$${option.price.toFixed(2)}`}
                  </div>
                  <div className="text-sm text-gray-600">
                    {option.estimatedDays} business days
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Package Information */}
      {cartItems.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Package Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Total Weight:</span>
              <span className="ml-2">{calculateTotals().totalWeight.toFixed(1)} lbs</span>
            </div>
            <div>
              <span className="font-medium">Items:</span>
              <span className="ml-2">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;
