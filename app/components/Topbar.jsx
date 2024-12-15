"use client";
import Link from 'next/link';
export default function Topbar({router, activeTopLink, setActiveTopLink, setActiveLink }) {


  const handleLinkClick = (link) => {
    setActiveTopLink(link); // Update the active link
  };
  const handleDefaultLink =(link) => {
    setActiveLink(link); //Handles the bolding of the default link
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
            <Link href="/pages/dashboard" className={`topbar-link ${
                activeTopLink === '/pages/dashboard' || activeTopLink === "/" ? '!text-lg !text-red-600 !font-bold' : '' 
              }`} onClick={() => {handleLinkClick("/pages/dashboard"); handleDefaultLink("/pages/dashboard"); }}>  
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/pages/user-list" className={`topbar-link ${
                activeTopLink === '/pages/user-list' ? '!text-lg !text-red-600 !font-bold' : '' 
              }`} onClick={() => {handleLinkClick("/pages/user-list"); handleDefaultLink("/pages/user-list"); }}>
              Users
            </Link>
          </li>
          <li>
            <Link href="/pages/general-settings" className={`topbar-link ${
                activeTopLink === '/pages/general-settings' ? '!text-lg !text-red-600 !font-bold' : '' 
              }`} onClick={() => {handleLinkClick("/pages/general-settings"); handleDefaultLink("/pages/general-settings"); }}>
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
