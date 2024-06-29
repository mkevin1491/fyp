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
  const [states, setStates] = useState<string[]>([]);
  const [chartData, setChartData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/switchgear-data", {
        params: {
          year: year,
          'states[]': states
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
  }, [year, states]);

  const availableYears = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i);

  const handleStateChange = (state: string) => {
    setStates((prevSelectedStates) => {
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
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-wrap items-center mb-4">
        <div className="flex items-center mr-4 pl-6">
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
                          checked={states.includes(state)}
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
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          width={500}
          height={300}
          data={chartData}
          margin={{
            top: 5,
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
