import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, DollarSign, Award, Plus } from 'lucide-react';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

const WalletPage = ({ user, onLogout }) => {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const response = await axiosInstance.get('/wallet');
      setWalletData(response.data);
    } catch (error) {
      toast.error('Failed to load wallet data');
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
      year: 'numeric'
    });
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
          <h1 className="text-3xl font-bold text-[#212121] mb-2">Wallet</h1>
          <p className="text-[#616161]">Manage your balance and transactions</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gradient-to-br from-[#1976D2] to-[#1565C0] rounded-3xl p-8 text-white shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm font-medium opacity-90 mb-2">Total Balance</div>
                  <div className="text-5xl font-bold">₹{walletData?.balance || 0}</div>
                </div>
                <WalletIcon className="w-12 h-12 opacity-80" />
              </div>
              <div className="flex gap-4">
                <button
                  data-testid="add-funds-btn"
                  className="flex-1 py-3 bg-white text-[#1976D2] rounded-xl font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Funds
                </button>
                <button
                  data-testid="redeem-points-btn"
                  className="flex-1 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5" />
                  Redeem Points
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#212121]">Recent Transactions</h2>
              </div>

              {!walletData?.transactions || walletData.transactions.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 text-[#1976D2] mx-auto mb-4 opacity-50" />
                  <div className="text-[#616161]">No transactions yet</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {walletData.transactions.map((transaction, idx) => (
                    <div
                      key={transaction.id}
                      data-testid={`transaction-${idx}`}
                      className="flex items-center justify-between p-4 bg-[#F4F6F8] rounded-xl hover:bg-[#E3F2FD] transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          transaction.status === 'completed' ? 'bg-[#E8F5E9]' : 'bg-[#FFEBEE]'
                        }`}>
                          {transaction.status === 'completed' ? (
                            <TrendingDown className="w-6 h-6 text-[#D32F2F]" />
                          ) : (
                            <DollarSign className="w-6 h-6 text-[#616161]" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-[#212121]">Parking Payment</div>
                          <div className="text-sm text-[#616161]">{formatDate(transaction.created_at)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#D32F2F]">-₹{transaction.amount}</div>
                        <div className={`text-xs font-medium ${
                          transaction.status === 'completed' ? 'text-[#43A047]' : 'text-[#616161]'
                        }`}>
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold text-[#212121] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#F9A825]" />
                Eco Points
              </h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-[#F9A825] mb-1">{walletData?.points || 0}</div>
                <div className="text-sm text-[#616161]">Available Points</div>
              </div>
              <div className="bg-[#FFF9C4] rounded-xl p-4 text-sm text-[#616161]">
                🌟 Convert 10 points = ₹1 in wallet balance
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-semibold text-[#212121] mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#616161]">Total Spent</span>
                  <span className="font-semibold text-[#212121]">
                    ₹{walletData?.transactions?.reduce((sum, t) => sum + (t.status === 'completed' ? t.amount : 0), 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#616161]">Total Bookings</span>
                  <span className="font-semibold text-[#212121]">{walletData?.transactions?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#616161]">Points Earned</span>
                  <span className="font-semibold text-[#F9A825]">{walletData?.points || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-2xl p-6">
              <TrendingUp className="w-10 h-10 text-[#43A047] mb-4" />
              <h3 className="font-semibold text-[#212121] mb-2">Save More</h3>
              <p className="text-sm text-[#616161]">Park during off-peak hours to earn bonus eco points!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;