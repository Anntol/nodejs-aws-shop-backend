import { Handler, APIGatewayEvent } from 'aws-lambda';

export const handler: Handler = async (event: APIGatewayEvent) => {
  console.log("request:", JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello from getProductList! You've hit ${event.path}\n`
  };
}