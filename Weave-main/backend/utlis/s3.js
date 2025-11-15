import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
    region: 'ap-south-1', credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});

const bucketName = `weave-chatapp`;

export const getUploadUrls3 = async (path, contentType) => {
    const key = `${path}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: contentType
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    return { url, key };
};

export const deleteObject = async (key) => {
    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
    });
    await s3Client.send(command);
    return true;
};