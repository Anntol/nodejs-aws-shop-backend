import * as cdk from 'aws-cdk-lib';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

require('dotenv').config();

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaProps: Partial<NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_18_X
    }

    const basicAuthorizerLambda = new NodejsFunction (this, "BasicAuthorizerLambda", {
      ...lambdaProps,
      functionName: "basicAuthorizer",
      entry: "src/handlers/basicAuthorizer.ts",
      environment: {
        LOGIN: process.env.LOGIN ?? "",
        PASSWORD: process.env.PASSWORD ?? ""
      }
    });

    new cdk.CfnOutput(this, "basicAuthorizerLambda", {value: basicAuthorizerLambda.functionArn});
  }
}
