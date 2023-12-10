import csv = require('csv-parser');
import { Readable } from "stream";
import { moveS3Object } from "./s3Operations";
import { sendMessageBatch } from './queueOperations';

interface IRow {
    [key: string]: string | number | boolean;
}

export const readStream = async (
    stream: Readable,
    sqsUrl?: string,
    bucket?: string,
    from?: string,
    to?: string
  ): Promise<void> => {
    const rows: IRow[] = [];
  
    const parser = stream.pipe(csv());
  
    parser
      .on('data', (data: IRow) => {
        //console.log('CSV data:', data);
        rows.push(data);
      })
      .on('end', async () => {
        console.log('End of the stream reached');

        if (sqsUrl) {
          const isSent = await sendMessageBatch(sqsUrl, rows);
          console.log('isSent: ', isSent);
        } else {
          console.error ('sqsUrl not defined!');
        }

        if (bucket && from && to) {
            await moveS3Object({ from, to });
            console.log('File moved!');
        }

        return Promise.resolve();
      })
      .on('error', (e: unknown) => {
          console.error('Error during CSV parsing: ', e);
          return Promise.reject(e);
      });
}