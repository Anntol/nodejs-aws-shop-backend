import {Callback, APIGatewayRequestAuthorizerEvent, Context, APIGatewayAuthorizerResult} from "aws-lambda";

const login = process.env.LOGIN;
const password = process.env.PASSWORD;

const unauthorized = "Unauthorized";
const allowEffect = "Allow";
const denyEffect = "Deny";

export const handler = async (event: APIGatewayRequestAuthorizerEvent, context: Context, callback: Callback) => {
    try {
        console.log('Event: ', event);
        console.log('Context: ', context);
        const token = event!.headers!.Authorization;

        if (!token) {
            callback(unauthorized);
            return;
        }

        const [, encodedCredentials] = token.split(' ');
        const buff = Buffer.from(encodedCredentials, 'base64');
        const [tokenName, tokenPwd] = buff.toString('utf-8').split(':');
        console.log('username', tokenName);

        if (!login || tokenName !== login || !password || tokenPwd !== password) {
            callback(null, generatePolicy(encodedCredentials, denyEffect, event.methodArn));
            return;
        }

        callback(null, generatePolicy(encodedCredentials, allowEffect, event.methodArn));
    } catch (e: unknown) {
        console.error(e);
        callback(unauthorized);
    }
};

const generatePolicy = (principalId: string, effect: string, resource: string): APIGatewayAuthorizerResult => {
    return {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource,
                }
            ]
        }
    }
};
