const express = require('express');
const router = express.Router();
const pool = require('../db');
const { auth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false);
    }
  }
});

// Get B2B dashboard data
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get corporate accounts
    const corporateAccounts = await pool.query(`
      SELECT 
        ca.id,
        ca.company_name,
        ca.contact_person,
        ca.email,
        ca.phone,
        ca.account_type,
        ca.credit_limit,
        ca.payment_terms,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent,
        ca.status
      FROM corporate_accounts ca
      LEFT JOIN orders o ON ca.id = o.corporate_account_id AND o.status != 'cancelled'
      GROUP BY ca.id, ca.company_name, ca.contact_person, ca.email, ca.phone, ca.account_type, ca.credit_limit, ca.payment_terms, ca.status
      ORDER BY total_spent DESC
    `);

    // Get wholesale products
    const wholesaleProducts = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.price as regular_price,
        p.wholesale_price,
        p.stock_quantity as stock,
        c.name as category,
        p.bulk_discounts
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_wholesale = true
      ORDER BY p.name
    `);

    // Get bulk orders
    const bulkOrders = await pool.query(`
      SELECT 
        o.id,
        ca.company_name,
        o.created_at as order_date,
        o.total_amount,
        COUNT(oi.id) as items,
        o.status,
        o.expected_delivery
      FROM orders o
      JOIN corporate_accounts ca ON o.corporate_account_id = ca.id
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.is_bulk_order = true
      GROUP BY o.id, ca.company_name, o.created_at, o.total_amount, o.status, o.expected_delivery
      ORDER BY o.created_at DESC
      LIMIT 20
    `);

    // Get supplier information
    const supplierInfo = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.contact_person,
        s.email,
        s.phone,
        s.products,
        s.lead_time,
        s.payment_terms,
        s.rating
      FROM suppliers s
      ORDER BY s.rating DESC
    `);

    // Get bulk operations history
    const importHistory = await pool.query(`
      SELECT 
        id,
        filename,
        operation_type,
        records_processed,
        status,
        created_at as date,
        error_count
      FROM bulk_operations
      WHERE operation_type = 'import'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const exportHistory = await pool.query(`
      SELECT 
        id,
        filename,
        operation_type,
        records_processed,
        export_type,
        created_at as date
      FROM bulk_operations
      WHERE operation_type = 'export'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    res.json({
      corporateAccounts: corporateAccounts.rows,
      wholesaleProducts: wholesaleProducts.rows,
      bulkOrders: bulkOrders.rows,
      supplierInfo: supplierInfo.rows,
      bulkOperations: {
        importHistory: importHistory.rows,
        exportHistory: exportHistory.rows
      }
    });

  } catch (error) {
    console.error('Error fetching B2B dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch B2B dashboard data' });
  }
});

// Create new corporate account
router.post('/corporate-accounts', adminAuth, async (req, res) => {
  try {
    const {
      company_name,
      contact_person,
      email,
      phone,
      account_type,
      credit_limit,
      payment_terms,
      address,
      city,
      state,
      zip_code,
      country
    } = req.body;

    // Validate required fields
    if (!company_name || !contact_person || !email) {
      return res.status(400).json({ error: 'Company name, contact person, and email are required' });
    }

    // Check if email already exists
    const existingAccount = await pool.query(
      'SELECT id FROM corporate_accounts WHERE email = $1',
      [email]
    );

    if (existingAccount.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered with another corporate account' });
    }

    const result = await pool.query(`
      INSERT INTO corporate_accounts (
        company_name, contact_person, email, phone, account_type,
        credit_limit, payment_terms, address, city, state, zip_code, country
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      company_name, contact_person, email, phone, account_type,
      credit_limit, payment_terms, address, city, state, zip_code, country
    ]);

    res.status(201).json({
      message: 'Corporate account created successfully',
      account: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating corporate account:', error);
    res.status(500).json({ error: 'Failed to create corporate account' });
  }
});

// Update corporate account
router.put('/corporate-accounts/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Build dynamic update query
    const setClause = Object.keys(updateFields)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [id, ...Object.values(updateFields)];

    const result = await pool.query(`
      UPDATE corporate_accounts 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Corporate account not found' });
    }

    res.json({
      message: 'Corporate account updated successfully',
      account: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating corporate account:', error);
    res.status(500).json({ error: 'Failed to update corporate account' });
  }
});

// Create wholesale product
router.post('/wholesale-products', adminAuth, async (req, res) => {
  try {
    const {
      name,
      sku,
      regular_price,
      wholesale_price,
      category_id,
      stock_quantity,
      bulk_discounts,
      description
    } = req.body;

    // Validate required fields
    if (!name || !sku || !regular_price || !wholesale_price) {
      return res.status(400).json({ error: 'Name, SKU, regular price, and wholesale price are required' });
    }

    // Check if SKU already exists
    const existingProduct = await pool.query(
      'SELECT id FROM products WHERE sku = $1',
      [sku]
    );

    if (existingProduct.rows.length > 0) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    const result = await pool.query(`
      INSERT INTO products (
        name, sku, price, wholesale_price, category_id, stock_quantity,
        bulk_discounts, description, is_wholesale
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING *
    `, [
      name, sku, regular_price, wholesale_price, category_id, stock_quantity,
      bulk_discounts, description
    ]);

    res.status(201).json({
      message: 'Wholesale product created successfully',
      product: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating wholesale product:', error);
    res.status(500).json({ error: 'Failed to create wholesale product' });
  }
});

// Bulk import products/inventory
router.post('/bulk-import', adminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    let recordsProcessed = 0;
    let errorCount = 0;

    // Process CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
        recordsProcessed++;
      })
      .on('end', async () => {
        try {
          // Process the imported data
          for (const row of results) {
            try {
              if (row.operation === 'create') {
                // Create new product
                await pool.query(`
                  INSERT INTO products (
                    name, sku, price, wholesale_price, category_id, 
                    stock_quantity, description, is_wholesale
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `, [
                  row.name, row.sku, row.price, row.wholesale_price,
                  row.category_id, row.stock_quantity, row.description, true
                ]);
              } else if (row.operation === 'update') {
                // Update existing product
                await pool.query(`
                  UPDATE products SET
                    price = $1, wholesale_price = $2, stock_quantity = $3,
                    updated_at = NOW()
                  WHERE sku = $4
                `, [row.price, row.wholesale_price, row.stock_quantity, row.sku]);
              }
            } catch (err) {
              errorCount++;
              console.error(`Error processing row:`, row, err);
            }
          }

          // Log the operation
          await pool.query(`
            INSERT INTO bulk_operations (
              filename, operation_type, records_processed, status, error_count
            ) VALUES ($1, 'import', $2, 'completed', $3)
          `, [req.file.originalname, recordsProcessed, errorCount]);

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            message: 'Bulk import completed successfully',
            recordsProcessed,
            errorCount
          });

        } catch (error) {
          console.error('Error processing bulk import:', error);
          res.status(500).json({ error: 'Failed to process bulk import' });
        }
      });

  } catch (error) {
    console.error('Error handling bulk import:', error);
    res.status(500).json({ error: 'Failed to handle bulk import' });
  }
});

// Bulk export data
router.post('/bulk-export', adminAuth, async (req, res) => {
  try {
    const { type } = req.body;

    let query = '';
    let filename = '';

    switch (type) {
      case 'products':
        query = `
          SELECT 
            p.name, p.sku, p.price, p.wholesale_price, p.stock_quantity,
            c.name as category, p.description
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.is_wholesale = true
          ORDER BY p.name
        `;
        filename = 'wholesale_products';
        break;
      
      case 'customers':
        query = `
          SELECT 
            u.first_name, u.last_name, u.email, u.phone,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_spent
          FROM users u
          LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
          WHERE u.is_admin = false
          GROUP BY u.id, u.first_name, u.last_name, u.email
          ORDER BY total_spent DESC
        `;
        filename = 'customer_data';
        break;
      
      case 'orders':
        query = `
          SELECT 
            o.id, o.created_at, o.total_amount, o.status,
            u.first_name, u.last_name, u.email
          FROM orders o
          JOIN users u ON o.user_id = u.id
          ORDER BY o.created_at DESC
        `;
        filename = 'order_history';
        break;
      
      case 'analytics':
        query = `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as orders,
            SUM(total_amount) as revenue
          FROM orders
          WHERE status != 'cancelled'
          GROUP BY DATE(created_at)
          ORDER BY date DESC
        `;
        filename = 'analytics_data';
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    const result = await pool.query(query);
    
    // Convert to CSV format
    const csvData = convertToCSV(result.rows);
    
    // Log the export operation
    await pool.query(`
      INSERT INTO bulk_operations (
        filename, operation_type, records_processed, export_type
      ) VALUES ($1, 'export', $2, $3)
    `, [`${filename}_${new Date().toISOString().split('T')[0]}.csv`, result.rows.length, type]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvData);

  } catch (error) {
    console.error('Error handling bulk export:', error);
    res.status(500).json({ error: 'Failed to handle bulk export' });
  }
});

// Helper function to convert data to CSV format
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

// Get supplier information
router.get('/suppliers', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, contact_person, email, phone,
        products, lead_time, payment_terms, rating
      FROM suppliers
      ORDER BY rating DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch supplier information' });
  }
});

// Create new supplier
router.post('/suppliers', adminAuth, async (req, res) => {
  try {
    const {
      name,
      contact_person,
      email,
      phone,
      products,
      lead_time,
      payment_terms
    } = req.body;

    if (!name || !contact_person || !email) {
      return res.status(400).json({ error: 'Name, contact person, and email are required' });
    }

    const result = await pool.query(`
      INSERT INTO suppliers (
        name, contact_person, email, phone, products, lead_time, payment_terms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [name, contact_person, email, phone, products, lead_time, payment_terms]);

    res.status(201).json({
      message: 'Supplier created successfully',
      supplier: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// Get bulk operations history
router.get('/bulk-operations', adminAuth, async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    
    let query = `
      SELECT id, filename, operation_type, records_processed, status, 
             created_at, error_count, export_type
      FROM bulk_operations
    `;
    
    if (type) {
      query += ` WHERE operation_type = $1`;
      query += ` ORDER BY created_at DESC LIMIT $2`;
      const result = await pool.query(query, [type, limit]);
      res.json(result.rows);
    } else {
      query += ` ORDER BY created_at DESC LIMIT $1`;
      const result = await pool.query(query, [limit]);
      res.json(result.rows);
    }

  } catch (error) {
    console.error('Error fetching bulk operations:', error);
    res.status(500).json({ error: 'Failed to fetch bulk operations history' });
  }
});

module.exports = router;
