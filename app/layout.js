import './globals.css';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

export const metadata = {
  title: 'AU Fondue',
  description: 'Admin Side for Assumption University',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="h-screen flex flex-col main-layout">
          {/* Top Bar */}
          <TopBar />

          {/* Main Content Area */}
          <div className="flex space-x-6 p-8">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Page Content */}
            <div className="main-content">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
