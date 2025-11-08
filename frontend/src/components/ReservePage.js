import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { MapPin, Clock, Zap, DollarSign, ArrowRight } from 'lucide-react';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

const ReservePage = ({ user, onLogout }) => {
  const { spotId } = useParams();
  const navigate = useNavigate();
  const [spot, setSpot] = useState(null);
  const [duration, setDuration] = useState(2);
  const [evCharging, setEvCharging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadSpot();
  }, [spotId]);

  const loadSpot = async () => {
    try {
      const response = await axiosInstance.get(`/spots/${spotId}`);
      setSpot(response.data);
    } catch (error) {
      toast.error('Failed to load spot details');
      navigate('/map');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!spot) return 0;
    const baseAmount = spot.rate_per_hour * duration;
    const evCharge = evCharging ? 50 : 0;
    return baseAmount + evCharge;
  };

  const handleReserve = async () => {
    setBooking(true);
    try {
      const response = await axiosInstance.post('/bookings', {
        spot_id: spotId,
        duration_hours: duration,
        ev_charging: evCharging
      });
      toast.success('Booking created successfully');
      navigate(`/payment/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create booking');
    } finally {
      setBooking(false);
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#212121] mb-2">Reserve Parking Spot</h1>
          <p className="text-[#616161]">Confirm your booking details</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#212121]">Slot {spot?.slot_number}</h2>
                  <div className="flex items-center gap-2 text-[#616161] mt-1">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">Parking Lot A - Level 1</span>
                  </div>
                </div>
                <span className="status-available px-4 py-2 rounded-full text-sm font-medium">
                  Available
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#F4F6F8] rounded-xl p-4">
                  <div className="text-sm text-[#616161] mb-1">Base Rate</div>
                  <div className="text-2xl font-bold text-[#212121]">₹{spot?.rate_per_hour}/hr</div>
                </div>
                <div className="bg-[#F4F6F8] rounded-xl p-4">
                  <div className="text-sm text-[#616161] mb-1">Distance</div>
                  <div className="text-2xl font-bold text-[#212121]">250m</div>
                </div>
              </div>

              <div className="border-t border-[#E0E0E0] pt-6">
                <label className="block text-sm font-medium text-[#212121] mb-3">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Parking Duration (hours)
                </label>
                <div className="flex items-center gap-4">
                  <button
                    data-testid="decrease-duration-btn"
                    onClick={() => setDuration(Math.max(0.5, duration - 0.5))}
                    className="w-12 h-12 bg-[#F4F6F8] rounded-xl font-bold text-[#1976D2] hover:bg-[#E0E0E0] transition"
                  >
                    -
                  </button>
                  <input
                    data-testid="duration-input"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseFloat(e.target.value) || 0.5)}
                    min="0.5"
                    step="0.5"
                    className="flex-1 px-4 py-3 border border-[#E0E0E0] rounded-xl text-center text-xl font-bold text-[#212121] focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
                  />
                  <button
                    data-testid="increase-duration-btn"
                    onClick={() => setDuration(duration + 0.5)}
                    className="w-12 h-12 bg-[#F4F6F8] rounded-xl font-bold text-[#1976D2] hover:bg-[#E0E0E0] transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {spot?.ev_charging && (
                <div className="border-t border-[#E0E0E0] pt-6 mt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      data-testid="ev-charging-toggle"
                      type="checkbox"
                      checked={evCharging}
                      onChange={(e) => setEvCharging(e.target.checked)}
                      className="w-5 h-5 text-[#43A047] rounded focus:ring-2 focus:ring-[#43A047] border-[#E0E0E0]"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Zap className="w-5 h-5 text-[#43A047]" />
                      <div>
                        <div className="font-medium text-[#212121]">Include EV Charging</div>
                        <div className="text-sm text-[#616161]">Additional ₹50/session</div>
                      </div>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold text-[#212121] mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Fare Summary
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[#616161]">
                  <span>Parking ({duration}h)</span>
                  <span>₹{spot?.rate_per_hour * duration}</span>
                </div>
                {evCharging && (
                  <div className="flex justify-between text-[#43A047]">
                    <span>EV Charging</span>
                    <span>₹50</span>
                  </div>
                )}
                <div className="border-t border-[#E0E0E0] pt-3 flex justify-between text-lg font-bold text-[#212121]">
                  <span>Total</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>

              <button
                data-testid="confirm-reservation-btn"
                onClick={handleReserve}
                disabled={booking}
                className="w-full py-4 bg-[#1976D2] text-white rounded-xl font-semibold hover:bg-[#1565C0] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {booking ? 'Processing...' : (
                  <>
                    Confirm & Pay
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-2xl p-6">
              <div className="text-sm font-medium text-[#43A047] mb-2">Eco Reward</div>
              <div className="text-2xl font-bold text-[#212121] mb-1">+{Math.floor(duration * 5)} Points</div>
              <div className="text-sm text-[#616161]">You'll earn these eco points for this booking</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservePage;