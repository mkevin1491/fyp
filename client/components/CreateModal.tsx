import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
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
    status: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleConfirm = () => {
    onCreate(formData);
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
            type="datetime-local" // Use appropriate input type for date and time
            value={formData.report_date}
            onChange={handleChange}
          />
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
        <Button variant="gradient" color="blue" onClick={handleConfirm}>
          Create
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateModal;
