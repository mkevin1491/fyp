"use client";
import { useState, useEffect } from "react";
import { Nav } from "./ui/nav";
import {
  LayoutDashboard,
  MapPinned,
  Upload,
  FileCog,
  FileClock,
  LineChart,
  Trello,
  Table2,
  TrendingUp,
  Captions,
  BookMinus,
} from "lucide-react";
import { io } from "socket.io-client";
import { useMaterialTailwindController, setOpenSidenav } from "./context";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useRouter } from "next/navigation"; // Assuming you're using the next/navigation package

export default function SideNavbar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingApprovalCount, setPendingApprovalCount] = useState<number>(0);
  const [controller, dispatch] = useMaterialTailwindController();
  const [mounted, setMounted] = useState(false);
  const router = useRouter(); // Initialize useRouter for navigation

  useEffect(() => {
    setMounted(true);
    const socket = io("https://sea-lion-app-3l29g.ondigitalocean.app");

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("update_pending_approvals_count", (data) => {
      console.log("Received update for pending approvals count:", data);
      setPendingApprovalCount(data.count);
    });

    fetchPendingApprovalCount();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchPendingApprovalCount = async () => {
    try {
      const response = await fetch(
        "https://sea-lion-app-3l29g.ondigitalocean.app/api/pending-approvals/count"
      );
      const data = await response.json();
      setPendingApprovalCount(data.count);
    } catch (error) {
      console.error("Error fetching pending approvals count:", error);
    }
  };

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setOpenSidenav(dispatch, false);
      } else {
        setOpenSidenav(dispatch, true);
      }
    };

    handleResize(); // Call the function initially to set the correct state

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dispatch]);

  if (!mounted) {
    return null;
  }

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post(
          "https://sea-lion-app-3l29g.ondigitalocean.app/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        localStorage.removeItem("token");
        router.push("/login");
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  };

  return (
    <aside
      className={`${
        controller.openSidenav ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 bg-white shadow-md rounded-xl transition-transform duration-300 md:translate-x-0`}
    >
      <div className="relative flex flex-col h-full">
        <div className="flex justify-center items-center py-6 px-8">
          <img
            className="mx-auto h-6 w-auto my-6"
            src="/tnb-logo.png"
            alt="TNB Logo"
          />
          <span className="text-xl font-bold">TNB-SWITCHWISE</span>
        </div>

        <Nav
          isCollapsed={isCollapsed}
          links={[
            {
              title: "Dashboard",
              href: "/dashboard",
              icon: LayoutDashboard,
              variant: "default",
            },
            {
              title: "Upload CSV",
              href: "/upload",
              icon: Upload,
              variant: "ghost",
            },
          ]}
        />
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="defect_analytic">
            <AccordionTrigger
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className:
                    "flex items-center w-full text-left px-8 py-2 justify-between",
                })
              )}
            >
              <div className="flex items-center">
                <LineChart className="mr-2" />
                <span>Defect Analytic</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-12">
              <Nav
                isCollapsed={isCollapsed}
                links={[
                  {
                    title: "Switchgear List",
                    href: "/switchgear_list",
                    icon: Table2,
                    variant: "ghost",
                  },
                  {
                    title: "Defect Trend",
                    href: "/defect_analytic",
                    icon: TrendingUp,
                    variant: "ghost",
                  },
                ]}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <Nav
          isCollapsed={isCollapsed}
          links={[
            {
              title: "Geographical Map",
              href: "/map",
              icon: MapPinned,
              variant: "ghost",
            },
            {
              title: "Generate Report",
              href: "/generate_report",
              icon: Trello,
              variant: "ghost",
            },
            {
              title: "Approval",
              href: "/approval",
              icon: FileCog,
              variant: "ghost",
              label:
                pendingApprovalCount > 0
                  ? pendingApprovalCount.toString()
                  : undefined,
            },
            {
              title: "Approval Log",
              href: "/approval_log",
              icon: FileClock,
              variant: "ghost",
            },
            {
              title: "Action Log",
              href: "/action_log",
              icon: Captions,
              variant: "ghost",
            },
            {
              title: "About System",
              href: "/aboutsystem",
              icon: BookMinus,
              variant: "ghost",
            },
          ]}
        />
        {/* Logout Button */}
        <div className="flex items-center justify-center mt-auto py-4">
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-500"
          >
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
