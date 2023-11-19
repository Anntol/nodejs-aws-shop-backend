import * as cdk from "aws-cdk-lib";
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaProps: Partial<NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_18_X
    }

    const getProductList = new NodejsFunction (this, "GetProductListLambda", {
      ...lambdaProps,
      functionName: "getProductList",
      entry: "src/handlers/getProductList.ts"
    });

    const api = new apigw.RestApi(this, "ProductApi", {
      defaultCorsPreflightOptions: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: ["*"]
      }
    });

    const productsResource = api.root.addResource('products');
    productsResource.addMethod("GET", new apigw.LambdaIntegration(getProductList));

    new cdk.CfnOutput(this, 'apiUrl', {value: api.url});
  }
}
