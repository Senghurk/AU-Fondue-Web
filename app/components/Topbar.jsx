"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";

export default function Topbar({ activeTopLink, setActiveTopLink, setActiveLink }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState("Admin");

  const backendUrl =
    "https://aufondue-backend.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";
    // "https://aufonduebackend.kindisland-399ef298.southeastasia.azurecontainerapps.io/api";

  // Fetch logged-in admin's name (same as dashboard)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const email = user.email;
          const res = await fetch(`${backendUrl}/admin/details?email=${email}`);
          const adminData = await res.json();
          setUserName(adminData.username || email);
        } catch (err) {
          console.error("Failed to fetch admin details", err);
          setUserName(user.email);
        }
      } else {
        router.push("/Log-in");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLinkClick = (link) => {
    setActiveTopLink(link);
  };

  const handleDefaultLink = (link) => {
    setActiveLink(link);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/Log-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="topbar">
      {/* App Title */}
      <h1 className="topbar-title">AU Fondue Admin</h1>

      {/* Navigation Links */}
      <nav>
        <ul className="topbar-nav flex items-center gap-6">
          <li>
            <Link
              href="/dashboard"
              className={`topbar-link ${
                activeTopLink === "/dashboard" || activeTopLink === "/"
                  ? "!text-lg !text-red-600 !font-bold"
                  : ""
              }`}
              onClick={() => {
                handleLinkClick("/dashboard");
                handleDefaultLink("/dashboard");
              }}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/admins"
              className={`topbar-link ${
                activeTopLink === "/admins"
                  ? "!text-lg !text-red-600 !font-bold"
                  : ""
              }`}
              onClick={() => {
                handleLinkClick("/admins");
                handleDefaultLink("/admins");
              }}
            >
              Users
            </Link>
          </li>

          {/* Username Dropdown */}
          <li className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 font-medium text-gray-800"
            >
              {userName}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-50">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
}
