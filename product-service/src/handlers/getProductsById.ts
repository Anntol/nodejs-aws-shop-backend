import { Handler, APIGatewayEvent } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { getResponse } from '../utils/getResponse';
import products from "../data/products.json";

export const handler: Handler = async (event: APIGatewayEvent) => {
  try {
    const productId = event.pathParameters!.productId;

    if (!productId) {
      return getResponse(StatusCodes.BAD_REQUEST, {
        message: "productId is invalid"
      });
    }

    const product = products.filter((item) => item.id === productId);
    if (!product) {
      return getResponse(StatusCodes.NOT_FOUND, {
        message: "product not found"
      });
    }

    return getResponse(StatusCodes.OK, product);
  }
  catch (e) {
    console.error(e);
    return getResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Internal Server Error"
    })
  }
}