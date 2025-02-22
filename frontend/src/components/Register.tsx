import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Error al registrar el usuario");

            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            navigate("/");
        } catch {
            setError("No se pudo registrar. Inténtalo de nuevo.");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96">
                <h2 className="text-white text-3xl font-bold mb-4 text-center">Registro</h2>

                {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <input
                        type="text"
                        name="username"
                        placeholder="Nombre de usuario"
                        value={formData.username}
                        onChange={handleChange}
                        className="p-3 mb-3 bg-gray-700 text-white rounded"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Correo electrónico"
                        value={formData.email}
                        onChange={handleChange}
                        className="p-3 mb-3 bg-gray-700 text-white rounded"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        value={formData.password}
                        onChange={handleChange}
                        className="p-3 mb-4 bg-gray-700 text-white rounded"
                        required
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold">
                        Registrarse
                    </button>
                </form>

                <p className="text-gray-400 text-center mt-4">
                    ¿Ya tienes una cuenta?{" "}
                    <button onClick={() => navigate("/login")} className="text-blue-400 hover:text-blue-500 underline">
                        Inicia sesión aquí
                    </button>
                </p>
            </div>
        </div>
    );
}
