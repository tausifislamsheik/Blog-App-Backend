import { CommentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

// Comment Create Section

const createComment = async (payload: {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
}) => {
  await prisma.post.findUniqueOrThrow({
    where: {
      id: payload.postId,
    },
  });

  if (payload.parentId) {
    await prisma.comment.findUniqueOrThrow({
      where: {
        id: payload.parentId,
      },
    });
  }

  return await prisma.comment.create({
    data: payload,
  });
};

// Comment Get By Id Section

const getCommentById = async (commentId: string) => {
  return await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          views: true,
        },
      },
    },
  });
};

// Comment Get By AuthorId Section

const getCommentByAuthorId = async (authorId: string) => {
  return await prisma.comment.findMany({
    where: {
      authorId,
    },
  });
};

// Comment Delete Section

const deleteComment = async (commentId: string, authorId: string) => {
  const commentData = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
    },
    select: {
      id: true,
    },
  });

  if (!commentData) {
    throw new Error("Your provided input is invalid");
  }

  return await prisma.comment.delete({
    where: {
      id: commentData.id,
    },
  });
};

// Comment Update Section

const updateComment = async (
  commentId: string,
  data: { content?: string; status?: CommentStatus },
  authorId: string
) => {
  const commentData = await prisma.comment.findFirst({
    where: {
      id: commentId,
      authorId,
    },
    select: {
      id: true,
    },
  });

  if (!commentData) {
    throw new Error("Your provided input is invalid");
  }

  return await prisma.comment.update({
    where: {
      id: commentData.id,
      authorId,
    },
    data,
  });
};

// Comment Moderate Section

const moderateComment = async (id: string, data: { status: CommentStatus }) => {
  const commentData = await prisma.comment.findUniqueOrThrow({
    where: {
      id,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (commentData.status === data.status) {
    throw new Error(
      `Your provided status (${commentData.status}) is already up to date`
    );
  }

  return await prisma.comment.update({
    where: {
      id,
    },
    data,
  });
};

export const commentServices = {
  createComment,
  getCommentById,
  getCommentByAuthorId,
  deleteComment,
  updateComment,
  moderateComment,
};
