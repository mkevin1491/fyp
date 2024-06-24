"use client";

import axios from "axios";
import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import withAuth from "@/components/withAuth";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";

const UploadPage = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [arrayBuffers, setArrayBuffers] = useState<ArrayBuffer[]>([]);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const router = useRouter();

  const parseExcelData = (arrayBuffer: ArrayBuffer) => {
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  };

  const parseCSVData = (arrayBuffer: ArrayBuffer): Promise<string[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const data = text.split("\n").map((row) => row.split(","));
        resolve(data);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(new Blob([arrayBuffer]));
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || arrayBuffers.length === 0) {
      setError("No files selected.");
      setNotification({
        message: "No files selected.",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const arrayBuffer = arrayBuffers[i];

        let data = [];
        if (
          file.type === "application/vnd.ms-excel" ||
          file.type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
          data = parseExcelData(arrayBuffer);
        } else if (file.type === "text/csv") {
          data = await parseCSVData(arrayBuffer);
        } else {
          setError("Unsupported file type.");
          setMessage(null);
          setNotification({
            message: "Unsupported file type. Please upload a CSV or Excel file.",
            type: "error",
          });
          setTimeout(() => setNotification(null), 3000);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post(
          "http://127.0.0.1:8080/api/upload",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response.data); // Log the response data to the console

        const { message } = response.data;

        if (
          message ===
          "All records already exist in either PendingSwitchgear or Switchgear tables."
        ) {
          setNotification({
            message:
              "All data is already in the approval page or switchgear table.",
            type: "info",
          });
        } else if (
          message ===
          "No new records were added to pending switchgear. All records are already in the approval page."
        ) {
          setNotification({
            message:
              "No new records added. Data is already in the approval page.",
            type: "info",
          });
        } else {
          setMessage(message);
          setError(null);
          setNotification({
            message: "Upload successful! Please go to the approval page.",
            type: "success",
          });
        }
        setTimeout(() => setNotification(null), 3000); // Hide notification after 3 seconds
      }
    } catch (error) {
      console.error(error);
      setMessage(null);
      setError("An error occurred while uploading the files.");
      setNotification({
        message: "An error occurred while uploading the files. Please try again.",
        type: "error",
      });
      setTimeout(() => setNotification(null), 3000); // Hide notification after 3 seconds
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setMessage(null); // Clear previous message
    setError(null); // Clear previous error

    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setSelectedFiles([...selectedFiles, ...newFiles]);
      const newArrayBuffers = [...arrayBuffers];

      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const buffer = e.target?.result as ArrayBuffer;
          newArrayBuffers.push(buffer);
          setArrayBuffers(newArrayBuffers);
        };
        reader.readAsArrayBuffer(file);
      });
    } else {
      setError("Please select a file.");
      setMessage(null); // Clear any success message
    }

    // Reset the file input
    event.target.value = "";
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const files = event.dataTransfer.files;
      setMessage(null); // Clear previous message
      setError(null); // Clear previous error

      if (files && files.length > 0) {
        const newFiles = Array.from(files);
        setSelectedFiles([...selectedFiles, ...newFiles]);
        const newArrayBuffers = [...arrayBuffers];

        newFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const buffer = e.target?.result as ArrayBuffer;
            newArrayBuffers.push(buffer);
            setArrayBuffers(newArrayBuffers);
          };
          reader.readAsArrayBuffer(file);
        });
      } else {
        setError("Please select a file.");
        setMessage(null); // Clear any success message
      }
    },
    [selectedFiles, arrayBuffers]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleRemoveFile = (index: number) => {
    const newSelectedFiles = [...selectedFiles];
    const newArrayBuffers = [...arrayBuffers];
    newSelectedFiles.splice(index, 1);
    newArrayBuffers.splice(index, 1);
    setSelectedFiles(newSelectedFiles);
    setArrayBuffers(newArrayBuffers);
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Upload CSV/Excel Files
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-4 pt-4 pb-4">
          {notification && (
            <div
              className={`fixed top-0 right-0 mt-4 mr-4 px-4 py-2 rounded shadow-lg ${
                notification.type === "success"
                  ? "bg-green-500"
                  : notification.type === "info"
                  ? "bg-blue-500"
                  : "bg-red-500"
              } text-white`}
            >
              <p>{notification.message}</p>
            </div>
          )}

          <div
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              id="dropzone-file"
              type="file"
              accept=".csv, .xls, .xlsx"
              className="hidden"
              onChange={handleFileChange}
              multiple
            />
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  CSV or Excel files only
                </p>
              </div>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-4">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center mb-2"
                >
                  <p className="text-sm text-gray-500">{file.name}</p>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={handleUpload}
            className="mt-4"
            variant="gradient"
            color="blue"
          >
            Upload
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default withAuth(UploadPage);
