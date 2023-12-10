import csv = require('csv-parser');
import { Readable } from "stream";
import { moveS3Object } from "./s3Operations";

interface IRow {
    [key: string]: string | number | boolean;
}

export const readStream = async (
    stream: Readable,
    bucket?: string,
    from?: string,
    to?: string
  ): Promise<void> => {
    const rows: IRow[] = [];
  
    const parser = stream.pipe(csv());
  
    parser
      .on('data', (data: IRow) => {
        console.log('CSV data:', data);
        rows.push(data);
      })
      .on('end', async () => {
        console.log('End of the stream reached');

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