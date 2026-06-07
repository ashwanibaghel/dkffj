"use server";

import prisma from "@/lib/prisma";
import { verifyAdmin } from "../auth";
import { revalidatePath } from "next/cache";

export async function getNews() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  return prisma.news.findMany({
    orderBy: {
      publishedAt: "desc"
    }
  });
}

export async function addNews(payload: {
  title: string;
  content: string;
  category: string;
  status?: string;
  publishedAt?: Date;
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
        status: payload.status || "Published",
        publishedAt: payload.publishedAt || new Date()
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
    publishedAt?: Date;
  }
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  try {
    const news = await prisma.news.update({
      where: { id },
      data: {
        ...(payload.title !== undefined && { title: payload.title }),
        ...(payload.content !== undefined && { content: payload.content }),
        ...(payload.category !== undefined && { category: payload.category }),
        ...(payload.status !== undefined && { status: payload.status }),
        ...(payload.publishedAt !== undefined && { publishedAt: payload.publishedAt })
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
