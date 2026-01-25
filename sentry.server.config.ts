// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://1c9e2140c73730014f5942bc693a49b5@o4510759702233088.ingest.de.sentry.io/4510759718879312",

  integrations:[
    Sentry.vercelAIIntegration({
      recordInputs: true, // Whether to record AI inputs
      recordOutputs: true, // Whether to record AI outputs
    }),
    Sentry.consoleLoggingIntegration({levels:["log","info","warn","error","debug"]}),
  ],
  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
 sendDefaultPii: true,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
