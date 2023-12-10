import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as s3notifications from 'aws-cdk-lib/aws-s3-notifications';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const catalogProductsQueue = sqs.Queue.fromQueueArn(
      this,
      "CatalogProductsQueue",
      "arn:aws:sqs:eu-west-1:664326670415:catalog-products-queue.fifo"
    );

    const bucket = new s3.Bucket(this, 'ImportBucket', {
      bucketName: 'anntol-be-cdk23',
      autoDeleteObjects: true,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.GET,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'],
        },
      ],
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const lambdaProps: Partial<NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_18_X
    };

    const importProductsFile = new NodejsFunction (this, "ImportProductsFileLambda", {
      ...lambdaProps,
      functionName: "importProductsFile",
      entry: "src/handlers/importProductsFile.ts"
    });
    bucket.grantReadWrite(importProductsFile);

    const importFileParser = new NodejsFunction (this, "ImportFileParserLambda", {
      ...lambdaProps,
      functionName: "importFileParser",
      entry: "src/handlers/importFileParser.ts",
      environment: {
        SQS_URL: catalogProductsQueue.queueUrl
      }
    });
    catalogProductsQueue.grantSendMessages(importFileParser);
    bucket.grantReadWrite(importFileParser);
    bucket.grantDelete(importFileParser);
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3notifications.LambdaDestination(importFileParser),
      {
        prefix: 'uploaded',
      }
    );

    const api = new apigw.RestApi(this, "ImportApi", {
      defaultCorsPreflightOptions: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: ["*"]
      }
    });

    const importResource = api.root.addResource('import');
    importResource.addMethod("GET", new apigw.LambdaIntegration(importProductsFile), 
      {requestParameters: { "method.request.querystring.name": true } })

    new cdk.CfnOutput(this, 'apiUrl', {value: api.url});

  }
}