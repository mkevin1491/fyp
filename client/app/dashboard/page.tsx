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
import Pagination from "@/components/pagination";
import EditModal from "@/components/EditModal";
import CreateModal from "@/components/CreateModal";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

    const fetchSwitchgearData = async (page = 1) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/switchgear-info?page=${page}&per_page=25`
        );
        const data = response.data.data;
        setSwitchgearData(data);
        setTotalPages(response.data.total_pages);

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
    fetchSwitchgearData(currentPage);
  }, [router, currentPage]);

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
    setCurrentPage(1); // Reset currentPage when search query changes
  };

  const fetchData = async (page) => {
    try {
      const response = await axios.get(
        `/api/switchgear-info?page=${page}&per_page=25`
      );
      setSwitchgearData(response.data.data);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const filteredData = switchgearData.filter((item) => {
    return (
      (item.functional_location &&
        item.functional_location
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (item.defect_from &&
        item.defect_from.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.switchgear_type &&
        item.switchgear_type
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (item.switchgear_brand &&
        item.switchgear_brand
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (item.substation_name &&
        item.substation_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (item.defect_description_1 &&
        item.defect_description_1
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (item.defect_description_2 &&
        item.defect_description_2
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (item.defect_owner &&
        item.defect_owner.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.status &&
        item.status.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const onPageChange = (page) => {
    setCurrentPage(page);
    fetchData(page);
  };

  //CRUD DELETE
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      // Proceed with delete action
      deleteRecord(id);
    }
  };

  const deleteRecord = async (id) => {
    try {
      const randomKey = "random-key-123"; // Replace with your random authorization key
      const response = await fetch(
        `http://localhost:8080/api/switchgear/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${randomKey}`, // Authorization header with random key
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete record");
      }

      // Optionally handle success
      console.log("Record deleted successfully");

      // Return any data if needed
      return response.json(); // or return response.text();
    } catch (error) {
      console.error("Error deleting record:", error);
      // Handle error appropriately
    }
  };
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
            <PieChartComponent data={brandData}  onFilterChange={handleFilterChange} brandStatusText={brandStatusText}  />
          </CardBody>
        </Card>
      </div>
      </div>
  );
};

export default withAuth(DashboardPage);
