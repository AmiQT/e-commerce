const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth, adminAuth } = require('../middleware/auth');
const os = require('os');
const fs = require('fs');

// Get system performance metrics
router.get('/metrics', adminAuth, async (req, res) => {
  try {
    const { range = '24h' } = req.query;
    
    // Calculate time range
    const endDate = new Date();
    let startDate = new Date();
    
    switch (range) {
      case '1h':
        startDate.setHours(endDate.getHours() - 1);
        break;
      case '6h':
        startDate.setHours(endDate.getHours() - 6);
        break;
      case '24h':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      default:
        startDate.setDate(endDate.getDate() - 1);
    }

    // System Metrics
    const systemMetrics = await getSystemMetrics();
    
    // Database Performance Metrics
    const databaseMetrics = await getDatabaseMetrics(startDate, endDate);
    
    // Cache Performance Metrics
    const cacheMetrics = await getCacheMetrics(startDate, endDate);
    
    // API Performance Metrics
    const apiMetrics = await getAPIMetrics(startDate, endDate);
    
    // Real-time Stats
    const realTimeStats = await getRealTimeStats();

    res.json({
      systemMetrics,
      databaseMetrics,
      cacheMetrics,
      apiMetrics,
      realTimeStats
    });

  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
});

// Get system resource metrics
async function getSystemMetrics() {
  try {
    // CPU Usage
    const cpuUsage = os.loadavg()[0] * 100; // 1 minute average
    
    // Memory Usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    // Disk Usage (simplified - in production, use a proper disk monitoring library)
    const diskUsage = await getDiskUsage();
    
    // Network Stats
    const networkStats = os.networkInterfaces();
    const networkUsage = calculateNetworkUsage(networkStats);

    return {
      cpu: [Math.round(cpuUsage)],
      memory: [Math.round(memoryUsage)],
      disk: [Math.round(diskUsage)],
      network: [Math.round(networkUsage)]
    };

  } catch (error) {
    console.error('Error getting system metrics:', error);
    return {
      cpu: [0],
      memory: [0],
      disk: [0],
      network: [0]
    };
  }
}

// Get disk usage (simplified implementation)
async function getDiskUsage() {
  try {
    // This is a simplified implementation
    // In production, you'd want to use a proper disk monitoring library
    const stats = fs.statSync('.');
    // Return a mock value for demonstration
    return Math.floor(Math.random() * 30) + 40; // 40-70%
  } catch (error) {
    return 50; // Default fallback
  }
}

// Calculate network usage
function calculateNetworkUsage(networkStats) {
  try {
    let totalUsage = 0;
    let interfaceCount = 0;
    
    for (const interfaceName in networkStats) {
      const interfaces = networkStats[interfaceName];
      for (const interface of interfaces) {
        if (interface.family === 'IPv4' && !interface.internal) {
          // Mock network usage calculation
          totalUsage += Math.floor(Math.random() * 20) + 10;
          interfaceCount++;
        }
      }
    }
    
    return interfaceCount > 0 ? totalUsage / interfaceCount : 0;
  } catch (error) {
    return 0;
  }
}

// Get database performance metrics
async function getDatabaseMetrics(startDate, endDate) {
  try {
    // Query Performance
    const queryPerformance = await pool.query(`
      SELECT 
        EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as time_span,
        COUNT(*) as total_queries,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_response_time
      FROM orders 
      WHERE created_at >= $1 AND created_at <= $2
    `, [startDate, endDate]);

    // Connection Pool Status
    const connectionPool = await pool.query(`
      SELECT 
        setting as max_connections,
        (SELECT count(*) FROM pg_stat_activity) as active_connections
      FROM pg_settings 
      WHERE name = 'max_connections'
    `);

    // Slow Queries (orders taking longer than 5 seconds to process)
    const slowQueries = await pool.query(`
      SELECT COUNT(*) as slow_query_count
      FROM orders 
      WHERE created_at >= $1 
        AND created_at <= $2
        AND EXTRACT(EPOCH FROM (updated_at - created_at)) > 5
    `, [startDate, endDate]);

    // Generate time series data for the last 24 hours
    const timeSeriesData = await generateTimeSeriesData(startDate, endDate, 'database');

    return {
      queryPerformance: timeSeriesData.queryPerformance,
      connectionPool: timeSeriesData.connectionPool,
      slowQueries: timeSeriesData.slowQueries
    };

  } catch (error) {
    console.error('Error getting database metrics:', error);
    return {
      queryPerformance: [],
      connectionPool: [],
      slowQueries: []
    };
  }
}

// Get cache performance metrics
async function getCacheMetrics(startDate, endDate) {
  try {
    // Generate mock cache metrics for demonstration
    // In production, you'd integrate with Redis or your caching solution
    const timeSeriesData = await generateTimeSeriesData(startDate, endDate, 'cache');

    return {
      hitRate: timeSeriesData.hitRate,
      memoryUsage: timeSeriesData.memoryUsage,
      evictions: timeSeriesData.evictions
    };

  } catch (error) {
    console.error('Error getting cache metrics:', error);
    return {
      hitRate: [],
      memoryUsage: [],
      evictions: []
    };
  }
}

// Get API performance metrics
async function getAPIMetrics(startDate, endDate) {
  try {
    // Generate mock API metrics for demonstration
    // In production, you'd collect these from your API gateway or logging system
    const timeSeriesData = await generateTimeSeriesData(startDate, endDate, 'api');

    return {
      responseTime: timeSeriesData.responseTime,
      throughput: timeSeriesData.throughput,
      errorRate: timeSeriesData.errorRate
    };

  } catch (error) {
    console.error('Error getting API metrics:', error);
    return {
      responseTime: [],
      throughput: [],
      errorRate: []
    };
  }
}

// Get real-time performance stats
async function getRealTimeStats() {
  try {
    // Active users (users with recent activity)
    const activeUsers = await pool.query(`
      SELECT COUNT(DISTINCT user_id) as active_users
      FROM orders 
      WHERE created_at >= NOW() - INTERVAL '1 hour'
    `);

    // Requests per second (orders per hour converted to per second)
    const requestsPerSecond = await pool.query(`
      SELECT 
        ROUND(COUNT(*) / 3600.0, 2) as requests_per_second
      FROM orders 
      WHERE created_at >= NOW() - INTERVAL '1 hour'
    `);

    // Average response time
    const averageResponseTime = await pool.query(`
      SELECT 
        ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) * 1000, 2) as avg_response_time
      FROM orders 
      WHERE created_at >= NOW() - INTERVAL '1 hour'
        AND updated_at IS NOT NULL
    `);

    // Cache hit rate (mock data for demonstration)
    const cacheHitRate = Math.floor(Math.random() * 20) + 80; // 80-100%

    return {
      activeUsers: activeUsers.rows[0]?.active_users || 0,
      requestsPerSecond: requestsPerSecond.rows[0]?.requests_per_second || 0,
      averageResponseTime: averageResponseTime.rows[0]?.avg_response_time || 0,
      cacheHitRate
    };

  } catch (error) {
    console.error('Error getting real-time stats:', error);
    return {
      activeUsers: 0,
      requestsPerSecond: 0,
      averageResponseTime: 0,
      cacheHitRate: 0
    };
  }
}

// Generate time series data for metrics
async function generateTimeSeriesData(startDate, endDate, metricType) {
  try {
    const hours = Math.ceil((endDate - startDate) / (1000 * 60 * 60));
    const data = [];

    for (let i = 0; i < hours; i++) {
      const timestamp = new Date(startDate.getTime() + (i * 60 * 60 * 1000));
      
      switch (metricType) {
        case 'database':
          data.push({
            queryPerformance: Math.floor(Math.random() * 150) + 50, // 50-200ms
            connectionPool: Math.floor(Math.random() * 60) + 20,    // 20-80%
            slowQueries: Math.floor(Math.random() * 10)            // 0-10
          });
          break;
        
        case 'cache':
          data.push({
            hitRate: Math.floor(Math.random() * 20) + 80,          // 80-100%
            memoryUsage: Math.floor(Math.random() * 40) + 30,     // 30-70%
            evictions: Math.floor(Math.random() * 20)             // 0-20
          });
          break;
        
        case 'api':
          data.push({
            responseTime: Math.floor(Math.random() * 100) + 50,   // 50-150ms
            throughput: Math.floor(Math.random() * 400) + 100,    // 100-500 req/s
            errorRate: Math.floor(Math.random() * 5)              // 0-5%
          });
          break;
      }
    }

    // Extract individual metrics for Chart.js
    const extractedData = {};
    Object.keys(data[0]).forEach(key => {
      extractedData[key] = data.map(item => item[key]);
    });

    return extractedData;

  } catch (error) {
    console.error('Error generating time series data:', error);
    return {};
  }
}

// Get detailed system information
router.get('/system-info', adminAuth, async (req, res) => {
  try {
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: os.uptime(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length,
      cpuModel: os.cpus()[0]?.model || 'Unknown',
      loadAverage: os.loadavg(),
      networkInterfaces: os.networkInterfaces()
    };

    res.json(systemInfo);

  } catch (error) {
    console.error('Error fetching system info:', error);
    res.status(500).json({ error: 'Failed to fetch system information' });
  }
});

// Get database performance details
router.get('/database-details', adminAuth, async (req, res) => {
  try {
    // Database size
    const dbSize = await pool.query(`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        pg_size_pretty(pg_total_relation_size('orders')) as orders_table_size,
        pg_size_pretty(pg_total_relation_size('products')) as products_table_size,
        pg_size_pretty(pg_total_relation_size('users')) as users_table_size
    `);

    // Table statistics
    const tableStats = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      ORDER BY tablename, attname
      LIMIT 20
    `);

    // Index usage
    const indexUsage = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes
      ORDER BY idx_scan DESC
      LIMIT 20
    `);

    // Connection information
    const connections = await pool.query(`
      SELECT 
        state,
        COUNT(*) as count
      FROM pg_stat_activity
      GROUP BY state
      ORDER BY count DESC
    `);

    res.json({
      databaseSize: dbSize.rows[0],
      tableStats: tableStats.rows,
      indexUsage: indexUsage.rows,
      connections: connections.rows
    });

  } catch (error) {
    console.error('Error fetching database details:', error);
    res.status(500).json({ error: 'Failed to fetch database details' });
  }
});

// Get performance recommendations
router.get('/recommendations', adminAuth, async (req, res) => {
  try {
    const recommendations = [];

    // Check CPU usage
    const cpuUsage = os.loadavg()[0] * 100;
    if (cpuUsage > 80) {
      recommendations.push({
        type: 'warning',
        category: 'CPU',
        title: 'High CPU Usage',
        description: 'CPU usage is above 80%. Consider optimizing queries or scaling horizontally.',
        priority: 'high',
        actions: [
          'Review and optimize database queries',
          'Consider implementing caching strategies',
          'Monitor background job processing',
          'Evaluate horizontal scaling options'
        ]
      });
    }

    // Check memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    if (memoryUsage > 85) {
      recommendations.push({
        type: 'warning',
        category: 'Memory',
        title: 'High Memory Usage',
        description: 'Memory usage is above 85%. This may impact performance.',
        priority: 'medium',
        actions: [
          'Review memory leaks in application code',
          'Optimize data structures and algorithms',
          'Implement pagination for large datasets',
          'Consider memory profiling tools'
        ]
      });
    }

    // Check database performance
    const slowQueries = await pool.query(`
      SELECT COUNT(*) as count
      FROM orders 
      WHERE created_at >= NOW() - INTERVAL '1 hour'
        AND EXTRACT(EPOCH FROM (updated_at - created_at)) > 5
    `);

    if (slowQueries.rows[0]?.count > 5) {
      recommendations.push({
        type: 'warning',
        category: 'Database',
        title: 'Slow Queries Detected',
        description: 'Multiple slow queries detected in the last hour.',
        priority: 'high',
        actions: [
          'Review and optimize slow queries',
          'Add database indexes where appropriate',
          'Consider query result caching',
          'Monitor database connection pool usage'
        ]
      });
    }

    // Check cache performance (mock data)
    const cacheHitRate = Math.floor(Math.random() * 20) + 80;
    if (cacheHitRate < 85) {
      recommendations.push({
        type: 'info',
        category: 'Cache',
        title: 'Cache Hit Rate Below Optimal',
        description: 'Cache hit rate is below 85%. Consider cache optimization.',
        priority: 'medium',
        actions: [
          'Increase cache memory allocation',
          'Implement cache warming strategies',
          'Review cache invalidation policies',
          'Consider CDN implementation'
        ]
      });
    }

    // If no issues found
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        category: 'System',
        title: 'All Systems Operating Normally',
        description: 'No performance issues detected. System is running optimally.',
        priority: 'low',
        actions: [
          'Continue monitoring system performance',
          'Maintain current optimization strategies',
          'Document current performance baseline'
        ]
      });
    }

    res.json(recommendations);

  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate performance recommendations' });
  }
});

// Get performance alerts
router.get('/alerts', adminAuth, async (req, res) => {
  try {
    const alerts = [];

    // CPU alert
    const cpuUsage = os.loadavg()[0] * 100;
    if (cpuUsage > 90) {
      alerts.push({
        id: 'cpu_high',
        type: 'critical',
        message: `CPU usage is critically high: ${Math.round(cpuUsage)}%`,
        timestamp: new Date(),
        acknowledged: false
      });
    } else if (cpuUsage > 80) {
      alerts.push({
        id: 'cpu_warning',
        type: 'warning',
        message: `CPU usage is high: ${Math.round(cpuUsage)}%`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Memory alert
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    if (memoryUsage > 90) {
      alerts.push({
        id: 'memory_critical',
        type: 'critical',
        message: `Memory usage is critically high: ${Math.round(memoryUsage)}%`,
        timestamp: new Date(),
        acknowledged: false
      });
    } else if (memoryUsage > 85) {
      alerts.push({
        id: 'memory_warning',
        type: 'warning',
        message: `Memory usage is high: ${Math.round(memoryUsage)}%`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    // Database alert
    const slowQueries = await pool.query(`
      SELECT COUNT(*) as count
      FROM orders 
      WHERE created_at >= NOW() - INTERVAL '1 hour'
        AND EXTRACT(EPOCH FROM (updated_at - created_at)) > 10
    `);

    if (slowQueries.rows[0]?.count > 10) {
      alerts.push({
        id: 'db_slow',
        type: 'warning',
        message: `Multiple very slow queries detected: ${slowQueries.rows[0].count} in the last hour`,
        timestamp: new Date(),
        acknowledged: false
      });
    }

    res.json(alerts);

  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch performance alerts' });
  }
});

module.exports = router;
