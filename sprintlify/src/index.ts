import { Hono } from "hono";
import { AppContext } from "./types/AppContext";
import { dbAuthMiddleware } from "./middleware/dbAuthMiddleware";
import authRouter from "./route/authRoute";
import { apiRoute } from "./constant/constant_url";
import projectRouter from "./route/projectRoute";
import projectMemberRouter from "./route/projectMemberRoute";
import { userAuthMiddleware } from "./middleware/userAuthMiddleware";
import ticketRouter from "./route/ticketRoute";
import ticketCommentRouter from "./route/ticketCommentRoute";
import userRouter from "./route/userRoute";
import ticketHistoryRouter from "./route/ticketHistoryRoute";
import sprintRouter from "./route/sprintRoute";
import backlogRouter from "./route/backlogRoute";

const app = new Hono<AppContext>();

app.use("*", dbAuthMiddleware());
app.use("*", userAuthMiddleware);

app.route(apiRoute.auth, authRouter);
app.route(apiRoute.projects, projectRouter);
app.route(apiRoute.projectMembers, projectMemberRouter);
app.route(apiRoute.tickets, ticketRouter);
app.route(apiRoute.ticketComments, ticketCommentRouter);
app.route(apiRoute.ticketHistory, ticketHistoryRouter);
app.route(apiRoute.sprints, sprintRouter);
app.route(apiRoute.backlog, backlogRouter);
app.route(apiRoute.users, userRouter);

app.notFound((c) => {
  return c.json({ message: "Route not found" }, 404);
});

app.onError((err, c) => {
  console.error(`[ERROR] ${err.message}`, err.stack);
  return c.json({ message: "Internal server error" }, 500);
});

export default app;
