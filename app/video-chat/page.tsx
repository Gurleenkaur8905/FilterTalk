"use client";
import { useState } from "react";
import {Mic,Video,MessageSquare,Users,Wand2,Smile,SkipForward,User,Ghost,Cat, Dog,Zap, VolumeX,Volume2,Volume1, Play} from "lucide-react";
import Layout from "@/components/Layout";

export default function Component() {
  const [activeTab, setActiveTab] = useState("video");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeVoice, setActiveVoice] = useState<string | null>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);

  const filters = [
    { name: "None", icon: User },
    { name: "Ghost", icon: Ghost },
    { name: "Cat", icon: Cat },
    { name: "Dog", icon: Dog },
    { name: "Zap", icon: Zap },
  ];

  const voices = [
    { name: "Normal", icon: Mic },
    { name: "Robot", icon: Wand2 },
    { name: "Helium", icon: Volume1 },
    { name: "Deep", icon: Volume2 },
    { name: "Muted", icon: VolumeX },
  ];

  return (
    <Layout>
    <div className="flex h-screen bg-gray-50 text-gray-800">
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Anonymous Video Chat</h1>
          {/* View Profile Button */}
          <div
            className="text-blue-600 border border-blue-300 hover:bg-blue-50 px-4 py-2 rounded-lg cursor-pointer"
            onClick={() => setIsProfileDialogOpen(true)}
          >
            View Profile
          </div>
        </header>

        {/* Profile Dialog */}
        {isProfileDialogOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold">Anonymous User</h2>
                <p className="text-sm text-gray-500 text-center">
                  Your identity is protected. Enjoy anonymous conversations!
                </p>
                <button
                  onClick={() => setIsProfileDialogOpen(false)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Call Area */}
        <div className="flex-1 p-4 flex flex-col items-center">
          <div className="relative w-full max-w-4xl aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-24 w-24 text-gray-400" />
            </div>
            {/* Stranger's Video */}
            <div className="absolute bottom-4 right-4 w-1/4 aspect-video bg-blue-100 rounded-lg flex items-center justify-center">
              {activeFilter ? (
                filters.find((f) => f.name === activeFilter)?.icon({ className: "h-8 w-8 text-blue-600" })
              ) : (
                <User className="h-8 w-8 text-blue-600" />
              )}
            </div>
          </div>

          <div className="flex space-x-6">
             {/* Start chat Button */}
             <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer"  onClick={() => console.log("Start action triggered")}>
              <Play className="h-6 w-6 mr-2 inline" />
                Start
              </div>
            {/* Voice Changer */}
            <div className="relative">
              <div
                className={`px-4 py-2 rounded-full cursor-pointer ${
                  activeVoice ? "bg-purple-200 text-purple-700" : "bg-purple-100 text-purple-600"
                }`}
                onClick={() => setActiveVoice(activeVoice ? null : "Normal")}
              >
                <Wand2 className="h-6 w-6 mr-2 inline" />
                Voice Changer
              </div>
              {activeVoice && (
                <div className="absolute top-full mt-2 bg-white shadow-lg rounded-lg p-4 w-72">
                  <h3 className="font-medium text-lg leading-none mb-2">Select Voice</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {voices.map((voice) => (
                      <div
                        key={voice.name}
                        className={`p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer ${
                          activeVoice === voice.name ? "bg-purple-100 text-purple-700 border-purple-500" : ""
                        }`}
                        onClick={() => setActiveVoice(voice.name)}
                      >
                        <voice.icon className="h-8 w-8 mb-2" />
                        <span className="text-xs">{voice.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Face Filter */}
            <div className="relative">
              <div
                className={`px-4 py-2 rounded-full cursor-pointer ${
                  activeFilter ? "bg-pink-200 text-pink-700" : "bg-pink-100 text-pink-600"
                }`}
                onClick={() => setActiveFilter(activeFilter ? null : "None")}
              >
                <Smile className="h-6 w-6 mr-2 inline" />
                Face Filter
              </div>
              {activeFilter && (
                <div className="absolute top-full mt-2 bg-white shadow-lg rounded-lg p-4 w-72">
                  <h3 className="font-medium text-lg leading-none mb-2">Select Filter</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {filters.map((filter) => (
                      <div
                        key={filter.name}
                        className={`p-4 rounded-lg flex flex-col items-center justify-center cursor-pointer ${
                          activeFilter === filter.name ? "bg-pink-100 text-pink-700 border-pink-500" : ""
                        }`}
                        onClick={() => setActiveFilter(filter.name)}
                      >
                        <filter.icon className="h-8 w-8 mb-2" />
                        <span className="text-xs">{filter.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Skip Button */}
            <div
              className="px-4 py-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer"
              onClick={() => console.log("Skip to next person")}
            >
              <SkipForward className="h-6 w-6 mr-2 inline" />
              Skip
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
}
