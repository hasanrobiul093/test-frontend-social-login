"use client";

import React, { useState } from "react";

export default function CredentialsChecklist() {
  const [showCredentials, setShowCredentials] = useState(false);

  return (
    <div className="w-full max-w-4xl mt-8">
      <button
        onClick={() => setShowCredentials(!showCredentials)}
        className="w-full flex items-center justify-between text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer py-2 px-4 bg-slate-800/80 border border-slate-700 rounded-2xl"
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Required Setup & Credentials List
        </span>
        <span>{showCredentials ? "▲ Hide Checklist" : "▼ Show Credentials Checklist"}</span>
      </button>

      {showCredentials && (
        <div className="mt-3 p-5 bg-slate-900/90 rounded-2xl border border-slate-700 text-xs text-slate-300 space-y-4 shadow-xl">
          {/* Google Credentials */}
          <div>
            <h3 className="font-bold text-blue-400 text-sm mb-1.5 flex items-center gap-1">
              1. Google OAuth Credentials Needed
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>
                <strong className="text-white">Google Client ID</strong> (e.g. <code className="text-blue-300">xxxx.apps.googleusercontent.com</code>)
              </li>
              <li>
                <strong className="text-white">Google Client Secret</strong> (set in NestJS backend <code className="text-blue-300">.env</code>)
              </li>
              <li>
                <strong className="text-white">Authorized JavaScript Origins</strong>: <code className="text-slate-400">http://localhost:3000</code> in Google Cloud Console
              </li>
            </ul>
          </div>

          {/* Apple Credentials */}
          <div className="border-t border-slate-800 pt-3">
            <h3 className="font-bold text-amber-400 text-sm mb-1.5 flex items-center gap-1">
              2. Sign in with Apple Credentials Needed
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>
                <strong className="text-white">Apple Service ID / Client ID</strong>: Created under Service IDs in Apple Developer (e.g. <code className="text-amber-300">com.company.app.sid</code>)
              </li>
              <li>
                <strong className="text-white">Apple Team ID</strong>: 10-character Team ID from Apple Developer account
              </li>
              <li>
                <strong className="text-white">Key ID & Private Key (.p8 file)</strong>: Downloaded from Keys section with "Sign in with Apple" enabled
              </li>
              <li>
                <strong className="text-white">Return URLs / Web Domain</strong>: Configured under Service ID settings (e.g. domain <code className="text-slate-400">localhost</code>, Return URL <code className="text-slate-400">http://localhost:3000</code>)
              </li>
            </ul>
          </div>

          {/* Environment Variable Mapping */}
          <div className="border-t border-slate-800 pt-3">
            <h3 className="font-bold text-emerald-400 text-sm mb-1.5">
              3. Environment Variable Checklist
            </h3>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1 text-slate-300 overflow-x-auto">
              <p className="text-slate-400"># Frontend (.env.local in google-auth):</p>
              <p>NEXT_PUBLIC_API_BASE_URL=http://localhost:6969/api/v1</p>
              <p>NEXT_PUBLIC_GOOGLE_CLIENT_ID=&lt;GOOGLE_CLIENT_ID&gt;</p>
              <p>NEXT_PUBLIC_APPLE_CLIENT_ID=&lt;APPLE_SERVICE_ID&gt;</p>
              <p className="text-slate-400 mt-2"># Backend (.env in payton-backend):</p>
              <p>GOOGLE_CLIENT_ID=&lt;GOOGLE_CLIENT_ID&gt;</p>
              <p>GOOGLE_CLIENT_SECRET=&lt;GOOGLE_CLIENT_SECRET&gt;</p>
              <p>APPLE_CLIENT_ID=&lt;APPLE_SERVICE_ID_OR_BUNDLE_ID&gt;</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
