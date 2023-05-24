// @ts-check
import express from "express";
import { readFileSync } from "fs";
import { join } from "path";
import serveStatic from "serve-static";
import { CustomError } from "./backend/lib/customError.js";
import shopify from "./backend/lib/shopify.js";
import router from "./backend/routes/index.js";
import testRoutes from "./backend/routes/test-routes.js";
import webhooks from "./backend/webhooks/index.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "8000", 10);

const STATIC_PATH = process.env.NODE_ENV === "production" ? `${process.cwd()}/frontend/dist` : `${process.cwd()}/frontend/`;

const app = express();
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

if (process.env.NODE_ENV === "development") {
  console.warn("WARNING: Running in development mode. Do not use this in production.");
  app.use("/api/test", testRoutes);
}

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(shopify.config.auth.callbackPath, shopify.auth.callback(), shopify.redirectToShopifyOrAppRoot());
app.post(shopify.config.webhooks.path, shopify.processWebhooks({ webhookHandlers: webhooks }));

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.use("/api", router);

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

//@ts-expect-error
app.use((err, _req, res, _next) => {
  if (err instanceof CustomError) {
    console.error({ route: _req.url, err: err.logMessage });
    return res.status(err.status).send(err.userMessage);
  }
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`> Ready on http://localhost:${PORT}`);
});
