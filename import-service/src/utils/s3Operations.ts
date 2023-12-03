import {
    S3Client,
    PutObjectCommand
  } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IS3UploadParams } from './interfaces/IS3UploadParams';

const bucketName = "anntol-be-cdk23";
const client = new S3Client();

export const getS3SignedUrl = async (objectKey: string) => {
    try {
      const payload = {
        Bucket: bucketName,
        Key: objectKey
      };
  
      const command = new PutObjectCommand(payload);
      return await getSignedUrl(client, command);
    } catch (e: unknown) {
      console.error('Error generating S3 signed URL: ', e);
      throw e;
    }
  };