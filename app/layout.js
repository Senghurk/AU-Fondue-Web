import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'AU Fondue',
  description: 'Admin Side for Assumption University',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="h-screen flex flex-col">
          {/* Top Bar */}
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

          {/* Main Content Area */}
          <div className="flex flex-1">
            {/* Sidebar */}
            <div className="w-1/4 bg-gray-200 p-4">
              <nav>
      
                <ul className="space-y-4">
                  <li>
                    <Link href="/" className="block text-gray-700 hover:text-gray-900">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/reports" className="block text-gray-700 hover:text-gray-900">
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
                    <Link href="/updates" className="block text-gray-700 hover:text-gray-900">
                      Updates
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Main Page Content */}
            <div className="w-3/4 p-6 bg-white overflow-auto">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
