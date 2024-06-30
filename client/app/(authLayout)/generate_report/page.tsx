"use client";
import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import { Button, Typography, Card } from "@material-tailwind/react";
import BarChartComponent from "@/components/BarChartComponent";
import PieChartComponent from "@/components/PieChartComponent";
import MixedBarComposedChart from "@/components/MixedBarComposedChart";
import ReportTable from "@/components/ReportTable";
import withAuth from "@/components/withAuth";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const states = [
  "Perak", "Selangor", "Pahang", "Kelantan", "Putrajaya", "Johor", "Kedah",
  "Malacca", "Negeri Sembilan", "Penang", "Sarawak", "Perlis", "Sabah", 
  "Terengganu", "Kuala Lumpur"
];

interface DefectData {
  month: string;
  total_defects: number;
  [key: string]: number | string;
}

const GenerateReport = () => {
  const [data, setData] = useState<DefectData[]>([]);
  const [defectDescriptions, setDefectDescriptions] = useState<string[]>([]);
  const [year, setYear] = useState<number | undefined>(new Date().getFullYear());
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [brandStatusText, setBrandStatusText] = useState("Critical");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
      const formattedTime = now.toLocaleTimeString();
      setCurrentTime(`${formattedDate} ${formattedTime}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://sea-lion-app-3l29g.ondigitalocean.app/api/defect-analytics",
        {
          params: {
            "defect_descriptions[]": defectDescriptions,
            year,
            "states[]": selectedStates,
          },
        }
      );

      const formattedData = monthNames.map((month) => {
        const monthData = response.data.data.filter((item) => item.month === month);
        const monthResult: DefectData = { month, total_defects: 0 };

        states.forEach((state) => {
          const stateData = monthData.find((item) => item.state === state);
          monthResult[state] = stateData ? stateData.unique_functional_locations : 0;
          monthResult.total_defects += stateData ? stateData.unique_functional_locations : 0;
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

  const availableYears = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

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

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Report",
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (filterType: string) => {
    setBrandStatusText(` ${filterType}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Typography variant="h5" color="gray">
          Generate Report
        </Typography>
        <Button onClick={handlePrint} color="blue" className="mt-4">
          Print Report
        </Button>
      </div>
      <div ref={componentRef} className="space-y-6">
        <Typography variant="h4" color="gray" className="mb-4">
          Switchgear Report
        </Typography>
        <Typography variant="subtitle1" color="gray">
          {currentTime}
        </Typography>
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-4">
            <Typography variant="h6" color="gray">
              Defect Switchgear Reported
            </Typography>
            <BarChartComponent />
          </Card>
          <Card className="p-4">
            <Typography variant="h6" color="gray">
              Switchgear Brand Status: {brandStatusText}
            </Typography>
            <PieChartComponent
              onFilterChange={handleFilterChange}
              brandStatusText={brandStatusText}
            />
          </Card>
        </div>
        <Card className="p-4">
          <Typography variant="h6" color="gray">
            Defect Trend
          </Typography>
          <MixedBarComposedChart
            data={data}
            defectDescriptions={defectDescriptions}
            setDefectDescriptions={setDefectDescriptions}
            year={year}
            setYear={setYear}
            availableYears={availableYears}
            selectedStates={selectedStates}
            handleStateChange={handleStateChange}
            handleFilterButtonClick={handleFilterButtonClick}
          />
        </Card>
        <Card className="p-4">
          <ReportTable
            searchQuery={searchQuery}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </Card>
      </div>
    </div>
  );
};

export default withAuth(GenerateReport);
