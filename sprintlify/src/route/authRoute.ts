import { Hono } from "hono";
import { AppContext } from "../types/AppContext";
import { userAuthMiddleware } from "../middleware/userAuthMiddleware";
import * as authController from "../controller/authController";
import { apiRoute } from "../constant/constant_url";

const authRouter = new Hono<AppContext>();

authRouter.post(apiRoute.register, authController.register);
authRouter.post(apiRoute.login, authController.login);
authRouter.post(apiRoute.refresh, authController.refresh);
authRouter.get(apiRoute.authenticate, authController.authenticate);

authRouter.post(apiRoute.logout, userAuthMiddleware, authController.logout);
export default authRouter;
