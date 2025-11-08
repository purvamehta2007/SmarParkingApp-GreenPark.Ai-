import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Share2, MapPin, DollarSign, Plus, Navigation } from 'lucide-react';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

const SharedSpaces = ({ user, onLogout }) => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: { lat: 28.6139, lng: 77.2090 },
    rate_per_hour: 40,
    slot_type: 'regular'
  });

  useEffect(() => {
    loadSharedSpaces();
  }, []);

  const loadSharedSpaces = async () => {
    try {
      const response = await axiosInstance.get('/shared-spaces');
      setSpaces(response.data);
    } catch (error) {
      toast.error('Failed to load shared spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpace = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/shared-spaces', formData);
      toast.success('Space added successfully');
      setShowAddForm(false);
      setFormData({
        name: '',
        location: { lat: 28.6139, lng: 77.2090 },
        rate_per_hour: 40,
        slot_type: 'regular'
      });
      loadSharedSpaces();
    } catch (error) {
      toast.error('Failed to add space');
    }
  };

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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#212121] mb-2">Shared Spaces</h1>
            <p className="text-[#616161]">Discover community-listed parking spots</p>
          </div>
          <button
            data-testid="add-space-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-6 py-3 bg-[#1976D2] text-white rounded-xl font-semibold hover:bg-[#1565C0] transition"
          >
            <Plus className="w-5 h-5" />
            List Your Space
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-semibold text-[#212121] mb-4">Add Your Parking Space</h2>
            <form onSubmit={handleAddSpace} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#616161] mb-2">Space Name</label>
                  <input
                    data-testid="space-name-input"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., My Driveway"
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#616161] mb-2">Rate per Hour (₹)</label>
                  <input
                    data-testid="space-rate-input"
                    type="number"
                    required
                    min="10"
                    value={formData.rate_per_hour}
                    onChange={(e) => setFormData({ ...formData, rate_per_hour: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#616161] mb-2">Slot Type</label>
                <select
                  data-testid="space-type-select"
                  value={formData.slot_type}
                  onChange={(e) => setFormData({ ...formData, slot_type: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
                >
                  <option value="regular">Regular</option>
                  <option value="covered">Covered</option>
                  <option value="ev_charging">EV Charging</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  data-testid="submit-space-btn"
                  type="submit"
                  className="flex-1 py-3 bg-[#1976D2] text-white rounded-xl font-semibold hover:bg-[#1565C0] transition"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 bg-[#E0E0E0] text-[#616161] rounded-xl font-semibold hover:bg-[#BDBDBD] transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {spaces.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <Share2 className="w-16 h-16 text-[#1976D2] mx-auto mb-4 opacity-50" />
            <div className="text-xl font-medium text-[#212121] mb-2">No shared spaces yet</div>
            <div className="text-[#616161] mb-6">Be the first to list your parking space</div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-[#1976D2] text-white rounded-xl font-semibold hover:bg-[#1565C0] transition"
            >
              List Your Space
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <div
                key={space.id}
                data-testid={`shared-space-${space.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-lg card-hover cursor-pointer"
              >
                <div className="h-48 bg-gradient-to-br from-[#E3F2FD] to-[#E8F5E9] flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-[#1976D2] opacity-50" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg text-[#212121]">{space.name}</h3>
                    <span className="px-3 py-1 bg-[#E8F5E9] text-[#43A047] rounded-full text-xs font-medium">
                      {space.slot_type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#616161] mb-4">
                    <Navigation className="w-4 h-4" />
                    <span className="text-sm">{Math.floor(Math.random() * 500 + 100)}m away</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[#E0E0E0]">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-5 h-5 text-[#1976D2]" />
                      <span className="text-2xl font-bold text-[#1976D2]">₹{space.rate_per_hour}</span>
                      <span className="text-sm text-[#616161]">/hr</span>
                    </div>
                    <button className="px-4 py-2 bg-[#1976D2] text-white rounded-lg font-medium hover:bg-[#1565C0] transition text-sm">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedSpaces;