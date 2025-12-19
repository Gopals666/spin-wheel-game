import { useEffect, useState } from "react";
import api from "../api";
import { socket } from "../socket";

export default function SpinWheel() {
  const [wheel, setWheel] = useState(null);
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    api.get("/spin/active").then(res => {
      if (res.data) {
        setWheel(res.data);
        setPlayers(res.data.participants || []);
        setStatus(res.data.status);
      }
    });

    socket.on("userJoined", participants => {
      setPlayers(participants);
    });

    socket.on("wheelStarted", () => {
      setStatus("active");
    });

    socket.on("userEliminated", eliminatedId => {
      setPlayers(prev => prev.filter(p => p._id !== eliminatedId));
    });

    socket.on("winnerDeclared", winner => {
      setWinner(winner);
      setStatus("completed");
    });

    socket.on("wheelAborted", () => {
      setStatus("aborted");
    });

    return () => socket.off();
  }, []);

  const statusColor = {
    waiting: "bg-yellow-100 text-yellow-700",
    active: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    aborted: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center py-10 px-4">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight">
          🎡 Spin Wheel Arena
        </h1>
        <p className="text-gray-600 mt-2">
          Real-time multiplayer elimination game
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8">
        
        {/* Status */}
        {status && (
          <div className="flex justify-center mb-6">
            <span
              className={`px-6 py-2 rounded-full text-sm font-semibold uppercase tracking-wide ${statusColor[status]}`}
            >
              Status: {status}
            </span>
          </div>
        )}

        {/* No Wheel */}
        {!wheel && (
          <p className="text-center text-gray-500 text-lg">
            No active spin wheel at the moment
          </p>
        )}

        {/* Players */}
        {players.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              👥 Players ({players.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {players.map(p => (
                <div
                  key={p._id}
                  className="relative bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl p-5 shadow-md transform transition hover:scale-105"
                >
                  <div className="absolute top-2 right-3 text-xs opacity-80">
                    ID: {p._id.slice(-4)}
                  </div>
                  <div className="text-xl font-semibold text-center">
                    {p.name}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Winner */}
        {winner && (
          <div className="mt-10 flex justify-center">
            <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-10 py-6 rounded-2xl shadow-lg text-center animate-pulse">
              <h3 className="text-sm uppercase tracking-wide opacity-90">
                Winner
              </h3>
              <p className="text-3xl font-extrabold mt-1">
                🏆 {winner.name}
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
