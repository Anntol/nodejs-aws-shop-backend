import { SQSEvent } from "aws-lambda/trigger/sqs";
import { getResponse } from "../utils/getResponse";
import { StatusCodes } from "http-status-codes";
import { IAvailableProduct } from "../utils/interfaces/IAvailableProduct";
import { randomUUID } from "node:crypto";
import { createProduct } from "../utils/dynamoDb/dbOperations";

export const handler = async (event: SQSEvent) => {
    try {
        console.log(event);
        const itemsList = event.Records.map(({ body }) => body);
    
        for (const item of itemsList) {
            let product: IAvailableProduct;
            try {
                product = JSON.parse(item);
                if (!product.id) {
                    product.id = randomUUID();
                }
            } catch (e) {
                console.error(e);
                return getResponse(StatusCodes.BAD_REQUEST, { 
                    message: "Product data is invalid"
                });
            }
            const newProduct = await createProduct(product);
            console.log('created newProduct: ', newProduct.id);
        }
        return true;
    }
    catch (e) {
        console.error(e);
        return getResponse(StatusCodes.INTERNAL_SERVER_ERROR, {
            message: "Internal Server Error"
        })
    }

}