import { Hono } from "hono";
import { AppContext } from "../types/AppContext";
import { userAuthMiddleware } from "../middleware/userAuthMiddleware";
import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware";
import * as userController from "../controller/userController";

const userRouter = new Hono<AppContext>();

// admin only
userRouter.get("/admin", adminAuthMiddleware, userController.getUsers);

// any authenticated user
userRouter.get("/profile", userController.getCurrentUser);
userRouter.patch("/profile", userController.updateCurrentUser);

export default userRouter;
