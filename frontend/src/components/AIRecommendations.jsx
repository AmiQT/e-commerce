import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState({});
  const { user, token } = useUser();

  useEffect(() => {
    if (user) {
      fetchAIRecommendations();
    }
  }, [user]);

  const fetchAIRecommendations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/ai/recommendations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRecommendations(response.data.recommendations);
      setAiInsights(response.data.insights);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationReason = (type) => {
    const reasons = {
      'collaborative': 'Based on similar users like you',
      'content_based': 'Similar to products you loved',
      'trending': 'Currently popular in your area',
      'seasonal': 'Perfect for this time of year',
      'cross_sell': 'Goes great with your recent purchases',
      'upsell': 'Premium version of items you like'
    };
    return reasons[type] || 'AI-powered suggestion';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          🤖 AI-Powered Recommendations
        </h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">AI Active</span>
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights.confidence && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              🧠
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">AI Confidence Score</h3>
              <p className="text-blue-700">
                Our AI is {(aiInsights.confidence * 100).toFixed(1)}% confident in these recommendations
                based on your browsing patterns and preferences.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((item, index) => (
          <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">${item.price}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {item.recommendation_type}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {getRecommendationReason(item.recommendation_type)}
                </p>
                <div className="mt-3 flex space-x-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                    Add to Cart
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Learning Status */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            📊
          </div>
          <div>
            <h4 className="font-medium text-gray-900">AI Learning Progress</h4>
            <p className="text-sm text-gray-600">
              Our AI has analyzed {aiInsights.dataPoints || 0} data points from your interactions
              and continues to learn your preferences for better recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;
