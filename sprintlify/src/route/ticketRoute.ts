import { Hono } from "hono";
import { AppContext } from "../types/AppContext";
import { userAuthMiddleware } from "../middleware/userAuthMiddleware";
import * as ticketController from "../controller/ticketController";

const ticketRouter = new Hono<AppContext>();

ticketRouter.get("/", ticketController.getTickets);
ticketRouter.get("/:ticketId", ticketController.getTicketById);
ticketRouter.post("/", ticketController.createTicket);
ticketRouter.patch("/:ticketId", ticketController.updateTicket);
ticketRouter.delete("/:ticketId", ticketController.deleteTicket);

export default ticketRouter;
