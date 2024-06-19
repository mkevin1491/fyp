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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { StatisticsCard } from "@/components/statistics-card";

const DashboardPage = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [chartData, setChartData] = useState([]);
  const [switchgearData, setSwitchgearData] = useState([]);
  const [totalSwitchgear, setTotalSwitchgear] = useState(0);
  const [criticalSwitchgear, setCriticalSwitchgear] = useState(0);
  const [brandData, setBrandData] = useState([]);
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
        const data = response.data.data;
        setSwitchgearData(data);

        // Calculate statistics
        const total = data.length;
        const critical = data.filter(
          (item) => item.status === "Critical"
        ).length;

        // Calculate brand data for pie chart
        const brandCount = {};
        data.forEach((item) => {
          if (item.status === "Critical") {
            if (!brandCount[item.switchgear_brand]) {
              brandCount[item.switchgear_brand] = 0;
            }
            brandCount[item.switchgear_brand]++;
          }
        });
        const brandData = Object.keys(brandCount).map((key) => ({
          name: key,
          value: brandCount[key],
        }));

        setTotalSwitchgear(total);
        setCriticalSwitchgear(critical);
        setBrandData(brandData);
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

  if (!user) {
    return <div>Loading...</div>;
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <div className="mb-8">
        <Typography variant="h5" className="mb-4">
          Welcome, {user.name}
        </Typography>
        <Button onClick={handleLogout} variant="gradient" color="blue">
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatisticsCard
          color="blue"
          icon={<i className="fas fa-cogs"></i>}
          title="Total Switchgear"
          value={totalSwitchgear}
        />
        <StatisticsCard
          color="red"
          icon={<i className="fas fa-exclamation-triangle"></i>}
          title="Critical Switchgear"
          value={criticalSwitchgear}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardBody>
            <Typography variant="h6" className="mb-4">
              Bar Chart
            </Typography>
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
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Typography variant="h6" className="mb-4">
              Critical Switchgear Brands
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={brandData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {brandData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      <div>
        <div className="p-6 bg-gray-100 rounded-t-lg">
          <Typography variant="h6" color="blue-gray" className="mb-1">
            Switchgear Table
          </Typography>
        </div>
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto mt-4">
              <thead>
                <tr>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Functional Location
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Report Date
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Defect From
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    TEV/US In DB
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Hotspot ∆T In ⁰C
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Switchgear Type
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Switchgear Brand
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Substation Name
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Defect Description 1
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Defect Description 2
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Defect Owner
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {switchgearData.map((item) => (
                  <tr key={item.id} className="border-b border-blue-gray-50">
                    <td className="py-3 px-5">{item.functional_location}</td>
                    <td className="py-3 px-5">
                      {new Date(item.report_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-5">{item.defect_from}</td>
                    <td className="py-3 px-5">
                      {item.tev_us_in_db !== null ? item.tev_us_in_db : "N/A"}
                    </td>
                    <td className="py-3 px-5">
                      {item.hotspot_delta_t_in_c !== null
                        ? item.hotspot_delta_t_in_c
                        : "N/A"}
                    </td>
                    <td className="py-3 px-5">{item.switchgear_type}</td>
                    <td className="py-3 px-5">{item.switchgear_brand}</td>
                    <td className="py-3 px-5">{item.substation_name}</td>
                    <td className="py-3 px-5">{item.defect_description_1}</td>
                    <td className="py-3 px-5">{item.defect_description_2}</td>
                    <td className="py-3 px-5">{item.defect_owner}</td>
                    <td className="py-3 px-5">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default withAuth(DashboardPage);
