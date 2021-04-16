const { AwsCdkTypeScriptApp } = require("projen");

const project = new AwsCdkTypeScriptApp({
  name: "appsync-metrics-example",
  defaultReleaseBranch: "main",
  jsiiFqn: "projen.AwsCdkTypeScriptApp",
  cdkVersion: "1.95.2",
  cdkDependencies: [
    "@aws-cdk/aws-iam",
    "@aws-cdk/aws-lambda",
    "@aws-cdk/aws-lambda-nodejs",
    "@aws-cdk/aws-logs",
    "@aws-cdk/custom-resources",
  ],

  devDeps: ["@types/deep-diff", "cdk-appsync-transformer", "esbuild"],

  buildWorkflow: false,
  releaseWorkflow: false,
  mergify: false,
  dependabot: false,
  pullRequestTemplate: false,
  gitignore: [".stack-outputs.json", "appsync/"],

  eslint: false,

  context: {
    "@aws-cdk/core:enableStackNameDuplicates": true,
    "@aws-cdk/core:newStyleStackSynthesis": true,
  },
});

project.tasks.addTask("deploy", {
  exec: "npx cdk deploy -O .stack-outputs.json",
});

project.synth();
