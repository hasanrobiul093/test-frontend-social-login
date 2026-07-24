"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          state?: string;
          nonce?: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization: {
            code: string;
            id_token: string;
            state?: string;
          };
          user?: {
            name?: {
              firstName?: string;
              lastName?: string;
            };
            email?: string;
          };
        }>;
      };
    };
  }
}

interface AuthSuccessData {
  statusCode?: number;
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
}

const GoogleSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<AuthSuccessData | null>(null);
  const [lastProvider, setLastProvider] = useState<"GOOGLE" | "APPLE" | null>(null);
  const [showCredentials, setShowCredentials] = useState(false);
  const [copied, setCopied] = useState(false);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL;
  const appleClientId =
    process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
  
  if (!apiBaseUrl) return <div>Please provide API_BASE_URL in .env file</div>;
  if (!appleClientId) return <div>Please provide APPLE_CLIENT_ID in .env file</div>;

  useEffect(() => {
    // Check if token exists in localStorage on initial mount
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
    setLastProvider("GOOGLE");

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
        "Social login request failed.";

      const detailedError = Array.isArray(serverMsg)
        ? serverMsg.join(", ")
        : serverMsg;

      setErrorMessage(detailedError);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setStatus("idle");
    setErrorMessage(null);
    setSuccessData(null);
    setLastProvider("APPLE");

    try {
      if (typeof window === "undefined" || !window.AppleID) {
        throw new Error(
          "Apple Sign-In SDK is not loaded. Please ensure you have internet connectivity or wait a few seconds."
        );
      }

      window.AppleID.auth.init({
        clientId: appleClientId,
        scope: "name email",
        redirectURI: typeof window !== "undefined" ? window.location.origin : "",
        usePopup: true,
      });

      const appleResponse = await window.AppleID.auth.signIn();

      const idToken = appleResponse?.authorization?.id_token;
      if (!idToken) {
        throw new Error("No ID Token returned by Apple authentication.");
      }

      let userFullName: string | undefined = undefined;
      if (appleResponse.user?.name) {
        const { firstName, lastName } = appleResponse.user.name;
        userFullName = `${firstName || ""} ${lastName || ""}`.trim();
      }

      const response = await axios.post(`${apiBaseUrl}/auth/social-login`, {
        idToken,
        provider: "APPLE",
        name: userFullName || undefined,
      });

      console.log("Apple Login Backend Response:", response.data);

      const resData = response.data;
      setSuccessData(resData);
      setStatus("success");

      const token = resData?.data?.accessToken;
      if (token) {
        localStorage.setItem("accessToken", token);
      }
    } catch (error: any) {
      console.error("Apple Social Login Failed:", error);
      setStatus("error");

      if (error?.error === "popup_closed_by_user") {
        setErrorMessage("Apple login popup was closed by user.");
      } else {
        const serverMsg =
          error?.response?.data?.message ||
          error?.message ||
          "Apple Social login request failed.";

        const detailedError = Array.isArray(serverMsg)
          ? serverMsg.join(", ")
          : serverMsg;

        setErrorMessage(detailedError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setSuccessData(null);
    setStatus("idle");
    setErrorMessage(null);
    setLastProvider(null);
  };

  const handleCopyToken = () => {
    if (successData?.data?.accessToken) {
      navigator.clipboard.writeText(successData.data.accessToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center bg-slate-900 p-4 sm:p-6 min-h-screen font-sans text-slate-100">
      <div className="bg-slate-800 shadow-2xl p-6 sm:p-8 border border-slate-700 rounded-3xl w-full max-w-lg transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex justify-center items-center bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/30 shadow-lg rounded-2xl w-16 h-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="mt-5 font-extrabold text-white text-2xl sm:text-3xl tracking-tight">
            Social Authentication
          </h1>

          <p className="mt-2 text-slate-400 text-sm">
            Sign in with Google or Apple to verify token backend integration
          </p>
        </div>

        {/* Live Status Indicators */}
        {loading && (
          <div className="flex items-center gap-3 bg-blue-950/60 mt-6 p-4 border border-blue-800/60 rounded-xl text-blue-300 text-sm animate-pulse">
            <svg className="w-5 h-5 text-blue-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Verifying token with backend at <code className="bg-slate-900 px-1.5 py-0.5 rounded text-blue-200">{apiBaseUrl}</code>...</span>
          </div>
        )}

        {status === "success" && successData && (
          <div className="flex flex-col gap-3 bg-emerald-950/60 mt-6 p-5 border border-emerald-700/60 rounded-2xl text-emerald-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold text-emerald-400 text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>LOGIN SUCCESSFUL {lastProvider ? `(${lastProvider})` : ""}</span>
              </div>
              <span className="bg-emerald-800/50 px-2.5 py-1 rounded-full font-mono text-emerald-300 text-xs">
                200 OK
              </span>
            </div>

            <p className="text-emerald-300/80 text-xs">
              {successData.message || "Authentication succeeded and token was issued!"}
            </p>

            {successData?.data?.accessToken && (
              <div className="flex flex-col gap-1.5 bg-slate-900/90 mt-1 p-3 border border-emerald-900/40 rounded-xl">
                <div className="flex justify-between items-center font-semibold text-slate-400 text-xs">
                  <span>Access Token</span>
                  <button
                    onClick={handleCopyToken}
                    className="flex items-center gap-1 font-sans text-emerald-400 hover:text-emerald-300 text-xs transition-colors cursor-pointer"
                  >
                    {copied ? "Copied!" : "Copy Token"}
                  </button>
                </div>
                <div className="bg-slate-950 p-2 border border-slate-800 rounded max-h-24 overflow-y-auto font-mono text-emerald-300 text-xs break-all">
                  {successData.data.accessToken}
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="bg-emerald-900/40 hover:bg-emerald-900/70 mt-2 py-2 border border-emerald-700/50 rounded-xl w-full font-semibold text-emerald-200 text-xs transition cursor-pointer"
            >
              Sign Out / Reset Session
            </button>
          </div>
        )}

        {status === "error" && errorMessage && (
          <div className="flex flex-col gap-3 bg-rose-950/60 mt-6 p-5 border border-rose-800/60 rounded-2xl text-rose-200">
            <div className="flex items-center gap-2 font-bold text-rose-400 text-base">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <span>LOGIN FAILED {lastProvider ? `(${lastProvider})` : ""}</span>
            </div>

            <div className="bg-slate-900/90 p-3 border border-rose-900/40 rounded-xl font-mono text-rose-300 text-xs break-words">
              {errorMessage}
            </div>

            <div className="space-y-1 text-rose-300/80 text-xs leading-relaxed">
              <p className="font-semibold text-rose-300">Common Causes & Fixes:</p>
              <ul className="space-y-0.5 text-slate-300 list-disc list-inside">
                <li>Google/Apple Client ID mismatch between frontend and backend <code className="bg-slate-900 px-1 rounded text-rose-300">.env</code></li>
                <li>Backend NestJS server not running on <code className="bg-slate-900 px-1 rounded text-rose-300">{apiBaseUrl}</code></li>
                <li>Invalid ID token or expired token signature</li>
              </ul>
            </div>
          </div>
        )}

        {/* Buttons Section */}
        <div className="flex flex-col gap-4 mt-8">
          {/* Google Login Button Container */}
          <div className="flex flex-col items-center">
            <label className="mb-2 font-medium text-slate-400 text-xs">Google Sign-In</label>
            <div className="flex justify-center w-full">
              <GoogleLogin
                theme="filled_blue"
                size="large"
                shape="pill"
                width="320"
                text="continue_with"
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setStatus("error");
                  setErrorMessage("Google OAuth widget encountered an error or was closed.");
                }}
              />
            </div>
          </div>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-slate-700 border-t"></div>
            <span className="flex-shrink mx-4 font-semibold text-slate-500 text-xs uppercase">OR</span>
            <div className="flex-grow border-slate-700 border-t"></div>
          </div>

          {/* Apple Login Button */}
          <div className="flex flex-col items-center">
            <label className="mb-2 font-medium text-slate-400 text-xs">Apple Sign-In</label>
            <button
              onClick={handleAppleSignIn}
              disabled={loading}
              className="flex justify-center items-center gap-2 bg-black hover:bg-slate-950 disabled:opacity-50 shadow-lg border border-slate-600 rounded-full w-full max-w-[320px] h-[40px] font-medium text-white transition-all cursor-pointer"
            >
              <svg className="fill-current mb-0.5 w-5 h-5 text-white" viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.82.13-9.67-1.92-14.54-6.14-3.32-2.81-7.23-7.51-11.73-14.1-6.72-9.72-12.04-20.91-15.96-33.57-3.92-12.66-5.88-24.36-5.88-35.1 0-14.37 3.66-26.17 10.98-35.39 7.32-9.22 16.4-13.9 27.24-14.03 5.08 0 10.45 1.25 16.11 3.75 5.66 2.5 9.77 3.75 12.33 3.75 2.19 0 6.26-1.25 12.21-3.75 5.95-2.5 11.05-3.69 15.3-3.56 10.02.63 18.23 4.29 24.63 10.98-8.91 5.37-13.23 12.87-12.96 22.5 0.38 10.88 4.79 19.5 13.23 25.88-3.41 9.72-8.08 19.34-14.01 28.87zM119.22 31.06c0-6.75 2.45-13.12 7.35-19.12 4.9-6 10.98-9.44 18.24-10.31 0.25 1.13.38 2.13.38 3 0 6.88-2.52 13.38-7.56 19.5-5.04 6.13-11.1 9.69-18.17 10.69-.04-.88-.24-2.13-.24-3.76z"/>
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>
        </div>

        {/* Credentials & Setup Instructions Section */}
        <div className="mt-8 pt-5 border-slate-700/80 border-t">
          <button
            onClick={() => setShowCredentials(!showCredentials)}
            className="flex justify-between items-center py-1 w-full font-semibold text-indigo-400 hover:text-indigo-300 text-xs cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Required Setup & Credentials List
            </span>
            <span>{showCredentials ? "▲ Hide" : "▼ Show Credentials Checklist"}</span>
          </button>

          {showCredentials && (
            <div className="space-y-4 bg-slate-900/90 mt-4 p-4 border border-slate-700 rounded-2xl text-slate-300 text-xs">
              {/* Google Credentials */}
              <div>
                <h3 className="flex items-center gap-1 mb-1.5 font-bold text-blue-400 text-sm">
                  1. Google OAuth Credentials Needed
                </h3>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  <li>
                    <strong className="text-white">Google Client ID</strong> (e.g. <code className="text-blue-300">xxxx.apps.googleusercontent.com</code>)
                  </li>
                  <li>
                    <strong className="text-white">Google Client Secret</strong> (in backend <code className="text-blue-300">.env</code>)
                  </li>
                  <li>
                    <strong className="text-white">Authorized JavaScript Origins</strong>: <code className="text-slate-400">http://localhost:3000</code> in Google Cloud Console
                  </li>
                </ul>
              </div>

              {/* Apple Credentials */}
              <div className="pt-3 border-slate-800 border-t">
                <h3 className="flex items-center gap-1 mb-1.5 font-bold text-amber-400 text-sm">
                  2. Sign in with Apple Credentials Needed
                </h3>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
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
              <div className="pt-3 border-slate-800 border-t">
                <h3 className="mb-1.5 font-bold text-emerald-400 text-sm">
                  3. Environment Variable Checklist
                </h3>
                <div className="space-y-1 bg-slate-950 p-2.5 border border-slate-800 rounded-lg overflow-x-auto font-mono text-[11px] text-slate-300">
                  <p className="text-slate-400"># Frontend (.env.local in google-auth):</p>
                  <p>NEXT_PUBLIC_API_BASE_URL=http://localhost:6969/api/v1</p>
                  <p>NEXT_PUBLIC_GOOGLE_CLIENT_ID=&lt;GOOGLE_CLIENT_ID&gt;</p>
                  <p>NEXT_PUBLIC_APPLE_CLIENT_ID=&lt;APPLE_SERVICE_ID&gt;</p>
                  <p className="mt-2 text-slate-400"># Backend (.env in payton-backend):</p>
                  <p>GOOGLE_CLIENT_ID=&lt;GOOGLE_CLIENT_ID&gt;</p>
                  <p>GOOGLE_CLIENT_SECRET=&lt;GOOGLE_CLIENT_SECRET&gt;</p>
                  <p>APPLE_CLIENT_ID=&lt;APPLE_SERVICE_ID_OR_BUNDLE_ID&gt;</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-slate-500 text-xs text-center">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default GoogleSignIn;