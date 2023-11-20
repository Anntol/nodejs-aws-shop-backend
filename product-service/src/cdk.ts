import * as cdk from "aws-cdk-lib";
import { ProductServiceStack } from "./product-service-stack.js";

const app = new cdk.App();
new ProductServiceStack(app, "ProductServiceStack", {});
