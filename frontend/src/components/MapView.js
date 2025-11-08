import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { MapPin, Search, Filter, Zap, Navigation } from 'lucide-react';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

const MapView = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [filteredSpots, setFilteredSpots] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpots();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filter, searchQuery, spots]);

  const loadSpots = async () => {
    try {
      const response = await axiosInstance.get('/spots');
      setSpots(response.data);
    } catch (error) {
      toast.error('Failed to load parking spots');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = spots;

    if (filter !== 'all') {
      filtered = filtered.filter(s => s.status === filter);
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.slot_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSpots(filtered);
  };

  const refreshSpots = async () => {
    try {
      await axiosInstance.post('/simulate-iot');
      await loadSpots();
      toast.success('Map refreshed with latest data');
    } catch (error) {
      toast.error('Failed to refresh map');
    }
  };

  const SpotMarker = ({ spot }) => (
    <div
      data-testid={`map-spot-${spot.slot_number}`}
      onClick={() => navigate(`/reserve/${spot.id}`)}
      className="bg-white rounded-xl p-4 shadow-lg card-hover cursor-pointer border-l-4"
      style={{
        borderLeftColor:
          spot.status === 'available'
            ? '#43A047'
            : spot.status === 'occupied'
            ? '#D32F2F'
            : spot.status === 'soon_available'
            ? '#F9A825'
            : '#1976D2'
      }}
    >
      <div className="flex justify-between items-start mb-2">
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
          <span>{Math.floor(Math.random() * 500 + 100)}m</span>
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

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#212121] mb-2">Real-Time Parking Map</h1>
          <p className="text-[#616161]">Live availability powered by IoT sensors</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#616161]" />
              <input
                data-testid="search-spots-input"
                type="text"
                placeholder="Search by slot number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                data-testid="filter-status-select"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="soon_available">Soon Available</option>
              </select>
              <button
                data-testid="refresh-map-btn"
                onClick={refreshSpots}
                className="px-6 py-3 bg-[#1976D2] text-white rounded-xl font-medium hover:bg-[#1565C0] transition"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-[#43A047]">{spots.filter(s => s.status === 'available').length}</div>
            <div className="text-sm text-[#616161]">Available</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-[#D32F2F]">{spots.filter(s => s.status === 'occupied').length}</div>
            <div className="text-sm text-[#616161]">Occupied</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-[#F9A825]">{spots.filter(s => s.status === 'soon_available').length}</div>
            <div className="text-sm text-[#616161]">Soon Available</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-2xl font-bold text-[#1976D2]">{spots.filter(s => s.status === 'reserved').length}</div>
            <div className="text-sm text-[#616161]">Reserved</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="aspect-video bg-gradient-to-br from-[#E3F2FD] to-[#E8F5E9] rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#1976D2] rounded-full"></div>
              <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#43A047] rounded-full"></div>
            </div>
            <div className="relative text-center">
              <MapPin className="w-16 h-16 text-[#1976D2] mx-auto mb-4" />
              <div className="text-xl font-semibold text-[#212121] mb-2">Interactive Map View</div>
              <div className="text-sm text-[#616161]">Real-time parking spot visualization</div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-[#616161]">Loading spots...</div>
          ) : filteredSpots.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#616161]">No spots found</div>
          ) : (
            filteredSpots.map((spot) => <SpotMarker key={spot.id} spot={spot} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;