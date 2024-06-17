"use client";

import { useEffect, useState } from "react";
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
        `http://127.0.0.1:8080/api/approval-logs?filter=${filter}&page=${currentPage}&per_page=10`,
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
            {" "}
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
            <table className="w-full min-w-[640px] table-auto mt-4">
              <thead>
                <tr>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    Functional Location
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    Action
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    Message
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    Approval Date
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    Approver
                  </th>
                </tr>
              </thead>
              <tbody>
                {approvalLogs.map((log, index) => (
                  <tr key={index} className="border-b border-blue-gray-50">
                    <td className="py-3 px-5">{log.functional_location}</td>
                    <td className="py-3 px-5">{log.action}</td>
                    <td className="py-3 px-5">{log.message}</td>
                    <td className="py-3 px-5">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-5">{log.approver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Typography className="py-4 px-5 text-gray-500">
              No logs found.
            </Typography>
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
