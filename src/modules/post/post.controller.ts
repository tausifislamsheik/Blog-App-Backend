import { Request, Response } from "express";
import { postServices } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { UserRole } from "../../middleware/auth";

// Post Create Section

const createPost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        error: "Unauthorized",
      });
    }
    const result = await postServices.createPost(req.body, user.id as string);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      error: "Post creation failed",
      details: error,
    });
  }
};

// All Post Get Section

const getAllPost = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const searchString = typeof search === "string" ? search : undefined;
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
        ? false
        : undefined
      : undefined;
    const status = req.query.status as PostStatus | undefined;
    const authorId = req.query.authorId as string;
    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query
    );

    const result = await postServices.getAllPost({
      search: searchString,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      error: "Post get failed",
      details: err,
    });
  }
};

// Post Get By Id Section

const getPostById = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const result = await postServices.getPostById(postId as string);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      error: "Post fetch by id failed",
      details: err,
    });
  }
};

// Get My Posts Section

const getMyPosts = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("You are unauthorized");
    }
    console.log(user);
    const result = await postServices.getMyPosts(user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({
      error: "Post fetch failed",
      details: err,
    });
  }
};

// Post Update Section

const updatePost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if(!user){
      throw new Error("You are unauthorized")
    }
    const { postId } = req.params;
    const isAdmin = user.role === UserRole.Admin 
    const result = await postServices.updatePost(
      postId as string,
      req.body,
      user.id as string,
      isAdmin
    );
    res.status(200).json(result);
  } catch (err) {
    console.log(err)
    res.status(400).json({
      error: "Post update failed",
      details: err,
    });
  }
};


// Post Delete Section

const deletePost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if(!user){
      throw new Error("You are unauthorized")
    }
    const { postId } = req.params;
    const isAdmin = user.role === UserRole.Admin 
    const result = await postServices.deletePost(
      postId as string,
      user.id as string,
      isAdmin
    );
    res.status(200).json(result);
  } catch (err) {
    console.log(err)
    res.status(400).json({
      error: "Post delete failed",
      details: err,
    });
  }
};


// Post Statistics Section

const getStats = async (req: Request, res: Response) => {
  try { 
    const result = await postServices.getStats();
    res.status(200).json(result);
  } catch (err) {
    console.log(err)
    res.status(400).json({
      error: "Stats fetch failed",
      details: err,
    });
  }
};





export const postController = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  getStats
};
