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
  const [nonDuplicatedLocations, setNonDuplicatedLocations] = useState<string[]>([]);
  const [undetectedCoordinates, setUndetectedCoordinates] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("non-duplicated");
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
          "https://sea-lion-app-3l29g.ondigitalocean.app/auth/protected",
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
          "https://sea-lion-app-3l29g.ondigitalocean.app/api/switchgear-info"
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
    const coordinateMap: { [key: string]: Set<string> } = {};
    const duplicates: Set<string> = new Set();
    const nonDuplicates: Set<string> = new Set();
    const undetected: Set<string> = new Set();

    assets.forEach((asset) => {
      const [lat, lng] = asset.coordinates;
      const key = `${lat},${lng}`;

      if (lat === null || lng === null) {
        undetected.add(asset.functional_location);
      } else {
        if (!coordinateMap[key]) {
          coordinateMap[key] = new Set();
        }

        coordinateMap[key].add(asset.functional_location);
      }
    });

    Object.values(coordinateMap).forEach((locations) => {
      if (locations.size > 1) {
        locations.forEach((location) => duplicates.add(location));
      } else {
        locations.forEach((location) => nonDuplicates.add(location));
      }
    });

    setDuplicateCoordinates(Array.from(duplicates));
    setNonDuplicatedLocations(Array.from(nonDuplicates));
    setUndetectedCoordinates(Array.from(undetected));
  }, [assets]);

  useEffect(() => {
    const filterAssets = () => {
      const query = searchQuery.toLowerCase();
      const filtered = assets.filter(
        (asset) =>
          ((asset.functional_location && asset.functional_location.toLowerCase().includes(query)) ||
          (asset.substation_name && asset.substation_name.toLowerCase().includes(query))) &&
          (criticality === "All" || (asset.status && asset.status.toLowerCase() === criticality.toLowerCase())) &&
          !duplicateCoordinates.includes(asset.functional_location)
      );

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const nonDuplicatedCount = nonDuplicatedLocations.length;
  const duplicatedCount = duplicateCoordinates.length;
  const undetectedCount = undetectedCoordinates.length;

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
            <AssetMap assets={filteredAssets} duplicateCoordinates={duplicateCoordinates} />
          </div>
        </CardBody>
        <CardBody>
          <div className="tabs">
            <div className="block">
              <ul className="flex border-b border-gray-200 space-x-3 transition-all duration-300 -mb-px">
                <li>
                  <a
                    href="javascript:void(0)"
                    className={`inline-block py-4 px-6 text-gray-500 hover:text-gray-800 font-medium border-b-2 border-transparent ${
                      activeTab === "non-duplicated" ? "border-b-indigo-600 text-indigo-600" : ""
                    } tablink whitespace-nowrap`}
                    onClick={() => handleTabChange("non-duplicated")}
                  >
                    Non Duplicated Coordinates ({nonDuplicatedCount})
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0)"
                    className={`inline-block py-4 px-6 text-gray-500 hover:text-gray-800 font-medium border-b-2 border-transparent ${
                      activeTab === "duplicated" ? "border-b-indigo-600 text-indigo-600" : ""
                    } tablink whitespace-nowrap`}
                    onClick={() => handleTabChange("duplicated")}
                  >
                    Duplicated Coordinates ({duplicatedCount})
                  </a>
                </li>
                <li>
                  <a
                    href="javascript:void(0)"
                    className={`inline-block py-4 px-6 text-gray-500 hover:text-gray-800 font-medium border-b-2 border-transparent ${
                      activeTab === "undetected" ? "border-b-indigo-600 text-indigo-600" : ""
                    } tablink whitespace-nowrap`}
                    onClick={() => handleTabChange("undetected")}
                  >
                    Undetected Coordinates ({undetectedCount})
                  </a>
                </li>
              </ul>
            </div>
            <div className="mt-3">
              {activeTab === "non-duplicated" && (
                <div id="non-duplicated" role="tabpanel" aria-labelledby="non-duplicated-tab" className="tabcontent">
                  <div className="p-2 bg-white rounded-md shadow-md">
                    <Typography variant="h6">Non Duplicated Coordinates:</Typography>
                    <ul>
                      {nonDuplicatedLocations.map((location, index) => (
                        <li key={index}>{location}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {activeTab === "duplicated" && (
                <div id="duplicated" role="tabpanel" aria-labelledby="duplicated-tab" className="tabcontent">
                  {duplicateCoordinates.length > 0 ? (
                    <div className="p-2 bg-white rounded-md shadow-md">
                      <Typography variant="h6">Duplicated Coordinates Found:</Typography>
                      <ul>
                        {duplicateCoordinates.map((location, index) => (
                          <li key={index}>{location}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No duplicated coordinates found.</p>
                  )}
                </div>
              )}
              {activeTab === "undetected" && (
                <div id="undetected" role="tabpanel" aria-labelledby="undetected-tab" className="tabcontent">
                  {undetectedCoordinates.length > 0 ? (
                    <div className="p-2 bg-white rounded-md shadow-md">
                      <Typography variant="h6">Undetected Coordinates Found:</Typography>
                      <ul>
                        {undetectedCoordinates.map((location, index) => (
                          <li key={index}>{location}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No undetected coordinates found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default withAuth(MapPage);
