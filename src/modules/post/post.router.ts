import express from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.get("/", postController.getAllPost);

router.get("/:postId", postController.getPostById);

router.post("/", auth(UserRole.User), postController.createPost);

export const postRouter = router;