"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import Pagination from "@/components/pagination";
import EditModal from "@/components/EditModal";
import CreateModal from "@/components/CreateModal";

const SwitchgearTable = () => {
  const [switchgearData, setSwitchgearData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editItem, setEditItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchSwitchgearData(currentPage);
  }, [currentPage]);

  const fetchSwitchgearData = async (page = 1) => {
    try {
      const response = await axios.get(
        `https://sea-lion-app-3l29g.ondigitalocean.app/api/switchgear-info?page=${page}&per_page=25`
      );
      const data = response.data.data;
      setSwitchgearData(data);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      console.error("Error fetching switchgear data:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset currentPage when search query changes
  };

  const filteredData = switchgearData.filter((item) => {
    return (
      (item.functional_location &&
        item.functional_location
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (item.defect_from &&
        item.defect_from.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.switchgear_type &&
        item.switchgear_type
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (item.switchgear_brand &&
        item.switchgear_brand
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (item.substation_name &&
        item.substation_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (item.defect_description_1 &&
        item.defect_description_1
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (item.defect_description_2 &&
        item.defect_description_2
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (item.defect_owner &&
        item.defect_owner.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.status &&
        item.status.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const onPageChange = (page) => {
    setCurrentPage(page);
    fetchSwitchgearData(page);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      deleteRecord(id);
    }
  };

  const deleteRecord = async (id) => {
    try {
      const randomKey = "random-key-123"; // Replace with your random authorization key
      const response = await fetch(
        `https://sea-lion-app-3l29g.ondigitalocean.app/api/switchgear/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${randomKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete record");
      }

      console.log("Record deleted successfully");
      return response.json();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  const updateSwitchgearDetails = async (id, updatedData) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.put(
        `https://sea-lion-app-3l29g.ondigitalocean.app/api/switchgear/${id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating switchgear details:", error);
      throw error;
    }
  };

  const handleConfirmEdit = async (updatedItem) => {
    try {
      const updatedResponse = await updateSwitchgearDetails(
        updatedItem.id,
        updatedItem
      );
      console.log("Update successful:", updatedResponse);

      const updatedData = switchgearData.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      );
      setSwitchgearData(updatedData);
      setIsModalOpen(false);
      setEditItem(null);
    } catch (error) {
      console.error("Failed to update switchgear details:", error);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const response = await fetch("https://sea-lion-app-3l29g.ondigitalocean.app/api/switchgear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        console.log("Switchgear record created successfully!");
      } else {
        console.error("Failed to create switchgear record.");
      }
    } catch (error) {
      console.error("Error creating switchgear record:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  return (
    <div>
      <div className="p-6 bg-white rounded-t-lg">
        <Typography variant="h6" color="blue-gray" className="mb-1">
          Switchgear Table
        </Typography>
        {/* <button
          onClick={() => setCreateModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4"
        >
          Create New
        </button> */}
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="border border-gray-300 rounded-lg p-2 mb-4"
        />
      </div>
      <Card className="border border-blue-gray-100 shadow-sm">
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto mt-4">
            <thead>
              <tr>
                {[
                  "Functional Location",
                  "Report Date",
                  "Status",
                  "Defect From",
                  "Switchgear Type",
                  "Switchgear Brand",
                  "Substation Name",
                  "Defect Description 1",
                  "Defect Description 2",

                ].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-center"
                  >
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
              {filteredData.map((item) => (
                <tr key={item.id} className="border-b border-blue-gray-50">
                  <td className="py-3 px-5">{item.functional_location}</td>
                  <td className="py-3 px-5">{formatDate(item.report_date)}</td>
                  <td className="py-3 px-5">
                    {item.status === "Critical" ? (
                      <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                        Critical
                      </span>
                    ) : item.status === "Major" ? (
                      <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-sm font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        Major
                      </span>
                    ) : item.status === "Minor" ? (
                      <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                        Minor
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Unknown
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-5">{item.defect_from}</td>
                  <td className="py-3 px-5">{item.switchgear_type}</td>
                  <td className="py-3 px-5">{item.switchgear_brand}</td>
                  <td className="py-3 px-5">{item.substation_name}</td>
                  <td className="py-3 px-5">{item.defect_description_1}</td>
                  <td className="py-3 px-5">{item.defect_description_2}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-center mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        </CardBody>
      </Card>
      {isModalOpen && (
        <EditModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          item={editItem}
          onConfirm={handleConfirmEdit}
        />
      )}
      {createModalOpen && (
        <CreateModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onConfirm={handleCreate}
        />
      )}
    </div>
  );
};

export default SwitchgearTable;
