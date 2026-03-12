import { Hono } from "hono";
import { AppContext } from "../types/AppContext";
import * as ticketCommentController from "../controller/ticketCommentController";

const ticketCommentRouter = new Hono<AppContext>();

ticketCommentRouter.get("/", ticketCommentController.getTicketComments);
ticketCommentRouter.post("/", ticketCommentController.createTicketComment);
ticketCommentRouter.delete(
  "/:commentId",
  ticketCommentController.deleteTicketComment,
);

export default ticketCommentRouter;
