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
      case "/pages/user-list":
        return (
          <ul className="sidebar-nav">
            <li>
              <Link
                href="/pages/user-list"
                className={`sidebar-link ${
                  activeLink === "/pages/user-list" ? "!text-red-600 !font-bold" : ""
                }`}
                onClick={() => handleLinkClick("/pages/user-list")}
              >
                User List
              </Link>
            </li>

            <li>
              <Link
                href="/pages/admins"
                className={`sidebar-link ${
                  activeLink === "/pages/admins" ? "!text-red-600 !font-bold" : ""
                }`}
                onClick={() => handleLinkClick("/pages/admins")}
              >
                Admin List
              </Link>
            </li>
          </ul>
        );

      case "/pages/general-settings":
        return (
          <ul className="sidebar-nav">
            <li>
              <Link
                href="/pages/general-settings"
                className={`sidebar-link ${
                  activeLink === "/pages/general-settings" ? "!text-red-600 !font-bold" : ""
                }`}
                onClick={() => handleLinkClick("/pages/general-settings")}
              >
                General Settings
              </Link>
            </li>
            <li>
              <Link
                href="/pages/notification-settings"
                className={`sidebar-link ${
                  activeLink === "/pages/notification-settings" ? "!text-red-600 !font-bold" : ""
                }`}
                onClick={() => handleLinkClick("/pages/notification-settings")}
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
              href="/pages/dashboard"
              className={`sidebar-link ${
                activeLink === '/pages/dashboard' || activeLink === "/" ? '!text-red-600 !font-bold' : '' // Because this is Home button, it will be displayed at first
              }`}
              onClick={() => handleLinkClick('/pages/dashboard')}
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
                    href="/pages/reports"
                    className={`sidebar-submenu-link ${
                      activeLink === '/pages/reports' ? '!text-red-500 !font-bold' : ''
                    }`}
                    onClick={() => handleLinkClick('/pages/reports')}
                  >
                    Reports
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pages/urgents"
                    className={`sidebar-submenu-link ${
                      activeLink === '/pages/urgents' ? '!text-red-500 !font-bold' : ''
                    }`}
                    onClick={() => handleLinkClick('/pages/urgents')}
                  >
                    Urgent
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Other Links */}
          <li>
            <Link
              href="/pages/assignedReports"
              className={`sidebar-link ${
                activeLink === '/pages/assignedReports' ? '!text-red-500 !font-bold' : ''
              }`}
              onClick={() => handleLinkClick('/pages/assignedReports')}
            >
              Assigned Reports
            </Link>
          </li>
          <li>
            <Link
              href="/pages/updates"
              className={`sidebar-link ${
                activeLink === '/pages/updates' ? '!text-red-500 !font-bold' : ''
              }`}
              onClick={() => handleLinkClick('/pages/updates')}
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
