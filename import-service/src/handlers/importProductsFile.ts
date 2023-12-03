import { Handler, APIGatewayEvent } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { getResponse } from '../utils/getResponse';

export const handler: Handler = async (event: APIGatewayEvent) => {
    try {
        console.log(event);
        const response = 'Hello from importProductsFile!';
        return getResponse(StatusCodes.OK, response);
      }
      catch (e) {
        console.error(e);
        return getResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
            message: "Internal Server Error"
        })
      }
}