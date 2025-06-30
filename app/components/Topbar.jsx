"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Topbar({ activeTopLink, setActiveTopLink, setActiveLink }) {
  const router = useRouter(); // ✅ Use router directly

  const handleLinkClick = (link) => {
    setActiveTopLink(link); // Update the active top nav
  };

  const handleDefaultLink = (link) => {
    setActiveLink(link); // Update side nav
  };

  const handleLogout = (e) => {
    e.preventDefault();
    // Add logout logic if needed (e.g., clear session)
    router.push("/Log-in"); // ✅ Redirect to login
  };

  return (
    <div className="topbar ">
      {/* App Title */}
      <h1 className="topbar-title">AU Fondue Admin</h1>

      {/* Navigation Links */}
      <nav>
        <ul className="topbar-nav">
          <li>
            <Link
              href="/dashboard"
              className={`topbar-link ${
                activeTopLink === "/dashboard" || activeTopLink === "/" ? "!text-lg !text-red-600 !font-bold" : ""
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
              href="/user-list"
              className={`topbar-link ${
                activeTopLink === "/user-list" ? "!text-lg !text-red-600 !font-bold" : ""
              }`}
              onClick={() => {
                handleLinkClick("/user-list");
                handleDefaultLink("/user-list");
              }}
            >
              Users
            </Link>
          </li>
          {/* <li>
            <Link
              href="/general-settings"
              className={`topbar-link ${
                activeTopLink === "/general-settings" ? "!text-lg !text-red-600 !font-bold" : ""
              }`}
              onClick={() => {
                handleLinkClick("/general-settings");
                handleDefaultLink("/general-settings");
              }}
            >
              Settings
            </Link>
          </li> */}
          <li>
            <a href="#" onClick={handleLogout} className="topbar-link">
              Logout
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
