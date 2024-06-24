import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
} from "@material-tailwind/react";

const EditModal = ({ isOpen, onClose, item, onConfirm }) => {
  const [formData, setFormData] = useState({ ...item });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
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

  const handleConfirm = () => {
    // Format the report_date before confirming
    const formattedData = {
      ...formData,
      report_date: formatDate(formData.report_date),
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

          <Input
            label="Defect From"
            name="defect_from"
            value={formData.defect_from}
            onChange={handleChange}
          />
          <Input
            label="TEV/US In DB"
            name="tev_us_in_db"
            value={formData.tev_us_in_db}
            onChange={handleChange}
          />
          <Input
            label="Hotspot ∆T In ⁰C"
            name="hotspot_delta_t_in_c"
            value={formData.hotspot_delta_t_in_c}
            onChange={handleChange}
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
            value={formData.status}
            onChange={handleChange}
          />
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="red" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="gradient"
          color="blue"
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default EditModal;