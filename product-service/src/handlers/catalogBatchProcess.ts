import { SQSEvent } from "aws-lambda/trigger/sqs";

export const handler = async (event: SQSEvent) => {
    console.log(event);
}