"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import withAuth from '@/components/withAuth';
import { useRouter } from 'next/navigation';

const ApprovalLogPage = () => {
    const [approvalLogs, setApprovalLogs] = useState([]);
    const router = useRouter();

    useEffect(() => {
        fetchApprovalLogs();
    }, []);

    const fetchApprovalLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const logsResponse = await axios.get('http://127.0.0.1:8080/api/approval-logs', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setApprovalLogs(logsResponse.data);
        } catch (error) {
            console.error('Error fetching approval logs:', error);
        }
    };

    return (
        <div>
            <h1>Approval Logs</h1>
            <table>
                <thead>
                    <tr>
                        <th>Functional Location</th>
                        <th>Action</th>
                        <th>Message</th>
                        <th>User</th>
                    </tr>
                </thead>
                <tbody>
                    {approvalLogs.map((log, index) => (
                        <tr key={index}>
                            <td>{log.functional_location}</td>
                            <td>{log.action}</td>
                            <td>{log.message}</td>
                            <td>{log.user}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <style jsx>{`
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                }
                th {
                    background-color: #f2f2f2;
                }
            `}</style>
        </div>
    );
};

export default withAuth(ApprovalLogPage);
