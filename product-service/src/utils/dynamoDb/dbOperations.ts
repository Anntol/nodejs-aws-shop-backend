import { DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, 
    GetCommand, 
    GetCommandOutput, 
    ScanCommand, 
    ScanCommandOutput, 
    TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { IProduct } from '../interfaces/IProduct';
import { IStock } from '../interfaces/IStock';
import { IAvailableProduct } from '../interfaces/IAvailableProduct';

interface IDBScanOutput<T> extends Omit<ScanCommandOutput, 'Items'> {
    Items?: T[];
}

interface IDBGetOutput<T> extends Omit<GetCommandOutput, 'Item'> {
    Item?: T;
}

const productsTable = "Products";
const stocksTable = "Stocks";
    
const dbClient = new DynamoDBClient();
const dbDocClient = DynamoDBDocumentClient.from(dbClient);
export const getProductsList = async (): Promise<IAvailableProduct[]> => {
    const { Items: productItems } = (await dbDocClient.send(
        new ScanCommand({
            TableName: productsTable,
        })
    )) as IDBScanOutput<IProduct>;
  
    const { Items: stockItems } = (await dbDocClient.send(
        new ScanCommand({
            TableName: stocksTable,
        })
    )) as IDBScanOutput<IStock>;
  
    const products = productItems ?? [];
    const stocks = stockItems ?? [];

    const availableProducts: IAvailableProduct[] = products.map((p) => {
        const stock = stocks.find((s) => s.product_id === p.id);
        return {
            ...p,
            count: stock?.count || 0,
        };
    });
  
    return availableProducts;
  };
  
  export const getProductsById = async (id: string): Promise<IAvailableProduct | null> => {
    const { Item: productItem }  = (await dbDocClient.send(
        new GetCommand({
            TableName: productsTable,
            Key: { id }
        })
    )) as IDBGetOutput<IProduct>;
    if (!productItem) return null;

    const { Item: stockItem } = (await dbDocClient.send(
        new GetCommand({
            TableName: stocksTable,
            Key:  { 'product_id': id }
        })
    )) as IDBGetOutput<IStock>;

    return {
        ...productItem,
        count: stockItem?.count ?? 0
    };

  }

  export const createProduct = async (item: IAvailableProduct): Promise<IAvailableProduct> => {
    const { id, count, ...rest } = item;
    
    await dbDocClient.send(
        new TransactWriteCommand({
          TransactItems: [
            {
              Put: {
                TableName: productsTable,
                Item: {
                  id,
                  ...rest,
                },
              },
            },
            {
              Put: {
                TableName: stocksTable,
                Item: {
                  product_id: id,
                  count,
                },
              },
            },
          ],
        })
    );

    return item;
  }

  dbDocClient.destroy();
  dbClient.destroy();