"use client"; // This enables client-side interactivity

import { useState } from 'react';
import Link from 'next/link';

export default function Sidebar({activeTopLink, activeLink,setActiveLink }) {
  const [isIncidentMenuOpen, setIsIncidentMenuOpen] = useState(false);

  const handleLinkClick = (link) => {
    setActiveLink(link); // Updates the active link
  };

  const renderLinks = () => {
    switch (activeTopLink) {
      case "/user-list":
        return (
          <ul className="sidebar-nav">
            <li>
              <Link
                href="/user-list"
                className={`sidebar-link ${
                  activeLink === "/user-list" ? "!text-red-600 !font-bold" : ""
                }`}
                onClick={() => handleLinkClick("/user-list")}
              >
                User List
              </Link>
            </li>

            <li>
              <Link
                href="/admins"
                className={`sidebar-link ${
                  activeLink === "/admins" ? "!text-red-600 !font-bold" : ""
                }`}
                onClick={() => handleLinkClick("/admins")}
              >
                Admin List
              </Link>
            </li>
          </ul>
        );

      case "/general-settings":
        return (
          <ul className="sidebar-nav">
            <li>
              <Link
                href="/general-settings"
                className={`sidebar-link ${
                  activeLink === "/general-settings" ? "!text-red-600 !font-bold" : ""
                }`}
                onClick={() => handleLinkClick("/pages/general-settings")}
              >
                General Settings
              </Link>
            </li>
            <li>
              <Link
                href="/notification-settings"
                className={`sidebar-link ${
                  activeLink === "/notification-settings" ? "!text-red-600 !font-bold" : ""
                }`}
                onClick={() => handleLinkClick("/notification-settings")}
              >
                Notification Settings
              </Link>
            </li>
          </ul>
        );

      default:
        return (
          <ul className="sidebar-nav">
          {/* Home */}
          <li>
            <Link
              href="/dashboard"
              className={`sidebar-link ${
                activeLink === '/dashboard' || activeLink === "/" ? '!text-red-600 !font-bold' : '' // Because this is Home button, it will be displayed at first
              }`}
              onClick={() => handleLinkClick('/dashboard')}
            >
              Home
            </Link>
          </li>

          {/* Incidents Category */}
          <li>
            <div
              className="sidebar-home-menu"
              onClick={() => setIsIncidentMenuOpen(!isIncidentMenuOpen)}
            >
              <span>Incidents</span>
              <span>{isIncidentMenuOpen ? '▲' : '▼'}</span>
            </div>
            {isIncidentMenuOpen && (
              <ul className="sidebar-submenu">
                <li>
                  <Link
                    href="/reports"
                    className={`sidebar-submenu-link ${
                      activeLink === '/reports' ? '!text-red-500 !font-bold' : ''
                    }`}
                    onClick={() => handleLinkClick('/reports')}
                  >
                    Reports
                  </Link>
                </li>
                <li>
                  <Link
                    href="/assignedReports"
                    className={`sidebar-submenu-link ${
                      activeLink === '/assignedReports' ? '!text-red-500 !font-bold' : ''
                    }`}
                    onClick={() => handleLinkClick('/assignedReports')}
                  >
                    Assigned Reports
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Other Links */}
          <li>
            <Link
              href="/updates"
              className={`sidebar-link ${
                activeLink === '/updates' ? '!text-red-500 !font-bold' : ''
              }`}
              onClick={() => handleLinkClick('/updates')}
            >
              Updates
            </Link>
          </li>
        </ul>
        );
    }
  };

  return (
    <div className="sidebar">
      {renderLinks()}
    </div>
  );
}
