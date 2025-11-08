import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Award, Trophy, TrendingUp, Gift, Users } from 'lucide-react';
import { axiosInstance } from '../App';
import { toast } from 'sonner';

const RewardsPage = ({ user, onLogout }) => {
  const [rewards, setRewards] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewardsData();
  }, []);

  const loadRewardsData = async () => {
    try {
      const [rewardsRes, leaderboardRes] = await Promise.all([
        axiosInstance.get('/rewards/me'),
        axiosInstance.get('/rewards/leaderboard')
      ]);
      setRewards(rewardsRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      toast.error('Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Green Hero':
        return 'from-[#43A047] to-[#388E3C]';
      case 'Silver Saver':
        return 'from-[#9E9E9E] to-[#757575]';
      case 'Bronze Member':
        return 'from-[#D7CCC8] to-[#A1887F]';
      default:
        return 'from-[#1976D2] to-[#1565C0]';
    }
  };

  const getLevelIcon = (level) => {
    if (level === 'Green Hero') return '🌟';
    if (level === 'Silver Saver') return '🥈';
    if (level === 'Bronze Member') return '🥉';
    return '🌱';
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

  const monthlyData = [
    { month: 'Jan', carbon: 2.5 },
    { month: 'Feb', carbon: 3.2 },
    { month: 'Mar', carbon: 2.8 },
    { month: 'Apr', carbon: 4.1 },
    { month: 'May', carbon: 3.5 },
    { month: 'Jun', carbon: 4.8 }
  ];

  const maxCarbon = Math.max(...monthlyData.map(d => d.carbon));

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#212121] mb-2">Eco Rewards</h1>
          <p className="text-[#616161]">Earn rewards for sustainable parking choices</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className={`bg-gradient-to-br ${getLevelColor(rewards?.level)} rounded-3xl p-8 text-white shadow-xl`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm font-medium opacity-90 mb-1">Your Level</div>
                  <div className="text-3xl font-bold flex items-center gap-2">
                    <span>{getLevelIcon(rewards?.level)}</span>
                    {rewards?.level}
                  </div>
                </div>
                <Trophy className="w-12 h-12 opacity-80" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm opacity-90 mb-1">Total Points</div>
                  <div className="text-4xl font-bold">{rewards?.points || 0}</div>
                </div>
                <div>
                  <div className="text-sm opacity-90 mb-1">Carbon Saved</div>
                  <div className="text-4xl font-bold">{rewards?.carbon_saved || 0}kg</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#212121] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#43A047]" />
                  Monthly Carbon Savings
                </h2>
              </div>
              <div className="space-y-4">
                {monthlyData.map((data, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="text-sm font-medium text-[#616161] w-12">{data.month}</div>
                    <div className="flex-1">
                      <div className="h-10 bg-[#E0E0E0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#43A047] to-[#66BB6A] flex items-center justify-end pr-3 text-sm font-medium text-white transition-all"
                          style={{ width: `${(data.carbon / maxCarbon) * 100}%` }}
                        >
                          {data.carbon}kg
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#212121] flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#F9A825]" />
                  Available Rewards
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border-2 border-[#E0E0E0] rounded-xl p-4 hover:border-[#1976D2] transition cursor-pointer">
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="font-semibold text-[#212121] mb-1">Free Hour</div>
                  <div className="text-sm text-[#616161] mb-3">Get 1 free parking hour</div>
                  <div className="text-[#1976D2] font-medium text-sm">100 points</div>
                </div>
                <div className="border-2 border-[#E0E0E0] rounded-xl p-4 hover:border-[#1976D2] transition cursor-pointer">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-semibold text-[#212121] mb-1">EV Charging Discount</div>
                  <div className="text-sm text-[#616161] mb-3">50% off EV charging</div>
                  <div className="text-[#1976D2] font-medium text-sm">200 points</div>
                </div>
                <div className="border-2 border-[#E0E0E0] rounded-xl p-4 hover:border-[#1976D2] transition cursor-pointer">
                  <div className="text-2xl mb-2">🎫</div>
                  <div className="font-semibold text-[#212121] mb-1">Premium Pass</div>
                  <div className="text-sm text-[#616161] mb-3">1 month premium access</div>
                  <div className="text-[#1976D2] font-medium text-sm">500 points</div>
                </div>
                <div className="border-2 border-[#E0E0E0] rounded-xl p-4 hover:border-[#1976D2] transition cursor-pointer">
                  <div className="text-2xl mb-2">🎁</div>
                  <div className="font-semibold text-[#212121] mb-1">Gift Voucher</div>
                  <div className="text-sm text-[#616161] mb-3">₹500 voucher</div>
                  <div className="text-[#1976D2] font-medium text-sm">1000 points</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-[#1976D2]" />
                <h2 className="text-xl font-semibold text-[#212121]">Leaderboard</h2>
              </div>
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((entry, idx) => (
                  <div
                    key={idx}
                    data-testid={`leaderboard-rank-${idx + 1}`}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      idx === 0
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#FFC107] text-white'
                        : idx === 1
                        ? 'bg-gradient-to-r from-[#C0C0C0] to-[#A8A8A8] text-white'
                        : idx === 2
                        ? 'bg-gradient-to-r from-[#CD7F32] to-[#B87333] text-white'
                        : 'bg-[#F4F6F8]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      idx < 3 ? 'bg-white/20' : 'bg-[#1976D2] text-white'
                    }`}>
                      {idx + 1}
                    </div>
                    {entry.picture ? (
                      <img src={entry.picture} alt={entry.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#1976D2] flex items-center justify-center text-white font-medium">
                        {entry.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${
                        idx < 3 ? 'text-white' : 'text-[#212121]'
                      }`}>
                        {entry.name.split(' ')[0]}
                      </div>
                      <div className={`text-xs ${
                        idx < 3 ? 'text-white/80' : 'text-[#616161]'
                      }`}>
                        {entry.carbon_saved}kg CO₂
                      </div>
                    </div>
                    <div className={`font-bold ${
                      idx < 3 ? 'text-white' : 'text-[#1976D2]'
                    }`}>
                      {entry.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-2xl p-6">
              <Award className="w-10 h-10 text-[#43A047] mb-4" />
              <h3 className="font-semibold text-[#212121] mb-2">Next Level</h3>
              <p className="text-sm text-[#616161] mb-4">
                {rewards?.level === 'Eco Starter' && 'Earn 50 points to reach Bronze Member'}
                {rewards?.level === 'Bronze Member' && 'Earn 200 points to reach Silver Saver'}
                {rewards?.level === 'Silver Saver' && 'Earn 500 points to reach Green Hero'}
                {rewards?.level === 'Green Hero' && 'You are at the highest level!'}
              </p>
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#43A047] transition-all"
                  style={{
                    width: `${Math.min(100, (rewards?.points % 50) * 2)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;