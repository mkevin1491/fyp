"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import withAuth from "@/components/withAuth";
import AssetMap from "@/components/map/AssetMap";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
} from "@material-tailwind/react";

const MapPage = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
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
        const response = await axios.get(
          "http://localhost:8080/api/switchgear-info"
        );
        setAssets(response.data.data);
        setFilteredAssets(response.data.data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    fetchUser();
    fetchAssets();
  }, [router]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(query) ||
        asset.id.toLowerCase().includes(query)
    );
    setFilteredAssets(filtered);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-4 p-6">
          <Typography variant="h6" color="white">
            Geographical Map
          </Typography>
        </CardHeader>
        <CardBody>
          <div className="relative mt-4">
            {/* <Input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by functional location or substation name"
              className="absolute top-0 left-0 w-full z-10"
            /> */}
          </div>
          <div className="mt-6">
            <AssetMap assets={filteredAssets} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default withAuth(MapPage);
