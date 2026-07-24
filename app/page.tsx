"use client";

import React from "react";
import GoogleSignInComponent from "./components/GoogleSignIn";
import AppleSignInComponent from "./components/AppleSignIn";
import CredentialsChecklist from "./components/CredentialsChecklist";

export default function App() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Social Authentication Demo
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Modular Next.js Social Auth integration for Google & Apple Sign-In with NestJS backend
        </p>
      </div>

      {/* Side-by-side Modular Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <GoogleSignInComponent />
        <AppleSignInComponent />
      </div>

      {/* Setup Guide */}
      <CredentialsChecklist />
    </main>
  );
}