import { Handler, APIGatewayEvent } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { getResponse } from '../utils/getResponse';
import { getS3SignedUrl } from '../utils/s3Operations';

export const handler: Handler = async (event: APIGatewayEvent) => {
    try {
        console.log(event);

        const fileName = event.queryStringParameters!.name;
        const objectKey = `uploaded/${fileName}`;
        const url = await getS3SignedUrl(objectKey);
        return getResponse(StatusCodes.OK, url);
      }
      catch (e) {
        console.error(e);
        return getResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
            message: "Internal Server Error"
        })
      }
}