"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import "./globals.css";
import TopBar from "./components/Topbar";
import SideBar from "./components/Sidebar";

export default function RootLayout({ children }) {
  const [activeTopLink, setActiveTopLink] = useState("/");
  const [activeLink, setActiveLink] = useState("/");
  const pathname = usePathname();

  // ✅ Pages that should NOT have admin layout
  const isPublicPage = pathname === "/" || pathname === "/Log-in" || pathname === "/Sign-up";

  return (
    <html lang="en">
      <body>
        {isPublicPage ? (
          <div className="w-full min-h-screen">{children}</div>
        ) : (
          <div className="h-screen flex flex-col main-layout">
            {/* Top bar */}
            <TopBar
              activeTopLink={activeTopLink}
              setActiveTopLink={setActiveTopLink}
              setActiveLink={setActiveLink}
            />

            {/* Page layout */}
            <div className="flex space-x-6 p-8">
              <SideBar
                activeTopLink={activeTopLink}
                activeLink={activeLink}
                setActiveLink={setActiveLink}
              />

              {/* Page content */}
              <div className="w-3/4 main-content">{children}</div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
