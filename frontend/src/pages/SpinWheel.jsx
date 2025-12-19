import { useEffect, useState } from "react";
import api from "../api";
import { socket } from "../socket";

export default function SpinWheel() {
  const [wheel, setWheel] = useState(null);
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    // Fetch active wheel on load
    api.get("/spin/active").then(res => {
      if (res.data) {
        setWheel(res.data);
        setPlayers(res.data.participants || []);
        setStatus(res.data.status);
      }
    });

    // SOCKET EVENTS
    socket.on("userJoined", participants => {
      setPlayers(participants);
    });

    socket.on("wheelStarted", () => {
      setStatus("active");
    });

    socket.on("userEliminated", eliminatedId => {
      setPlayers(prev =>
        prev.filter(p => p._id !== eliminatedId)
      );
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-6">🎡 Spin Wheel</h1>

      {!wheel && (
        <p className="text-gray-500">No active spin wheel</p>
      )}

      {status && (
        <p className="mb-4 text-blue-600 font-semibold">
          Status: {status.toUpperCase()}
        </p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {players.map(p => (
          <div
            key={p._id}
            className="bg-white px-6 py-4 rounded shadow text-center"
          >
            {p.name}
          </div>
        ))}
      </div>

      {winner && (
        <h2 className="mt-8 text-2xl font-bold text-green-600">
          🏆 Winner: {winner.name}
        </h2>
      )}
    </div>
  );
}
