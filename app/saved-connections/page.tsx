"use client";

import Layout from "@/components/Layout";
import { Users } from "lucide-react";

export default function SavedConnections() {
  return (
    <Layout>
    <div className="h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Saved Connections</h1>
      </header>

      {/* Saved Connections Content */}
      <main className="h-full bg-white shadow-lg rounded-lg p-4 m-4">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Saved Connections</h2>
        <div className="space-y-4 overflow-y-auto h-[calc(100%-2rem)]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">Anonymous User {i}</div>
                  <div className="text-sm text-gray-500">Last chat: 2 days ago</div>
                </div>
              </div>
              <button className="border border-blue-300 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg">
                Chat
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
    </Layout>
  );
}
