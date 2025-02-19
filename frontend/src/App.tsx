import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import Chat from "./components/Chat";
import ListOfUserActive from "./components/ListOfUserActive";

export default function App() {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <SignedOut>
        <div className="flex items-center justify-center h-full">
          <SignInButton />
        </div>
      </SignedOut>

      <SignedIn>
        <div className="absolute top-4 left-4">
          <UserButton />
        </div>
        <div className="flex justify-center items-center h-full m-5">
          <ListOfUserActive />
        </div>
        <Chat />
      </SignedIn>
    </div>
  );
}
