"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import withAuth from "@/components/withAuth";
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
import AssetMap from "@/components/map/AssetMap";

const DashboardPage = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [chartData, setChartData] = useState([]);
  const [switchgearData, setSwitchgearData] = useState([]);
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

    const fetchSwitchgearData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/switchgear-info"
        );
        setSwitchgearData(response.data.data);
      } catch (error) {
        console.error("Error fetching switchgear data:", error);
      }
    };

    fetchUser();
    fetchChartData();
    fetchSwitchgearData();
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

  const getStatus = (tev, temperature) => {
    if (tev !== null && tev >= 10) return "Critical";
    if (tev !== null && tev >= 5) return "Major";
    if (tev !== null && tev > 0) return "Non-Critical";
    if (temperature !== null && temperature >= 10) return "Critical";
    if (temperature !== null && temperature >= 5) return "Major";
    if (temperature !== null && temperature > 0) return "Non-Critical";
    return "Unknown";
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
      <div>
        <h1>Switchgear Table</h1>
        <table>
          <thead>
            <tr>
              <th>Functional Location</th>
              <th>Report Date</th>
              <th>Defect From</th>
              <th>TEV/US In DB</th>
              <th>Hotspot ∆T In ⁰C</th>
              <th>Switchgear Type</th>
              <th>Switchgear Brand</th>
              <th>Substation Name</th>
              <th>Defect Description 1</th>
              <th>Defect Description 2</th>
              <th>Defect Owner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {switchgearData.map((item) => (
              <tr key={item.id}>
                <td>{item.functional_location}</td>
                <td>{new Date(item.report_date).toLocaleDateString()}</td>
                <td>{item.defect_from}</td>
                <td>
                  {item.tev_us_in_db !== null ? item.tev_us_in_db : "N/A"}
                </td>
                <td>
                  {item.hotspot_delta_t_in_c !== null
                    ? item.hotspot_delta_t_in_c
                    : "N/A"}
                </td>
                <td>{item.switchgear_type}</td>
                <td>{item.switchgear_brand}</td>
                <td>{item.substation_name}</td>
                <td>{item.defect_description_1}</td>
                <td>{item.defect_description_2}</td>
                <td>{item.defect_owner}</td>
                <td>
                  {getStatus(item.tev_us_in_db, item.hotspot_delta_t_in_c)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default withAuth(DashboardPage);
