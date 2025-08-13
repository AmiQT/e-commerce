import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useUser } from '../context/UserContext';
import axios from 'axios';

const PerformanceMonitor = () => {
  const { user, token } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState({
    systemMetrics: {
      cpu: [],
      memory: [],
      disk: [],
      network: []
    },
    databaseMetrics: {
      queryPerformance: [],
      connectionPool: [],
      slowQueries: []
    },
    cacheMetrics: {
      hitRate: [],
      memoryUsage: [],
      evictions: []
    },
    apiMetrics: {
      responseTime: [],
      throughput: [],
      errorRate: []
    },
    realTimeStats: {
      activeUsers: 0,
      requestsPerSecond: 0,
      averageResponseTime: 0,
      cacheHitRate: 0
    }
  });

  useEffect(() => {
    if (user && user.is_admin) {
      fetchPerformanceData();
      // Set up real-time updates every 5 seconds
      const interval = setInterval(fetchPerformanceData, 5000);
      return () => clearInterval(interval);
    }
  }, [user, token]);

  const fetchPerformanceData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/performance/metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      // Use mock data for demonstration
      setPerformanceData(getMockPerformanceData());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockPerformanceData = () => {
    const generateTimeSeriesData = (count, min, max, trend = 'stable') => {
      const data = [];
      let currentValue = (min + max) / 2;
      
      for (let i = 0; i < count; i++) {
        let variation = (Math.random() - 0.5) * (max - min) * 0.1;
        
        if (trend === 'increasing') {
          currentValue += (max - min) * 0.01;
        } else if (trend === 'decreasing') {
          currentValue -= (max - min) * 0.01;
        }
        
        currentValue = Math.max(min, Math.min(max, currentValue + variation));
        data.push(Math.round(currentValue * 100) / 100);
      }
      
      return data;
    };

    const timeLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    return {
      systemMetrics: {
        cpu: generateTimeSeriesData(24, 20, 80, 'variable'),
        memory: generateTimeSeriesData(24, 60, 90, 'stable'),
        disk: generateTimeSeriesData(24, 40, 70, 'increasing'),
        network: generateTimeSeriesData(24, 10, 50, 'variable')
      },
      databaseMetrics: {
        queryPerformance: generateTimeSeriesData(24, 50, 200, 'stable'),
        connectionPool: generateTimeSeriesData(24, 20, 80, 'stable'),
        slowQueries: generateTimeSeriesData(24, 0, 10, 'variable')
      },
      cacheMetrics: {
        hitRate: generateTimeSeriesData(24, 70, 95, 'stable'),
        memoryUsage: generateTimeSeriesData(24, 30, 70, 'stable'),
        evictions: generateTimeSeriesData(24, 0, 20, 'variable')
      },
      apiMetrics: {
        responseTime: generateTimeSeriesData(24, 50, 150, 'stable'),
        throughput: generateTimeSeriesData(24, 100, 500, 'variable'),
        errorRate: generateTimeSeriesData(24, 0, 5, 'variable')
      },
      realTimeStats: {
        activeUsers: Math.floor(Math.random() * 150) + 50,
        requestsPerSecond: Math.floor(Math.random() * 200) + 100,
        averageResponseTime: Math.floor(Math.random() * 100) + 50,
        cacheHitRate: Math.floor(Math.random() * 20) + 80
      }
    };
  };

  const getStatusColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (value, thresholds) => {
    if (value <= thresholds.good) return '🟢';
    if (value <= thresholds.warning) return '🟡';
    return '🔴';
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
          <p className="text-xl text-gray-900">Loading performance data...</p>
        </div>
      </div>
    );
  }

  const timeLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  const systemMetricsData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: performanceData.systemMetrics.cpu,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Memory Usage (%)',
        data: performanceData.systemMetrics.memory,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Disk Usage (%)',
        data: performanceData.systemMetrics.disk,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const databaseMetricsData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Query Response Time (ms)',
        data: performanceData.databaseMetrics.queryPerformance,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Connection Pool Usage (%)',
        data: performanceData.databaseMetrics.connectionPool,
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const cacheMetricsData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Cache Hit Rate (%)',
        data: performanceData.cacheMetrics.hitRate,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Memory Usage (%)',
        data: performanceData.cacheMetrics.memoryUsage,
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const apiMetricsData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Response Time (ms)',
        data: performanceData.apiMetrics.responseTime,
        borderColor: 'rgb(6, 182, 212)',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Throughput (req/s)',
        data: performanceData.apiMetrics.throughput,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Performance & Scalability Monitor</h1>
          <p className="text-xl text-gray-600">Real-time system performance monitoring and optimization insights</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'system', name: 'System Metrics', icon: '💻' },
                { id: 'database', name: 'Database', icon: '🗄️' },
                { id: 'cache', name: 'Cache & Redis', icon: '⚡' },
                { id: 'api', name: 'API Performance', icon: '🌐' },
                { id: 'optimization', name: 'Optimization', icon: '🚀' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Performance Overview</h2>
              
              {/* Real-time Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Active Users</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {performanceData.realTimeStats.activeUsers}
                  </p>
                  <p className="text-sm text-blue-700">Currently online</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Requests/Second</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {performanceData.realTimeStats.requestsPerSecond}
                  </p>
                  <p className="text-sm text-green-700">Current load</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Avg Response Time</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {performanceData.realTimeStats.averageResponseTime}ms
                  </p>
                  <p className="text-sm text-purple-700">API performance</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">Cache Hit Rate</h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {performanceData.realTimeStats.cacheHitRate}%
                  </p>
                  <p className="text-sm text-orange-700">Efficiency</p>
                </div>
              </div>

              {/* System Health Indicators */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">💻</span>
                        <div>
                          <p className="font-medium text-gray-900">CPU Usage</p>
                          <p className="text-sm text-gray-600">Current system load</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getStatusColor(
                          performanceData.systemMetrics.cpu[performanceData.systemMetrics.cpu.length - 1],
                          { good: 60, warning: 80 }
                        )}`}>
                          {performanceData.systemMetrics.cpu[performanceData.systemMetrics.cpu.length - 1]}%
                        </p>
                        <span className="text-2xl">{getStatusIcon(
                          performanceData.systemMetrics.cpu[performanceData.systemMetrics.cpu.length - 1],
                          { good: 60, warning: 80 }
                        )}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🧠</span>
                        <div>
                          <p className="font-medium text-gray-900">Memory Usage</p>
                          <p className="text-sm text-gray-600">RAM utilization</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getStatusColor(
                          performanceData.systemMetrics.memory[performanceData.systemMetrics.memory.length - 1],
                          { good: 70, warning: 85 }
                        )}`}>
                          {performanceData.systemMetrics.memory[performanceData.systemMetrics.memory.length - 1]}%
                        </p>
                        <span className="text-2xl">{getStatusIcon(
                          performanceData.systemMetrics.memory[performanceData.systemMetrics.memory.length - 1],
                          { good: 70, warning: 85 }
                        )}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">💾</span>
                        <div>
                          <p className="font-medium text-gray-900">Disk Usage</p>
                          <p className="text-sm text-gray-600">Storage utilization</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getStatusColor(
                          performanceData.systemMetrics.disk[performanceData.systemMetrics.disk.length - 1],
                          { good: 70, warning: 85 }
                        )}`}>
                          {performanceData.systemMetrics.disk[performanceData.systemMetrics.disk.length - 1]}%
                        </p>
                        <span className="text-2xl">{getStatusIcon(
                          performanceData.systemMetrics.disk[performanceData.systemMetrics.disk.length - 1],
                          { good: 70, warning: 85 }
                        )}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Alerts</h3>
                  <div className="space-y-3">
                    {performanceData.systemMetrics.cpu[performanceData.systemMetrics.cpu.length - 1] > 80 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-red-500 mr-2">⚠️</span>
                          <p className="text-red-800 text-sm">High CPU usage detected</p>
                        </div>
                      </div>
                    )}
                    
                    {performanceData.systemMetrics.memory[performanceData.systemMetrics.memory.length - 1] > 85 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-2">⚠️</span>
                          <p className="text-yellow-800 text-sm">Memory usage approaching limit</p>
                        </div>
                      </div>
                    )}
                    
                    {performanceData.cacheMetrics.hitRate[performanceData.cacheMetrics.hitRate.length - 1] < 80 && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-orange-500 mr-2">⚠️</span>
                          <p className="text-orange-800 text-sm">Cache hit rate below optimal</p>
                        </div>
                      </div>
                    )}
                    
                    {performanceData.apiMetrics.responseTime[performanceData.apiMetrics.responseTime.length - 1] > 200 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-red-500 mr-2">⚠️</span>
                          <p className="text-red-800 text-sm">API response time degraded</p>
                        </div>
                      </div>
                    )}
                    
                    {(!performanceData.systemMetrics.cpu[performanceData.systemMetrics.cpu.length - 1] > 80 &&
                      !performanceData.systemMetrics.memory[performanceData.systemMetrics.memory.length - 1] > 85 &&
                      !performanceData.cacheMetrics.hitRate[performanceData.cacheMetrics.hitRate.length - 1] < 80 &&
                      !performanceData.apiMetrics.responseTime[performanceData.apiMetrics.responseTime.length - 1] > 200) && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <span className="text-green-500 mr-2">✅</span>
                          <p className="text-green-800 text-sm">All systems operating normally</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Metrics Tab */}
          {activeTab === 'system' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">System Resource Metrics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization (24h)</h3>
                  <Line 
                    data={systemMetricsData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' },
                        tooltip: { mode: 'index', intersect: false }
                      },
                      scales: {
                        y: { beginAtZero: true, max: 100 }
                      }
                    }}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Resource Status</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'CPU', value: performanceData.systemMetrics.cpu[performanceData.systemMetrics.cpu.length - 1], unit: '%', color: 'bg-red-500' },
                      { name: 'Memory', value: performanceData.systemMetrics.memory[performanceData.systemMetrics.memory.length - 1], unit: '%', color: 'bg-blue-500' },
                      { name: 'Disk', value: performanceData.systemMetrics.disk[performanceData.systemMetrics.disk.length - 1], unit: '%', color: 'bg-green-500' },
                      { name: 'Network', value: performanceData.systemMetrics.network[performanceData.systemMetrics.network.length - 1], unit: '%', color: 'bg-purple-500' }
                    ].map((resource, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>{resource.name}</span>
                          <span>{resource.value}{resource.unit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${resource.color}`}
                            style={{ width: `${Math.min(resource.value, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Database Performance Metrics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Performance (24h)</h3>
                  <Line 
                    data={databaseMetricsData}
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
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Health</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Query Performance</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {performanceData.databaseMetrics.queryPerformance[performanceData.databaseMetrics.queryPerformance.length - 1]}ms
                      </p>
                      <p className="text-sm text-gray-600">Average response time</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Connection Pool</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {performanceData.databaseMetrics.connectionPool[performanceData.databaseMetrics.connectionPool.length - 1]}%
                      </p>
                      <p className="text-sm text-gray-600">Pool utilization</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Slow Queries</h4>
                      <p className="text-2xl font-bold text-orange-600">
                        {performanceData.databaseMetrics.slowQueries[performanceData.databaseMetrics.slowQueries.length - 1]}
                      </p>
                      <p className="text-sm text-gray-600">Last hour</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cache Tab */}
          {activeTab === 'cache' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Cache & Redis Performance</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Metrics (24h)</h3>
                  <Line 
                    data={cacheMetricsData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'top' },
                        tooltip: { mode: 'index', intersect: false }
                      },
                      scales: {
                        y: { beginAtZero: true, max: 100 }
                      }
                    }}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Efficiency</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Hit Rate</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {performanceData.cacheMetrics.hitRate[performanceData.cacheMetrics.hitRate.length - 1]}%
                      </p>
                      <p className="text-sm text-gray-600">Cache effectiveness</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Memory Usage</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {performanceData.cacheMetrics.memoryUsage[performanceData.cacheMetrics.memoryUsage.length - 1]}%
                      </p>
                      <p className="text-sm text-gray-600">Redis memory</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Evictions</h4>
                      <p className="text-2xl font-bold text-red-600">
                        {performanceData.cacheMetrics.evictions[performanceData.cacheMetrics.evictions.length - 1]}
                      </p>
                      <p className="text-sm text-gray-600">Last hour</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Performance Tab */}
          {activeTab === 'api' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">API Performance Metrics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">API Performance (24h)</h3>
                  <Line 
                    data={apiMetricsData}
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
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">API Health</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Response Time</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {performanceData.apiMetrics.responseTime[performanceData.apiMetrics.responseTime.length - 1]}ms
                      </p>
                      <p className="text-sm text-gray-600">Average</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Throughput</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {performanceData.apiMetrics.throughput[performanceData.apiMetrics.throughput.length - 1]}
                      </p>
                      <p className="text-sm text-gray-600">Requests per second</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Error Rate</h4>
                      <p className="text-2xl font-bold text-red-600">
                        {performanceData.apiMetrics.errorRate[performanceData.apiMetrics.errorRate.length - 1]}%
                      </p>
                      <p className="text-sm text-gray-600">Last hour</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Optimization Tab */}
          {activeTab === 'optimization' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Optimization</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Recommendations</h3>
                  <div className="space-y-4">
                    {performanceData.systemMetrics.cpu[performanceData.systemMetrics.cpu.length - 1] > 80 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">🚀 CPU Optimization</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Consider horizontal scaling</li>
                          <li>• Optimize database queries</li>
                          <li>• Implement caching strategies</li>
                          <li>• Review background job processing</li>
                        </ul>
                      </div>
                    )}
                    
                    {performanceData.cacheMetrics.hitRate[performanceData.cacheMetrics.hitRate.length - 1] < 80 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-2">⚡ Cache Optimization</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Increase cache memory allocation</li>
                          <li>• Implement cache warming strategies</li>
                          <li>• Review cache invalidation policies</li>
                          <li>• Consider CDN implementation</li>
                        </ul>
                      </div>
                    )}
                    
                    {performanceData.apiMetrics.responseTime[performanceData.apiMetrics.responseTime.length - 1] > 200 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-2">🌐 API Optimization</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• Implement request batching</li>
                          <li>• Add response compression</li>
                          <li>• Optimize database queries</li>
                          <li>• Consider microservices architecture</li>
                        </ul>
                      </div>
                    )}
                    
                    {performanceData.systemMetrics.memory[performanceData.systemMetrics.memory.length - 1] > 85 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <h4 className="font-medium text-orange-800 mb-2">🧠 Memory Optimization</h4>
                        <ul className="text-sm text-orange-700 space-y-1">
                          <li>• Review memory leaks</li>
                          <li>• Optimize data structures</li>
                          <li>• Implement pagination</li>
                          <li>• Consider memory profiling</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Scalability Metrics</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Current Capacity</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">CPU Headroom:</span>
                          <span className="text-sm font-medium">
                            {Math.max(0, 100 - performanceData.systemMetrics.cpu[performanceData.systemMetrics.cpu.length - 1])}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Memory Headroom:</span>
                          <span className="text-sm font-medium">
                            {Math.max(0, 100 - performanceData.systemMetrics.memory[performanceData.systemMetrics.memory.length - 1])}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Disk Headroom:</span>
                          <span className="text-sm font-medium">
                            {Math.max(0, 100 - performanceData.systemMetrics.disk[performanceData.systemMetrics.disk.length - 1])}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Performance Score</h4>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600 mb-2">
                          {Math.round(
                            (100 - performanceData.systemMetrics.cpu[performanceData.systemMetrics.cpu.length - 1] * 0.3) +
                            (100 - performanceData.systemMetrics.memory[performanceData.systemMetrics.memory.length - 1] * 0.3) +
                            (performanceData.cacheMetrics.hitRate[performanceData.cacheMetrics.hitRate.length - 1] * 0.4)
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Overall system health</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
