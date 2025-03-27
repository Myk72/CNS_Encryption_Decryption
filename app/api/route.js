import crypto from "crypto";

export async function POST(req) {
  try {
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
      default:
        return Response.json({ error: "Invalid algorithm" }, { status: 400 });
    }

    return Response.json({ result: response });
  } catch (error) {
    console.error("Encryption Error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
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
  let plainText = "";
  for (let i = 0; i < cipherText.length; i++) {
    plainText += String.fromCharCode(
      cipherText.charCodeAt(i) ^ key.charCodeAt(i)
    );
  }
  return plainText;
};

const aesEncrypt = (text, key) => {
  const initializationVector = crypto.randomBytes(16);
  const formattedKey = crypto.createHash("sha256").update(key).digest();
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    formattedKey,
    initializationVector
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return initializationVector.toString("hex") + authTag + encrypted;
};

const aesDecrypt = (encryptedText, key) => {
  const initializationVector = Buffer.from(
    encryptedText.substring(0, 32),
    "hex"
  );
  const authTag = Buffer.from(encryptedText.substring(32, 64), "hex");
  const encrypted = encryptedText.substring(64);
  const formattedKey = crypto.createHash("sha256").update(key).digest();
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    formattedKey,
    initializationVector
  );

  decipher.setAuthTag(authTag);

  return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
};

const encrypt3DES = (text, key) => {
  const formattedKey = crypto
    .createHash("sha256")
    .update(key)
    .digest()
    .subarray(0, 24);
  const cipher = crypto.createCipheriv("des-ede3", formattedKey, null);

  return cipher.update(text, "utf8", "hex") + cipher.final("hex");
};

const decrypt3DES = (encryptedText, key) => {
  const formattedKey = crypto
    .createHash("sha256")
    .update(key)
    .digest()
    .subarray(0, 24);
  const decipher = crypto.createDecipheriv("des-ede3", formattedKey, null);

  return decipher.update(encryptedText, "hex", "utf8") + decipher.final("utf8");
};
