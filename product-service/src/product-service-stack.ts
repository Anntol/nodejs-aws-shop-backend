import * as cdk from "aws-cdk-lib";
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigw.RestApi(this, "ProductApi", {
      defaultCorsPreflightOptions: {
        allowHeaders: ["*"],
        allowOrigins: ["*"],
        allowMethods: ["*"]
      }
    });

    const lambdaProps: Partial<NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_18_X
    }

    const getProductsList = new NodejsFunction (this, "GetProductsListLambda", {
      ...lambdaProps,
      functionName: "getProductsList",
      entry: "src/handlers/getProductsList.ts"
    });

    const getProductsById = new NodejsFunction (this, "GetProductsByIdLambda", {
      ...lambdaProps,
      functionName: "getProductsById",
      entry: "src/handlers/getProductsById.ts"
    });

    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET", new apigw.LambdaIntegration(getProductsList));

    const productResource = productsResource.addResource("{productId}");
    productResource.addMethod("GET", new apigw.LambdaIntegration(getProductsById));

    new cdk.CfnOutput(this, "apiUrl", {value: api.url});
  }
}
