import { Sparkles, Car, Zap, Award } from 'lucide-react';

const Landing = () => {
  const handleLogin = () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6F8] via-[#E3F2FD] to-[#E8F5E9]">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1976D2] to-[#43A047] flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-[#1976D2]">GreenPark.AI</span>
        </div>
        <button
          data-testid="landing-login-btn"
          onClick={handleLogin}
          className="px-6 py-2.5 bg-[#1976D2] text-white rounded-full font-medium hover:bg-[#1565C0] shadow-lg"
        >
          Sign In
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-6 fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-[#1976D2] shadow-sm">
            <Sparkles className="w-4 h-4" />
            Smart • Sustainable • Simple
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#212121] leading-tight">
            Find your perfect <br />
            <span className="bg-gradient-to-r from-[#1976D2] to-[#43A047] bg-clip-text text-transparent">
              parking spot
            </span> — instantly.
          </h1>
          
          <p className="text-lg sm:text-xl text-[#616161] max-w-2xl mx-auto">
            AI-powered parking prediction, real-time availability, EV charging, and eco rewards.
            Park smarter. Save time. Protect the planet.
          </p>

          <div className="flex gap-4 justify-center pt-8">
            <button
              data-testid="landing-get-started-btn"
              onClick={handleLogin}
              className="px-8 py-4 bg-[#1976D2] text-white rounded-2xl font-semibold text-lg hover:bg-[#1565C0] shadow-xl"
            >
              Get Started
            </button>
            <button
              className="px-8 py-4 bg-white text-[#1976D2] rounded-2xl font-semibold text-lg hover:bg-gray-50 shadow-xl"
            >
              Learn More
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white rounded-3xl p-8 shadow-lg card-hover">
            <div className="w-14 h-14 rounded-2xl bg-[#E3F2FD] flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-[#1976D2]" />
            </div>
            <h3 className="text-xl font-semibold text-[#212121] mb-3">AI Predictions</h3>
            <p className="text-[#616161]">Know exactly when spots will be available with our advanced AI forecasting.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg card-hover">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] flex items-center justify-center mb-4">
              <Zap className="w-7 h-7 text-[#43A047]" />
            </div>
            <h3 className="text-xl font-semibold text-[#212121] mb-3">EV Charging</h3>
            <p className="text-[#616161]">Find and reserve EV charging spots instantly. Charge while you park.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg card-hover">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF9C4] flex items-center justify-center mb-4">
              <Award className="w-7 h-7 text-[#F9A825]" />
            </div>
            <h3 className="text-xl font-semibold text-[#212121] mb-3">Eco Rewards</h3>
            <p className="text-[#616161]">Earn carbon credits and rewards for eco-friendly parking choices.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;