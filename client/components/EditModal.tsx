import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Select,
} from "@material-tailwind/react";

const EditModal = ({ isOpen, onClose, item, onConfirm }) => {
  const [formData, setFormData] = useState({ ...item });
  const [status, setStatus] = useState("Unknown");

  useEffect(() => {
    // Update status whenever tev_us_in_db or hotspot_delta_t_in_c changes
    const { tev_us_in_db, hotspot_delta_t_in_c } = formData;
    const newStatus = calculateStatus(tev_us_in_db, hotspot_delta_t_in_c);
    setStatus(newStatus);
  }, [formData.tev_us_in_db, formData.hotspot_delta_t_in_c]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDefectFromChange = (value) => {
    setFormData({
      ...formData,
      defect_from: value,
      // Reset the disabled fields when switching defect_from options
      tev_us_in_db: "",
      hotspot_delta_t_in_c: "",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Function to render disabled input fields
  const renderDisabledInput = (label, value) => (
    <Input
      label={label}
      name={label.toLowerCase().replace(/ /g, "_")}
      value={value}
      disabled
    />
  );

  // Function to calculate the status based on tev_us_in_db and hotspot_delta_t_in_c
  const calculateStatus = (tev_us_in_db, hotspot_delta_t_in_c) => {
    if (tev_us_in_db >= 10 || hotspot_delta_t_in_c >= 10) {
      return "Critical";
    } else if (tev_us_in_db >= 5 || hotspot_delta_t_in_c >= 5) {
      return "Major";
    } else if (tev_us_in_db > 0 || hotspot_delta_t_in_c > 0) {
      return "Minor";
    } else {
      return "Unknown";
    }
  };

  const handleConfirm = () => {
    // Format the report_date before confirming
    const formattedData = {
      ...formData,
      report_date: formatDate(formData.report_date),
      status: status, // Ensure status is included
    };
    onConfirm(formattedData);
  };

  return (
    <Dialog open={isOpen} handler={onClose}>
      <DialogHeader>Edit Switchgear Details</DialogHeader>
      <DialogBody divider>
        <div className="grid grid-cols-2 gap-4">
          {renderDisabledInput("Functional Location", formData.functional_location)}
          {renderDisabledInput("Report Date", formData.report_date)}

          <Select
            label="Defect From"
            name="defect_from"
            value={formData.defect_from}
            onChange={(e) => handleDefectFromChange(e.target.value)}
          >
            <option value="ULTRASOUND">ULTRASOUND</option>
            <option value="THERMOGRAPHY">THERMOGRAPHY</option>
          </Select>
          <Input
            label="TEV/US In DB"
            name="tev_us_in_db"
            value={formData.tev_us_in_db}
            onChange={handleChange}
            disabled={formData.defect_from === "THERMOGRAPHY"}
          />
          <Input
            label="Hotspot ∆T In ⁰C"
            name="hotspot_delta_t_in_c"
            value={formData.hotspot_delta_t_in_c}
            onChange={handleChange}
            disabled={formData.defect_from === "ULTRASOUND"}
          />
          <Input
            label="Switchgear Type"
            name="switchgear_type"
            value={formData.switchgear_type}
            onChange={handleChange}
          />
          <Input
            label="Switchgear Brand"
            name="switchgear_brand"
            value={formData.switchgear_brand}
            onChange={handleChange}
          />
          <Input
            label="Substation Name"
            name="substation_name"
            value={formData.substation_name}
            onChange={handleChange}
          />
          <Input
            label="Defect Description 1"
            name="defect_description_1"
            value={formData.defect_description_1}
            onChange={handleChange}
          />
          <Input
            label="Defect Description 2"
            name="defect_description_2"
            value={formData.defect_description_2}
            onChange={handleChange}
          />
          <Input
            label="Defect Owner"
            name="defect_owner"
            value={formData.defect_owner}
            onChange={handleChange}
          />
          <Input
            label="Status"
            name="status"
            value={status}
            onChange={handleChange}
            disabled
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="gradient" color="blue" onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditModal;
