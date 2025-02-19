import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Chat() {
    const { user } = useUser();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<
        { senderName: string; senderid: string; content: string }[]
    >([]);

    useEffect(() => {
        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        newSocket.on("previous messages", (loadedMessages) => {
            setMessages(loadedMessages.reverse());
        });

        newSocket.on("chat message", (message) => {
            setMessages((prev) => [...prev, message]);
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

    return (
        <div className="flex flex-col w-full max-w-lg h-[80vh] p-4 bg-gray-800 rounded-2xl shadow-lg">
            {/* Cabecera del chat (puedes personalizarla más si deseas) */}
            <div className="pb-2 border-b border-gray-700 mb-4 text-center">
                <h2 className="text-xl font-bold text-white">HeyZap</h2>
            </div>

            {/* Contenedor de los mensajes */}
            <div className="flex-1 overflow-y-auto bg-gray-700 p-4 rounded-xl mb-4">
                <AnimatePresence>
                    {messages.map((msg, idx) => {
                        // Verificar si es tu propio mensaje
                        const isOwnMessage = user && msg.senderid === user.id;

                        // Avatar (si el usuario está autenticado, muestra su foto; si no, muestra un placeholder)
                        // O bien, puedes usar un placeholder para todos, y solo para el usuario el profileImageUrl
                        const avatarUrl = isOwnMessage
                            ? user?.setProfileImage || "https://via.placeholder.com/40"
                            : "https://via.placeholder.com/40";

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.3 }}
                                className={`flex items-end mb-4 ${isOwnMessage ? "justify-end" : "justify-start"
                                    }`}
                            >
                                {/* Si es mensaje de otro, avatar a la izquierda; si es tuyo, avatar a la derecha */}
                                {!isOwnMessage && (
                                    <img
                                        src={avatarUrl}
                                        alt="avatar"
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                )}
                                <div
                                    className={`relative p-3 rounded-xl max-w-xs text-white ${isOwnMessage ? "bg-blue-600" : "bg-gray-600"
                                        }`}
                                >
                                    {/* Nombre del usuario que envió el mensaje */}
                                    <p className="text-sm text-gray-300 mb-1">{msg.senderName}</p>
                                    {/* Contenido del mensaje */}
                                    <p>{msg.content}</p>
                                    {/* Flecha que sale del globo de mensaje */}
                                    <span
                                        className={`
                      absolute top-1/2 w-4 h-4 transform rotate-45
                      ${isOwnMessage ? "bg-blue-600 -right-1" : "bg-gray-600 -left-1"}
                    `}
                                        style={{ marginTop: "-8px" }}
                                    ></span>
                                </div>
                                {isOwnMessage && (
                                    <img
                                        src={avatarUrl}
                                        alt="avatar"
                                        className="w-10 h-10 rounded-full ml-3"
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Formulario para enviar mensajes */}
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
