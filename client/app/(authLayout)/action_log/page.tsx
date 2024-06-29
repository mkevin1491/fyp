"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  CardBody,
  Typography,
} from '@material-tailwind/react';
import withAuth from '@/components/withAuth';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/action-logs');
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(error);
      setLoading(false);
    }
  };

  // Function to render data as a list
  const renderDataList = (data) => {
    return (
      <ul className="list-disc list-inside">
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            <strong>{key.replace(/_/g, ' ')}:</strong> {value ? value.toString() : 'N/A'}
          </li>
        ))}
      </ul>
    );
  };

  // Function to format message column
  const formatMessage = (message) => {
    return message.split('. ').join('. \n');
  };

  return (
    <div className="p-6">
      <Typography variant="h6" color="blue-gray" className="mb-1">
        Action Logs
      </Typography>
      {loading ? (
        <Typography variant="small" color="blue-gray" className="text-center">
          Loading logs...
        </Typography>
      ) : error ? (
        <Typography variant="small" color="red" className="text-center">
          Error loading logs: {error.message}
        </Typography>
      ) : (
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto mt-4">
              <thead>
                <tr>
                  {['ID', 'Action', 'Message', 'Data', 'Timestamp', 'User'].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-center">
                      <Typography
                        variant="small"
                        className="text-[11px] font-medium uppercase text-blue-gray-400"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-blue-gray-50">
                    <td className="py-3 px-5 text-center">{log.id}</td>
                    <td className="py-3 px-5 text-center">{log.action}</td>
                    <td className="py-3 px-5">
                      <Typography variant="body" className="whitespace-pre-wrap">
                        {formatMessage(log.message)}
                      </Typography>
                    </td>
                    <td className="py-3 px-5">
                      {renderDataList(log.data)}
                    </td>
                    <td className="py-3 px-5 text-center">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-5 text-center">{log.user.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default withAuth(LogsPage);
