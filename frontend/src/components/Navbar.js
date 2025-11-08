import { Car, Menu, X, MapPin, TrendingUp, Award, History, Wallet, User, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Car, label: 'Home' },
    { path: '/map', icon: MapPin, label: 'Map' },
    { path: '/predict', icon: TrendingUp, label: 'Predict' },
    { path: '/rewards', icon: Award, label: 'Rewards' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/shared-spaces', icon: Share2, label: 'Shared' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1976D2] to-[#43A047] flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1976D2]">GreenPark.AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                    isActive
                      ? 'bg-[#E3F2FD] text-[#1976D2]'
                      : 'text-[#616161] hover:bg-[#F4F6F8]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              data-testid="nav-profile"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[#F4F6F8] transition"
            >
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1976D2] flex items-center justify-center text-white font-medium">
                  {user?.name?.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-[#212121]">{user?.name}</span>
            </Link>

            <button
              data-testid="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#616161] hover:bg-[#F4F6F8] rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E0E0E0]">
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                    isActive
                      ? 'bg-[#E3F2FD] text-[#1976D2]'
                      : 'text-[#616161] hover:bg-[#F4F6F8]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[#616161] hover:bg-[#F4F6F8] transition"
            >
              <User className="w-5 h-5" />
              Profile
            </Link>
            <button
              data-testid="logout-btn"
              onClick={onLogout}
              className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-[#D32F2F] hover:bg-red-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;