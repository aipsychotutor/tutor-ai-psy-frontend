import { useState } from 'react';

export default function Auth() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Left Side - Form */}
      <div className="w-1/2 bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          {isSignIn ? (
            // Sign In Form
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">Welcome back</h1>
              <p className="text-gray-600 mb-8">Please enter your details</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder=""
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder=""
                  />
                </div>
                
                <button className="w-full py-3 bg-yellowCustom hover:bg-yellow-400 text-black font-medium rounded-full transition-colors">
                  Sign In
                </button>
                
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => setIsSignIn(false)}
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          ) : (
            // Sign Up Form
            <div>
              <h1 className="text-4xl font-bold text-black mb-2">Sign Up</h1>
              <p className="text-gray-600 mb-8">Please enter your details</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder=""
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-dashboardStart"
                    placeholder=""
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-gray-200 rounded-full outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder=""
                  />
                </div>
                
                <button className="w-full py-3 bg-yellow-400 hover:bg-yellow-400 text-black font-medium rounded-full transition-colors">
                  Sign up
                </button>
                
                <p className="text-center text-sm text-gray-600">
                  Have an account?{' '}
                  <button 
                    onClick={() => setIsSignIn(true)}
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="text-white text-center px-12">
          <h2 className="text-5xl font-bold mb-4">CommuLab</h2>
          <p className="text-xl font-light">Belajar komunikasi, siap hadapi pasien</p>
        </div>
      </div>
    </div>
  );
}