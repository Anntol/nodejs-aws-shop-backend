import {
    S3Client,
    PutObjectCommand,
    CopyObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand
  } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

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

export const moveS3Object = async (from: string, to: string) => {
    try {
      const copyCommand = new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${from}`,
        Key: to,
      });
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: from,
      });

      await client.send(copyCommand);
      console.log(`File copied from ${from} to ${to} in bucket ${bucketName}`);
      await client.send(deleteCommand);
      console.log(`File deleted from ${from} in bucket ${bucketName}`);
    } catch (e: unknown) {
      console.error('Error moving S3 object: ', e);
      throw e;
    }
};

export const getS3ReadStream = async (fileName: string) => {
    try {
      const input = {
        Bucket: bucketName,
        Key: decodeURIComponent(fileName),
      };
  
      const command = new GetObjectCommand(input);
      const response = await client.send(command);
  
      const readStream = response.Body as Readable;
      return readStream;
    } catch (e: unknown) {
      console.error('Error getting S3 read stream: ', e);
      throw e;
    }
  };