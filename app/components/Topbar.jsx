"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseClient";
import { getBackendUrl } from "../config/api";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { User, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ activeTopLink, setActiveTopLink, setActiveLink, sidebarOpen, setSidebarOpen, isMobile }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, logout, isAdmin, isOMStaff } = useAuth();

  const backendUrl = getBackendUrl();

  const handleLinkClick = (link) => {
    setActiveTopLink(link);
  };

  const handleDefaultLink = (link) => {
    setActiveLink(link);
  };

  const handleLogout = async () => {
    try {
      // Bypass Firebase logout - just clear local auth
      logout();
      router.push("/Log-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-gray-200 shadow-sm print:hidden">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Mobile Menu Button & App Title */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link href={isOMStaff() ? "/reports" : "/dashboard"} className="group">
            <h1 className={`font-semibold transition-colors duration-200 ${
              isMobile ? 'text-lg' : 'text-2xl'
            }`}>
              <span className="text-gray-900 group-hover:text-blue-600">AU Fondue </span>
              <span className={isOMStaff() ? "text-green-600 group-hover:text-green-700" : "text-blue-600 group-hover:text-blue-700"}>
                {isOMStaff() ? "Staff" : "Admin"}
              </span>
            </h1>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-4 lg:space-x-8">
          {/* Desktop Navigation Links - Only show for Admin users */}
          {isAdmin() && (
            <div className="hidden sm:flex items-center space-x-4 lg:space-x-6">
              <Link
                href="/dashboard"
                className={`px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTopLink === "/dashboard" || activeTopLink === "/"
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                onClick={() => {
                  handleLinkClick("/dashboard");
                  handleDefaultLink("/dashboard");
                }}
              >
                Dashboard
              </Link>
              <Link
                href="/admins"
                className={`px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTopLink === "/admins"
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                onClick={() => {
                  handleLinkClick("/admins");
                  handleDefaultLink("/admins");
                }}
              >
                Users
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-2 lg:space-x-3 pl-4 lg:pl-6 border-l border-gray-300">
            {/* Username Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium hidden sm:block">
                    {user ? user.name : 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
