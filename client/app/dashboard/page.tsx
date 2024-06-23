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
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import {
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import BarChartComponent from "@/components/BarChartComponent";
import PieChartComponent from "@/components/PieChartComponent";
import BorderCard from "@/components/BorderCard";

const DashboardPage = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [chartData, setChartData] = useState([]);
  const [switchgearData, setSwitchgearData] = useState([]);
  const [totalSwitchgear, setTotalSwitchgear] = useState(0);
  const [criticalSwitchgear, setCriticalSwitchgear] = useState(0);
  const [majorSwitchgear, setMajorSwitchgear] = useState(0);
  const [nonCriticalSwitchgear, setNonCriticalSwitchgear] = useState(0);
  const [brandData, setBrandData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

        const uniqueTotalSwitchgear = new Set(
          data.map((item) => item.functional_location)
        );
        setTotalSwitchgear(uniqueTotalSwitchgear.size);

        const uniqueCriticalSwitchgear = new Set(
          data
            .filter((item) => item.status === "Critical")
            .map((item) => item.functional_location)
        );
        setCriticalSwitchgear(uniqueCriticalSwitchgear.size);

        const uniqueMajorSwitchgear = new Set(
          data
            .filter((item) => item.status === "Major")
            .map((item) => item.functional_location)
        );
        setMajorSwitchgear(uniqueMajorSwitchgear.size);

        const uniqueNonCriticalSwitchgear = new Set(
          data
            .filter((item) => item.status === "Minor")
            .map((item) => item.functional_location)
        );
        setNonCriticalSwitchgear(uniqueNonCriticalSwitchgear.size);

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
    return null;
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredData = switchgearData.filter((item) => {
    return (
      (item.functional_location && item.functional_location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.defect_from && item.defect_from.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.switchgear_type && item.switchgear_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.switchgear_brand && item.switchgear_brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.substation_name && item.substation_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.defect_description_1 && item.defect_description_1.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.defect_description_2 && item.defect_description_2.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.defect_owner && item.defect_owner.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.status && item.status.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

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

      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-6">
        <BorderCard
          title={`Total: ${totalSwitchgear}`}
          description="Total Switchgear"
          color="border-t-blue-600"
        />
        <BorderCard
          title={`Total: ${criticalSwitchgear}`}
          description="Critical Switchgear"
          color="border-t-red-600"
        />
        <BorderCard
          title={`Total: ${majorSwitchgear}`}
          description="Major Switchgear"
          color="border-t-yellow-600"
        />
        <BorderCard
          title={`Total: ${nonCriticalSwitchgear}`}
          description="Non-Critical Switchgear"
          color="border-t-green-600"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
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
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currentColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Action</MenuItem>
                <MenuItem>Another Action</MenuItem>
                <MenuItem>Something else here</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <BarChartComponent data={chartData} />
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody>
            <Typography variant="h6" className="mb-4">
              Switchgear Brands Status: Critical
            </Typography>
            <PieChartComponent data={brandData} />
          </CardBody>
        </Card>
      </div>

      <div>
        <div className="p-6 bg-gray-100 rounded-t-lg">
          <Typography variant="h6" color="blue-gray" className="mb-1">
            Switchgear Table
          </Typography>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="border border-gray-300 rounded-lg p-2 mb-4"
          />
        </div>
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto mt-4">
              <thead>
                <tr>
                  {[
                    "Functional Location",
                    "Report Date",
                    "Defect From",
                    "TEV/US In DB",
                    "Hotspot ∆T In ⁰C",
                    "Switchgear Type",
                    "Switchgear Brand",
                    "Substation Name",
                    "Defect Description 1",
                    "Defect Description 2",
                    "Defect Owner",
                    "Status",
                  ].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-5 text-center"
                    >
                      <Typography
                        variant="small"
                        className="text-[11px] font-medium uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
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
                    <td className="py-3 px-5">
                      {item.status === "Critical" ? (
                        <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                          Critical
                        </span>
                      ) : item.status === "Major" ? (
                        <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          Major
                        </span>
                      ) : item.status === "Minor" ? (
                        <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                          Minor
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Unknown
                        </span>
                      )}
                    </td>
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
