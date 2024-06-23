"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Select,
  Option,
  Button,
  Checkbox,
} from "@material-tailwind/react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const states = [
  'Perak', 'Selangor', 'Pahang', 'Kelantan', 'Putrajaya', 'Johor', 'Kedah', 'Malacca',
  'Negeri Sembilan', 'Penang', 'Sarawak', 'Perlis', 'Sabah', 'Terengganu', 'Kuala Lumpur'
];
const stateColors = [
  '#4CAF50', '#2196F3', '#FF5722', '#673AB7', '#795548', 
  '#E91E63', '#009688', '#FF9800', '#CDDC39', '#9C27B0', 
  '#FFC107', '#607D8B', '#FFEB3B', '#00BCD4', '#F44336'
];

interface DefectData {
  month: string;
  total_defects: number;  // Add total_defects for the line chart
  [key: string]: number | string;
}

const MixedBarComposedChart: React.FC = () => {
  const [data, setData] = useState<DefectData[]>([]);
  const [defectDescription, setDefectDescription] = useState<string>("CORONA DISCHARGE");
  const [year, setYear] = useState<number | undefined>(new Date().getFullYear());
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  const handleFilterButtonClick = () => {
    fetchData();
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

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Defect Analytics
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <div className="flex flex-wrap items-center mb-4">
            <div className="flex items-center mr-4 pl-5">
              <Typography variant="small" className="mr-2 text-gray-500">
                Defect Description:
              </Typography>
              <Select value={defectDescription} onChange={(e) => setDefectDescription(e)}>
                <Option value="ARCHING SOUND">ARCHING SOUND</Option>
                <Option value="CORONA DISCHARGE">CORONA DISCHARGE</Option>
                <Option value="HOTSPOT">HOTSPOT</Option>
                <Option value="MECHANICAL VIBRATION">MECHANICAL VIBRATION</Option>
                <Option value="TEV">TEV</Option>
                <Option value="TRACKING SOUND">TRACKING SOUND</Option>
              </Select>
            </div>
            <div className="flex items-center mr-4">
              <Typography variant="small" className="mr-2 text-gray-500">
                Year:
              </Typography>
              <Select value={year} onChange={(e) => setYear(e)}>
                {availableYears.map((year) => (
                  <Option key={year} value={year}>{year}</Option>
                ))}
              </Select>
            </div>
            <div className="flex items-center mr-4">
              <Typography variant="small" className="mr-2 text-gray-500">
                States:
              </Typography>
              <div className="relative">
                <button 
                  id="dropdownSearchButton" 
                  onClick={toggleDropdown} 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" 
                  type="button"
                >
                  Dropdown search 
                  <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4"/>
                  </svg>
                </button>
                {dropdownOpen && (
                  <div id="dropdownSearch" className="z-10 absolute bg-white rounded-lg shadow w-60 dark:bg-gray-700 mt-2">
                    <div className="p-3">
                      <label htmlFor="input-group-search" className="sr-only">Search</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                          </svg>
                        </div>
                        <input 
                          type="text" 
                          id="input-group-search" 
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                          placeholder="Search state"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <ul className="h-48 px-3 pb-3 overflow-y-auto text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownSearchButton">
                      {filteredStates.map((state) => (
                        <li key={state}>
                          <div className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                            <input 
                              id={`checkbox-item-${state}`} 
                              type="checkbox" 
                              value={state} 
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" 
                              checked={selectedStates.includes(state)}
                              onChange={() => handleStateChange(state)}
                            />
                            <label htmlFor={`checkbox-item-${state}`} className="w-full ml-2 text-sm font-medium text-gray-900 rounded dark:text-gray-300">{state}</label>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <Button onClick={handleFilterButtonClick} color="blue">
                Filter
              </Button>
            </div>
          </div>
          <div className="flex justify-center items-center h-full">
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={data}>
                  <CartesianGrid stroke="#f5f5f5" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {states.map((state, index) => (
                    <Bar key={state} dataKey={state} fill={stateColors[index]} stackId="a">
                      <LabelList dataKey={state} position="top" />
                    </Bar>
                  ))}
                  <Line type="monotone" dataKey="total_defects" stroke="#ff7300" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default MixedBarComposedChart;
