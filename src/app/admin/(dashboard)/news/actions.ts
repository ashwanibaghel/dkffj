"use server";

import prisma from "@/lib/prisma";
import { verifyAdmin } from "../auth";
import { revalidatePath } from "next/cache";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
    + "-" + Math.random().toString(36).substring(2, 7);
}

export async function getNews() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  return prisma.news.findMany({
    orderBy: {
      created_at: "desc"
    }
  });
}

export async function addNews(payload: {
  title: string;
  content: string;
  category: string;
  status?: string;
}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  if (!payload.title || !payload.content || !payload.category) {
    return { success: false, error: "Title, Content, and Category are required" };
  }

  try {
    const news = await prisma.news.create({
      data: {
        title: payload.title,
        content: payload.content,
        category: payload.category,
        slug: slugify(payload.title),
        is_published: payload.status === "Published",
        image_url: ""
      }
    });

    revalidatePath("/");
    return { success: true, news };
  } catch (error: any) {
    console.error("Error adding news:", error);
    return { success: false, error: error.message || "Failed to create news" };
  }
}

export async function updateNews(
  id: string,
  payload: {
    title?: string;
    content?: string;
    category?: string;
    status?: string;
  }
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  try {
    const news = await prisma.news.update({
      where: { id },
      data: {
        ...(payload.title !== undefined && { title: payload.title, slug: slugify(payload.title) }),
        ...(payload.content !== undefined && { content: payload.content }),
        ...(payload.category !== undefined && { category: payload.category }),
        ...(payload.status !== undefined && { is_published: payload.status === "Published" })
      }
    });

    revalidatePath("/");
    return { success: true, news };
  } catch (error: any) {
    console.error("Error updating news:", error);
    return { success: false, error: error.message || "Failed to update news" };
  }
}

export async function deleteNews(id: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  try {
    await prisma.news.delete({
      where: { id }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting news:", error);
    return { success: false, error: error.message || "Failed to delete news" };
  }
}
