"use client";

export default function LoginPage() {
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome to AU Fondue</h1>
          <p className="text-gray-600 mt-2">Admin Portal Login</p>
        </div>

        {/* Illustration */}
        <div className="flex justify-center mb-6">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3408/3408515.png"
            alt="Admin Illustration"
            className="h-24 w-24"
          />
        </div>

        {/* Login Button */}
        <div>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
              alt="Microsoft"
              className="h-6 w-6 mr-3"
            />
            Log in with Microsoft
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            By logging in, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
