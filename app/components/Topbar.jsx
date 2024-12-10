import Link from 'next/link';

export default function TopBar() {
  return (
    <div className="topbar">
      {/* App Title */}
      <h1 className="topbar-title">AU Fondue Admin</h1>

      {/* Navigation Links */}
      <nav>
        <ul className="topbar-nav">
          <li>
            <Link href="/" className="topbar-link">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/users" className="topbar-link">
              Users
            </Link>
          </li>
          <li>
            <Link href="/settings" className="topbar-link">
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
