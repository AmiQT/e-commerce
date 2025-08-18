import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Link } from 'react-router-dom';
import WishlistSharing from './WishlistSharing';

const UserProfile = () => {
  const { user, token, handleLogin } = useUser();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(
        '/api/auth/profile',
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Update the user context with new data
        handleLogin({
          ...user,
          ...profileData
        }, token);
        
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        '/api/auth/change-password',
        {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
        setIsChangingPassword(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcf8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-xl text-[#1b0e0e] mb-4">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8f8] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1b0e0e] mb-4">My Profile</h1>
          <p className="text-xl text-[#994d51]">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f3e7e8]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1b0e0e]">Profile Information</h2>
              <div className="flex space-x-3">
                <Link
                  to="/preferences"
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Preferences
                </Link>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 text-sm font-medium text-[#ea2a33] bg-white border border-[#ea2a33] rounded-lg hover:bg-[#ea2a33] hover:text-white transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleProfileUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                      className="w-full px-4 py-3 border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                      className="w-full px-4 py-3 border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#ea2a33] text-white py-3 rounded-lg hover:bg-[#d4252e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#994d51] mb-1">First Name</label>
                  <p className="text-lg text-[#1b0e0e]">{user.first_name || 'Not set'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#994d51] mb-1">Last Name</label>
                  <p className="text-lg text-[#1b0e0e]">{user.last_name || 'Not set'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#994d51] mb-1">Email</label>
                  <p className="text-lg text-[#1b0e0e]">{user.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#994d51] mb-1">Account Type</label>
                  <p className="text-lg text-[#1b0e0e]">
                    {user.is_admin ? 'Administrator' : 'Customer'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f3e7e8]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1b0e0e]">Change Password</h2>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="px-4 py-2 text-sm font-medium text-[#ea2a33] bg-white border border-[#ea2a33] rounded-lg hover:bg-[#ea2a33] hover:text-white transition-colors"
              >
                {isChangingPassword ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {isChangingPassword ? (
              <form onSubmit={handlePasswordChange}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      className="w-full px-4 py-3 border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      className="w-full px-4 py-3 border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-[#1b0e0e] mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      className="w-full px-4 py-3 border border-[#f3e7e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea2a33] focus:border-transparent"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#ea2a33] text-white py-3 rounded-lg hover:bg-[#d4252e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔐</div>
                <p className="text-[#994d51] mb-4">Keep your account secure by regularly updating your password</p>
                <p className="text-sm text-[#994d51]">Password must be at least 6 characters long</p>
              </div>
            )}
          </div>

          {/* Orders Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#f3e7e8] mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#1b0e0e]">Order History</h2>
              <Link 
                to="/orders" 
                className="px-4 py-2 text-sm font-medium text-[#ea2a33] bg-white border border-[#ea2a33] rounded-lg hover:bg-[#ea2a33] hover:text-white transition-colors"
              >
                View All Orders
              </Link>
            </div>
            
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📦</div>
              <p className="text-[#994d51] mb-4">Track your orders and view order history</p>
              <Link 
                to="/orders" 
                className="inline-block bg-[#ea2a33] text-white px-6 py-3 rounded-lg hover:bg-[#d4252e] transition-colors font-medium"
              >
                Go to Orders
              </Link>
            </div>
          </div>

          {/* Wishlist Sharing */}
          <div className="mt-8">
            <WishlistSharing />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
