import { Handler, APIGatewayEvent } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { getResponse } from '../utils/getResponse';
import products from "../data/products.json";

export const handler: Handler = async (event: APIGatewayEvent) => {
  try {
    return getResponse(StatusCodes.OK, products);
  }
  catch (e) {
    console.error(e);
    return getResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Internal Server Error"
    })
  }
}