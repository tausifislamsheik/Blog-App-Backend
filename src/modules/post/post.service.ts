import { Post, PostStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
  return result;
};

const getAllPost = async ({
  search,
  tags,
  isFeatured,
  status,
  page,
  limit,
  skip,
  sortBy,
  sortOrder
}: {
  search: string | undefined,
  tags: string[] | [],
  isFeatured: boolean | undefined,
  status: PostStatus | undefined,
  page: number,
  limit: number,
  skip: number,
  sortBy: string | undefined,
  sortOrder: string | undefined
}) => {
  const andConditions:PostWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search as string,
          },
        },
      ],
    });
  }

  if (tags.length > 0) {
    andConditions.push({
      tags: {
        hasEvery: tags,
      },
    });
  }

  if(typeof isFeatured === 'boolean'){
    andConditions.push({
        isFeatured
    })
  }

  if(status){
    andConditions.push({
        status
    })
  }

  const allPost = await prisma.post.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions
    },
    orderBy:sortBy && sortOrder ? {
      [sortBy]: sortOrder
    } : {createdAt: "desc"}
  });
  return allPost;
};

export const postServices = {
  createPost,
  getAllPost,
};
