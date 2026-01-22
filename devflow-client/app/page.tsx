"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const[rooms, setRooms] =  useState<Array<{id: string, name: string, userCount: number, createdAt: Date, language?: string}>>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    fetch(`${API_URL}/api/rooms`)
      .then(response => response.json())
      .then(data => setRooms(data))
      .catch(error => console.error("Error fetching rooms:", error));
  }, []);

  function createRoom() {
    setLoading(true);
    axios.post(`${API_URL}/api/rooms`, { name: `Room ${Date.now()}` })
      .then(response => {
        const roomId = response.data.roomId;
        router.push(`/room/${roomId}`);
      })
      .catch(error => {
        console.error("Error creating room:", error);
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-linear-to-br from-blue-00 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">df</span>
              </div>
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-blue-100 to-rose-400">
                DevFlow
              </h1>
            </div>
            <p className="text-gray-400 text-lg">Real-time collaborative code editor</p>
          </div>

          {/* Create Room Button */}
          <div className="mb-12">
            <button 
              onClick={createRoom}
              disabled={loading}
              className="px-8 py-4 bg-linear-to-r cursor-pointer from-blue-0 to-rose-600 text-white rounded-xl hover:from-blue-0 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              {loading ? 'Creating Room...' : 'Create New Room'}
            </button>
          </div>

          {/* Rooms Section */}
          {rooms.length > 0 && (
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Active Rooms</h2>
                <p className="text-gray-400">{rooms.length} room{rooms.length !== 1 ? 's' : ''} available</p>
              </div>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <div 
                    key={room.id}
                    onClick={() => router.push(`/room/${room.id}`)}
                    className="group cursor-pointer"
                  >
                    <div className="p-6 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 hover:border-blue-500 hover:bg-gray-800/80 transition-all duration-300 h-full hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      <div className="flex flex-col justify-between h-full">
                        <div>
                          <h3 className="text-white font-semibold text-lg mb-3 group-hover:text-blue-400 transition-colors">
                            {room.name}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                            <span className="px-3 py-1 bg-gray-700 rounded-full text-xs font-mono">
                              {room.language || 'javascript'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              {room.userCount} user{room.userCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="text-gray-500 text-xs">
                          {new Date(room.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {rooms.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">No rooms yet. Create one to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}