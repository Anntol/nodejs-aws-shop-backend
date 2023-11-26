import * as cdk from "aws-cdk-lib";
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from "aws-cdk-lib/aws-lambda";
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = TableV2.fromTableName(this, 'ProductsTable', 'Products');
    const stocksTable = TableV2.fromTableName(this, 'StocksTable', 'Stocks');

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
    productsTable.grantReadData(getProductsList);
    stocksTable.grantReadData(getProductsList);
    
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
