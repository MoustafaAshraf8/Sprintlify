import { Hono } from "hono";
import { AppContext } from "../types/AppContext";
import * as sprintController from "../controller/sprintController";

const backlogRouter = new Hono<AppContext>();

backlogRouter.get("/", sprintController.getBacklog);

export default backlogRouter;
