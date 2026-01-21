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
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          DevFlow - Collaborative Code Editor
        </h1>
        
        <button 
          onClick={createRoom}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
        >
          {loading ? 'Creating...' : '+ Create New Room'}
        </button>
        
        {rooms.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Active Rooms</h2>
            <div className="grid gap-4">
              {rooms.map((room) => (
                <div 
                  key={room.id}
                  onClick={() => router.push(`/room/${room.id}`)}
                  className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer border border-gray-700"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-semibold">{room.name}</h3>
                      <p className="text-gray-400 text-sm">
                        {room.language} • {room.userCount} user{room.userCount !== 1 ? 's' : ''} active
                      </p>
                    </div>
                    <div className="text-gray-500 text-sm">
                      Created {new Date(room.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}