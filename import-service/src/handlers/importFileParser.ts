import { Handler, S3Event } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { getResponse } from '../utils/getResponse';
import { readStream } from '../utils/readStream';
import { getS3ReadStream } from '../utils/s3Operations';

export const handler: Handler = async (event: S3Event) => {
    try {
        console.log(event);
        
        if (!event.Records || event.Records.length === 0) {
            return getResponse(StatusCodes.BAD_REQUEST, {
                message: "Missing Records array."
            });
        }

        const bucketS3 = event.Records[0].s3;
        const bucket = bucketS3.bucket.name;
        const fileName = decodeURIComponent(
            bucketS3.object.key.replace(/\+/g, ' ')
        );

        const rawStream = await getS3ReadStream(fileName);

        if (!rawStream) {
            return getResponse(StatusCodes.BAD_REQUEST, {
                message: "Unable to read stream for " + fileName
            });
        }

        await readStream(
            rawStream,
            bucket,
            fileName,
            fileName.replace('uploaded', 'parsed')
        );

        return getResponse(StatusCodes.OK, fileName);
    }
    catch (e) {
        console.error(e);
        return getResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
            message: "Internal Server Error"
        })
    }
}