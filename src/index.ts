import cors from "cors";
import express, { Response } from "express";
import { sseMiddleware } from "express-sse-middleware";

const app = express();

app.use(express.json());
app.use((_, res, next) => {
  res.set("Access-Control-Allow-Private-Network", "true");
  next();
});
app.use(sseMiddleware);

app.use(
  cors({
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

let clients: { res: Response }[] = [];

app.listen(5100, () => {
  console.log("Server is running on http://localhost:5100");
});

app.post("/comments", (req, res) => {
  const comment = req.body;
  clients.forEach((client) =>
    client.res.write(`data: ${JSON.stringify(comment)}\n\n`)
  );
  res.status(204).end();
});

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.push({ res });

  req.on("close", () => {
    clients = clients.filter((client) => client.res !== res);
  });
});
