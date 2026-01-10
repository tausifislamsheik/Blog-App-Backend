import express from "express";
import { commentControllers } from "./comment.controller";
import auth, { UserRole } from "../../middleware/auth";


const router = express.Router();

router.get("/author/:authorId", commentControllers.getCommentByAuthorId);

router.get("/:commentId", commentControllers.getCommentById);

router.post("/", auth(UserRole.User, UserRole.Admin), commentControllers.createComment);

router.delete("/:commentId", auth(UserRole.User, UserRole.Admin), commentControllers.deleteComment);

router.patch("/:commentId", auth(UserRole.User, UserRole.Admin), commentControllers.updateComment);

router.patch("/moderate/:commentId", auth(UserRole.Admin), commentControllers.moderateComment);


export const commentRouter = router;