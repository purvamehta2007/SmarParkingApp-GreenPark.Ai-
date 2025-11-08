import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { CreditCard, CheckCircle, Smartphone } from 'lucide-react';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

const PaymentPage = ({ user, onLogout }) => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [spot, setSpot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [rewardData, setRewardData] = useState(null);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      const bookingsRes = await axiosInstance.get('/bookings');
      const currentBooking = bookingsRes.data.find(b => b.id === bookingId);
      
      if (!currentBooking) {
        toast.error('Booking not found');
        navigate('/dashboard');
        return;
      }

      setBooking(currentBooking);

      const spotRes = await axiosInstance.get(`/spots/${currentBooking.spot_id}`);
      setSpot(spotRes.data);
    } catch (error) {
      toast.error('Failed to load booking details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      // Create Razorpay order
      const orderRes = await axiosInstance.post('/payments/create-order', {
        booking_id: bookingId
      });

      // Simulate payment (in production, use Razorpay SDK)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockPaymentId = `pay_mock_${Date.now()}`;

      // Verify payment
      const verifyRes = await axiosInstance.post('/payments/verify', {
        razorpay_payment_id: mockPaymentId,
        razorpay_order_id: orderRes.data.order_id,
        booking_id: bookingId
      });

      setRewardData(verifyRes.data);
      setPaymentSuccess(true);
      toast.success('Payment successful!');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
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

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[#F4F6F8]">
        <Navbar user={user} onLogout={onLogout} />
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
            <div className="w-20 h-20 bg-[#43A047] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#212121] mb-3">Payment Successful!</h1>
            <p className="text-[#616161] mb-8">Your parking spot has been reserved</p>

            <div className="bg-[#F4F6F8] rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <div className="text-sm text-[#616161] mb-1">Slot Number</div>
                  <div className="font-semibold text-[#212121]">{spot?.slot_number}</div>
                </div>
                <div>
                  <div className="text-sm text-[#616161] mb-1">Amount Paid</div>
                  <div className="font-semibold text-[#212121]">₹{booking?.amount}</div>
                </div>
                <div>
                  <div className="text-sm text-[#616161] mb-1">Duration</div>
                  <div className="font-semibold text-[#212121]">{booking?.duration_hours}h</div>
                </div>
                <div>
                  <div className="text-sm text-[#616161] mb-1">Booking ID</div>
                  <div className="font-semibold text-[#212121] text-xs">{bookingId.slice(0, 8)}</div>
                </div>
              </div>
            </div>

            {rewardData && (
              <div className="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-2xl p-6 mb-6">
                <div className="text-sm font-medium text-[#43A047] mb-2">Eco Rewards Earned</div>
                <div className="flex justify-center gap-8">
                  <div>
                    <div className="text-2xl font-bold text-[#212121]">+{rewardData.points_earned}</div>
                    <div className="text-sm text-[#616161]">Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#212121]">{rewardData.carbon_saved}kg</div>
                    <div className="text-sm text-[#616161]">CO₂ Saved</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                data-testid="view-booking-details-btn"
                onClick={() => navigate('/history')}
                className="flex-1 py-4 bg-white border-2 border-[#1976D2] text-[#1976D2] rounded-xl font-semibold hover:bg-[#F4F6F8] transition"
              >
                View Details
              </button>
              <button
                data-testid="back-to-dashboard-btn"
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-4 bg-[#1976D2] text-white rounded-xl font-semibold hover:bg-[#1565C0] transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#212121] mb-2">Complete Payment</h1>
          <p className="text-[#616161]">Secure payment powered by Razorpay</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h2 className="text-xl font-semibold text-[#212121] mb-4">Booking Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#616161]">Slot Number</span>
                  <span className="font-medium text-[#212121]">{spot?.slot_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#616161]">Duration</span>
                  <span className="font-medium text-[#212121]">{booking?.duration_hours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#616161]">Rate</span>
                  <span className="font-medium text-[#212121]">₹{spot?.rate_per_hour}/hr</span>
                </div>
                {booking?.ev_charging && (
                  <div className="flex justify-between text-[#43A047]">
                    <span>EV Charging</span>
                    <span className="font-medium">₹50</span>
                  </div>
                )}
                <div className="border-t border-[#E0E0E0] pt-3 flex justify-between text-lg font-bold text-[#212121]">
                  <span>Total Amount</span>
                  <span>₹{booking?.amount}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-[#212121] mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                    paymentMethod === 'upi'
                      ? 'border-[#1976D2] bg-[#E3F2FD]'
                      : 'border-[#E0E0E0] hover:border-[#1976D2]'
                  }`}
                >
                  <input
                    data-testid="payment-method-upi"
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-[#1976D2]"
                  />
                  <Smartphone className="w-6 h-6 text-[#1976D2]" />
                  <div className="flex-1">
                    <div className="font-medium text-[#212121]">UPI</div>
                    <div className="text-sm text-[#616161]">PhonePe, Google Pay, Paytm</div>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                    paymentMethod === 'card'
                      ? 'border-[#1976D2] bg-[#E3F2FD]'
                      : 'border-[#E0E0E0] hover:border-[#1976D2]'
                  }`}
                >
                  <input
                    data-testid="payment-method-card"
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-[#1976D2]"
                  />
                  <CreditCard className="w-6 h-6 text-[#1976D2]" />
                  <div className="flex-1">
                    <div className="font-medium text-[#212121]">Debit / Credit Card</div>
                    <div className="text-sm text-[#616161]">Visa, Mastercard, Rupay</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
              <h3 className="font-semibold text-[#212121] mb-4">Payment Details</h3>
              <div className="bg-[#F4F6F8] rounded-xl p-4 mb-6">
                <div className="text-sm text-[#616161] mb-1">Amount to Pay</div>
                <div className="text-3xl font-bold text-[#1976D2]">₹{booking?.amount}</div>
              </div>

              <button
                data-testid="proceed-to-pay-btn"
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-4 bg-[#1976D2] text-white rounded-xl font-semibold hover:bg-[#1565C0] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Pay Now'}
              </button>

              <div className="mt-4 text-xs text-center text-[#616161]">
                Secured by Razorpay. Your payment information is encrypted and secure.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;