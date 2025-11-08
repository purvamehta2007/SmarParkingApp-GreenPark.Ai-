import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { History as HistoryIcon, MapPin, Clock, DollarSign, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

const HistoryPage = ({ user, onLogout }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await axiosInstance.get('/history');
      setHistory(response.data);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-[#43A047] text-white';
      case 'active':
        return 'bg-[#1976D2] text-white';
      case 'cancelled':
        return 'bg-[#D32F2F] text-white';
      default:
        return 'bg-[#F9A825] text-white';
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
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#212121] mb-2">Booking History</h1>
          <p className="text-[#616161]">View all your past parking sessions</p>
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <HistoryIcon className="w-16 h-16 text-[#1976D2] mx-auto mb-4 opacity-50" />
            <div className="text-xl font-medium text-[#212121] mb-2">No booking history</div>
            <div className="text-[#616161]">Your past bookings will appear here</div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, idx) => (
              <div
                key={item.booking.id}
                data-testid={`history-item-${idx}`}
                className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover"
              >
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === item.booking.id ? null : item.booking.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-bold text-lg text-[#212121]">
                          Slot {item.spot?.slot_number || 'N/A'}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.booking.status)}`}>
                          {item.booking.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#616161]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(item.booking.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>Parking Lot A</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#1976D2]">₹{item.booking.amount}</div>
                        <div className="text-sm text-[#616161]">{item.booking.duration_hours}h</div>
                      </div>
                      {expandedId === item.booking.id ? (
                        <ChevronUp className="w-5 h-5 text-[#616161]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#616161]" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === item.booking.id && (
                  <div className="border-t border-[#E0E0E0] p-6 bg-[#F4F6F8]">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-[#212121] mb-3">Booking Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#616161]">Booking ID</span>
                            <span className="font-medium text-[#212121]">{item.booking.id.slice(0, 12)}...</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#616161]">Start Time</span>
                            <span className="font-medium text-[#212121]">{formatDate(item.booking.start_time)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#616161]">End Time</span>
                            <span className="font-medium text-[#212121]">{formatDate(item.booking.end_time)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#616161]">EV Charging</span>
                            <span className="font-medium text-[#212121]">{item.booking.ev_charging ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#212121] mb-3">Payment Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#616161]">Amount Paid</span>
                            <span className="font-medium text-[#212121]">₹{item.booking.amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#616161]">Payment Method</span>
                            <span className="font-medium text-[#212121]">{item.transaction?.payment_method || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#616161]">Payment Status</span>
                            <span className="font-medium text-[#43A047]">{item.transaction?.status || 'Pending'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#616161]">Eco Points Earned</span>
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4 text-[#F9A825]" />
                              <span className="font-medium text-[#F9A825]">+{Math.floor(item.booking.duration_hours * 5)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;