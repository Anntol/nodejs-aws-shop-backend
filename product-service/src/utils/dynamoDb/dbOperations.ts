import { DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, GetCommandOutput, ScanCommand, ScanCommandOutput } from '@aws-sdk/lib-dynamodb';
import { IProduct } from '../interfaces/IProduct';
import { IStock } from '../interfaces/IStock';
import { IAvailableProduct } from '../interfaces/IAvailableProduct';

interface IDBScanOutput<T> extends Omit<ScanCommandOutput, 'Items'> {
    Items?: T[];
}

interface IDBGetOutput<T> extends Omit<GetCommandOutput, 'Item'> {
    Item?: T;
}

const ProductsTable = "Products";
const StocksTable = "Stocks";
    
const dbClient = new DynamoDBClient();
const dbDocClient = DynamoDBDocumentClient.from(dbClient);
export const getProductsList = async (): Promise<IAvailableProduct[]> => {
    const { Items: productItems } = (await dbDocClient.send(
        new ScanCommand({
            TableName: ProductsTable,
        })
    )) as IDBScanOutput<IProduct>;
  
    const { Items: stockItems } = (await dbDocClient.send(
        new ScanCommand({
            TableName: StocksTable,
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
            TableName: ProductsTable,
            Key: { id }
        })
    )) as IDBGetOutput<IProduct>;
    if (!productItem) return null;

    const { Item: stockItem } = (await dbDocClient.send(
        new GetCommand({
            TableName: StocksTable,
            Key:  { 'product_id': id }
        })
    )) as IDBGetOutput<IStock>;
    
    return {
        ...productItem,
        count: stockItem?.count ?? 0
    };

  }

  dbDocClient.destroy();
  dbClient.destroy();