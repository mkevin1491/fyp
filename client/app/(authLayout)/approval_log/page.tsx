"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import withAuth from "@/components/withAuth";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";
import Pagination from "@/components/pagination"; // Adjust the path according to your project structure

const ApprovalLogPage = () => {
  const [approvalLogs, setApprovalLogs] = useState([]);
  const [filter, setFilter] = useState("all"); // State to manage filter
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortingColumn, setSortingColumn] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc"); // Set default sort order to "desc"
  const router = useRouter();

  useEffect(() => {
    fetchApprovalLogs();
  }, [filter, currentPage]); // Re-fetch logs whenever the filter or page changes

  const fetchApprovalLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const logsResponse = await axios.get(
        `https://sea-lion-app-3l29g.ondigitalocean.app/api/approval-logs?filter=${filter}&page=${currentPage}&per_page=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApprovalLogs(logsResponse.data.approval_logs);
      setTotalPages(logsResponse.data.total_pages);
    } catch (error) {
      console.error("Error fetching approval logs:", error);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' should be '12'
    const strHours = String(hours).padStart(2, "0");
    return `${day}/${month}/${year} ${strHours}:${minutes}:${seconds} ${ampm}`;
  };

  const handleFilterChange = (value) => {
    setFilter(value); // Update filter state when dropdown value changes
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const sortByColumn = (column) => {
    const order =
      sortingColumn === column && sortOrder === "asc" ? "desc" : "asc";
    const sortedLogs = approvalLogs.sort((a, b) => {
      if (a[column] < b[column]) return order === "asc" ? -1 : 1;
      if (a[column] > b[column]) return order === "asc" ? 1 : -1;
      return 0;
    });
    setApprovalLogs([...sortedLogs]);
    setSortingColumn(column);
    setSortOrder(order);
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === approvalLogs.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(approvalLogs.map((log) => log.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Approval Logs
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <div className="flex justify-start items-center mb-4">
            <Typography variant="small" className="mr-2 text-gray-500 pl-5">
              Filter by:
            </Typography>
            <div className="flex items-center max-w-1/4">
              <Select
                value={filter}
                onChange={handleFilterChange}
                className="text-sm w-full"
              >
                <Option value="all">All</Option>
                <Option value="Approved">Approved</Option>
                <Option value="Rejected">Rejected</Option>
              </Select>
            </div>
          </div>
          {approvalLogs.length > 0 ? (
           <table className="table-auto overflow-scroll md:overflow-auto w-[95%] mx-auto text-left font-inter border-separate border-spacing-y-0 border">



              <thead className="bg-[#222E3A]/[6%] rounded-lg text-base text-white font-semibold w-full">
                <tr>
                  <th className="py-3 px-3 text-[#212B36] sm:text-base font-bold whitespace-nowrap group">
                    <div className="flex items-center">
                      <svg
                        className={`w-4 h-4 cursor-pointer ${
                          sortingColumn === "functional_location" &&
                          sortOrder === "asc"
                            ? "rotate-180"
                            : ""
                        }`}
                        onClick={() => sortByColumn("functional_location")}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                      <span
                        className="cursor-pointer pl-1"
                        onClick={() => sortByColumn("functional_location")}
                      >
                        Functional Location
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-3 text-[#212B36] sm:text-base font-bold whitespace-nowrap group">
                    <div className="flex items-center">
                      <svg
                        className={`w-4 h-4 cursor-pointer ${
                          sortingColumn === "action" && sortOrder === "asc"
                            ? "rotate-180"
                            : ""
                        }`}
                        onClick={() => sortByColumn("action")}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                      <span
                        className="cursor-pointer pl-1"
                        onClick={() => sortByColumn("action")}
                      >
                        Action
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-3 text-[#212B36] sm:text-base font-bold whitespace-nowrap group">
                    <div className="flex items-center">
                      <svg
                        className={`w-4 h-4 cursor-pointer ${
                          sortingColumn === "message" && sortOrder === "asc"
                            ? "rotate-180"
                            : ""
                        }`}
                        onClick={() => sortByColumn("message")}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                      <span
                        className="cursor-pointer pl-1"
                        onClick={() => sortByColumn("message")}
                      >
                        Message
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-3 text-[#212B36] sm:text-base font-bold whitespace-nowrap group">
                    <div className="flex items-center">
                      <svg
                        className={`w-4 h-4 cursor-pointer ${
                          sortingColumn === "timestamp" && sortOrder === "asc"
                            ? "rotate-180"
                            : ""
                        }`}
                        onClick={() => sortByColumn("timestamp")}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                      <span
                        className="cursor-pointer pl-1"
                        onClick={() => sortByColumn("timestamp")}
                      >
                        Timestamp
                      </span>
                    </div>
                  </th>
                  <th className="py-3 px-3 text-[#212B36] sm:text-base font-bold whitespace-nowrap group">
                    <div className="flex items-center">
                      <svg
                        className={`w-4 h-4 cursor-pointer ${
                          sortingColumn === "approver" && sortOrder === "asc"
                            ? "rotate-180"
                            : ""
                        }`}
                        onClick={() => sortByColumn("approver")}
                        xmlns="http://www.w3.org/2000/svg"
                        stroke-width="2"
                        // height="24"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                      <span
                        className="cursor-pointer pl-1"
                        onClick={() => sortByColumn("approver")}
                      >
                        Approver
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {approvalLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 px-3">{log.functional_location}</td>
                    <td className="py-3 px-3">{log.action}</td>
                    <td className="py-3 px-3">{log.message}</td>
                    <td className="py-3 px-3">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-3">{log.approver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex justify-center items-center h-full">
              <Typography variant="body2" className="text-gray-500">
                No approval logs found.
              </Typography>
            </div>
          )}
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default withAuth(ApprovalLogPage);
