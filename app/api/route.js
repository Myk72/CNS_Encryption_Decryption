import crypto from "crypto";

export async function POST(req) {
  try {
    const { message, key, operation, algorithm } = await req.json();

    let apiResponse;
    switch (algorithm.toUpperCase()) {
      case "OTP":
        apiResponse =
          operation === "Encryption"
            ? otpEncrypt(message, key)
            : otpDecrypt(message, key);
        break;

      case "AES":
        apiResponse =
          operation === "Encryption"
            ? aesEncrypt(message, key)
            : aesDecrypt(message, key);
        break;

      case "3DES":
        apiResponse =
          operation === "Encryption"
            ? encrypt3DES(message, key)
            : decrypt3DES(message, key);
        break;

      default:
        return Response.json({ error: "Invalid algorithm" }, { status: 400 });
    }

    return Response.json({ result: apiResponse });
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
  const iv = crypto.randomBytes(16);
  const formattedKey = crypto.createHash("sha256").update(key).digest();
  const cipher = crypto.createCipheriv("aes-256-cbc", formattedKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + encrypted;
};

const aesDecrypt = (encryptedText, key) => {
  const iv = Buffer.from(encryptedText.substring(0, 32), "hex");
  const encrypted = encryptedText.substring(32);
  const formattedKey = crypto.createHash("sha256").update(key).digest();
  const decipher = crypto.createDecipheriv("aes-256-cbc", formattedKey, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

const encrypt3DES = (text, key) => {
  const formattedKey = Buffer.alloc(24, key);
  const cipher = crypto.createCipheriv("des-ede3", formattedKey, null);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt3DES = (encryptedText, key) => {
  const formattedKey = Buffer.alloc(24, key);
  const decipher = crypto.createDecipheriv("des-ede3", formattedKey, null);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
