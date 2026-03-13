import { Hono } from "hono";
import { AppContext } from "../types/AppContext";
import { userAuthMiddleware } from "../middleware/userAuthMiddleware";
import * as projectMemberController from "../controller/projectMemberController";

const projectMemberRouter = new Hono<AppContext>();

projectMemberRouter.get("/", projectMemberController.getProjectMembers);
projectMemberRouter.post("/", projectMemberController.addProjectMember);
projectMemberRouter.delete(
  "/:unwantedId",
  projectMemberController.removeProjectMember,
);

export default projectMemberRouter;
