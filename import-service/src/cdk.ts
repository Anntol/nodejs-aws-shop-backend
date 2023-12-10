import * as cdk from "aws-cdk-lib";
import { ImportServiceStack } from "./import-service-stack.js";

const app = new cdk.App();
new ImportServiceStack(app, "ImportServiceStack", {});