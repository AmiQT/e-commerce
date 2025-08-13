import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const Internationalization = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [exchangeRates, setExchangeRates] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' }
  ];

  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸', taxRate: 0.08 },
    { code: 'CA', name: 'Canada', flag: '🇨🇦', taxRate: 0.13 },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', taxRate: 0.20 },
    { code: 'DE', name: 'Germany', flag: '🇩🇪', taxRate: 0.19 },
    { code: 'FR', name: 'France', flag: '🇫🇷', taxRate: 0.20 },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', taxRate: 0.10 },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', taxRate: 0.10 },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷', taxRate: 0.17 }
  ];

  const translations = {
    en: {
      title: 'International Settings',
      language: 'Language',
      currency: 'Currency',
      country: 'Country',
      taxInfo: 'Tax Information',
      shippingInfo: 'Shipping Information',
      saveSettings: 'Save Settings',
      settingsSaved: 'Settings saved successfully!'
    },
    es: {
      title: 'Configuración Internacional',
      language: 'Idioma',
      currency: 'Moneda',
      country: 'País',
      taxInfo: 'Información Fiscal',
      shippingInfo: 'Información de Envío',
      saveSettings: 'Guardar Configuración',
      settingsSaved: '¡Configuración guardada exitosamente!'
    },
    fr: {
      title: 'Paramètres Internationaux',
      language: 'Langue',
      currency: 'Devise',
      country: 'Pays',
      taxInfo: 'Informations Fiscales',
      shippingInfo: 'Informations d\'Expédition',
      saveSettings: 'Sauvegarder les Paramètres',
      settingsSaved: 'Paramètres sauvegardés avec succès!'
    }
  };

  const currentTranslations = translations[selectedLanguage] || translations.en;

  useEffect(() => {
    fetchExchangeRates();
  }, [selectedCurrency]);

  const fetchExchangeRates = async () => {
    setIsLoading(true);
    try {
      // Simulate API call for exchange rates
      const rates = {
        USD: 1.0,
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        CNY: 6.45
      };
      
      setExchangeRates(rates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertPrice = (priceUSD) => {
    const rate = exchangeRates[selectedCurrency];
    if (!rate) return priceUSD;
    
    const converted = priceUSD * rate;
    return converted.toFixed(2);
  };

  const getCurrentTaxRate = () => {
    const country = countries.find(c => c.code === selectedCountry);
    return country ? country.taxRate : 0.08;
  };

  const handleSaveSettings = () => {
    // Save settings to user preferences
    localStorage.setItem('userLanguage', selectedLanguage);
    localStorage.setItem('userCurrency', selectedCurrency);
    localStorage.setItem('userCountry', selectedCountry);
    
    // Show success message
    alert(currentTranslations.settingsSaved);
  };

  const getShippingInfo = () => {
    const country = countries.find(c => c.code === selectedCountry);
    if (!country) return { standard: '5-7 days', express: '2-3 days', cost: '$5.99' };
    
    const shippingRates = {
      US: { standard: '3-5 days', express: '1-2 days', cost: '$4.99' },
      CA: { standard: '5-7 days', express: '2-3 days', cost: '$8.99' },
      GB: { standard: '7-10 days', express: '3-5 days', cost: '$12.99' },
      DE: { standard: '7-10 days', express: '3-5 days', cost: '$14.99' },
      JP: { standard: '10-14 days', express: '5-7 days', cost: '$19.99' },
      AU: { standard: '12-16 days', express: '7-10 days', cost: '$24.99' }
    };
    
    return shippingRates[country.code] || { standard: '7-14 days', express: '3-7 days', cost: '$15.99' };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          🌍 {currentTranslations.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Language Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🗣️ {currentTranslations.language}
            </h2>
            <div className="space-y-3">
              {languages.map((lang) => (
                <label key={lang.code} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="language"
                    value={lang.code}
                    checked={selectedLanguage === lang.code}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-gray-700">{lang.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Currency Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              💰 {currentTranslations.currency}
            </h2>
            <div className="space-y-3">
              {currencies.map((currency) => (
                <label key={currency.code} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="currency"
                    value={currency.code}
                    checked={selectedCurrency === currency.code}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-2xl">{currency.flag}</span>
                  <span className="text-gray-700">{currency.name}</span>
                  <span className="text-gray-500">({currency.symbol})</span>
                </label>
              ))}
            </div>
            
            {/* Exchange Rate Display */}
            {!isLoading && exchangeRates[selectedCurrency] && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Exchange Rate:</strong> 1 USD = {exchangeRates[selectedCurrency]} {selectedCurrency}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Sample: $99.99 = {convertPrice(99.99)} {selectedCurrency}
                </p>
              </div>
            )}
          </div>

          {/* Country & Tax Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🏳️ {currentTranslations.country}
            </h2>
            <div className="space-y-3">
              {countries.map((country) => (
                <label key={country.code} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="country"
                    value={country.code}
                    checked={selectedCountry === country.code}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-2xl">{country.flag}</span>
                  <span className="text-gray-700">{country.name}</span>
                  <span className="text-gray-500">({(country.taxRate * 100).toFixed(1)}% tax)</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tax & Shipping Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📊 {currentTranslations.taxInfo}
            </h2>
            
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Current Tax Rate</h3>
                <p className="text-2xl font-bold text-red-600">
                  {(getCurrentTaxRate() * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">
                  Applied to all purchases in {countries.find(c => c.code === selectedCountry)?.name}
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Shipping Information</h3>
                {(() => {
                  const shipping = getShippingInfo();
                  return (
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Standard:</span> {shipping.standard}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Express:</span> {shipping.express}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Base Cost:</span> {shipping.cost}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSaveSettings}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            💾 {currentTranslations.saveSettings}
          </button>
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Product Price</h3>
              <p className="text-2xl font-bold text-green-600">
                {currencies.find(c => c.code === selectedCurrency)?.symbol}{convertPrice(99.99)}
              </p>
              <p className="text-sm text-gray-500">Original: $99.99 USD</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Tax Amount</h3>
              <p className="text-2xl font-bold text-red-600">
                {currencies.find(c => c.code === selectedCurrency)?.symbol}{convertPrice(99.99 * getCurrentTaxRate())}
              </p>
              <p className="text-sm text-gray-500">{(getCurrentTaxRate() * 100).toFixed(1)}% rate</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Total</h3>
              <p className="text-2xl font-bold text-blue-600">
                {currencies.find(c => c.code === selectedCurrency)?.symbol}{convertPrice(99.99 * (1 + getCurrentTaxRate()))}
              </p>
              <p className="text-sm text-gray-500">Price + Tax</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Internationalization;
