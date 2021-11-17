import path from 'path';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import { App, Construct, Stack, StackProps } from '@aws-cdk/core';
import { RestApi, HttpMethod } from '@softchef/cdk-restapi';

const LAMBDA_ASSETS_PATH = path.resolve( __dirname, './lambda-assets' );
export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    // define resources here...
    new RestApi(this, 'OpenIdApi', {
      resources: [
        {
          path: '/oauth2/token',
          httpMethod: HttpMethod.POST,
          lambdaFunction: this.createOauthTokenLambda(),
        },
        {
          path: '/oauth2/authorize',
          httpMethod: HttpMethod.GET,
          lambdaFunction: new lambda.NodejsFunction(this, 'OpenIdAuthorize', {
            entry: `${LAMBDA_ASSETS_PATH}/oauth2/authorize.ts`,
          }),
        },
        {
          path: '/oauth2/userInfo',
          httpMethod: HttpMethod.GET,
          lambdaFunction: new lambda.NodejsFunction(this, 'OpenIdUserInfo', {
            entry: `${LAMBDA_ASSETS_PATH}/oauth2/user-info.ts`,
          }),
        },
        {
          path: '/.well-known/jwks.json',
          httpMethod: HttpMethod.GET,
          lambdaFunction: this.createJwksLambda(),
        },
        {
          path: '/.well-known/openid-configuration',
          httpMethod: HttpMethod.GET,
          lambdaFunction: new lambda.NodejsFunction(this, 'OpenIdConfiguration', {
            entry: `${LAMBDA_ASSETS_PATH}/.well-known/openid-configuration.ts`,
          }),
        },
      ],
      enableCors: true,
    });
  }

  private createOauthTokenLambda(): lambda.NodejsFunction {
    // Deploy lambda function
    const oauth2TokenLambda = new lambda.NodejsFunction(this, 'TwitterOpenIdToken', {
      entry: `${LAMBDA_ASSETS_PATH}/oauth2/token.ts`,
      bundling: {
        nodeModules: [
          '@aws-sdk/client-ssm',
          'jsonwebtoken',
          'url',
        ],
      },
    });

    // Assign necessary role policy for permission
    oauth2TokenLambda.role?.attachInlinePolicy(
      new iam.Policy(this, 'AccessSSMFromToken', {
        statements: [
          new iam.PolicyStatement({
            actions: [
              'ssm:GetParameter',
            ],
            resources: [
              '<SSM Arn>',
            ],
          }),
        ],
      }),
    );

    return oauth2TokenLambda;
  }

  private createJwksLambda(): lambda.NodejsFunction {
    const jwksLambda = new lambda.NodejsFunction(this, 'TwitterOpenIdJwks', {
      entry: `${LAMBDA_ASSETS_PATH}/.well-known/jwks.ts`,
      bundling: {
        nodeModules: [
          'pem-jwk',
          '@aws-sdk/client-ssm',
        ],
      },
    });

    // Assign necessary role policy for permission
    jwksLambda.role?.attachInlinePolicy(
      new iam.Policy(this, 'AccessSSMFromToken', {
        statements: [
          new iam.PolicyStatement({
            actions: [
              'ssm:GetParameter',
            ],
            resources: [
              '<SSM Arn>',
            ],
          }),
        ],
      }),
    );

    return jwksLambda;
  }

}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();