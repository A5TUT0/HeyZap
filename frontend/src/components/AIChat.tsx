import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function IAChat() {
    const [input, setInput] = useState("");
    const [chatHistory, setChatHistory] = useState(() => {
        return JSON.parse(localStorage.getItem("aiChatHistory")) || [];
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        localStorage.setItem("aiChatHistory", JSON.stringify(chatHistory));
        scrollToBottom();
    }, [chatHistory]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleGenerate = async () => {
        if (!input) return;
        setLoading(true);

        try {
            const res = await fetch(
                "https://router.huggingface.co/hf-inference/models/HuggingFaceTB/SmolLM2-1.7B-Instruct/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer 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`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "HuggingFaceTB/SmolLM2-1.7B-Instruct",
                        messages: [...chatHistory, { role: "user", content: input }],
                        max_tokens: 500,
                        stream: false,
                    }),
                }
            );

            const data = await res.json();
            if (data.choices && data.choices.length > 0) {
                const botResponse = { role: "assistant", content: data.choices[0].message.content };
                setChatHistory([...chatHistory, { role: "user", content: input }, botResponse]);
            }
        } catch (error) {
            console.error("Error generating response:", error);
            setChatHistory([...chatHistory, { role: "assistant", content: "AI model is still loading... Please wait a moment and try again." }]);
        }

        setLoading(false);
        setInput("");
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
            <button
                onClick={() => navigate("/")}
                className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 self-start"
            >
                Back to Chat
            </button>

            <div className="flex flex-col flex-grow w-full max-w-2xl mx-auto bg-gray-800 p-4 rounded-lg shadow-md">

                <div className="flex-1 max-h-[500px] overflow-y-auto space-y-2 p-2 border-b border-gray-700">
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`p-3 max-w-[70%] rounded-lg ${msg.role === "user" ? "bg-blue-500" : "bg-gray-600"}`}>
                                <p>{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="sticky bottom-0 w-full bg-gray-800 p-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 p-2 bg-gray-700 text-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {loading ? "Generating..." : "Send"}
                        </button>
                    </div>
                    <p className="text-sm text-gray-400 text-center mt-2">
                        If no response is received, the AI model is still loading. Please wait and try again.
                    </p>
                </div>
            </div>
        </div>
    );
}
