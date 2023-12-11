import { SQSClient, SendMessageBatchCommand, SendMessageCommand } from "@aws-sdk/client-sqs";
import { randomUUID } from "crypto";
import { StatusCodes } from 'http-status-codes';

const sqsClient = new SQSClient();

interface IRow {
  [key: string]: string | number | boolean;
}

export const sendMessage = async (
  queueUrl: string,
  item: IRow,
): Promise<void> => {
  try {
    console.log(
      `Sending message to queue ${queueUrl}. Item: ${item}`,
    );
    const sendMessageCommand = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(item),
    });

    sqsClient.send(sendMessageCommand)
      .then(data => {
        console.log(`Message sent with status code ${data.$metadata.httpStatusCode}`);
      })
      .catch(err => {
        console.error(err);
      });
  } catch (e: unknown) {
    console.error('Error sending Message: ', e);
    throw e;
  }
};