"use client";
import { React, useState } from "react";
import SecurityComponent from "./component/securityComponent.js";
export default function Home() {
  const [algorithm, setAlgorithm] = useState("OTP");
  return (
    <div className="bg-gray-100 justify-center h-screen flex items-center p-6">
    <div className="flex justify-center items-center flex-col gap-2 shadow-lg bg-white p-6 rounded-lg w-3/4">
      <h1 className="text-2xl font-bold font-serif text-center mb-6">
        Symmetric Encryption and Message Confidentiality
      </h1>
      <div className="flex flex-col gap-1 justify-center items-center w-1/4 ">
        <label className="block text-sm font-bold">Choose Algorithm</label>
        <select
          className="w-full border rounded-lg p-2"
          onChange={(e) => setAlgorithm(e.target.value)}
        >
          <option>OTP</option>
          <option>3DES</option>
          <option>AES</option>
          <option>RSA</option>
        </select>
      </div>

      <div className="flex justify-between w-full ">
        <SecurityComponent operation="Encryption" algorithm={algorithm} />
        <SecurityComponent operation="Decryption" algorithm={algorithm} />
      </div>
    </div>
    </div>
  );
}
