import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ProductReviews = ({ productId, productName }) => {
  const { user, token } = useUser();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    review_text: ''
  });

  useEffect(() => {
    if (productId) {
      fetchReviews();
      checkUserReview();
    }
  }, [productId, token]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/reviews/product/${productId}`);
      setReviews(response.data.reviews);
      setStats(response.data.stats);
    } catch (err) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const checkUserReview = async () => {
    if (!user || !token) return;
    
    try {
      const response = await axios.get(`http://localhost:3001/api/reviews/product/${productId}`);
      const userReview = response.data.reviews.find(review => 
        review.reviewer_name === `${user.first_name} ${user.last_name}`
      );
      setUserReview(userReview);
    } catch (err) {
      // User hasn't reviewed yet
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (userReview) {
        // Update existing review
        await axios.put(
          `http://localhost:3001/api/reviews/${userReview.id}`,
          formData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        toast.success('Review updated successfully!');
      } else {
        // Add new review
        await axios.post(
          'http://localhost:3001/api/reviews',
          { ...formData, product_id: productId },
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        toast.success('Review added successfully!');
      }
      
      setShowReviewForm(false);
      fetchReviews();
      checkUserReview();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save review');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    
    try {
      await axios.delete(`http://localhost:3001/api/reviews/${userReview.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Review deleted successfully!');
      setUserReview(null);
      fetchReviews();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const StarRating = ({ rating, interactive = false, onRatingChange }) => {
    const stars = [1, 2, 3, 4, 5];
    
    return (
      <div className="flex space-x-1">
        {stars.map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "button"}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            className={`text-2xl ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            disabled={!interactive}
          >
            {star <= rating ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-[#1b0e0e]">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#f3e7e8]">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1b0e0e] mb-2">Customer Reviews</h2>
          <div className="flex items-center space-x-4">
            <StarRating rating={Math.round(stats.averageRating)} />
            <span className="text-lg font-medium text-[#1b0e0e]">
              {stats.averageRating.toFixed(1)} out of 5
            </span>
            <span className="text-[#994d51]">
              ({stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
        
        {user && !userReview && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-[#ea2a33] text-white px-6 py-2 rounded-lg hover:bg-[#d4252e] transition-colors font-medium"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-[#fcf8f8] rounded-xl p-6 mb-6 border border-[#f3e7e8]">
          <h3 className="text-lg font-semibold text-[#1b0e0e] mb-4">
            {userReview ? 'Edit Your Review' : 'Write Your Review'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
                Rating *
              </label>
              <StarRating 
                rating={formData.rating} 
                interactive={true} 
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
                Review (optional)
              </label>
              <textarea
                value={formData.review_text}
                onChange={(e) => setFormData(prev => ({ ...prev, review_text: e.target.value }))}
                rows="4"
                className="w-full px-4 py-3 border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                placeholder="Share your thoughts about this product..."
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-[#ea2a33] text-white px-6 py-2 rounded-lg hover:bg-[#d4252e] transition-colors font-medium"
              >
                {userReview ? 'Update Review' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-[#f3e7e8] text-[#1b0e0e] px-6 py-2 rounded-lg hover:bg-[#e8d8d9] transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User's Review (if exists) */}
      {userReview && (
        <div className="bg-[#fcf8f8] rounded-xl p-4 mb-6 border border-[#f3e7e8]">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-[#1b0e0e] mb-2">Your Review</h4>
              <StarRating rating={userReview.rating} />
              {userReview.review_text && (
                <p className="text-[#1b0e0e] mt-2">{userReview.review_text}</p>
              )}
              <p className="text-sm text-[#994d51] mt-2">
                {formatDate(userReview.created_at)}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setFormData({ rating: userReview.rating, review_text: userReview.review_text || '' });
                  setShowReviewForm(true);
                }}
                className="text-[#ea2a33] hover:text-[#d4252e] font-medium text-sm"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-[#f3e7e8] pb-4 last:border-b-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-[#1b0e0e]">{review.reviewer_name}</p>
                  <StarRating rating={review.rating} />
                </div>
                <span className="text-sm text-[#994d51]">
                  {formatDate(review.created_at)}
                </span>
              </div>
              {review.review_text && (
                <p className="text-[#1b0e0e] mt-2">{review.review_text}</p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-[#994d51] mb-2">No reviews yet</p>
            <p className="text-sm text-[#994d51]">Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
