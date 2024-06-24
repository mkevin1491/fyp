"use client";
import React from "react";
import SwitchgearTable from "@/components/SwitchgearTable";
import { Card, CardHeader, CardBody, Typography } from "@material-tailwind/react";

const SwitchgearList = () => {
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Switchgear List
          </Typography>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <SwitchgearTable />
        </CardBody>
      </Card>
    </div>
  );
};

export default SwitchgearList;
