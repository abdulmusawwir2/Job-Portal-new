// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node"
import { nodeProfilingIntegration } from "@sentry/profiling-node";


// Initialize Sentry
Sentry.init({
  dsn: "https://80c0be4b41893b5a47312053366289d2@o4508992758153216.ingest.us.sentry.io/4508992761561088",
    integrations: [
        nodeProfilingIntegration(),
        Sentry.mongooseIntegration()],
//   tracesSampleRate: 1.0, // Capture 100% of the transactions
});

// Manually start the profiler
Sentry.profiler.startProfiler();

// Start a transaction with profiling
Sentry.startSpan({ name: "My First Transaction" }, () => {
  // The code inside this function will be profiled
  
});

// Stop the profiler (optional, as it stops on process exit)
Sentry.profiler.stopProfiler();
