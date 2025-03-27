import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  const { message, key, operation, algorithm } = await req.json();

  let response;
  switch (algorithm.toUpperCase()) {
    case "OTP":
      response =
        operation === "Encryption"
          ? otpEncrypt(message, key)
          : otpDecrypt(message, key);
      break;
    case "AES":
      response =
        operation === "Encryption"
          ? aesEncrypt(message, key)
          : aesDecrypt(message, key);
      break;
    case "3DES":
      response =
        operation === "Encryption"
          ? encrypt3DES(message, key)
          : decrypt3DES(message, key);
      break;
  }
  if (response === "AES Decryption Error" || response === "3DES Decryption Error" || response === "Key length and cipher text length should be equal") {
    return NextResponse.json({ result: response, status:
      400 });
  }
  return NextResponse.json({ result: response, status: 200 });
}

const otpEncrypt = (text, key) => {
  let cipherText = "";
  for (let i = 0; i < text.length; i++) {
    cipherText += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i));
  }
  return Buffer.from(cipherText, "utf-8").toString("hex");
};

const otpDecrypt = (cipherHex, key) => {
  const cipherText = Buffer.from(cipherHex, "hex").toString("utf-8");
  if (cipherText.length !== key.length) {
    return "Key length and cipher text length should be equal";
  }

  let plainText = "";
  for (let i = 0; i < cipherText.length; i++) {
    plainText += String.fromCharCode(
      cipherText.charCodeAt(i) ^ key.charCodeAt(i)
    );
  }
  return plainText;
};

const aesEncrypt = (text, key) => {
  const iv = crypto.randomBytes(16);
  const formattedKey = crypto.createHash("sha256").update(key).digest();
  const cipher = crypto.createCipheriv("aes-256-gcm", formattedKey, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return iv.toString("hex") + authTag + encrypted;
};

const aesDecrypt = (encryptedText, key) => {
  try {
    const iv = Buffer.from(encryptedText.substring(0, 32), "hex");
    const authTag = Buffer.from(encryptedText.substring(32, 64), "hex");
    const encrypted = encryptedText.substring(64);
    const formattedKey = crypto.createHash("sha256").update(key).digest();
    const decipher = crypto.createDecipheriv("aes-256-gcm", formattedKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("AES Decryption Error:", error.message);
    return "AES Decryption Error";
  }
};

const encrypt3DES = (text, key) => {
  const formattedKey = crypto
    .createHash("sha256")
    .update(key)
    .digest()
    .subarray(0, 24);
  const cipher = crypto.createCipheriv("des-ede3", formattedKey, null);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt3DES = (encryptedText, key) => {
  try {
    const formattedKey = crypto
      .createHash("sha256")
      .update(key)
      .digest()
      .subarray(0, 24);
    const decipher = crypto.createDecipheriv("des-ede3", formattedKey, null);

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("3DES Decryption Error:", error.message);
    return "3DES Decryption Error";
  }
};
