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
  Button,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import Pagination from "@/components/pagination"; // Adjust the path according to your project structure

const PendingApprovals = () => {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentAction, setCurrentAction] = useState("");
  const [currentId, setCurrentId] = useState(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });
  const router = useRouter();

  useEffect(() => {
    fetchPendingApprovals();
  }, [currentPage]);

  const fetchPendingApprovals = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const response = await axios.get(
        `https://sea-lion-app-3l29g.ondigitalocean.app/api/pending-approvals?page=${currentPage}&per_page=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPendingApprovals(response.data.pending_approvals);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
    }
  };

  const handleApprove = async (id, reason) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      await axios.post(
        `https://sea-lion-app-3l29g.ondigitalocean.app/api/approve/${id}`,
        { message: reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchPendingApprovals();
      closeModal();
      setNotification({
        message: "Record approved successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error approving record:", error);
      setNotification({
        message: "Error approving record.",
        type: "error",
      });
    }
  };

  const handleReject = async (id, reason) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      await axios.post(
        `https://sea-lion-app-3l29g.ondigitalocean.app/api/reject/${id}`,
        { message: reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchPendingApprovals();
      closeModal();
      setNotification({
        message: "Record rejected successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error rejecting record:", error);
      setNotification({
        message: "Error rejecting record.",
        type: "error",
      });
    }
  };

  const openModal = (action, id) => {
    setCurrentAction(action);
    setCurrentId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setReason("");
    setReasonError("");
  };

  const handleAction = () => {
    if (!reason) {
      setReasonError("Reason is required.");
      return;
    }
    if (currentAction === "approve") {
      handleApprove(currentId, reason);
    } else if (currentAction === "reject") {
      handleReject(currentId, reason);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Pending Approvals
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {notification.message && (
            <div
              className={`fixed top-0 right-0 mt-4 mr-4 px-4 py-2 rounded shadow-lg ${
                notification.type === "success"
                  ? "bg-green-500"
                  : "bg-red-500"
              } text-white`}
            >
              <p>{notification.message}</p>
            </div>
          )}

          {pendingApprovals.length > 0 ? (
            <table className="w-full min-w-[640px] table-auto mt-4">
              <thead>
                <tr>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Functional Location
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Report Date
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Defect From
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    TEV/US In DB
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Hotspot ∆T In ⁰C
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Switchgear Type
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Switchgear Brand
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Substation Name
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Defect Description 1
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Defect Description 2
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Defect Owner
                  </th>
                  <th className="border-b border-blue-gray-50 py-3 px-5 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((approval) => (
                  <tr
                    key={approval.id}
                    className="border-b border-blue-gray-50"
                  >
                    <td className="py-3 px-5">
                      {approval.functional_location}
                    </td>
                    <td className="py-3 px-5">{approval.report_date}</td>
                    <td className="py-3 px-5">{approval.defect_from}</td>
                    <td className="py-3 px-5">{approval.tev_us_in_db}</td>
                    <td className="py-3 px-5">
                      {approval.hotspot_delta_t_in_c}
                    </td>
                    <td className="py-3 px-5">{approval.switchgear_type}</td>
                    <td className="py-3 px-5">{approval.switchgear_brand}</td>
                    <td className="py-3 px-5">{approval.substation_name}</td>
                    <td className="py-3 px-5">
                      {approval.defect_description_1}
                    </td>
                    <td className="py-3 px-5">
                      {approval.defect_description_2}
                    </td>
                    <td className="py-3 px-5">{approval.defect_owner}</td>
                    <td className="py-3 px-5">
                      <div className="flex">
                        <Button
                          onClick={() => openModal("approve", approval.id)}
                          variant="gradient"
                          color="green"
                          size="sm"
                          className="mr-2"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => openModal("reject", approval.id)}
                          variant="gradient"
                          color="red"
                          size="sm"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Typography className="py-4 px-5 text-gray-500">
              No records found.
            </Typography>
          )}
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>

          <Dialog open={showModal} handler={closeModal}>
            <DialogHeader>{`You are about to ${currentAction}. Are you sure?`}</DialogHeader>
            <DialogBody>
              <Input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                label="Reason"
                placeholder="Enter reason"
                error={!!reasonError}
              />
              {reasonError && (
                <Typography color="red" variant="small">
                  {reasonError}
                </Typography>
              )}
            </DialogBody>
            <DialogFooter>
              <Button
                onClick={handleAction}
                variant="gradient"
                color={currentAction === "approve" ? "green" : "red"}
                className="mr-2"
              >
                {currentAction.charAt(0).toUpperCase() + currentAction.slice(1)}
              </Button>
              <Button onClick={closeModal} variant="outlined" className="ml-2">
                Cancel
              </Button>
            </DialogFooter>
          </Dialog>
        </CardBody>
      </Card>
    </div>
  );
};

export default withAuth(PendingApprovals);
