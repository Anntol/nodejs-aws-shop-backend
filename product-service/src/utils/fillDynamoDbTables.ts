import {
    DynamoDBClient,
    BatchWriteItemCommand,
  } from '@aws-sdk/client-dynamodb';
  import products from "../data/products.json";
  import stocks from "../data/stocks.json";
  
  interface IDynamoDBItem {
    [key: string]: { S: string } | { N: string };
  }
  
  const dbClient = new DynamoDBClient({});
  
  const fillTable = async <T extends Record<string, any>>(
    dbClient: DynamoDBClient,
    tableName: string,
    items: T[],
    keyField: keyof T & string
  ): Promise<void> => {
    try {
      await dbClient.send(
        new BatchWriteItemCommand({
          RequestItems: {
            [tableName]: items.map((item) => {
              const dynamoDBItem: IDynamoDBItem = {
                [keyField]: { S: String(item[keyField]) },
              };
  
              Object.entries(item).forEach(([key, value]) => {
                if (key !== keyField) {
                  dynamoDBItem[key] =
                    typeof value === 'number'
                      ? { N: String(value) }
                      : { S: String(value) };
                }
              });
  
              return {
                PutRequest: {
                  Item: dynamoDBItem,
                },
              };
            }),
          },
        })
      );
      console.log(`Table ${tableName} filled with data`);
    } catch (error) {
      console.error(`Error seeding DynamoDB table ${tableName}`, error);
    }
  };
  
  (async () => {
    await fillTable(dbClient, "Products", products, 'id');
    await fillTable(dbClient, "Stocks", stocks, 'product_id');
  })();
