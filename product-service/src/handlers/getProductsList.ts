import { Handler, APIGatewayEvent } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { getResponse } from '../utils/getResponse';
import { getProductsList } from '../utils/dynamoDb/dbOperations';

export const handler: Handler = async (event: APIGatewayEvent) => {
  try {
    console.log(event);
    const products = await getProductsList();
    return getResponse(StatusCodes.OK, products);
  }
  catch (e) {
    console.error(e);
    return getResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Internal Server Error"
    })
  }
}