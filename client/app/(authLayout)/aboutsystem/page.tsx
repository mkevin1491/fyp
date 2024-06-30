// pages/about-us.tsx
"use client";
import React from "react";
import { Card, CardHeader, CardBody, Typography } from "@material-tailwind/react";

const AboutUsPage = () => {
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            About TNB Switchgear Wellness and Insight System (TNB-SWITCHWISE)
          </Typography>
        </CardHeader>
        <CardBody className="px-6 py-4">
          <Typography variant="body1" className="text-gray-700">
            TNB Switchgear Wellness and Insight System (TNB-SWITCHWISE) is a comprehensive system designed to monitor and manage the health and performance of 11kV switchgears, with plans to expand to include 33kV switchgears in the future. It offers valuable insights into switchgear conditions, enabling proactive maintenance and optimizing operational efficiency.
          </Typography>
          <Typography variant="body1" className="text-gray-700 mt-4">
            Our mission is to ensure the reliability and safety of switchgear operations through advanced analytics, predictive maintenance, and actionable insights derived from real-time data. TNB-SWITCHWISE empowers utility providers to enhance grid reliability, minimize downtime, and extend the lifespan of critical assets.
          </Typography>
          <Typography variant="body1" className="text-gray-700 mt-4">
            For more information and inquiries, please contact us at contact@tnb-switchwise.com.
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
};

export default AboutUsPage;
