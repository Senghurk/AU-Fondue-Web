"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }) {
  const pathname = usePathname(); // Get the current route

  const isLoginPage = pathname === "/"; // Check if it's the login page

  return (
    <html lang="en">
      <head>
        <title>AU Fondue</title>
      </head>
      <body>
        <div className="h-screen flex flex-col">
          {/* Conditionally render navbar */}
          {!isLoginPage && (
            <div className="flex items-center justify-between bg-gray-800 text-white p-4">
              <h1 className="text-lg font-semibold">AU Fondue Admin</h1>
              <nav>
                <ul className="flex space-x-4">
                  <li>
                    <Link href="/" className="hover:underline">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/users" className="hover:underline">
                      Users
                    </Link>
                  </li>
                  <li>
                    <Link href="/settings" className="hover:underline">
                      Settings
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          <div className="flex flex-1">
            {/* Conditionally render sidebar */}
            {!isLoginPage && (
              <div className="w-1/4 bg-gray-200 p-4">
                <nav>
                  <ul className="space-y-4">
                    <li>
                      <Link
                        href="/"
                        className="block text-gray-700 hover:text-gray-900"
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/reports"
                        className="block text-gray-700 hover:text-gray-900"
                      >
                        Reports
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/assignedReports"
                        className="block text-gray-700 hover:text-gray-900"
                      >
                        Assigned Reports
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/updates"
                        className="block text-gray-700 hover:text-gray-900"
                      >
                        Updates
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            )}

            {/* Main content */}
            <div
              className={`${
                isLoginPage ? "w-full" : "w-3/4"
              } p-6 bg-white overflow-auto`}
            >
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
