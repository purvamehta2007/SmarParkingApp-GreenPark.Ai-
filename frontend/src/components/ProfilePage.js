import Navbar from './Navbar';
import { User, Mail, LogOut, Bell, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ProfilePage = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#212121] mb-2">Profile & Settings</h1>
          <p className="text-[#616161]">Manage your account preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-[#212121] mb-6">Account Information</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#616161] mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name
                  </label>
                  <input
                    data-testid="profile-name-input"
                    type="text"
                    value={user?.name || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-xl bg-[#F4F6F8] text-[#212121] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#616161] mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    data-testid="profile-email-input"
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-xl bg-[#F4F6F8] text-[#212121] cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-[#212121] mb-6">Preferences</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-[#F4F6F8] rounded-xl cursor-pointer hover:bg-[#E3F2FD] transition">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#1976D2]" />
                    <div>
                      <div className="font-medium text-[#212121]">Email Notifications</div>
                      <div className="text-sm text-[#616161]">Receive booking confirmations via email</div>
                    </div>
                  </div>
                  <input
                    data-testid="notification-toggle"
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-[#1976D2] rounded focus:ring-2 focus:ring-[#1976D2] border-[#E0E0E0]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-[#F4F6F8] rounded-xl cursor-pointer hover:bg-[#E3F2FD] transition">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#43A047]" />
                    <div>
                      <div className="font-medium text-[#212121]">Eco Mode</div>
                      <div className="text-sm text-[#616161]">Prioritize eco-friendly parking spots</div>
                    </div>
                  </div>
                  <input
                    data-testid="eco-mode-toggle"
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 text-[#43A047] rounded focus:ring-2 focus:ring-[#43A047] border-[#E0E0E0]"
                  />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-[#212121] mb-6">Account Actions</h2>
              <button
                data-testid="logout-profile-btn"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#D32F2F] text-white rounded-xl font-semibold hover:bg-[#C62828] transition"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-[#E3F2FD]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1976D2] to-[#43A047] flex items-center justify-center mx-auto mb-4 text-white text-3xl font-bold">
                  {user?.name?.charAt(0)}
                </div>
              )}
              <div className="font-semibold text-lg text-[#212121] mb-1">{user?.name}</div>
              <div className="text-sm text-[#616161] mb-4">{user?.email}</div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8F5E9] text-[#43A047] rounded-full text-sm font-medium">
                ✔ Verified User
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-2xl p-6">
              <h3 className="font-semibold text-[#212121] mb-3">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#616161]">Member Since</span>
                  <span className="font-medium text-[#212121]">
                    {new Date(user?.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#616161]">Total Bookings</span>
                  <span className="font-medium text-[#212121]">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#616161]">Carbon Saved</span>
                  <span className="font-medium text-[#43A047]">0 kg</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold text-[#212121] mb-3">Help & Support</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-[#1976D2] hover:underline">FAQ</a>
                <a href="#" className="block text-[#1976D2] hover:underline">Contact Support</a>
                <a href="#" className="block text-[#1976D2] hover:underline">Privacy Policy</a>
                <a href="#" className="block text-[#1976D2] hover:underline">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;