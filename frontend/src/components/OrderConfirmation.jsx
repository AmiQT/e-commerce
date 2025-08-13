import React from 'react';
import { useParams, Link } from 'react-router-dom';

const OrderConfirmation = () => {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center bg-white p-8 rounded-2xl shadow-lg border border-[#f3e7e8]">
        <div className="text-6xl mb-4 text-green-500">✅</div>
        <h1 className="text-3xl font-bold text-[#1b0e0e] mb-4">Order Confirmed!</h1>
        <p className="text-[#994d51] text-lg mb-6">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        {orderId && (
          <p className="text-xl font-semibold text-[#1b0e0e] mb-6">
            Order ID: <span className="text-[#ea2a33]">{orderId}</span>
          </p>
        )}
        <div className="flex flex-col space-y-4">
          <Link
            to="/orders"
            className="bg-[#ea2a33] text-white px-8 py-3 rounded-lg hover:bg-[#d4252e] transition-colors font-medium text-lg"
          >
            View Your Orders
          </Link>
          <Link
            to="/products"
            className="bg-[#f3e7e8] text-[#1b0e0e] px-8 py-3 rounded-lg hover:bg-[#e8d8d9] transition-colors font-medium text-lg"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
