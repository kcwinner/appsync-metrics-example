import { App } from "@aws-cdk/core";

import { AppSyncMetricsExampleStack } from "./lib/appsync-metrics-example";

const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new AppSyncMetricsExampleStack(app, "appsync-metrics-example", { env: devEnv });

app.synth();
