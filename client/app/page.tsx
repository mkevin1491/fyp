"use client";

import React, { useEffect, useState } from "react";
import axios from "axios"; //npm install axios https://www.npmjs.com/package/axios

export default function Home() {
  const [userData, setUSerData] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await axios("http://127.0.0.1:8080/api/user");
      console.log(result.data);
      setUSerData(result.data.name);
    } catch (err) {
      console.log("somthing Wrong");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h3>Next js Python Flask</h3>
      {userData.map((user, index) => (
        <div key={index}>{user}</div>
      ))}
    </main>
  );
}
