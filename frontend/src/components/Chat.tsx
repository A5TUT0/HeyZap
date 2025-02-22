import { io, Socket } from "socket.io-client";
import { useEffect, useState, useRef } from "react";

export default function Chat() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<{ user_id: string; username: string; content: string }[]>([]);
    const [message, setMessage] = useState("");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No hay token, redirigiendo al login...");
            return;
        }

        const newSocket = io("http://localhost:3000", { auth: { token } });
        setSocket(newSocket);

        newSocket.on("previous messages", (loadedMessages) => {
            setMessages(loadedMessages);
            setTimeout(scrollToBottom, 100);
        });

        newSocket.on("chat message", (message) => {
            setMessages((prev) => [...prev, message]);
            setTimeout(scrollToBottom, 100);
        });

        return () => {
            newSocket.close();
        };
    }, []);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        if (socket) {
            socket.emit("chat message", { content: message.trim() });
            setMessage("");
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    return (
        <div className="flex flex-col w-full max-w-lg h-[80vh] p-4 bg-gray-900 rounded-2xl shadow-lg">
            <div className="pb-2 border-b border-gray-700 mb-4 text-center">
                <h2 className="text-xl font-bold text-white">HeyZap Chat</h2>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-800 p-4 rounded-xl mb-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex w-full mb-4 ${msg.user_id === user.id ? "justify-end" : "justify-start"}`}>
                        <div className={`p-3 rounded-xl max-w-[70%] text-white ${msg.user_id === user.id ? "bg-blue-600" : "bg-gray-600"}`}>
                            <p className="text-sm text-gray-300 mb-1">{msg.username}</p>
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="flex items-center space-x-2">
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 p-2 bg-gray-700 text-white border rounded-full" placeholder="Escribe un mensaje..." />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-full">Enviar</button>
            </form>
        </div>
    );
}
