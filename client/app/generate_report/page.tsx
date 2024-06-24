"use client";
import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import { Button, Typography, Card } from "@material-tailwind/react";
import BarChartComponent from "@/components/BarChartComponent";
import PieChartComponent from "@/components/PieChartComponent";
import MixedBarComposedChart from "@/components/MixedBarComposedChart";
import ReportTable from "@/components/ReportTable";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
const states = [
  'Perak', 'Selangor', 'Pahang', 'Kelantan', 'Putrajaya', 'Johor', 'Kedah', 'Malacca',
  'Negeri Sembilan', 'Penang', 'Sarawak', 'Perlis', 'Sabah', 'Terengganu', 'Kuala Lumpur'
];

interface DefectData {
  month: string;
  total_defects: number;  // Add total_defects for the line chart
  [key: string]: number | string;
}

const GenerateReport = () => {
  const [data, setData] = useState<DefectData[]>([]);
  const [defectDescription, setDefectDescription] = useState<string>("CORONA DISCHARGE");
  const [year, setYear] = useState<number | undefined>(new Date().getFullYear());
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [brandStatusText, setBrandStatusText] = useState("Critical");

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/defect-analytics", {
        params: {
          defect_description_1: defectDescription,
          year,
          'states[]': selectedStates
        }
      });

      const formattedData = monthNames.map((month) => {
        const monthData = response.data.data.filter(item => item.month === month);
        const monthResult: DefectData = { month, total_defects: 0 };

        states.forEach((state) => {
          const stateData = monthData.find(item => item.state === state);
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

  const availableYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const handleStateChange = (state: string) => {
    setSelectedStates((prevSelectedStates) => {
      if (prevSelectedStates.includes(state)) {
        return prevSelectedStates.filter((s) => s !== state);
      } else {
        return [...prevSelectedStates, state];
      }
    });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const filteredStates = states.filter((state) => 
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-4">
            <Typography variant="h6" color="gray">
              Registered Switchgear
            </Typography>
            <BarChartComponent />
          </Card>
          <Card className="p-4">
            <Typography variant="h6" color="gray">
            Switchgear Brand Status: {brandStatusText}
            </Typography>
            <PieChartComponent  onFilterChange={handleFilterChange} brandStatusText={brandStatusText}/>
          </Card>
        </div>
        <Card className="p-4">
          <Typography variant="h6" color="gray">
            Defect Trend
          </Typography>
          <MixedBarComposedChart 
            data={data}
            defectDescription={defectDescription}
            setDefectDescription={setDefectDescription}
            year={year}
            setYear={setYear}
            availableYears={availableYears}
            selectedStates={selectedStates}
            handleStateChange={handleStateChange}
            dropdownOpen={dropdownOpen}
            toggleDropdown={toggleDropdown}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredStates={filteredStates}
            handleFilterButtonClick={fetchData}
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

export default GenerateReport;
