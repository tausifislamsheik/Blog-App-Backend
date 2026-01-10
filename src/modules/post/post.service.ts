import { Post, PostStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

// Post Create Section

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

// All Post Get Section

const getAllPost = async ({
  search,
  tags,
  isFeatured,
  status,
  authorId,
  page,
  limit,
  skip,
  sortBy,
  sortOrder,
}: {
  search: string | undefined;
  tags: string[] | [];
  isFeatured: boolean | undefined;
  status: PostStatus | undefined;
  authorId: string;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const andConditions: PostWhereInput[] = [];

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

  if (typeof isFeatured === "boolean") {
    andConditions.push({
      isFeatured,
    });
  }

  if (status) {
    andConditions.push({
      status,
    });
  }

  if (authorId) {
    andConditions.push({
      authorId,
    });
  }

  const allPost = await prisma.post.findMany({
    take: limit,
    skip,
    where: {
      AND: andConditions,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });

  const total = await prisma.post.count({
    where: {
      AND: andConditions,
    },
  });
  return {
    data: allPost,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Post Get By Id Section

const getPostById = async (postId: string) => {
  return await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const result = await tx.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        comments: {
          where: {
            parentId: null,
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            replies: {
              orderBy: {
                createdAt: "asc",
              },
              include: {
                replies: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });
    return result;
  });
};

// Get My Posts Section

const getMyPosts = async (authorId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: authorId,
      status: "Active",
    },
    select: {
      id: true,
    },
  });
  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });

  // const total = await prisma.post.aggregate({
  //   _count: {
  //     id: true
  //   },
  //   where: {
  //     authorId
  //   }
  // })
  return result;
};

// Post Update Section

const updatePost = async (
  postId: string,
  data: Partial<Post>,
  authorId: string,
  isAdmin: boolean
) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("You are not the owner/creator of this post");
  }

  if (!isAdmin) {
    delete data.isFeatured;
  }

  return await prisma.post.update({
    where: {
      id: postId,
    },
    data,
  });
};

// Post Delete Section

const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });

  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("You are not the owner/creator of this post");
  }

  return await prisma.post.delete({
    where: {
      id: postId
    }
  })
};


// Post Statistics Section

const getStats = async () =>{
  return await prisma.$transaction(async (tx) =>{
    const [totalPosts, publishedPosts, draftPosts, archivedPosts, totalComments, totalViews, totalUsers, adminCount, userCount] = await Promise.all([
           await tx.post.count(),
           await tx.post.count({where: {status: PostStatus.Published}}),
           await tx.post.count({where: {status: PostStatus.Draft}}),
           await tx.post.count({where: {status: PostStatus.Archived}}),
           await tx.comment.count(),
           await tx.post.aggregate({_sum: {views: true}}),
           await tx.user.count(),
           await tx.user.count({where: {role: "Admin"}}),
           await tx.user.count({where: {role: "User"}})

    ])
    return {
      totalPosts,
      publishedPosts,
      draftPosts,
      archivedPosts,
      totalComments,
      totalViews: totalViews._sum.views,
      totalUsers,
      adminCount,
      userCount
    }
  })
}




export const postServices = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  updatePost,
  deletePost,
  getStats
};
