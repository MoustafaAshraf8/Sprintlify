import { Hono } from "hono";
import { AppContext } from "../types/AppContext";
import * as sprintController from "../controller/sprintController";

const sprintRouter = new Hono<AppContext>();

sprintRouter.get("/", sprintController.getSprints);
sprintRouter.get("/active", sprintController.getActiveSprint);
sprintRouter.get("/:sprintId", sprintController.getSprintById);
sprintRouter.post("/", sprintController.createSprint);
sprintRouter.patch("/:sprintId", sprintController.updateSprint);
sprintRouter.delete("/:sprintId", sprintController.deleteSprint);

sprintRouter.patch("/:sprintId/start", sprintController.startSprint);
sprintRouter.patch("/:sprintId/complete", sprintController.completeSprint);

sprintRouter.post("/:sprintId/tickets", sprintController.addTicketToSprint);
sprintRouter.delete(
  "/:sprintId/tickets/:ticketId",
  sprintController.removeTicketFromSprint,
);

export default sprintRouter;
