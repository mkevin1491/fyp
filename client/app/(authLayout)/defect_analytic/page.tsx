"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import MixedBarComposedChart from "@/components/MixedBarComposedChart";
import withAuth from "@/components/withAuth";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const states = [
  "Perak",
  "Selangor",
  "Pahang",
  "Kelantan",
  "Putrajaya",
  "Johor",
  "Kedah",
  "Malacca",
  "Negeri Sembilan",
  "Penang",
  "Sarawak",
  "Perlis",
  "Sabah",
  "Terengganu",
  "Kuala Lumpur",
];

interface DefectData {
  month: string;
  total_defects: number; // Add total_defects for the line chart
  [key: string]: number | string;
}

const DefectAnalytics: React.FC = () => {
  const [data, setData] = useState<DefectData[]>([]);
  const [defectDescriptions, setDefectDescriptions] = useState<string[]>([]);
  const [year, setYear] = useState<number | undefined>(
    new Date().getFullYear()
  );
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/defect-analytics",
        {
          params: {
            "defect_descriptions[]": defectDescriptions,
            year,
            "states[]": selectedStates,
          },
        }
      );

      const formattedData = monthNames.map((month) => {
        const monthData = response.data.data.filter(
          (item) => item.month === month
        );
        const monthResult: DefectData = { month, total_defects: 0 };

        states.forEach((state) => {
          const stateData = monthData.find((item) => item.state === state);
          monthResult[state] = stateData
            ? stateData.unique_functional_locations
            : 0;
          monthResult.total_defects += stateData
            ? stateData.unique_functional_locations
            : 0;
        });

        return monthResult;
      });

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableYears = Array.from(
    { length: 4 },
    (_, i) => new Date().getFullYear() - i
  );

  const handleStateChange = (state: string) => {
    setSelectedStates((prevSelectedStates) => {
      if (prevSelectedStates.includes(state)) {
        return prevSelectedStates.filter((s) => s !== state);
      } else {
        return [...prevSelectedStates, state];
      }
    });
  };

  const handleFilterButtonClick = () => {
    fetchData();
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Defect Analytics
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <div className="flex justify-center items-center h-full">
            <div className="w-full h-full">
              <MixedBarComposedChart
                data={data}
                defectDescriptions={defectDescriptions}
                setDefectDescriptions={setDefectDescriptions}
                year={year}
                setYear={setYear}
                availableYears={availableYears}
                selectedStates={selectedStates}
                handleStateChange={handleStateChange}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                handleFilterButtonClick={handleFilterButtonClick}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default withAuth(DefectAnalytics);
