import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import HandleBars from "handlebars";
import { Realtime } from "@inngest/realtime";
import { httpRequestChannel } from "@/inngest/channels/http-request";
type httpRequestData = {
  variableName: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
};
HandleBars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  const safeString = new HandleBars.SafeString(stringified);
  return safeString;
});
export const httpRequestExecutor: NodeExecutor<httpRequestData> = async ({
  nodeId,
  data,
  context,
  step,
  publish,
}) => {
  await publish(
    httpRequestChannel().status({
      nodeId,
      status: "loading",
    })
  );
  if (!data.endpoint) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(
      `Endpoint is required for HTTP Request node: ${nodeId}`
    );
  }
  if (!data.variableName) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError(
      `VaraibleName is required for HTTP Request node: ${nodeId}`
    );
  }
  if (!data.method) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "loading",
      })
    );
    throw new NonRetriableError(
      `Method is required for HTTP Request node: ${nodeId}`
    );
  }
  try {
    const result = await step.run(`http-request`, async () => {
      const endpoint = HandleBars.compile(data.endpoint)(context);
      const method = data.method;
      const options: KyOptions = {
        method,
      };
      if (["POST", "PUT", "PATCH"].includes(method)) {
        const resloved = HandleBars.compile(data.body || "")(context);
        JSON.parse(resloved);
        options.body = data.body;
        options.headers = {
          "Content-Type": "application/json",
        };
      }
      const response = await ky(endpoint, options);
      const contentType = response.headers.get("content-type");
      const responseData = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();
      const responsePlayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      };

      return {
        ...context,
        [data.variableName]: responsePlayload,
      };
    });
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "success",
      })
    );
    return result;
  } catch (error) {
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
