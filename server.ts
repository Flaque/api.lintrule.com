import { serve } from "https://deno.land/std@0.180.0/http/server.ts";
import { handleCheck } from "./lib/handlers/check.ts";
import { handleLogin } from "./lib/handlers/login.ts";

const port = 8080;

const INDEX_ROUTE = new URLPattern({ pathname: "/" });
const LOGIN_ROUTE = new URLPattern({ pathname: "/login" });
const CHECK_ROUTE = new URLPattern({ pathname: "/check" });

const handler = async (request: Request): Promise<Response> => {
  try {
    if (INDEX_ROUTE.test(request.url) && request.method === "GET") {
      return new Response("so fast!!", { status: 200 });
    }

    if (LOGIN_ROUTE.test(request.url) && request.method === "POST") {
      return await handleLogin(request);
    }
    if (CHECK_ROUTE.test(request.url) && request.method === "POST") {
      return await handleCheck(request);
    }

    return new Response("Not found", { status: 404 });
  } catch (err) {
    console.error(err);
    return new Response("Oh no!", { status: 500 });
  }
};

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`);
await serve(handler, { port });
