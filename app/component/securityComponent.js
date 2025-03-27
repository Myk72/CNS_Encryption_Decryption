"use client";
import { React, useState, useEffect } from "react";
import ErrorMessage from "./errorMessage";

const SecurityComponent = ({ operation, algorithm }) => {
  const [message, setMessage] = useState("");
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [encryptedMessage, setEncryptedMessage] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState("");

  useEffect(() => {
    setDecryptedMessage("");
    setEncryptedMessage("");
  }, [algorithm]);
  const handleEncrptionAndDecryption = async (e) => {
    e.preventDefault();
    try {
      if (message === "" || key === "") {
        setErrorMessage("Please fill all the fields");
        return;
      }
      if (
        algorithm === "OTP" &&
        message.length !== key.length &&
        operation === "Encryption"
      ) {
        setErrorMessage("Message and key length should be equal");
        return;
      }
      const response = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, key, algorithm, operation }),
      });
      const data = await response.json();
      if (data.status === 400) {
        setErrorMessage(data.result);
        return;
      }
      if (operation === "Encryption") {
        setEncryptedMessage(data.result);
      } else {
        setDecryptedMessage(data.result);
      }
    } catch (error) {
      if (operation === "Decryption") {
        setErrorMessage(e.message);
      }
      console.error("Error: Here is the error", error);
    }
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(
      operation === "Encryption" ? encryptedMessage : decryptedMessage
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  return (
    <div className="p-6 bg-white rounded-lg font-serif w-full flex flex-col gap-3">
      <div>
        <label className="block text-sm font-bold mb-2">
          <div className="flex flex-row gap-2 ">
            {operation === "Encryption" ? "Encrypt" : "Decrypt"}
            {operation === "Encryption" ? (
              <img src="/encryption.png" className="size-6 -mt-1" />
            ) : (
              <img src="/decryption.png" className="size-6 -mt-1" />
            )}
            Message
          </div>
        </label>
        <textarea
          className="w-full p-2 border rounded-lg"
          placeholder="Enter your message"
          onChange={(e) => {
            setMessage(e.target.value);
            setErrorMessage("");
          }}
          style={{ resize: "none" }}
        />
      </div>

      <div>
        <label className="block text-sm font-bold mb-2">{operation} Key</label>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            className="w-full p-2 border rounded-lg"
            placeholder={
              operation === "Encryption"
                ? "Enter encryption key"
                : "Enter decryption key"
            }
            onChange={(e) => {
              setKey(e.target.value);
              setErrorMessage("");
            }}
          />
          <button
            className="absolute inset-y-0 right-2 flex items-center p-2"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? (
              <img src="/show.png" className="size-5" />
            ) : (
              <img src="/hide.png" className="size-5" />
            )}
          </button>
        </div>
      </div>

      <button
        className="w-full bg-blue-500 text-white p-2 rounded-lg  hover:bg-blue-600"
        onClick={handleEncrptionAndDecryption}
      >
        {operation === "Encryption" ? "Encrypt" : "Decrypt"}
      </button>
      {errorMessage && <ErrorMessage message={errorMessage} />}

      <div>
        <label className="block text-sm font-medium mb-2">
          {operation === "Encryption" ? "Encrypted" : "Decrypted"} Message Using{" "}
          {algorithm}
        </label>
        <div className="flex items-center flex-col gap-2 ">
          <textarea
            className="w-full p-2 border rounded-lg mr-2"
            value={
              operation === "Encryption" ? encryptedMessage : decryptedMessage
            }
            readOnly
            style={{ resize: "none" }}
          />
          <button
            className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
            onClick={handleCopy}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityComponent;
