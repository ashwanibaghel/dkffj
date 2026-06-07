"use server";

import prisma from "@/lib/prisma";
import { verifyAdmin } from "../auth";
import { revalidatePath } from "next/cache";

export async function getBanners() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  return prisma.banner.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function addBanner(payload: { imageUrl: string; title?: string; subtitle?: string; linkUrl?: string; isActive?: boolean }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  if (!payload.imageUrl) return { success: false, error: "Image URL is required" };

  try {
    const banner = await prisma.banner.create({
      data: {
        imageUrl: payload.imageUrl,
        title: payload.title || "",
        subtitle: payload.subtitle || "",
        linkUrl: payload.linkUrl || "",
        isActive: payload.isActive !== undefined ? payload.isActive : true
      }
    });

    revalidatePath("/");
    return { success: true, banner };
  } catch (error: any) {
    console.error("Error adding banner:", error);
    return { success: false, error: error.message || "Failed to create banner" };
  }
}

export async function updateBanner(id: string, payload: { imageUrl?: string; title?: string; subtitle?: string; linkUrl?: string; isActive?: boolean }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  try {
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        ...(payload.imageUrl !== undefined && { imageUrl: payload.imageUrl }),
        ...(payload.title !== undefined && { title: payload.title }),
        ...(payload.subtitle !== undefined && { subtitle: payload.subtitle }),
        ...(payload.linkUrl !== undefined && { linkUrl: payload.linkUrl }),
        ...(payload.isActive !== undefined && { isActive: payload.isActive })
      }
    });

    revalidatePath("/");
    return { success: true, banner };
  } catch (error: any) {
    console.error("Error updating banner:", error);
    return { success: false, error: error.message || "Failed to update banner" };
  }
}

export async function deleteBanner(id: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  try {
    await prisma.banner.delete({
      where: { id }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting banner:", error);
    return { success: false, error: error.message || "Failed to delete banner" };
  }
}
