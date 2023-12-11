import { Handler, S3Event } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { getResponse } from '../utils/getResponse';
import { readStream } from '../utils/readStream';
import { getS3ReadStream, moveS3Object } from '../utils/s3Operations';

export const handler: Handler = async (event: S3Event) => {
    try {
        console.log(event);
        
        if (!event.Records || event.Records.length === 0) {
            return getResponse(StatusCodes.BAD_REQUEST, {
                message: "Missing Records array."
            });
        }

        const bucketS3 = event.Records[0].s3;
        const fileName = decodeURIComponent(
            bucketS3.object.key.replace(/\+/g, ' ')
        );

        const rawStream = await getS3ReadStream(fileName);
        if (!rawStream) {
            return getResponse(StatusCodes.BAD_REQUEST, {
                message: "Unable to read stream for " + fileName
            });
        }

        const sqsUrl = process.env.SQS_URL;
        if (sqsUrl) {
            await readStream(rawStream, sqsUrl);
        } else {
            console.error ('sqsUrl not defined!');
        }

        const destName = fileName.replace('uploaded', 'parsed');
        await moveS3Object(fileName, destName);

        return getResponse(StatusCodes.OK, fileName);
    }
    catch (e) {
        console.error(e);
        return getResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
            message: "Internal Server Error"
        })
    }
}