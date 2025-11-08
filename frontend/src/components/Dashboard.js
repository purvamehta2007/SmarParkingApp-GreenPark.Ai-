import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { MapPin, Zap, Award, TrendingUp, Navigation, Clock } from 'lucide-react';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ available: 0, ev: 0, points: 0 });
  const [nearbySpots, setNearbySpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [spotsRes, rewardsRes] = await Promise.all([
        axiosInstance.get('/spots'),
        axiosInstance.get('/rewards/me')
      ]);

      const availableCount = spotsRes.data.filter(s => s.status === 'available').length;
      const evCount = spotsRes.data.filter(s => s.ev_charging && s.status === 'available').length;

      setStats({
        available: availableCount,
        ev: evCount,
        points: rewardsRes.data.points || 0
      });

      setNearbySpots(spotsRes.data.slice(0, 6));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-lg card-hover cursor-pointer`}
      data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-[#212121] mb-1">{value}</div>
      <div className="text-sm text-[#616161] font-medium">{label}</div>
    </div>
  );

  const SpotCard = ({ spot }) => (
    <div
      data-testid={`nearby-spot-${spot.slot_number}`}
      className="bg-white rounded-xl p-4 shadow-md card-hover cursor-pointer"
      onClick={() => navigate(`/reserve/${spot.id}`)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-semibold text-[#212121] mb-1">Slot {spot.slot_number}</div>
          <div className="text-sm text-[#616161]">₹{spot.rate_per_hour}/hr</div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            spot.status === 'available'
              ? 'status-available'
              : spot.status === 'occupied'
              ? 'status-occupied'
              : spot.status === 'soon_available'
              ? 'status-soon'
              : 'status-reserved'
          }`}
        >
          {spot.status.replace('_', ' ')}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-[#616161]">
        <div className="flex items-center gap-1">
          <Navigation className="w-3 h-3" />
          <span>200m away</span>
        </div>
        {spot.ev_charging && (
          <div className="flex items-center gap-1 text-[#43A047]">
            <Zap className="w-3 h-3" />
            <span>EV Charging</span>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F8]">
        <Navbar user={user} onLogout={onLogout} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-[#1976D2] text-xl font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#212121] mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-[#616161]">Find your perfect parking spot in seconds</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={MapPin}
            label="Available Spots"
            value={stats.available}
            color="bg-[#1976D2]"
            onClick={() => navigate('/map')}
          />
          <StatCard
            icon={Zap}
            label="EV Charging"
            value={stats.ev}
            color="bg-[#43A047]"
            onClick={() => navigate('/map')}
          />
          <StatCard
            icon={Award}
            label="Eco Points"
            value={stats.points}
            color="bg-[#F9A825]"
            onClick={() => navigate('/rewards')}
          />
          <StatCard
            icon={TrendingUp}
            label="AI Predictions"
            value="85%"
            color="bg-[#7B1FA2]"
            onClick={() => navigate('/predict')}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#212121]">Nearby Parking</h2>
              <button
                data-testid="view-all-spots-btn"
                onClick={() => navigate('/map')}
                className="text-sm text-[#1976D2] font-medium hover:underline"
              >
                View All
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {nearbySpots.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#1976D2] to-[#1565C0] rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Quick Actions</span>
              </div>
              <div className="space-y-3">
                <button
                  data-testid="quick-action-find-parking"
                  onClick={() => navigate('/map')}
                  className="w-full bg-white text-[#1976D2] py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Find Parking Now
                </button>
                <button
                  data-testid="quick-action-predict"
                  onClick={() => navigate('/predict')}
                  className="w-full bg-white/20 backdrop-blur-sm text-white py-3 rounded-xl font-semibold hover:bg-white/30 transition"
                >
                  Predict Availability
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold text-[#212121] mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#43A047]"></div>
                  <span className="text-[#616161]">+15 points earned today</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#1976D2]"></div>
                  <span className="text-[#616161]">2 bookings this week</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#F9A825]"></div>
                  <span className="text-[#616161]">1.2kg CO₂ saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;