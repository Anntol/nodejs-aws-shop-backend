import * as cdk from 'aws-cdk-lib';
import { AuthorizationServiceStack } from './authorization-service-stack';

const app = new cdk.App();
new AuthorizationServiceStack(app, 'AuthorizationServiceStack', {});