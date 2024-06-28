"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import withAuth from "@/components/withAuth";
import {
  Card,
  CardBody,
  Typography,
  Button,
  CardHeader,
} from "@material-tailwind/react";
import BarChartComponent from "@/components/BarChartComponent";
import PieChartComponent from "@/components/PieChartComponent";
import BorderCard from "@/components/BorderCard";

const DashboardPage = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [functionalLocations, setFunctionalLocations] = useState([]);
  const [totalSwitchgear, setTotalSwitchgear] = useState(0);
  const [criticalSwitchgear, setCriticalSwitchgear] = useState(0);
  const [majorSwitchgear, setMajorSwitchgear] = useState(0);
  const [nonCriticalSwitchgear, setNonCriticalSwitchgear] = useState(0);
  const [brandData, setBrandData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [brandStatusText, setBrandStatusText] = useState("Critical");

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

    const fetchFunctionalLocations = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/functional-locations");
        const data = response.data;
        setFunctionalLocations(data);

        const total = data.length;
        const critical = data.filter((item: any) => item.statuses.includes("Critical")).length;
        const major = data.filter((item: any) => item.statuses.includes("Major")).length;
        const minor = data.filter((item: any) => item.statuses.includes("Minor")).length;

        setTotalSwitchgear(total);
        setCriticalSwitchgear(critical);
        setMajorSwitchgear(major);
        setNonCriticalSwitchgear(minor);

        // Prepare chart data
        const chartData = [
          { label: "Total Switchgear", value: total },
          { label: "Critical Switchgear", value: critical },
          { label: "Major Switchgear", value: major },
          { label: "Non-Critical Switchgear", value: minor },
        ];
        setChartData(chartData);

        // Prepare brand data
        const brandCount = {};
        data.forEach((item) => {
          item.statuses.forEach((status) => {
            if (!brandCount[status]) {
              brandCount[status] = 0;
            }
            brandCount[status]++;
          });
        });
        const brandData = Object.keys(brandCount).map((key) => ({
          name: key,
          value: brandCount[key],
        }));
        setBrandData(brandData);

      } catch (error) {
        console.error("Error fetching functional locations:", error);
      }
    };

    fetchUser();
    fetchFunctionalLocations();
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
    return null;
  }

  const handleFilterChange = (filterType: string) => {
    setBrandStatusText(` ${filterType}`);
  };

  return (
    <div className="mt-12">
      <div className="mb-8 flex items-center justify-between">
        <Typography variant="h5" className="mb-4, pl-1">
          Welcome, {user.name}
        </Typography>
        <Button onClick={handleLogout} variant="gradient" color="blue">
          Logout
        </Button>
      </div>

      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        <BorderCard
          title={`${totalSwitchgear}`}
          description="Total Switchgear"
          color="border-t-blue-600"
        />
        <BorderCard
          title={`${criticalSwitchgear}`}
          description="Critical Switchgear"
          color="border-t-red-600"
        />
        <BorderCard
          title={`${majorSwitchgear}`}
          description="Major Switchgear"
          color="border-t-yellow-600"
        />
        <BorderCard
          title={`${nonCriticalSwitchgear}`}
          description="Non-Critical Switchgear"
          color="border-t-green-600"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-2">
        <Card className="overflow-hidden border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Registered Switchgear
              </Typography>
            </div>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <BarChartComponent data={chartData} />
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody>
            <Typography variant="h6" className="mb-4">
              Switchgear Brand Status: {brandStatusText}
            </Typography>
            <PieChartComponent data={brandData} onFilterChange={handleFilterChange} brandStatusText={brandStatusText} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default withAuth(DashboardPage);
