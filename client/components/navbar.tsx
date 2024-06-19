// components/Navbar.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Navbar, Collapse, Typography, Button, IconButton } from "@material-tailwind/react";
import { ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const CustomNavbar = () => {
  const [openNav, setOpenNav] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await axios.post(
          "http://localhost:8080/auth/logout",
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960) {
        setOpenNav(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography as="li" variant="small" color="blue-gray" className="capitalize">
        <a href="/dashboard" className="flex items-center gap-1 p-1 font-normal">
          Dashboard
        </a>
      </Typography>
      <Typography as="li" variant="small" color="blue-gray" className="capitalize">
        <a href="/profile" className="flex items-center gap-1 p-1 font-normal">
          Profile
        </a>
      </Typography>
      {/* Add more navigation items here */}
    </ul>
  );

  return (
    <Navbar className="p-3">
      <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
        <a href="/">
          <Typography variant="small" className="mr-4 ml-2 cursor-pointer py-1.5 font-bold">
            My App
          </Typography>
        </a>
        <div className="hidden lg:block">{navList}</div>
        <Button
          variant="gradient"
          size="sm"
          className="hidden lg:inline-block"
          onClick={handleLogout}
        >
          Logout
        </Button>
        <IconButton
          variant="text"
          size="sm"
          className="ml-auto text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon strokeWidth={2} className="h-6 w-6" />
          ) : (
            <Bars3Icon strokeWidth={2} className="h-6 w-6" />
          )}
        </IconButton>
      </div>
      <Collapse open={openNav}>
        <div className="container mx-auto">
          {navList}
          <Button
            variant="gradient"
            size="sm"
            className="w-full block lg:hidden"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </Collapse>
    </Navbar>
  );
};

export default CustomNavbar;
