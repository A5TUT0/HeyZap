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
        <div className="absolute top-4 left-4">
          <UserButton />
        </div>

        <div className="flex items-center justify-center h-full w-full">
          <Chat />
        </div>
      </SignedIn>
    </div>
  );
}
