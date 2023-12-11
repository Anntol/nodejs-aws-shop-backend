import csv = require('csv-parser');
import { Readable } from "stream";
import { sendMessage } from './queueOperations';

interface IRow {
  [key: string]: string | number | boolean;
}

export const readStream = async (stream: Readable, queueUrl: string): Promise<void> => {
  stream.pipe(csv())
    .on('data', (data: IRow) => {
      // console.log('CSV data:', data);
      sendMessage(queueUrl, data);
    })
    .on('end', async () => {
      console.log('End of the stream reached');
    })
    .on('error', (e: unknown) => {
      console.error('Error during CSV parsing: ', e);
      return Promise.reject(e);
    });
}