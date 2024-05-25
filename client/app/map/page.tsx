"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import withAuth from "@/components/withAuth";
import AssetMap from "@/components/map/AssetMap";

const dummyData = [
  {
    id: 1,
    name: "Asset 1",
    criticality: "High",
    coordinates: [12.4924, 41.8902],
  }, // Coordinates of Rome
  {
    id: 2,
    name: "Asset 2",
    criticality: "Medium",
    coordinates: [2.2945, 48.8584],
  }, // Coordinates of Paris
  {
    id: 3,
    name: "Asset 3",
    criticality: "Low",
    coordinates: [-74.006, 40.7128],
  }, // Coordinates of New York
];
const DashboardPage = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      try {
        const response = await axios.get(
          "http://localhost:8080/auth/protected",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data.logged_in_as);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

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

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <button onClick={handleLogout}>Logout</button>
      <p>Dashboard</p>
      <div>
        <h1>Asset Map</h1>

        <AssetMap assets={dummyData} />
      </div>
    </div>
  );
};

export default withAuth(DashboardPage);
