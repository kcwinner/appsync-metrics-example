import * as https from "https";
import { URL } from "url";

interface Event {
  RequestType: "Create" | "Update" | "Delete";
  LogicalResourceId: string;
  PhysicalResourceId: string;
  ResourceProperties: { [_: string]: any };
  OldResourceProperties: { [_: string]: any };
  ResourceType: string;
  RequestId: string;
  StackId: string;
}

const getTodoQuery = `query GetTodo($params: QueryGetTodoParamsInput!) {
  getTodo(params: $params) {
    id
    userId
    title
  }
}`;

export const handler = async (event: Event) => {
  console.log(event);

  if (event.RequestType !== "Create") {
    return {
      PhysicalResourceId: event.PhysicalResourceId,
    };
  }

  const url = new URL(process.env.GRAPHQL_URL ?? "");

  const result = await fetch(
    {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "POST",
      headers: {
        "X-API-KEY": process.env.API_KEY,
      },
    },
    JSON.stringify({
      query: getTodoQuery,
      variables: { params: { id: "abc" } },
    })
  );

  console.log("## GOT RESULT ##");
  console.log(result);

  await sleep(10000);

  return {
    PhysicalResourceId: event.PhysicalResourceId,
  };
};

async function fetch(options: any, body: any) {
  console.log("## FETCHING:", options);
  return new Promise((resolve, reject) => {
    const request = https.request(options, (resp) => {
      let data = "";

      resp.on("data", (chunk) => {
        data += chunk;
      });

      resp.on("end", () => {
        resolve(data);
      });
    });

    request.on("error", (err) => {
      reject(err);
    });

    if (body) {
      request.write(body);
    }

    request.end();
  });
}

async function sleep(millis: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, millis);
  });
}
