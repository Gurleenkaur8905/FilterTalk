"use client";

import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    router.push("/"); // Redirect to the main page
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Sign In</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-300"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            className="text-gray-900 hover:text-gray-700 underline cursor-pointer"
            onClick={() => {
              router.push("/signup");
            }}
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
