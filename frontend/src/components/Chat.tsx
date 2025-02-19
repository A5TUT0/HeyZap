import { io, Socket } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Chat() {
    const { user } = useUser();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<
        { senderName: string; senderid: string; content: string }[]
    >([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        newSocket.on("previous messages", (loadedMessages) => {
            setMessages(loadedMessages.reverse());
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

    const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const input = e.currentTarget.querySelector("input");

        if (!input || input.value.trim() === "") return;
        if (!user) {
            console.error("Usuario no autenticado");
            return;
        }

        if (socket) {
            socket.emit("chat message", {
                senderid: user.id,
                content: input.value.trim(),
                senderName: user.username,
            });
            input.value = "";
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    return (
        <div className="flex flex-col w-full max-w-lg h-[80vh] p-4 bg-gray-800 rounded-2xl shadow-lg">
            <div className="pb-2 border-b border-gray-700 mb-4 text-center">
                <h2 className="text-xl font-bold text-white">HeyZap</h2>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-700 p-4 rounded-xl mb-4">
                <AnimatePresence>
                    {messages.map((msg, idx) => {
                        const isOwnMessage = user?.id === msg.senderid;
                        console.log(`Mensaje de ${msg.senderName} - senderid: ${msg.senderid}`);

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.3 }}
                                className={`flex w-full mb-4 ${isOwnMessage ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`p-3 rounded-xl max-w-[70%] text-white ${isOwnMessage ? "bg-blue-600 text-right" : "bg-gray-600 text-left"
                                        }`}
                                >
                                    <p className="text-sm text-gray-300 mb-1">{msg.senderName}</p>
                                    <p className="break-words">{msg.content}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            <form className="flex items-center space-x-2" onSubmit={sendMessage}>
                <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-2 bg-gray-600 text-white border border-gray-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-colors"
                >
                    Enviar
                </button>
            </form>
        </div>
    );
}
