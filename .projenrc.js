const { AwsCdkTypeScriptApp } = require('projen');
const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.95.2',
  defaultReleaseBranch: 'main',
  name: 'openid',

  cdkDependencies: [
    '@aws-cdk/aws-lambda-nodejs',
    '@aws-cdk/aws-iam',
  ], /* Which AWS CDK modules (those that start with "@aws-cdk/") this app uses. */
  deps: [
    '@softchef/cdk-restapi',
    'esbuild',
    'jsonwebtoken',
    '@aws-sdk/client-ssm',
    'jwt-decode',
    'pem-jwk',
  ], /* Runtime dependencies of this module. */
  // description: undefined,      /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: [
    '@types/jsonwebtoken',
    '@types/pem-jwk',
  ], /* Build dependencies for this module. */
  // packageName: undefined,      /* The "name" in package.json. */
  // release: undefined,          /* Add release management to this project. */
  tsconfig: {
    compilerOptions: {
      lib: [
        'ES2020',
        'DOM',
      ],
      noUnusedLocals: false,
    },
    include: [
      'lambda-assets/**/*.ts',
    ],
  },
  buildWorkflow: false,
});
project.synth();