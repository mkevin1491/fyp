import { FC, ReactNode } from "react";
import "../globals.css";

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <html>
      <body>
      <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      <div className="relative w-full max-w-md">
        {children}
      </div>
    </div>
      </body>
    </html>

  );
};

export default Layout;
