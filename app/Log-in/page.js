"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  OAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "firebase/auth";
import { auth } from "../firebaseClient";

export default function LoginPage() {
  const router = useRouter();

  const handleMicrosoftLoginPopup = async () => {
    const provider = new OAuthProvider("microsoft.com");

    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Only allow @au.edu domain
      if (!user.email.endsWith("@au.edu")) {
        alert("Access restricted to AU users only.");
        await signOut(auth);
        return;
      }

      // Backend check for admin permission
      const backendUrl = "https://aufondue-webtest.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";
      const response = await fetch(`${backendUrl}/admin/check?email=${user.email}`);
      const isAdmin = await response.json();

      if (!isAdmin) {
        alert("Access denied: Your email is not registered as an admin.");
        await signOut(auth);
        return;
      }

      // ✅ Success — redirect
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome to AU Fondue</h1>
          <p className="text-gray-600 mt-2">Admin Portal Login</p>
        </div>

        <div className="flex justify-center mb-6">
          <img
            src="app_icon.svg"
            alt="Admin"
            className="h-40 w-45"
          />
        </div>

        <button
          onClick={handleMicrosoftLoginPopup}
          className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
            alt="Microsoft"
            className="h-6 w-6 mr-3"
          />
          Log in with Microsoft
        </button>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            By logging in, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">Terms</a> and{" "}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
