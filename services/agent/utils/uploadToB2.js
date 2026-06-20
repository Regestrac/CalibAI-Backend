import { PutObjectCommand } from "@aws-sdk/client-s3";
import { b2 } from "../config/b2.js";

export const uploadToB2 = async (fileName, buffer, contentType) => {
  await b2.send(
    new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return fileName;
}