"use client";

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Sign Up</h2>
        <form className="space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-gray-800 focus:border-gray-800"
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-gray-800 focus:border-gray-800"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-gray-800 focus:border-gray-800"
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Confirm your password"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-gray-800 focus:border-gray-800"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-300"
          >
            Sign Up
          </button>
        </form>

        {/* Footer */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/signin" className="text-gray-900 hover:text-gray-700 underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
