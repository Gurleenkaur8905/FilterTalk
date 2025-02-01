"use client"
import { Video, Shield, Users, Smile, Wand2, SkipForward } from "lucide-react";
import { useRouter ,useSearchParams} from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();  // Access the search parameters
  const username = searchParams.get("username");
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <Video className="h-8 w-8 text-black" />
            <h1 className="text-2xl font-bold text-black">AnonyChat</h1>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
              onClick={() => {
                router.push(`/video-chat?username=${username}`);
              }}
            >
              Start Chatting
            </button>
            <button
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
              onClick={() => {
                router.push("/signin");
              }}
            >
              Sign In
            </button>
            <button
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
              onClick={() => {
                router.push("/signup");
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              className="text-black"
              onClick={() => {
                // Add toggle logic for mobile menu
                console.log("Toggle mobile menu");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 7.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div className="md:hidden px-4 py-2 space-y-2">
          <button
            className="block w-full bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
            onClick={() => {
              router.push("/video-chat");
            }}
          >
            Start Chatting
          </button>
          <button
            className="block w-full bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
            onClick={() => {
              router.push("/signin");
            }}
          >
            Sign In
          </button>
          <button
            className="block w-full bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
            onClick={() => {
              router.push("/signup");
            }}
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Anonymous Video Chat
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Connect with strangers from around the world. Chat anonymously, use fun filters, and make new friends!
            </p>
            <div className="mt-8">
              <button className="bg-black hover:bg-gray-800 text-white text-lg px-8 py-3 rounded-lg">
                Start Your Adventure
              </button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-semibold text-center mb-8">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Video className="h-6 w-6 text-black" />
                    <span>Start a Video Call</span>
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  Click the button to be matched with a random stranger for a video chat.
                </p>
              </div>
              {/* Card 2 */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Smile className="h-6 w-6 text-black" />
                    <span>Use Fun Filters</span>
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  Apply face filters and voice changers to add excitement to your conversations.
                </p>
              </div>
              {/* Card 3 */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <SkipForward className="h-6 w-6 text-black" />
                    <span>Skip or Connect</span>
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  If you're not feeling the conversation, easily skip to the next person.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-semibold text-center mb-8">Why Choose AnonyChat?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card 1 */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-black" />
                    <span>100% Anonymous</span>
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  Your identity is always protected. Chat freely without revealing personal information.
                </p>
              </div>
              {/* Card 2 */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Users className="h-6 w-6 text-black" />
                    <span>Global Community</span>
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  Connect with people from all around the world and experience diverse cultures.
                </p>
              </div>
              {/* Card 3 */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Wand2 className="h-6 w-6 text-black" />
                    <span>Fun Features</span>
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  Enjoy a variety of face filters and voice changers to make your chats more entertaining.
                </p>
              </div>
              {/* Card 4 */}
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Video className="h-6 w-6 text-black" />
                    <span>High-Quality Video</span>
                  </h3>
                </div>
                <p className="text-sm text-gray-500">
                  Experience smooth, high-quality video calls for the best chatting experience.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-500">&copy; 2023 AnonyChat. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
