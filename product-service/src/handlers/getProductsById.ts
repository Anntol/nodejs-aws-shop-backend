import { Handler, APIGatewayEvent } from 'aws-lambda';
import { StatusCodes } from 'http-status-codes';
import { getResponse } from '../utils/getResponse';
import products from "../data/products.json";

export const handler: Handler = async (event: APIGatewayEvent) => {
  try {
    const productId = event.pathParameters!.productId;

    if (!productId) {
      return getResponse(StatusCodes.BAD_REQUEST, {
        message: "ProductId is invalid"
      });
    }

    const product = products.filter((item) => item.id === productId);
    if (Array.isArray(product) && product.length) {
      return getResponse(StatusCodes.OK, product);
    };
    
    return getResponse(StatusCodes.NOT_FOUND, {
      message: "Product not found"
    });
  }
  catch (e) {
    console.error(e);
    return getResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
        message: "Internal Server Error"
    })
  }
}