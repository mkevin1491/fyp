"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import withAuth from "@/components/withAuth";
import AssetMap from "@/components/map/AssetMap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const DashboardPage = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [chartData, setChartData] = useState([]);
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

    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/switchgear-data"
        );
        setChartData(response.data.data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchUser();
    fetchChartData();
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
      <div></div>
      <div>
        <h1>Bar Chart</h1>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            width={500}
            height={300}
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="functional_locations" fill="#8884d8">
              <LabelList dataKey="functional_locations" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default withAuth(DashboardPage);
