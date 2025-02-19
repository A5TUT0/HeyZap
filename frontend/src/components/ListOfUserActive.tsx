import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@clerk/clerk-react";
export default function ListOfUserActive() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [activeUsers, setActiveUsers] = useState<string[]>([]);
    const { user } = useUser();
    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        newSocket.emit("user connected", user?.username);
        newSocket.on("active users", (users) => {
            setActiveUsers(users);
        });

        return () => {
            newSocket.emit("user disconnected", user?.username);
            newSocket.disconnect();
        };
    }, []);

    return (
        <div className="flex flex-col w-full max-w-lg h-[80vh] p-4 bg-gray-800 rounded-2xl shadow-lg">
            <div className="pb-2 border-b border-gray-700 mb-4 text-center">
                <h2 className="text-xl font-bold text-white">Active Users</h2>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-700 p-4 rounded-xl mb-4">
                <ul>
                    {activeUsers.map((user, idx) => (
                        <li key={idx} className="text-white">
                            {user}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
