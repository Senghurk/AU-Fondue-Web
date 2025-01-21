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
            <Link href="/dashboard" className={`topbar-link ${
                activeTopLink === '/dashboard' || activeTopLink === "/" ? '!text-lg !text-red-600 !font-bold' : '' 
              }`} onClick={() => {handleLinkClick("/dashboard"); handleDefaultLink("/dashboard"); }}>  
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/user-list" className={`topbar-link ${
                activeTopLink === '/user-list' ? '!text-lg !text-red-600 !font-bold' : '' 
              }`} onClick={() => {handleLinkClick("/user-list"); handleDefaultLink("/user-list"); }}>
              Users
            </Link>
          </li>
          <li>
            <Link href="/general-settings" className={`topbar-link ${
                activeTopLink === '/general-settings' ? '!text-lg !text-red-600 !font-bold' : '' 
              }`} onClick={() => {handleLinkClick("/general-settings"); handleDefaultLink("/general-settings"); }}>
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
