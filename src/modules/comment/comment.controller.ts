import { Request, Response } from "express";
import { commentServices } from "./comment.service";
import { error } from "node:console";

// Comment Create Section

const createComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    req.body.authorId = user?.id;
    const result = await commentServices.createComment(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      error: "Comment creation failed",
      details: error,
    });
  }
};

// Comment Get By Id Section

const getCommentById = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const result = await commentServices.getCommentById(commentId as string);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: "Comment fetch failed",
      details: error,
    });
  }
};

// Comment Get By AuthorId Section

const getCommentByAuthorId = async (req: Request, res: Response) => {
  try {
    const { authorId } = req.params;
    const result = await commentServices.getCommentByAuthorId(
      authorId as string
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      error: "Comment fetch by authorId failed",
      details: err,
    });
  }
};

// Comment Delete Section

const deleteComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { commentId } = req.params;
    const result = await commentServices.deleteComment(
      commentId as string,
      user?.id as string
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      error: "Comment delete failed",
      details: err,
    });
  }
};

// Comment Update Section

const updateComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { authorId } = req.params;
    const result = await commentServices.updateComment(
      authorId as string,
      req.body,
      user?.id as string
    );
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json({
      error: "Comment update failed",
      details: err,
    });
  }
};

// Comment Moderate Section

const moderateComment = async (req: Request, res: Response) => {
  try {
    const {commentId} = req.params;
    const result = await commentServices.moderateComment(commentId as string, req.body);
    res.status(200).json(result);
  } catch (err) {
    const errorMessage = (err instanceof Error) ? err.message : "Comment moderate failed"
    res.status(400).json({
      error: errorMessage,
      details: err,
    });
  }
};

export const commentControllers = {
  createComment,
  getCommentById,
  getCommentByAuthorId,
  deleteComment,
  updateComment,
  moderateComment
};
