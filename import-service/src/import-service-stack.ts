import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as s3notifications from 'aws-cdk-lib/aws-s3-notifications';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const catalogProductsQueue = sqs.Queue.fromQueueArn(
      this,
      "CatalogProductsQueue",
      "arn:aws:sqs:eu-west-1:664326670415:catalog-products-queue"
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
        allowMethods: ["*"],
        allowCredentials: true
      }
    });

    api.addGatewayResponse("GatewayResponse4XX", {
      type: apigw.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        "Access-Control-Allow-Origin": "'*'",
        "Access-Control-Allow-Headers":
          "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "Access-Control-Allow-Methods": "'OPTIONS,GET,PUT'"
      },
    });

    const basicAuth = lambda.Function.fromFunctionArn(this, 'basicAuthLambda',
      "arn:aws:lambda:eu-west-1:664326670415:function:basicAuthorizer");

    const assumedAuthRole = new Role(this, "basicAuthRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
    });
    assumedAuthRole.addToPolicy(
      new PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        resources: [basicAuth.functionArn],
      }),
    );

    const reqAuthorizer = new apigw.RequestAuthorizer(this, 'ImportRequestAuthorizer', {
      handler: basicAuth,
      identitySources: [apigw.IdentitySource.header('Authorization')],
      assumeRole: assumedAuthRole
    });

    const importResource = api.root.addResource('import');
    importResource.addMethod("GET", new apigw.LambdaIntegration(importProductsFile), 
      {
        requestParameters: { 
          "method.request.querystring.name": true,
          "method.request.header.Authorization": true
        },
        authorizationType: apigw.AuthorizationType.CUSTOM,
        authorizer: reqAuthorizer
      });

    new cdk.CfnOutput(this, 'importApiUrl: ', {value: api.url});
  }
}