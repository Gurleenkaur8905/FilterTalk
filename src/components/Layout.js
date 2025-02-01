"use client";

import { useRouter } from "next/navigation";
import { Video, MessageSquare, Users } from "lucide-react";

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <div className="w-16 bg-white shadow-md flex flex-col items-center py-4 space-y-4">
        <div
          className="p-2 rounded-full cursor-pointer hover:bg-blue-100 text-gray-600 hover:text-blue-600"
          onClick={() => router.push("/chat")}
        >
          <MessageSquare className="h-6 w-6" />
        </div>
        <div
          className="p-2 rounded-full cursor-pointer hover:bg-blue-100 text-gray-600 hover:text-blue-600"
          onClick={() => router.push("/video-chat")}
        >
          <Video className="h-6 w-6" />
        </div>
        <div
          className="p-2 rounded-full cursor-pointer hover:bg-blue-100 text-gray-600 hover:text-blue-600"
          onClick={() => router.push("/saved-connections")}
        >
          <Users className="h-6 w-6" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
