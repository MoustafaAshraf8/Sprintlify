import { Hono } from "hono";
import { AppContext } from "../types/AppContext";
import * as ticketHistoryController from "../controller/ticketHistoryController";

const ticketHistoryRouter = new Hono<AppContext>();

ticketHistoryRouter.get("/history", ticketHistoryController.getTicketHistory);
ticketHistoryRouter.get("/state", ticketHistoryController.getTicketState);

export default ticketHistoryRouter;
