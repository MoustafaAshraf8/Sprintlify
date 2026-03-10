import { Hono } from "hono";
import { AppContext } from "./types/AppContext";
import { dbAuthMiddleware } from "./middleware/dbAuthMiddleware";
import authRouter from "./route/authRoute";
import { apiRoute } from "./constant/constant_url";

const app = new Hono<AppContext>();

app.use("*", dbAuthMiddleware());

app.route(apiRoute.auth, authRouter);

export default app;
