// components/SideNavbar.tsx

"use client";

import { useState, useEffect } from "react";
import { Nav } from "./ui/nav";
import {
  LayoutDashboard,
  MapPinned,
  Upload,
  FileCog,
  FileClock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWindowWidth } from "@react-hook/window-size";
import { io } from "socket.io-client";

export default function SideNavbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingApprovalCount, setPendingApprovalCount] = useState<number>(0);
  const onlyWidth = useWindowWidth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const socket = io("http://127.0.0.1:8080"); // Adjust the URL if necessary

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("update_pending_approvals_count", (data) => {
      console.log("Received update for pending approvals count:", data);
      setPendingApprovalCount(data.count);
    });

    // Fetch initial count
    fetchPendingApprovalCount();

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchPendingApprovalCount = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8080/api/pending-approvals/count');
      const data = await response.json();
      setPendingApprovalCount(data.count);
    } catch (error) {
      console.error('Error fetching pending approvals count:', error);
    }
  };

  const mobileWidth = onlyWidth < 768;

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  if (!mounted) {
    return null; // or return a loading spinner or skeleton component
  }

  return (
    <div className="relative min-w-[80px] border-r px-3 pb-10 pt-24">
      {!mobileWidth && (
        <div className="absolute right-[-20px] top-7">
          <Button
            onClick={toggleSidebar}
            variant="secondary"
            className="rounded-full p-2"
            aria-label="Toggle Sidebar"
          >
            <ChevronRight />
          </Button>
        </div>
      )}

      <Nav
        isCollapsed={mobileWidth || isCollapsed}
        links={[
          {
            title: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            variant: "default",
          },
          {
            title: "Geographical Map",
            href: "/map",
            icon: MapPinned,
            variant: "ghost",
          },
          {
            title: "Upload CSV",
            href: "/upload",
            icon: Upload,
            variant: "ghost",
          },
          {
            title: "Approval",
            href: "/approval",
            icon: FileCog,
            variant: "ghost",
            label: pendingApprovalCount > 0 ? pendingApprovalCount.toString() : undefined,
          },
          {
            title: "Approval Log",
            href: "/approval_log",
            icon: FileClock,
            variant: "ghost",
          },
        ]}
      />
    </div>
  );
}
