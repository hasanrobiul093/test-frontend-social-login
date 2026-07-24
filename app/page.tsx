"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleSignIn from "./google-auth";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function App() {
  if (!GOOGLE_CLIENT_ID) return <div>Please provide GOOGLE_CLIENT_ID in .env file</div>;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleSignIn />
    </GoogleOAuthProvider>
  );
}