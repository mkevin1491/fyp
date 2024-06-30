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

const stateColors = [
  "#4CAF50",
  "#2196F3",
  "#FF5722",
  "#673AB7",
  "#795548",
  "#E91E63",
  "#009688",
  "#FF9800",
  "#CDDC39",
  "#9C27B0",
  "#FFC107",
  "#607D8B",
  "#FFEB3B",
  "#00BCD4",
  "#F44336",
];

const defectOptions = [
  "ARCHING SOUND",
  "CORONA DISCHARGE",
  "HOTSPOT",
  "MECHANICAL VIBRATION",
  "TEV",
  "TRACKING SOUND",
];

interface DefectData {
  month: string;
  total_defects: number;
  [key: string]: number | string;
}

interface MixedBarComposedChartProps {
  data: DefectData[];
  defectDescriptions: string[];
  setDefectDescriptions: (value: string[]) => void;
  year: number | undefined;
  setYear: (value: number | undefined) => void;
  availableYears: number[];
  selectedStates: string[];
  handleStateChange: (state: string) => void;
  handleFilterButtonClick: () => void;
}

const MixedBarComposedChart: React.FC<MixedBarComposedChartProps> = ({
  data,
  defectDescriptions,
  setDefectDescriptions,
  year,
  setYear,
  availableYears,
  selectedStates,
  handleStateChange,
  handleFilterButtonClick,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [defectDropdownOpen, setDefectDropdownOpen] = useState(false);
  const [defectSearchTerm, setDefectSearchTerm] = useState<string>("");
  const [stateSearchTerm, setStateSearchTerm] = useState<string>("");

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleDefectDropdown = () => setDefectDropdownOpen(!defectDropdownOpen);

  const filteredStates = states.filter((state) =>
    state.toLowerCase().includes(stateSearchTerm.toLowerCase())
  );
  const filteredDefects = defectOptions.filter(
    (description) =>
      description.toLowerCase().includes(defectSearchTerm.toLowerCase()) &&
      !defectDescriptions.includes(description)
  );

  const handleDefectChange = (defect: string) => {
    setDefectDescriptions((prev) =>
      prev.includes(defect)
        ? prev.filter((d) => d !== defect)
        : [...prev, defect]
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center mb-4">
        <div className="flex items-center mr-4 pl-5">
          <Typography variant="small" className="mr-2 text-gray-500">
            Defect Descriptions:
          </Typography>
          <div className="relative w-64">
            <div className="flex flex-col items-center relative">
              <div className="w-full">
                <div className="my-2 p-1 flex border border-gray-200 bg-white rounded">
                  <div className="flex flex-auto flex-wrap">
                    {defectDescriptions.length === 0 ? (
                      <div className="flex-1">
                        <input
                          placeholder="Search defect"
                          className="bg-transparent p-1 px-2 appearance-none outline-none h-full w-full text-gray-800"
                          value={defectSearchTerm}
                          onChange={(e) => setDefectSearchTerm(e.target.value)}
                          onFocus={toggleDefectDropdown}
                        />
                      </div>
                    ) : (
                      defectDescriptions.map((defect) => (
                        <div
                          key={defect}
                          className="flex justify-center items-center m-1 font-medium py-1 px-2 bg-white rounded-full text-teal-700 bg-teal-100 border border-teal-300"
                        >
                          <div className="text-xs font-normal leading-none max-w-full flex-initial">
                            {defect}
                          </div>
                          <div className="flex flex-auto flex-row-reverse">
                            <div>
                              <svg
                                onClick={() => handleDefectChange(defect)}
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
                      onClick={toggleDefectDropdown}
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
              {defectDropdownOpen && (
                <div className="absolute top-full mt-1 shadow bg-white z-40 w-full left-0 rounded max-h-select overflow-y-auto">
                  <div className="flex flex-col w-full">
                    {filteredDefects.map((defect) => (
                      <div
                        key={defect}
                        className="cursor-pointer w-full border-gray-100 border-b hover:bg-teal-100"
                        onClick={() => handleDefectChange(defect)}
                      >
                        <div className="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative hover:border-teal-100">
                          <div className="w-full items-center flex">
                            <input
                              type="checkbox"
                              checked={defectDescriptions.includes(defect)}
                              onChange={() => handleDefectChange(defect)}
                              className="form-checkbox h-4 w-4 text-teal-600 transition duration-150 ease-in-out"
                            />
                            <div className="mx-2 leading-6">{defect}</div>
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
        <div className="flex items-center mr-4">
          <Typography variant="small" className="mr-2 text-gray-500">
            Year:
          </Typography>
          <Select value={year} onChange={(e) => setYear(Number(e))}>
            {availableYears.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
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
        <div className="flex items-center">
          <Button onClick={handleFilterButtonClick} color="blue">
            Filter
          </Button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <ComposedChart data={data} 
                  margin={{
                    top: 30, // Increased margin top to provide more space
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }} >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          {states.map((state, index) => (
            <Bar
              key={state}
              dataKey={state}
              fill={stateColors[index]}
              stackId="a"
            >
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
