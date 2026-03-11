import { Hono } from "hono";
import { AppContext } from "./types/AppContext";
import { dbAuthMiddleware } from "./middleware/dbAuthMiddleware";
import authRouter from "./route/authRoute";
import { apiRoute } from "./constant/constant_url";
import projectRouter from "./route/projectRoute";
import projectMemberRouter from "./route/projectMemberRoute";
import { userAuthMiddleware } from "./middleware/userAuthMiddleware";

const app = new Hono<AppContext>();

app.use("*", dbAuthMiddleware());
app.use("*", userAuthMiddleware);

app.route(apiRoute.auth, authRouter);
app.route(apiRoute.projects, projectRouter);
app.route(apiRoute.projectMembers, projectMemberRouter);

export default app;
