import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { io } from "socket.io-client";

export default function App() {

  const socket = io('http://localhost:3000');
  return (
    <header>
      <SignedOut>
        <SignInButton />

      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}