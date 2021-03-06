import "@aws-cdk/assert/jest";
import { App } from "@aws-cdk/core";
import { AppSyncMetricsExampleStack } from "../src/lib/appsync-metrics-example";

test("Snapshot", () => {
  const app = new App();
  const stack = new AppSyncMetricsExampleStack(app, "test");

  expect(stack).not.toHaveResource("AWS::S3::Bucket");
  expect(
    app.synth().getStackArtifact(stack.artifactId).template
  ).toMatchSnapshot();
});
