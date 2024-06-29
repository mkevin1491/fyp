import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Select,
  Option,
} from "@material-tailwind/react";

const CreateModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    functional_location: "",
    report_date: "",
    defect_from: "",
    tev_us_in_db: "",
    hotspot_delta_t_in_c: "",
    switchgear_type: "",
    switchgear_brand: "",
    substation_name: "",
    defect_description_1: "",
    defect_description_2: "",
    defect_owner: "",
  });
  const [status, setStatus] = useState("Unknown");

  useEffect(() => {
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

  const renderDisabledInput = (label, value) => (
    <Input
      label={label}
      name={label.toLowerCase().replace(/ /g, "_")}
      value={value}
      disabled
    />
  );

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
    const formattedData = {
      ...formData,
      report_date: formatDate(formData.report_date),
      status: status,
    };
    onCreate(formattedData);
    onClose();
  };

  return (
    <Dialog open={isOpen} handler={onClose}>
      <DialogHeader>Create New Switchgear</DialogHeader>
      <DialogBody divider>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Functional Location"
            name="functional_location"
            value={formData.functional_location}
            onChange={handleChange}
          />
          <Input
            label="Report Date"
            name="report_date"
            type="datetime-local"
            value={formData.report_date}
            onChange={handleChange}
          />
          <Select
            label="Defect From"
            name="defect_from"
            value={formData.defect_from}
            onChange={handleDefectFromChange}
          >
            <Option value="ULTRASOUND">ULTRASOUND</Option>
            <Option value="THERMOGRAPHY">THERMOGRAPHY</Option>
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
          Create
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateModal;
