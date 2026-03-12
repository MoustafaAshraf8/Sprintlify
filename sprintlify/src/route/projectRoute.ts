// route/projectRoute.ts
import { Hono } from "hono";
import { AppContext } from "../types/AppContext";
import { userAuthMiddleware } from "../middleware/userAuthMiddleware";
import * as projectController from "../controller/projectController";

const projectRouter = new Hono<AppContext>();

projectRouter.get("/", projectController.getProjects);
projectRouter.get("/:projectId", projectController.getProjectById);
projectRouter.post("/", projectController.createProject);
projectRouter.patch("/:projectId", projectController.updateProject);
projectRouter.delete("/:projectId", projectController.deleteProject);

export default projectRouter;
``;
