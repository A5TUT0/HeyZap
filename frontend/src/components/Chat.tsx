import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";

export default function Chat() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        newSocket.on("chat message", (message: string) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            newSocket.close();
        };
    }, []);

    const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const input = e.currentTarget.querySelector("input");
        if (input.textContent === null) return Error("No se puede enviar un mensaje vacío");

        if (input && socket) {
            socket.emit("chat message", input.value);
            input.value = "";
        }
    };

    return (
        <div className="flex flex-col w-full max-w-lg h-3/4 p-4 bg-gray-800 rounded-2xl shadow-lg">
            <div className="flex-1 overflow-y-auto mb-4 bg-gray-700 p-4 rounded-xl">
                <div className="flex flex-col space-y-2">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`p-3 rounded-xl max-w-xs text-white ${idx % 2 === 0 ? "bg-blue-600" : "bg-gray-600"
                                }`}
                        >
                            {msg}
                        </div>
                    ))}
                </div>
            </div>
            <form className="flex items-center space-x-2" onSubmit={sendMessage}>
                <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-2 bg-gray-600 text-white border border-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700"
                >
                    Enviar
                </button>
            </form>
        </div>
    );
}
