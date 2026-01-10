import express from "express";
import { postController } from "./post.controller";
import auth, { UserRole } from "../../middleware/auth";

const router = express.Router();

router.get("/", postController.getAllPost);

router.get("/stats",auth(UserRole.Admin), postController.getStats);

router.get("/my-posts", auth(UserRole.User, UserRole.Admin), postController.getMyPosts);

router.get("/:postId", postController.getPostById);

router.post("/", auth(UserRole.User, UserRole.Admin), postController.createPost);

router.patch("/:postId", auth(UserRole.User, UserRole.Admin), postController.updatePost)

router.delete("/:postId", auth(UserRole.User, UserRole.Admin), postController.deletePost)

export const postRouter = router;