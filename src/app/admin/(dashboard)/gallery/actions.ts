"use server";

import prisma from "@/lib/prisma";
import { verifyAdmin } from "../auth";
import { revalidatePath } from "next/cache";

// ── Photo Gallery Actions ──

export async function getGalleryItems() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  return prisma.galleryItem.findMany({
    orderBy: {
      created_at: "desc"
    }
  });
}

export async function addGalleryItem(payload: { imageUrl: string; title?: string; isActive?: boolean }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  if (!payload.imageUrl.trim()) return { success: false, error: "Image URL is required" };

  try {
    const item = await prisma.galleryItem.create({
      data: {
        imageUrl: payload.imageUrl,
        title: payload.title || "",
        isActive: payload.isActive !== undefined ? payload.isActive : true
      }
    });

    revalidatePath("/gallery");
    return { success: true, item };
  } catch (error: unknown) {
    console.error("Error adding gallery item:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to add photo" };
  }
}

export async function deleteGalleryItem(id: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  try {
    await prisma.galleryItem.delete({
      where: { id }
    });

    revalidatePath("/gallery");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting gallery item:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete photo" };
  }
}

// ── Video Library Actions ──

export async function getVideoItems() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  return prisma.videoItem.findMany({
    orderBy: {
      created_at: "desc"
    }
  });
}

export async function addVideoItem(payload: { youtubeId: string; title: string; duration: string; date: string; isActive?: boolean }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  if (!payload.youtubeId.trim() || !payload.title.trim()) {
    return { success: false, error: "YouTube ID and Title are required" };
  }

  try {
    const item = await prisma.videoItem.create({
      data: {
        youtubeId: payload.youtubeId,
        title: payload.title,
        duration: payload.duration || "10:00",
        date: payload.date || new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }),
        isActive: payload.isActive !== undefined ? payload.isActive : true
      }
    });

    revalidatePath("/gallery");
    return { success: true, item };
  } catch (error: unknown) {
    console.error("Error adding video item:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to add video" };
  }
}

export async function deleteVideoItem(id: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  try {
    await prisma.videoItem.delete({
      where: { id }
    });

    revalidatePath("/gallery");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting video item:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete video" };
  }
}
