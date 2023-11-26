import { APIGatewayEvent, Handler } from "aws-lambda";
import { getResponse } from "../utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { randomUUID } from 'node:crypto';
import { IAvailableProduct } from "../utils/interfaces/IAvailableProduct";
import { createProduct } from "../utils/dynamoDb/dbOperations";

export const handler: Handler = async (event: APIGatewayEvent) => {
    try {
        const body = event.body;
        if (!body) {
            return getResponse(StatusCodes.BAD_REQUEST, { 
                message: "Request body is required"
            });
        }

        const product: IAvailableProduct = JSON.parse(body);
        if (!product.id) {
            product.id = randomUUID();
        }

        const newProduct = await createProduct(product);
        return getResponse(StatusCodes.CREATED, newProduct);
    }
    catch (e) {
        console.error(e);
        return getResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
            message: "Internal Server Error"
        })
    }
  }