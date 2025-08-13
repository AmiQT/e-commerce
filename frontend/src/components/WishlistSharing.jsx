import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';

const WishlistSharing = () => {
  const { user, wishlist } = useUser();
  const [shareLink, setShareLink] = useState('');
  const [showShareForm, setShowShareForm] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  const generateShareLink = () => {
    if (!user || !wishlist || wishlist.length === 0) {
      toast.error('You need to have items in your wishlist to share it');
      return;
    }

    // Generate a unique share token (in a real app, this would be stored in the database)
    const shareToken = btoa(`${user.id}-${Date.now()}`);
    const shareUrl = `${window.location.origin}/shared-wishlist/${shareToken}`;
    
    setShareLink(shareUrl);
    setShowShareForm(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copied to clipboard!');
    }
  };

  const shareOnSocialMedia = (platform) => {
    const encodedMessage = encodeURIComponent(shareMessage || `Check out my wishlist on ${window.location.hostname}!`);
    const encodedUrl = encodeURIComponent(shareLink);
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=My Wishlist&body=${encodedMessage}%0A%0A${encodedUrl}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const resetShare = () => {
    setShareLink('');
    setShowShareForm(false);
    setShareMessage('');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#f3e7e8]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1b0e0e] mb-2">Share Your Wishlist</h2>
          <p className="text-[#994d51]">
            Share your wishlist with friends and family
          </p>
        </div>
        
        {!showShareForm && (
          <button
            onClick={generateShareLink}
            disabled={!wishlist || wishlist.length === 0}
            className="bg-[#ea2a33] text-white px-6 py-2 rounded-lg hover:bg-[#d4252e] transition-colors font-medium disabled:bg-[#f3e7e8] disabled:text-[#994d51] disabled:cursor-not-allowed"
          >
            Generate Share Link
          </button>
        )}
      </div>

      {showShareForm && (
        <div className="space-y-6">
          {/* Share Link */}
          <div>
            <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
              Share Link
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-4 py-3 border border-[#f3e7e8] rounded-lg bg-[#fcf8f8] text-[#1b0e0e]"
              />
              <button
                onClick={copyToClipboard}
                className="bg-[#ea2a33] text-white px-4 py-3 rounded-lg hover:bg-[#d4252e] transition-colors font-medium"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
              Custom Message (optional)
            </label>
            <textarea
              value={shareMessage}
              onChange={(e) => setShareMessage(e.target.value)}
              rows="3"
              className="w-full px-4 py-3 border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
              placeholder="Add a personal message to your shared wishlist..."
            />
          </div>

          {/* Social Media Sharing */}
          <div>
            <label className="block text-sm font-medium text-[#1b0e0e] mb-3">
              Share on Social Media
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => shareOnSocialMedia('twitter')}
                className="flex items-center justify-center space-x-2 bg-[#1DA1F2] text-white px-4 py-2 rounded-lg hover:bg-[#1a8cd8] transition-colors"
              >
                <span className="text-lg">🐦</span>
                <span className="font-medium">Twitter</span>
              </button>
              
              <button
                onClick={() => shareOnSocialMedia('facebook')}
                className="flex items-center justify-center space-x-2 bg-[#4267B2] text-white px-4 py-2 rounded-lg hover:bg-[#365899] transition-colors"
              >
                <span className="text-lg">📘</span>
                <span className="font-medium">Facebook</span>
              </button>
              
              <button
                onClick={() => shareOnSocialMedia('whatsapp')}
                className="flex items-center justify-center space-x-2 bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#20ba5a] transition-colors"
              >
                <span className="text-lg">💬</span>
                <span className="font-medium">WhatsApp</span>
              </button>
              
              <button
                onClick={() => shareOnSocialMedia('email')}
                className="flex items-center justify-center space-x-2 bg-[#EA4335] text-white px-4 py-2 rounded-lg hover:bg-[#d33426] transition-colors"
              >
                <span className="text-lg">📧</span>
                <span className="font-medium">Email</span>
              </button>
            </div>
          </div>

          {/* Reset Button */}
          <div className="text-center">
            <button
              onClick={resetShare}
              className="bg-[#f3e7e8] text-[#1b0e0e] px-6 py-2 rounded-lg hover:bg-[#e8d8d9] transition-colors font-medium"
            >
              Generate New Link
            </button>
          </div>
        </div>
      )}

      {/* Wishlist Summary */}
      {wishlist && wishlist.length > 0 && (
        <div className="mt-6 p-4 bg-[#fcf8f8] rounded-xl border border-[#f3e7e8]">
          <h3 className="font-semibold text-[#1b0e0e] mb-2">Your Wishlist Summary</h3>
          <div className="flex items-center justify-between text-sm text-[#994d51]">
            <span>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</span>
            <span>Total Value: ${wishlist.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)}</span>
          </div>
        </div>
      )}

      {(!wishlist || wishlist.length === 0) && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💝</div>
          <p className="text-[#994d51] mb-2">Your wishlist is empty</p>
          <p className="text-sm text-[#994d51]">Add some products to start sharing!</p>
        </div>
      )}
    </div>
  );
};

export default WishlistSharing;
