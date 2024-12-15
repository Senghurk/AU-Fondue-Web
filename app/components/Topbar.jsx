"use client";
import Link from 'next/link';
import { useState } from 'react';
export default function Topbar({router}) {

  const [activeTopLink, setActiveTopLink] = useState(null); // Tracks the active link

  const handleLinkClick = (link) => {
    setActiveTopLink(link); // Update the active link
  };

  //LogOut Handler
  const handleLogout = (e) => {
    e.preventDefault(); // Prevent default link behavior
    // Clear any stored session-related information (if necessary)
    // For example: localStorage.removeItem("userSession");

    // Redirect to the login page
    router.push("/");
  };


  return (
    <div className="topbar">
      {/* App Title */}
      <h1 className="topbar-title">AU Fondue Admin</h1>

      {/* Navigation Links */}
      <nav>
        <ul className="topbar-nav">
          <li>
            <Link href="/dashboard" className={`topbar-link ${
                activeTopLink === '/dashboard' || activeTopLink === null ? '!font-bold' : '' 
              }`}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/users" className="topbar-link">
              Users
            </Link>
          </li>
          <li>
            <Link href="/settings" className="topbar-link">
              Settings
            </Link>
          </li>
          <li>
             <a
              href="/logout"
              onClick={handleLogout}
              className="topbar-link"
              >
                Logout
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
