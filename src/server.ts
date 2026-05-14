import cors from "@fastify/cors";
import Fastify from "fastify";
import { marketRoutes } from "./modules/market/interface/http/routes";

export async function buildServer() {
  const fastify = Fastify({
    logger: true
  });

  await fastify.register(cors, {
    origin: true
  });

  await fastify.register(marketRoutes, {
    prefix: "/api"
  });

  return fastify;
}
