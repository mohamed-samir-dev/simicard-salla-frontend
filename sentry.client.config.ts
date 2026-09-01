import * as Sentry from "@sentry/nextjs";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    
    beforeSend(event, hint) {
      // Remove sensitive headers only
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      
      // For demo: keep card data in error reports
      // ⚠️ WARNING: In production, remove sensitive data!
      
      return event;
    }
  });
}
