"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import withAuth from "@/components/withAuth";
import { useRouter } from "next/navigation";

const ApprovalLogPage = () => {
  const [approvalLogs, setApprovalLogs] = useState([]);
  const [filter, setFilter] = useState("all"); // State to manage filter
  const router = useRouter();

  useEffect(() => {
    fetchApprovalLogs();
  }, [filter]); // Re-fetch logs whenever the filter changes

  const fetchApprovalLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const logsResponse = await axios.get(
        `http://127.0.0.1:8080/api/approval-logs?filter=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApprovalLogs(logsResponse.data);
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

  return (
    <div>
      <h1>Approval Logs</h1>
      <div>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("Approved")}>Approved</button>
        <button onClick={() => setFilter("Rejected")}>Rejected</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Functional Location</th>
            <th>Action</th>
            <th>Message</th>
            <th>Approval Date</th>
            <th>Approver</th>
          </tr>
        </thead>
        <tbody>
          {approvalLogs.map((log, index) => (
            <tr key={index}>
              <td>{log.functional_location}</td>
              <td>{log.action}</td>
              <td>{log.message}</td>
              <td>{formatDateTime(log.timestamp)}</td>
              <td>{log.approver}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          border: 1px solid #ddd;
          padding: 8px;
        }
        th {
          background-color: #f2f2f2;
        }
        button {
          margin: 5px;
          padding: 10px 20px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default withAuth(ApprovalLogPage);
