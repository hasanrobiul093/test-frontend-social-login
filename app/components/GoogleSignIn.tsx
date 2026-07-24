"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

interface AuthSuccessData {
  statusCode?: number;
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
}

export default function GoogleSignInComponent() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<AuthSuccessData | null>(null);
  const [copied, setCopied] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:6969/api/v1";

  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    if (savedToken) {
      setSuccessData({
        statusCode: 200,
        message: "Restored existing session from localStorage",
        data: { accessToken: savedToken },
      });
      setStatus("success");
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setStatus("idle");
    setErrorMessage(null);
    setSuccessData(null);

    try {
      if (!credentialResponse?.credential) {
        throw new Error("No credential received from Google OAuth widget.");
      }

      const response = await axios.post(`${apiBaseUrl}/auth/social-login`, {
        idToken: credentialResponse.credential,
        provider: "GOOGLE",
      });

      console.log("Google Login Backend Response:", response.data);
      const resData = response.data;
      setSuccessData(resData);
      setStatus("success");

      const token = resData?.data?.accessToken;
      if (token) {
        localStorage.setItem("accessToken", token);
      }
    } catch (error: any) {
      console.error("Google Social Login Failed:", error);
      setStatus("error");

      const serverMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Google social login failed.";

      setErrorMessage(Array.isArray(serverMsg) ? serverMsg.join(", ") : serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setSuccessData(null);
    setStatus("idle");
    setErrorMessage(null);
  };

  const handleCopyToken = () => {
    if (successData?.data?.accessToken) {
      navigator.clipboard.writeText(successData.data.accessToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!googleClientId) {
    return (
      <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-2xl text-amber-300 text-xs">
        ⚠️ Please provide <code className="bg-slate-900 px-1 rounded">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in your <code className="bg-slate-900 px-1 rounded">.env.local</code> file.
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="bg-slate-800 border border-slate-700 shadow-xl p-6 rounded-3xl w-full flex flex-col items-center">
        {/* Header */}
        <div className="flex justify-center items-center bg-blue-600/20 border border-blue-500/30 rounded-2xl w-14 h-14 mb-3">
          <svg className="w-7 h-7 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
        </div>

        <h2 className="font-bold text-xl text-white">Google Sign-In</h2>
        <p className="text-slate-400 text-xs mt-1 mb-5">Authenticate with Google OAuth 2.0</p>

        {/* Live Feedback */}
        {loading && (
          <div className="w-full mb-4 p-3 bg-blue-950/60 border border-blue-800/60 rounded-xl flex items-center gap-2 text-blue-300 text-xs animate-pulse">
            <svg className="animate-spin h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Verifying Google token...</span>
          </div>
        )}

        {status === "success" && successData && (
          <div className="w-full mb-4 p-4 bg-emerald-950/60 border border-emerald-700/60 rounded-2xl flex flex-col gap-2 text-emerald-200">
            <div className="flex justify-between items-center font-bold text-emerald-400 text-sm">
              <span>GOOGLE LOGIN SUCCESSFUL</span>
              <span className="bg-emerald-800/50 px-2 py-0.5 rounded text-xs font-mono">200 OK</span>
            </div>

            {successData?.data?.accessToken && (
              <div className="mt-1 bg-slate-900 p-2.5 rounded-xl border border-emerald-900/40 text-xs">
                <div className="flex justify-between items-center mb-1 text-slate-400 font-semibold">
                  <span>Access Token</span>
                  <button onClick={handleCopyToken} className="text-emerald-400 hover:text-emerald-300 cursor-pointer">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-emerald-300 break-all bg-slate-950 p-2 rounded max-h-20 overflow-y-auto">
                  {successData.data.accessToken}
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="mt-1 py-1.5 bg-emerald-900/40 hover:bg-emerald-900/70 border border-emerald-700/50 rounded-xl text-emerald-200 text-xs font-semibold cursor-pointer"
            >
              Reset Session
            </button>
          </div>
        )}

        {status === "error" && errorMessage && (
          <div className="w-full mb-4 p-4 bg-rose-950/60 border border-rose-800/60 rounded-2xl text-rose-200 text-xs flex flex-col gap-2">
            <div className="font-bold text-rose-400">GOOGLE LOGIN FAILED</div>
            <div className="bg-slate-900 p-2 rounded border border-rose-900/40 font-mono text-rose-300 break-words">
              {errorMessage}
            </div>
          </div>
        )}

        {/* Google OAuth Login Widget */}
        <div className="w-full flex justify-center mt-2">
          <GoogleLogin
            theme="filled_blue"
            size="large"
            shape="pill"
            width="300"
            text="continue_with"
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setStatus("error");
              setErrorMessage("Google OAuth widget encountered an error or was closed.");
            }}
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
