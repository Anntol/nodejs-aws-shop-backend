import {
    SNSClient,
    PublishCommand,
    MessageAttributeValue,
} from '@aws-sdk/client-sns';

const client = new SNSClient();

export async function sendToSNS(
    TopicArn: string,
    Message: string,
    Subject: string,
    MessageAttributes: Record<string, MessageAttributeValue> = {}
  ) {
    const payload = {
      TopicArn,
      Message,
      Subject,
      MessageAttributes,
    };
    const command = new PublishCommand(payload);
    return await client.send(command);
}
