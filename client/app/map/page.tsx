"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import withAuth from "@/components/withAuth";
import AssetMap from "@/components/map/AssetMap";

const MapPage = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
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

    const fetchAssets = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/switchgear-info");
        setAssets(response.data.data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    fetchUser();
    fetchAssets();
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
        <AssetMap assets={assets} />
      </div>
    </div>
  );
};

export default withAuth(MapPage);
