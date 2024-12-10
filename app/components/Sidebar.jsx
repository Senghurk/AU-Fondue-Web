"use client"; // This enables client-side interactivity

import { useState } from 'react';
import Link from 'next/link';

export default function Sidebar() {
  const [isIncidentMenuOpen, setIsIncidentMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState(null); // Tracks the active link

  const handleLinkClick = (link) => {
    setActiveLink(link); // Update the active link
  };

  return (
    <div className="sidebar">
      <nav>
        <ul className="sidebar-nav">
          {/* Home */}
          <li>
            <Link
              href="/"
              className={`sidebar-link ${
                activeLink === '/' || activeLink === null ? '!text-red-500 !font-bold' : '' // Because this is Home button, it will be displayed at first
              }`}
              onClick={() => handleLinkClick('/')}
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
                    href="/urgents"
                    className={`sidebar-submenu-link ${
                      activeLink === '/urgents' ? '!text-red-500 !font-bold' : ''
                    }`}
                    onClick={() => handleLinkClick('/urgents')}
                  >
                    Urgent
                  </Link>
                </li>
                <li>
                  <Link
                    href="/comments"
                    className={`sidebar-submenu-link ${
                      activeLink === '/comments' ? '!text-red-500 !font-bold' : ''
                    }`}
                    onClick={() => handleLinkClick('/comments')}
                  >
                    Comments
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Other Links */}
          <li>
            <Link
              href="/assignedReports"
              className={`sidebar-link ${
                activeLink === '/assignedReports' ? '!text-red-500 !font-bold' : ''
              }`}
              onClick={() => handleLinkClick('/assignedReports')}
            >
              Assigned Reports
            </Link>
          </li>
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
      </nav>
    </div>
  );
}
