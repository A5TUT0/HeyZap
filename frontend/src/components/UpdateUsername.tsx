import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UpdateUsername() {
    const [newUsername, setNewUsername] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleUpdateUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
            setError("No estás autenticado.");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/update-username", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ newUsername }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Error al actualizar el nombre de usuario");
            }

            // Guardar el nuevo token y datos actualizados
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify({ id: JSON.parse(localStorage.getItem("user") || "{}").id, username: data.newUsername, email: JSON.parse(localStorage.getItem("user") || "{}").email }));

            setMessage("Nombre de usuario actualizado correctamente. Redirigiendo...");

            setTimeout(() => {
                window.location.reload(); // Recargar para que el usuario use el nuevo token
            }, 1500);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-lg p-4 bg-gray-800 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold text-white text-center mb-4">Actualizar Nombre de Usuario</h2>

            {message && <p className="text-green-500 text-sm mb-2">{message}</p>}
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <form onSubmit={handleUpdateUsername} className="flex flex-col">
                <input
                    type="text"
                    placeholder="Nuevo nombre de usuario"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="p-2 mb-2 bg-gray-700 text-white rounded"
                    required
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
                    Actualizar
                </button>
            </form>
        </div>
    );
}
