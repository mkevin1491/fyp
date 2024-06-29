"use client";
import React, { useState } from "react";
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
import { Select, Option, Button, Typography } from "@material-tailwind/react";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const states = [
  "Perak", "Selangor", "Pahang", "Kelantan", "Putrajaya", "Johor", "Kedah", "Malacca", 
  "Negeri Sembilan", "Penang", "Sarawak", "Perlis", "Sabah", "Terengganu", "Kuala Lumpur",
];

const stateColors = [
  "#4CAF50", "#2196F3", "#FF5722", "#673AB7", "#795548", "#E91E63", "#009688", 
  "#FF9800", "#CDDC39", "#9C27B0", "#FFC107", "#607D8B", "#FFEB3B", "#00BCD4", "#F44336",
];

interface DefectData {
  month: string;
  total_defects: number; // Add total_defects for the line chart
  [key: string]: number | string;
}

interface MixedBarComposedChartProps {
  data: DefectData[];
  defectDescription: string;
  setDefectDescription: (value: string) => void;
  year: number | undefined;
  setYear: (value: number | undefined) => void;
  availableYears: number[];
  selectedStates: string[];
  handleStateChange: (state: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  handleFilterButtonClick: () => void;
}

const MixedBarComposedChart: React.FC<MixedBarComposedChartProps> = ({
  data,
  defectDescription,
  setDefectDescription,
  year,
  setYear,
  availableYears,
  selectedStates,
  handleStateChange,
  searchTerm,
  setSearchTerm,
  handleFilterButtonClick,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const filteredStates = states.filter((state) => state.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
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
                          value={searchTerm} 
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onFocus={toggleDropdown}
                        />
                      </div>
                    ) : (
                      selectedStates.map((state) => (
                        <div key={state} className="flex justify-center items-center m-1 font-medium py-1 px-2 bg-white rounded-full text-teal-700 bg-teal-100 border border-teal-300">
                          <div className="text-xs font-normal leading-none max-w-full flex-initial">{state}</div>
                          <div className="flex flex-auto flex-row-reverse">
                            <div>
                              <svg onClick={() => handleStateChange(state)} xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x cursor-pointer hover:text-teal-400 rounded-full w-4 h-4 ml-2">
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
                    <button className="cursor-pointer w-6 h-6 text-gray-600 outline-none focus:outline-none" onClick={toggleDropdown}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-up w-4 h-4">
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
                      <div key={state} className="cursor-pointer w-full border-gray-100 border-b hover:bg-teal-100" onClick={() => handleStateChange(state)}>
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
        <div className="flex items-center">
          <Button onClick={handleFilterButtonClick} color="blue">
            Filter
          </Button>
        </div>
      </div>
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
  );
};

export default MixedBarComposedChart;
