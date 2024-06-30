import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Teal
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#7B68EE", // MediumPurple
  "#FF4500", // OrangeRed
  "#32CD32", // LimeGreen
  "#BA55D3", // MediumOrchid
  "#4169E1", // RoyalBlue
];

const PieChartComponent: React.FC<{ data: any[], brandStatusText: string, onFilterChange: (filterType: string) => void }> = ({ onFilterChange }) => {

  const [criticality, setCriticality] = useState("Critical");
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://sea-lion-app-3l29g.ondigitalocean.app/api/pie-chart?criticality=${criticality}`
        );
        const brandData = response.data.data.map((item: any) => ({
          name: item.switchgear_brand,
          value: item.functional_locations,
        }));
        setData(brandData);
      } catch (error) {
        console.error("Error fetching pie chart data:", error);
      }
    };

    fetchData();
  }, [criticality]);

  useEffect(() => {
    onFilterChange(criticality); // Run onFilterChange after setting the data
  }, [criticality, onFilterChange]);

  return (
    <div>
      <div>
        <label>Criticality:</label>
        <select
          value={criticality}
          onChange={(e) => setCriticality(e.target.value)}
        >
          <option value="Critical">Critical</option>
          <option value="Major">Major</option>
          <option value="Minor">Minor</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={(entry) => `${entry.name} (${(entry.percent * 100).toFixed(2)}%)`} // Display name and percentage
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent;
