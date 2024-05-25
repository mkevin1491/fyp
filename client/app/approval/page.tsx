"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import withAuth from '@/components/withAuth';
import { useRouter } from 'next/navigation';

const PendingApprovals = () => {
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentAction, setCurrentAction] = useState('');
    const [currentId, setCurrentId] = useState(null);
    const [reason, setReason] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchPendingApprovals();
    }, []);

    const fetchPendingApprovals = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }
            const response = await axios.get('http://127.0.0.1:8080/api/pending-approvals', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPendingApprovals(response.data.pending_approvals);
        } catch (error) {
            console.error('Error fetching pending approvals:', error);
        }
    };

    const handleApprove = async (id: number, reason: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }
            await axios.post(`http://127.0.0.1:8080/api/approve/${id}`, { message: reason }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchPendingApprovals();
            closeModal();
        } catch (error) {
            console.error('Error approving record:', error);
        }
    };

    const handleReject = async (id: number, reason: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }
            await axios.post(`http://127.0.0.1:8080/api/reject/${id}`, { message: reason }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            fetchPendingApprovals();
            closeModal();
        } catch (error) {
            console.error('Error rejecting record:', error);
        }
    };

    const openModal = (action: string, id: number) => {
        setCurrentAction(action);
        setCurrentId(id);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setReason('');
    };

    const handleAction = () => {
        if (currentAction === 'approve') {
            handleApprove(currentId, reason);
        } else if (currentAction === 'reject') {
            handleReject(currentId, reason);
        }
    };

    return (
        <div>
            <h1>Pending Approvals</h1>
            <table>
                <thead>
                    <tr>
                        <th>Functional Location</th>
                        <th>Report Date</th>
                        <th>Defect From</th>
                        <th>TEV/US In DB</th>
                        <th>Hotspot ∆T In ⁰C</th>
                        <th>Switchgear Type</th>
                        <th>Switchgear Brand</th>
                        <th>Substation Name</th>
                        <th>Defect Description 1</th>
                        <th>Defect Description 2</th>
                        <th>Defect Owner</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingApprovals.map((approval) => (
                        <tr key={approval.id}>
                            <td>{approval.functional_location}</td>
                            <td>{approval.report_date}</td>
                            <td>{approval.defect_from}</td>
                            <td>{approval.tev_us_in_db}</td>
                            <td>{approval.hotspot_delta_t_in_c}</td>
                            <td>{approval.switchgear_type}</td>
                            <td>{approval.switchgear_brand}</td>
                            <td>{approval.substation_name}</td>
                            <td>{approval.defect_description_1}</td>
                            <td>{approval.defect_description_2}</td>
                            <td>{approval.defect_owner}</td>
                            <td>
                                <button onClick={() => openModal('approve', approval.id)}>Approve</button>
                                <button onClick={() => openModal('reject', approval.id)}>Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{`You are about to ${currentAction}. Are you sure?`}</h2>
                        <label>
                            Reason:
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter reason"
                            />
                        </label>
                        <div className="modal-actions">
                            <button onClick={handleAction}>{currentAction.charAt(0).toUpperCase() + currentAction.slice(1)}</button>
                            <button onClick={closeModal}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

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
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .modal-content {
                    background: white;
                    padding: 20px;
                    border-radius: 5px;
                    text-align: center;
                }
                .modal-actions {
                    margin-top: 20px;
                    display: flex;
                    justify-content: space-around;
                }
                .modal-actions button {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};

export default withAuth(PendingApprovals);
