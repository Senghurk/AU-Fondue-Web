"use client";

import { usePathname, useRouter } from "next/navigation"; // Import useRouter for navigation
import {useState} from "react";
import "./globals.css";
import TopBar from "./components/Topbar";
import SideBar from "./components/Sidebar"

export default function RootLayout({ children }) {
  const [activeTopLink, setActiveTopLink] = useState("/"); 
  const [activeLink, setActiveLink] = useState("/");
  const pathname = usePathname(); // Get the current route
  const router = useRouter(); // Router for navigation

  const isLoginPage = pathname === "/"; // Check if it's the login page

  return (
    <html lang="en">
      <body>
        <div className="h-screen flex flex-col main-layout">
          {/* Conditionally render Top Bar */}
          {!isLoginPage && (
              <TopBar
               router = {router}
               activeTopLink={activeTopLink}
               setActiveTopLink={setActiveTopLink}
               setActiveLink={setActiveLink}
               />
          )}

          <div className="flex space-x-6 p-8">
            {/* Conditionally render Side Bar */}
            {!isLoginPage && (
                <SideBar 
                activeTopLink={activeTopLink}
                activeLink={activeLink}
                setActiveLink={setActiveLink}
                />
            )}

            {/* Main content */}
            <div
              className={`${
                isLoginPage ? "w-full" : "w-3/4"
              } main-content`}
            >
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
