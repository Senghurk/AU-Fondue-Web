"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const backendUrl = "https://aufondue-webtest.kindisland-399ef298.southeastasia.azurecontainerapps.io/api"; // for local

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Check backend status
      const res = await fetch(`${backendUrl}/admin/check?email=${email}`);
      const status = await res.text();

      if (status !== "can_login") {
        alert("Access denied: You are not allowed to log in.");
        return;
      }

      // Step 2: Firebase login
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed: " + error.message);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert("Please enter your email to reset your password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Reset error:", error);
      alert("Error sending reset email: " + error.message);
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
          <img src="app_icon.svg" alt="Admin Illustration" className="h-40 w-45" />
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 px-4 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-2 px-4 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="text-right mb-4">
            <button
              type="button"
              className="text-blue-600 text-sm hover:underline"
              onClick={handleResetPassword}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          >
            Log In
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Just got invited by Admin?{" "}
            <a href="/Sign-up" className="text-blue-600 hover:underline">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
