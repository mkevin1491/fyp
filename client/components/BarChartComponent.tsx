import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Select, Option, Typography } from "@material-tailwind/react";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const statesList = [
  'Perak', 'Selangor', 'Pahang', 'Kelantan', 'Putrajaya', 'Johor', 'Kedah', 'Malacca',
  'Negeri Sembilan', 'Penang', 'Sarawak', 'Perlis', 'Sabah', 'Terengganu', 'Kuala Lumpur'
];

const BarChartComponent = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [chartData, setChartData] = useState([]);
  const [stateSearchTerm, setStateSearchTerm] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get("https://sea-lion-app-3l29g.ondigitalocean.app/api/switchgear-data", {
        params: {
          year: year,
          'states[]': selectedStates
        }
      });

      const formattedData = monthNames.map((month) => {
        const monthData = response.data.data.find(item => item.month === month) || {};
        return {
          month,
          functional_locations: monthData.functional_locations || 0
        };
      });

      setChartData(formattedData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, selectedStates]);

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

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const filteredStates = statesList.filter((state) => 
    state.toLowerCase().includes(stateSearchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center mb-4 pl-6">
        <div className="flex items-center mr-4 w-1/2">
          <Typography variant="small" className="mr-2 text-gray-500">
            Year:
          </Typography>
          <Select value={year} onChange={(e) => setYear(Number(e))}>
            {availableYears.map((year) => (
              <Option key={year} value={year}>{year}</Option>
            ))}
          </Select>
        </div>
        <div className="flex items-center">
          <Typography variant="small" className="mr-2 text-gray-500">
            States:
          </Typography>
          <div className="relative w-64">
            <div className="flex flex-col items-center relative">
              <div className="w-full">
                <div className="my-2 p-1 flex border border-gray-200 bg-white rounded">
                  <div className="flex flex-auto flex-wrap">
                    {selectedStates.length === 0 ? (
                      <div className="flex-1">
                        <input
                          placeholder="Search state"
                          className="bg-transparent p-1 px-2 appearance-none outline-none h-full w-full text-gray-800"
                          value={stateSearchTerm}
                          onChange={(e) => setStateSearchTerm(e.target.value)}
                          onFocus={toggleDropdown}
                        />
                      </div>
                    ) : (
                      selectedStates.map((state) => (
                        <div
                          key={state}
                          className="flex justify-center items-center m-1 font-medium py-1 px-2 bg-white rounded-full text-teal-700 bg-teal-100 border border-teal-300"
                        >
                          <div className="text-xs font-normal leading-none max-w-full flex-initial">
                            {state}
                          </div>
                          <div className="flex flex-auto flex-row-reverse">
                            <div>
                              <svg
                                onClick={() => handleStateChange(state)}
                                xmlns="http://www.w3.org/2000/svg"
                                width="100%"
                                height="100%"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="feather feather-x cursor-pointer hover:text-teal-400 rounded-full w-4 h-4 ml-2"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="text-gray-300 w-8 py-1 pl-2 pr-1 border-l flex items-center border-gray-200">
                    <button
                      className="cursor-pointer w-6 h-6 text-gray-600 outline-none focus:outline-none"
                      onClick={toggleDropdown}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="100%"
                        height="100%"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="feather feather-chevron-up w-4 h-4"
                      >
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {dropdownOpen && (
                <div className="absolute top-full mt-1 shadow bg-white z-40 w-full left-0 rounded max-h-select overflow-y-auto">
                  <div className="flex flex-col w-full">
                    {filteredStates.map((state) => (
                      <div
                        key={state}
                        className="cursor-pointer w-full border-gray-100 border-b hover:bg-teal-100"
                        onClick={() => handleStateChange(state)}
                      >
                        <div className="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative hover:border-teal-100">
                          <div className="w-full items-center flex">
                            <input
                              type="checkbox"
                              checked={selectedStates.includes(state)}
                              onChange={() => handleStateChange(state)}
                              className="form-checkbox h-4 w-4 text-teal-600 transition duration-150 ease-in-out"
                            />
                            <div className="mx-2 leading-6">{state}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          width={500}
          height={300}
          data={chartData}
          margin={{
            top: 30, // Increased margin top to provide more space
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="functional_locations" fill="#8884d8">
            <LabelList dataKey="functional_locations" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
