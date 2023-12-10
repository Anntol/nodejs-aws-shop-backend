import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import { StatusCodes } from 'http-status-codes';

const sqsClient = new SQSClient();

interface IRow {
  [key: string]: string | number | boolean;
}

export const sendMessageBatch = async (
  queueUrl: string,
  items: IRow[],
): Promise<boolean> => {
  console.log(
    `Sending batch message to queue ${queueUrl}`,
  );
  const queueResult = await sqsClient.send(
    new SendMessageBatchCommand({
      QueueUrl: queueUrl,
      Entries: items.map((item, index) => {
        return {
          Id: index.toString(),
          MessageBody: JSON.stringify(item),
        };
      }),
    }),
  );

  const code = queueResult.$metadata.httpStatusCode;
  if (code !== StatusCodes.OK) {
    console.error(queueResult.$metadata.httpStatusCode);
    return false;
  } else {
    console.log(`Message sent with status code ${code}`);
    return true;
  };
};