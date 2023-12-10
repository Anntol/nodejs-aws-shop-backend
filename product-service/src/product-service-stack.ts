import * as cdk from "aws-cdk-lib";
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from "constructs";
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction, NodejsFunctionProps } from "aws-cdk-lib/aws-lambda-nodejs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

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
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        PRODUCTS_TABLE: productsTable.tableName,
        STOCKS_TABLE: stocksTable.tableName,
      },
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
    productsTable.grantReadData(getProductsById);
    stocksTable.grantReadData(getProductsById);

    const createProduct = new NodejsFunction (this, "CreateProductLambda", {
      ...lambdaProps,
      functionName: "createProduct",
      entry: "src/handlers/createProduct.ts"
    });
    productsTable.grantWriteData(createProduct);
    stocksTable.grantWriteData(createProduct);

    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue',
      {
        queueName: 'catalog-products-queue.fifo',
        fifo: true
      }
    );

    const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
      topicName: 'create-product-topic',
    });
    new sns.Subscription(this, 'CreateProductEmailSubscription', {
      endpoint: 'test@email.com',
      protocol: sns.SubscriptionProtocol.EMAIL,
      topic: createProductTopic
    });

    const catalogBatchProcess = new NodejsFunction(this, 'CatalogBatchProcessLambda',
      {
        ...lambdaProps,
        functionName: 'catalogBatchProcess',
        entry: 'src/handlers/catalogBatchProcess.ts',
        environment: {
          SNS_TOPIC: createProductTopic.topicArn
        }
      },
    );

    catalogBatchProcess.addEventSource(
      new SqsEventSource(catalogItemsQueue, {
        batchSize: 5,
      })
    );
    createProductTopic.grantPublish(catalogBatchProcess);
    productsTable.grantWriteData(catalogBatchProcess);
    stocksTable.grantWriteData(catalogBatchProcess);

    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET", new apigw.LambdaIntegration(getProductsList));
    productsResource.addMethod("POST", new apigw.LambdaIntegration(createProduct));

    const productResource = productsResource.addResource("{productId}");
    productResource.addMethod("GET", new apigw.LambdaIntegration(getProductsById));

    new cdk.CfnOutput(this, "apiUrl", {value: api.url});
  }
}
