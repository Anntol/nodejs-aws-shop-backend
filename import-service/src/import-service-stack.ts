import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaProps: Partial<NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_18_X
    }

    const importProductsFile = new NodejsFunction (this, "ImportProductsFileLambda", {
      ...lambdaProps,
      functionName: "importProductsFile",
      entry: "src/handlers/importProductsFile.ts"
    });

    const api = new apigw.RestApi(this, "ProductApi", {
      defaultCorsPreflightOptions: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: ["*"]
      }
    });

    const importResource = api.root.addResource('import');
    importResource.addMethod("GET", new apigw.LambdaIntegration(importProductsFile));

    new cdk.CfnOutput(this, 'apiUrl', {value: api.url});

  }
}