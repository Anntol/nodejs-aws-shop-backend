import { Handler, S3Event } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { getResponse } from '../utils/getResponse';

export const handler: Handler = async (event: S3Event) => {
    try {
        console.log(event);
        const response = 'Hello from importFileParser!';
        return getResponse(StatusCodes.OK, response);
    }
    catch (e) {
        console.error(e);
        return getResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
            message: "Internal Server Error"
        })
    }
}