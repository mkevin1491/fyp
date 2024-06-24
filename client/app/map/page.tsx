"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import withAuth from "@/components/withAuth";
import AssetMap from "@/components/map/AssetMap";
import { Card, CardHeader, CardBody, Typography, Input } from "@material-tailwind/react";

const MapPage = () => {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [criticality, setCriticality] = useState("All");
  const [filteredAssets, setFilteredAssets] = useState<any[]>([]);
  const [duplicateCoordinates, setDuplicateCoordinates] = useState<string[]>([]);
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
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    fetchUser();
    fetchAssets();
  }, [router]);

  useEffect(() => {
    const uniqueCoordinates: { [key: string]: string } = {};
    const duplicates: string[] = [];

    assets.forEach((asset) => {
      const [lat, lng] = asset.coordinates;
      const key = `${lat},${lng}`;

      if (uniqueCoordinates[key]) {
        duplicates.push(uniqueCoordinates[key]);
        duplicates.push(asset.functional_location);
      } else {
        uniqueCoordinates[key] = asset.functional_location;
      }
    });

    setDuplicateCoordinates(duplicates);
  }, [assets]);

  useEffect(() => {
    const filterAssets = () => {
      const query = searchQuery.toLowerCase();
      const filtered = assets.filter(
        (asset) =>
          (asset.functional_location.toLowerCase().includes(query) ||
            asset.substation_name.toLowerCase().includes(query)) &&
          (criticality === "All" || asset.status.toLowerCase() === criticality.toLowerCase()) &&
          !duplicateCoordinates.includes(asset.functional_location)
      );

      console.log('Filtered Assets:', filtered); // Debugging
      setFilteredAssets(filtered);
    };

    filterAssets();
  }, [searchQuery, criticality, assets, duplicateCoordinates]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCriticalityChange = (event) => {
    setCriticality(event.target.value);
  };

  if (!user) {
    return null;
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
            <label>Criticality:</label>
            <select value={criticality} onChange={handleCriticalityChange}>
              <option value="All">All</option>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>
          <div className="relative mt-4">
            <input
              type="text"
              placeholder="Find the functional location"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mt-6">
            <AssetMap assets={filteredAssets} />
          </div>
        </CardBody>
        <CardBody>
          {duplicateCoordinates.length > 0 && (
            <div className="p-2 bg-white rounded-md shadow-md">
              <Typography variant="h6">Duplicate Coordinates Found:</Typography>
              <ul>
                {duplicateCoordinates.map((location, index) => (
                  <li key={index}>{location}</li>
                ))}
              </ul>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default withAuth(MapPage);
