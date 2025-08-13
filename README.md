# 🛍️ E-Commerce Platform

A modern, full-stack e-commerce application built with React, Node.js, and PostgreSQL.

## ✨ Features

### 🚀 Core E-commerce
- User authentication & authorization
- Product catalog with search & filtering
- Shopping cart & wishlist management
- Secure checkout with multiple payment gateways
- Order management & tracking
- Admin dashboard

### 🎯 Advanced Features
- AI-powered product recommendations
- Intelligent chatbot support
- Dynamic pricing algorithms
- Fraud detection system
- Advanced analytics & business intelligence
- B2B portal with corporate accounts
- Multi-language support & currency conversion
- Mobile-responsive design

### 🔧 Technical Features
- Real-time system monitoring
- Performance optimization
- Advanced caching strategies
- Bulk import/export capabilities
- Supplier management
- Purchase order system

## 🛠️ Tech Stack

### Frontend
- **React 18** with Hooks
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **PostgreSQL** database
- **Redis** for caching
- **Stripe** payment integration
- **JWT** authentication
- **Multer** for file uploads

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd e-commerce
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend (.env)
   cd ../backend
   cp .env.example .env
   # Edit .env with your database and API keys
   ```

4. **Set up database**
   ```bash
   # Run the complete schema
   psql -U your_username -d your_database -f complete_schema.sql
   ```

5. **Start the application**
   ```bash
   # Start backend (from backend directory)
   npm start
   
   # Start frontend (from frontend directory)
   npm run dev
   ```

## 🌐 Deployment

### Frontend (GitHub Pages)
- Build the project: `npm run build`
- Deploy to GitHub Pages or any static hosting

### Backend (Render.com)
- Connect your GitHub repository
- Set environment variables
- Deploy automatically on push

## 📱 Mobile Responsive

The application is fully responsive and optimized for mobile devices with:
- Touch-friendly interfaces
- Mobile-first design
- Optimized navigation
- Responsive grids and layouts

## 🔐 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
REDIS_URL=your_redis_url
```

## 📊 Database Schema

The application uses a comprehensive PostgreSQL schema including:
- Users & authentication
- Products & categories
- Orders & payments
- Analytics & metrics
- B2B features
- System monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository.
