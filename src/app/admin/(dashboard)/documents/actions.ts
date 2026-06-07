"use server";

import prisma from "@/lib/prisma";
import { verifyAdmin } from "../auth";
import { revalidatePath } from "next/cache";

export async function getDocuments() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  return prisma.document.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function addDocument(payload: {
  title: string;
  url: string;
  size: string;
  category: string;
  iconType: string;
}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  if (!payload.title || !payload.url || !payload.category || !payload.iconType) {
    return { success: false, error: "Title, URL, Category, and Icon Type are required" };
  }

  try {
    const doc = await prisma.document.create({
      data: {
        title: payload.title,
        url: payload.url,
        size: payload.size || "PDF | 100 KB",
        category: payload.category,
        iconType: payload.iconType
      }
    });

    revalidatePath("/");
    return { success: true, doc };
  } catch (error: any) {
    console.error("Error adding document:", error);
    return { success: false, error: error.message || "Failed to create document" };
  }
}

export async function deleteDocument(id: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  try {
    await prisma.document.delete({
      where: { id }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return { success: false, error: error.message || "Failed to delete document" };
  }
}
