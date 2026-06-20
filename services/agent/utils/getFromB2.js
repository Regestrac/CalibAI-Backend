import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { GetObjectCommand } from "@aws-sdk/client-s3"
import { b2 } from "../config/b2.js"

export const getFromB2 = async (fileName, expiresIn = 600) => {
  return await getSignedUrl(
    b2,
    new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileName,
    }),
    { expiresIn },
  )
}