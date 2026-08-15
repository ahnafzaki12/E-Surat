import React, { ReactNode } from "react";
import { BrowserRouter } from "react-router";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import AppHeader from "../layout/AppHeader";
import Backdrop from "../layout/Backdrop";
import AppSidebar from "../layout/AppSidebar";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

const LayoutContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <LayoutContent>{children}</LayoutContent>
      </SidebarProvider>
    </BrowserRouter>
  );
}
