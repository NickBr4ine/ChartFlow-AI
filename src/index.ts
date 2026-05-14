import { buildServer } from "./server";

const port = Number(process.env.PORT ?? 3333);
const host = process.env.HOST ?? "0.0.0.0";

const server = await buildServer();

await server.listen({ port, host });
