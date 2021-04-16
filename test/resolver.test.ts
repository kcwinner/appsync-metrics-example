import * as fs from "fs";
import * as https from "https";

const getTodoQuery = `query GetTodo($params: QueryGetTodoParamsInput!) {
  getTodo(params: $params) {
    id
    userId
    title
  }
}`;

test("Fail To Get", async () => {
  const outputs = getOutputs();

  // @ts-ignore
  const url = new URL(outputs.url);

  const result = await fetch(
    {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "POST",
      headers: {
        "X-API-KEY": outputs.apiKey,
      },
    },
    JSON.stringify({
      query: getTodoQuery,
      variables: { params: { id: "abc" } },
    })
  );

  console.log(result);
});

function getOutputs() {
  const stackOutputs = JSON.parse(
    fs.readFileSync(`${__dirname}/../.stack-outputs.json`, "utf-8")
  );

  /*eslint-disable @typescript-eslint/no-explicit-any */
  const outputs = (stackOutputs as any)["appsync-metrics-example"];
  return {
    url: outputs.appsyncGraphQLEndpointOutput,
    apiKey: outputs.apikey,
  };
}

async function fetch(options: any, body: any) {
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
      console.log(body);
      request.write(body);
    }

    request.end();
  });
}
