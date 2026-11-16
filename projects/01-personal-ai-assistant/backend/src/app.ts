import cors from "cors";
import express from "express";
import { sendApiError } from "./api-response.js";
import { errorHandler } from "./middleware/error-handler.js";
import { apiRouter } from "./routes/api.js";

const defaultAllowedOrigins = ["http://localhost:5173"];
const allowedOrigins = (process.env.CORS_ORIGIN ?? defaultAllowedOrigins.join(","))
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, Boolean(origin && allowedOrigins.includes(origin)));
    },
  }),
);
app.use(express.json({ limit: "100kb" }));
app.use("/api", apiRouter);

app.use((_req, res) => {
  sendApiError(res, 404, "Route not found.");
});

app.use(errorHandler);
