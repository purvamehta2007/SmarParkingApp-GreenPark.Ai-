import { useState } from 'react';
import Navbar from './Navbar';
import { TrendingUp, Calendar, Clock, BarChart3, Navigation } from 'lucide-react';
import { axiosInstance } from '../App';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const PredictPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    destination: '',
    arrival_time: '',
    duration: 2
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    
    if (!formData.destination || !formData.arrival_time) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/predict-availability', formData);
      setPrediction(response.data);
      toast.success('Prediction generated successfully');
    } catch (error) {
      toast.error('Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#212121] mb-2">AI Parking Prediction</h1>
          <p className="text-[#616161]">Forecast availability and plan your parking ahead</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[#1976D2]" />
              <h2 className="text-xl font-semibold text-[#212121]">Prediction Inputs</h2>
            </div>

            <form onSubmit={handlePredict} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  <Navigation className="w-4 h-4 inline mr-1" />
                  Destination
                </label>
                <input
                  data-testid="predict-destination-input"
                  type="text"
                  placeholder="Enter parking location"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Arrival Time
                </label>
                <input
                  data-testid="predict-arrival-input"
                  type="datetime-local"
                  value={formData.arrival_time}
                  onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#212121] mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Duration (hours)
                </label>
                <input
                  data-testid="predict-duration-input"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1976D2] focus:border-transparent"
                />
              </div>

              <button
                data-testid="predict-availability-btn"
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#1976D2] text-white rounded-xl font-semibold hover:bg-[#1565C0] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Predicting...' : 'Predict Availability'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            {prediction ? (
              <>
                <div className="bg-gradient-to-br from-[#1976D2] to-[#1565C0] rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium opacity-90">Prediction Confidence</div>
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="text-5xl font-bold mb-2">{prediction.confidence}%</div>
                  <div className="text-sm opacity-90">High accuracy based on historical data</div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <h3 className="font-semibold text-[#212121] mb-4">Predicted Availability</h3>
                  <div className="space-y-3">
                    {prediction.predictions.map((pred, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="text-sm font-medium text-[#616161] w-16">{pred.time}</div>
                        <div className="flex-1">
                          <div className="h-8 bg-[#E0E0E0] rounded-full overflow-hidden">
                            <div
                              className={`h-full flex items-center justify-end pr-2 text-xs font-medium text-white transition-all ${
                                pred.status === 'high'
                                  ? 'bg-[#43A047]'
                                  : pred.status === 'medium'
                                  ? 'bg-[#F9A825]'
                                  : 'bg-[#D32F2F]'
                              }`}
                              style={{ width: `${pred.availability}%` }}
                            >
                              {pred.availability}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  data-testid="reserve-predicted-spot-btn"
                  onClick={() => navigate('/map')}
                  className="w-full py-4 bg-[#43A047] text-white rounded-xl font-semibold hover:bg-[#388E3C] transition"
                >
                  Reserve This Spot
                </button>
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                <BarChart3 className="w-16 h-16 text-[#1976D2] mx-auto mb-4 opacity-50" />
                <div className="text-[#616161]">Enter details to see AI predictions</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-2xl font-bold text-[#1976D2] mb-1">15min</div>
            <div className="text-sm text-[#616161]">Average prediction time</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-2xl font-bold text-[#43A047] mb-1">92%</div>
            <div className="text-sm text-[#616161]">Prediction accuracy</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-2xl font-bold text-[#F9A825] mb-1">5000+</div>
            <div className="text-sm text-[#616161]">Predictions made</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictPage;