import * as path from "path";

import {
  Construct,
  CfnOutput,
  CustomResource,
  Duration,
  Stack,
  StackProps,
} from "@aws-cdk/core";

import { Provider } from "@aws-cdk/custom-resources";

import { AuthorizationType, FieldLogLevel } from "@aws-cdk/aws-appsync";
import { Runtime } from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { LogGroup, MetricFilter } from "@aws-cdk/aws-logs";

import { AppSyncTransformer } from "cdk-appsync-transformer";

export class AppSyncMetricsExampleStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const appsyncTransformer = new AppSyncTransformer(this, "example-api", {
      schemaPath: "schema.graphql",
      fieldLogLevel: FieldLogLevel.ALL,
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
        },
        additionalAuthorizationModes: [
          {
            authorizationType: AuthorizationType.IAM,
          },
        ],
      },
    });

    const httpResourceHandler = this.createHttpCustomResource(
      appsyncTransformer
    );
    httpResourceHandler.node.addDependency(appsyncTransformer.appsyncAPI);

    const resourceProvider = new Provider(this, "http-provider", {
      onEventHandler: httpResourceHandler,
    });

    const resource = new CustomResource(this, "CustomResource", {
      serviceToken: resourceProvider.serviceToken,
    });

    const appsyncLogGroup = LogGroup.fromLogGroupName(
      this,
      "AppSyncLogGroup",
      `/aws/appsync/apis/${appsyncTransformer.appsyncAPI.apiId}`
    );

    const resolverFilter = new MetricFilter(this, "AppSyncFailedHTTPResolver", {
      filterPattern: {
        logPatternString:
          '{ ($.logType = "ResponseMapping") && ($.context.result.statusCode != 2* && $.context.result.statusCode != 3*) }',
      },
      metricValue: "1",
      logGroup: appsyncLogGroup,
      metricName: "AppSyncFailedHTTPResolver",
      metricNamespace: this.stackName,
      defaultValue: 0,
    });

    resolverFilter.node.addDependency(httpResourceHandler);
    resolverFilter.node.addDependency(resource);

    if (appsyncTransformer.appsyncAPI.apiKey) {
      new CfnOutput(this, "apikey", {
        value: appsyncTransformer.appsyncAPI.apiKey,
      });
    }

    new CfnOutput(this, "appsync-arn", {
      value: appsyncTransformer.appsyncAPI.arn,
    });
  }

  private createHttpCustomResource(appsyncTransformer: AppSyncTransformer) {
    return new NodejsFunction(this, "http-resource", {
      handler: "handler",
      runtime: Runtime.NODEJS_12_X,
      entry: path.join(__dirname, "custom-resource", "index.ts"),
      timeout: Duration.minutes(3),
      environment: {
        GRAPHQL_URL: appsyncTransformer.appsyncAPI.graphqlUrl,
        API_KEY: appsyncTransformer.appsyncAPI.apiKey ?? "",
      },
    });
  }
}
