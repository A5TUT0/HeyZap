import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import Chat from "./components/Chat";

export default function App() {
  return (
    <div className="h-screen bg-gray-900 relative">
      <SignedOut>
        <div className="flex items-center justify-center h-full">
          <SignInButton />
        </div>
      </SignedOut>

      <SignedIn>
        {/* Botón de usuario en la esquina superior izquierda */}
        <div className="absolute top-4 left-4">
          <UserButton />
        </div>

        {/* Contenedor que ocupa toda la pantalla y centra el contenido */}
        <div className="flex items-center justify-center h-full w-full">
          <Chat />
        </div>
      </SignedIn>
    </div>
  );
}
