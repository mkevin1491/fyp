import { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@material-tailwind/react";

const SwitchgearModal = ({ isOpen, onClose, switchgear, onSave }) => {
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

  useEffect(() => {
    if (switchgear) {
      setFormData({ ...switchgear });
    } else {
      setFormData({
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
    }
  }, [switchgear]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      if (switchgear) {
        // Update existing switchgear
        await axios.put(
          `https://sea-lion-app-3l29g.ondigitalocean.app/api/switchgear-info/${switchgear.id}`,
          formData,
          config
        );
      } else {
        // Create new switchgear
        await axios.post(
          "https://sea-lion-app-3l29g.ondigitalocean.app/api/switchgear-info",
          formData,
          config
        );
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving switchgear:", error);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalHeader>
        {switchgear ? "Update Switchgear" : "Create Switchgear"}
      </ModalHeader>
      <ModalBody>
        <div className="grid gap-y-4">
          <Input
            label="Functional Location"
            name="functional_location"
            value={formData.functional_location}
            onChange={handleChange}
          />
          <Input
            label="Report Date"
            name="report_date"
            type="date"
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
          <Textarea
            label="Defect Description 1"
            name="defect_description_1"
            value={formData.defect_description_1}
            onChange={handleChange}
          />
          <Textarea
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
      </ModalBody>
      <ModalFooter>
        <Button variant="text" color="red" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="gradient" color="blue" onClick={handleSubmit}>
          Save
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SwitchgearModal;
