import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function ListOfActiveUsers() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [activeUsers, setActiveUsers] = useState<string[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, redirecting to login...");
            return;
        }

        const newSocket = io("http://localhost:3000", { auth: { token } });
        setSocket(newSocket);

        newSocket.on("active users", (users) => {
            setActiveUsers(users);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <div className="flex flex-col w-full max-w-lg h-[40vh] p-4 bg-gray-800 rounded-2xl shadow-lg">
            <div className="pb-2 border-b border-gray-700 mb-4 text-center">
                <h2 className="text-xl font-bold text-white">Active Users</h2>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-700 p-4 rounded-xl mb-4">
                <ul>
                    {activeUsers.map((username, idx) => (
                        <li key={idx} className="text-white text-lg font-semibold">
                            {username}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
