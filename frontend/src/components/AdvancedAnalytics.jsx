import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
} from 'chart.js';
import axios from 'axios';
import { useUser } from '../context/UserContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
);

const AdvancedAnalytics = () => {
  const { user, token } = useUser();
  const [timeRange, setTimeRange] = useState('90d');
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    customerSegments: [],
    rfmAnalysis: [],
    salesForecast: [],
    inventoryPredictions: [],
    customerLifetimeValue: [],
    churnAnalysis: [],
    conversionFunnel: [],
    productPerformance: []
  });

  useEffect(() => {
    if (user && user.is_admin) {
      fetchAdvancedAnalytics();
    }
  }, [user, token, timeRange]);

  const fetchAdvancedAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/analytics/advanced?range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
      // Use mock data for demonstration
      setAnalytics(getMockAdvancedAnalytics());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockAdvancedAnalytics = () => {
    const days = Array.from({ length: 90 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (89 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return {
      customerSegments: [
        { segment: 'VIP Customers', count: 45, revenue: 125000, percentage: 15 },
        { segment: 'High Value', count: 120, revenue: 89000, percentage: 25 },
        { segment: 'Medium Value', count: 280, revenue: 67000, percentage: 35 },
        { segment: 'Low Value', count: 180, revenue: 22000, percentage: 25 }
      ],
      rfmAnalysis: [
        { score: '555', count: 45, revenue: 125000, description: 'Best Customers' },
        { score: '444', count: 78, revenue: 89000, description: 'High Potential' },
        { score: '333', count: 156, revenue: 67000, description: 'Average' },
        { score: '222', count: 89, revenue: 22000, description: 'At Risk' },
        { score: '111', count: 34, revenue: 8000, description: 'Lost' }
      ],
      salesForecast: days.map(() => Math.floor(Math.random() * 2000) + 500),
      inventoryPredictions: [
        { product: 'Laptop Pro', currentStock: 45, predictedDemand: 67, reorderPoint: 20 },
        { product: 'Wireless Headphones', currentStock: 89, predictedDemand: 45, reorderPoint: 30 },
        { product: 'Smart Watch', currentStock: 23, predictedDemand: 78, reorderPoint: 15 },
        { product: 'Gaming Mouse', currentStock: 156, predictedDemand: 34, reorderPoint: 50 }
      ],
      customerLifetimeValue: [
        { segment: 'VIP', avgLTV: 2500, retentionRate: 0.95, acquisitionCost: 150 },
        { segment: 'High Value', avgLTV: 1200, retentionRate: 0.85, acquisitionCost: 100 },
        { segment: 'Medium Value', avgLTV: 600, retentionRate: 0.70, acquisitionCost: 75 },
        { segment: 'Low Value', avgLTV: 200, retentionRate: 0.50, acquisitionCost: 50 }
      ],
      churnAnalysis: [
        { month: 'Jan', churnRate: 0.08, retentionRate: 0.92 },
        { month: 'Feb', churnRate: 0.06, retentionRate: 0.94 },
        { month: 'Mar', churnRate: 0.09, retentionRate: 0.91 },
        { month: 'Apr', churnRate: 0.07, retentionRate: 0.93 },
        { month: 'May', churnRate: 0.05, retentionRate: 0.95 },
        { month: 'Jun', churnRate: 0.08, retentionRate: 0.92 }
      ],
      conversionFunnel: [
        { stage: 'Website Visits', count: 10000, conversionRate: 100 },
        { stage: 'Product Views', count: 3500, conversionRate: 35 },
        { stage: 'Add to Cart', count: 1200, conversionRate: 12 },
        { stage: 'Checkout Started', count: 800, conversionRate: 8 },
        { stage: 'Purchase Completed', count: 600, conversionRate: 6 }
      ],
      productPerformance: [
        { product: 'Laptop Pro', revenue: 45000, units: 45, margin: 0.35, trend: 'up' },
        { product: 'Wireless Headphones', revenue: 7600, units: 38, margin: 0.28, trend: 'stable' },
        { product: 'Smart Watch', revenue: 9600, units: 32, margin: 0.42, trend: 'up' },
        { product: 'Gaming Mouse', revenue: 2800, units: 28, margin: 0.25, trend: 'down' }
      ]
    };
  };

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need administrator privileges to view this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl text-gray-900">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  const customerSegmentsData = {
    labels: analytics.customerSegments.map(seg => seg.segment),
    datasets: [{
      data: analytics.customerSegments.map(seg => seg.revenue),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const rfmAnalysisData = {
    labels: analytics.rfmAnalysis.map(rfm => rfm.score),
    datasets: [{
      label: 'Revenue ($)',
      data: analytics.rfmAnalysis.map(rfm => rfm.revenue),
      backgroundColor: 'rgba(54, 162, 235, 0.8)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  const salesForecastData = {
    labels: Array.from({ length: 90 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (89 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Actual Sales',
      data: analytics.salesForecast.slice(0, 30),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }, {
      label: 'Forecasted Sales',
      data: analytics.salesForecast.slice(30),
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true,
      borderDash: [5, 5]
    }]
  };

  const conversionFunnelData = {
    labels: analytics.conversionFunnel.map(stage => stage.stage),
    datasets: [{
      label: 'Conversion Rate (%)',
      data: analytics.conversionFunnel.map(stage => stage.conversionRate),
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 1
    }]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Advanced Business Intelligence</h1>
          <p className="text-xl text-gray-600">Deep insights into customer behavior, predictions, and business performance</p>
          
          {/* Time Range Selector */}
          <div className="mt-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Customers</h3>
            <p className="text-3xl font-bold text-blue-600">
              {analytics.customerSegments.reduce((sum, seg) => sum + seg.count, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">
              ${analytics.customerSegments.reduce((sum, seg) => sum + seg.revenue, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Conversion Rate</h3>
            <p className="text-3xl font-bold text-purple-600">
              {analytics.conversionFunnel[analytics.conversionFunnel.length - 1]?.conversionRate || 0}%
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Retention</h3>
            <p className="text-3xl font-bold text-orange-600">
              {Math.round((1 - analytics.churnAnalysis[analytics.churnAnalysis.length - 1]?.churnRate || 0) * 100)}%
            </p>
          </div>
        </div>

        {/* Customer Segmentation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Segmentation by Revenue</h3>
            <Doughnut 
              data={customerSegmentsData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const segment = analytics.customerSegments[context.dataIndex];
                        return `${segment.segment}: $${segment.revenue.toLocaleString()} (${segment.percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">RFM Analysis</h3>
            <Bar 
              data={rfmAnalysisData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      afterLabel: (context) => {
                        const rfm = analytics.rfmAnalysis[context.dataIndex];
                        return `${rfm.description} (${rfm.count} customers)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Sales Forecast */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Sales Forecast vs Actual</h3>
          <Line 
            data={salesForecastData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                tooltip: { mode: 'index', intersect: false }
              },
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Conversion Funnel</h3>
          <Bar 
            data={conversionFunnelData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    afterLabel: (context) => {
                      const stage = analytics.conversionFunnel[context.dataIndex];
                      return `${stage.count.toLocaleString()} visitors`;
                    }
                  }
                }
              },
              scales: {
                y: { beginAtZero: true, max: 100 }
              }
            }}
          />
        </div>

        {/* Inventory Predictions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Inventory Predictions & Reorder Points</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Current Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Predicted Demand</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Reorder Point</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.inventoryPredictions.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-900">{item.product}</td>
                    <td className="py-3 px-4 text-gray-900">{item.currentStock}</td>
                    <td className="py-3 px-4 text-gray-900">{item.predictedDemand}</td>
                    <td className="py-3 px-4 text-gray-900">{item.reorderPoint}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.currentStock <= item.reorderPoint 
                          ? 'bg-red-100 text-red-800' 
                          : item.currentStock <= item.reorderPoint * 1.5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.currentStock <= item.reorderPoint 
                          ? 'Reorder Now' 
                          : item.currentStock <= item.reorderPoint * 1.5
                          ? 'Monitor'
                          : 'Well Stocked'
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Lifetime Value */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Lifetime Value Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.customerLifetimeValue.map((segment, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{segment.segment}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg LTV:</span>
                    <span className="font-medium">${segment.avgLTV.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retention:</span>
                    <span className="font-medium">{(segment.retentionRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Acquisition Cost:</span>
                    <span className="font-medium">${segment.acquisitionCost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
