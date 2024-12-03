import './globals.css';

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
                  <a href="/" className="hover:underline">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/users" className="hover:underline">
                    Users
                  </a>
                </li>
                <li>
                  <a href="/settings" className="hover:underline">
                    Settings
                  </a>
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
                    <a href="/" className="block text-gray-700 hover:text-gray-900">
                      Home
                    </a>
                  </li>
                  <li>
                    <a href="/reports" className="block text-gray-700 hover:text-gray-900">
                      Reports
                    </a>
                  </li>
                  <li>
                    <a
                      href="/assignedReports"
                      className="block text-gray-700 hover:text-gray-900"
                    >
                      Assigned Reports
                    </a>
                  </li>
                  <li>
                    <a href="/updates" className="block text-gray-700 hover:text-gray-900">
                      Updates
                    </a>
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
