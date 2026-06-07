"use server";

import prisma from "@/lib/prisma";
import { verifyAdmin } from "../auth";
import { revalidatePath } from "next/cache";

export async function getDocuments() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  return prisma.documents.findMany({
    orderBy: {
      created_at: "desc"
    }
  });
}

export async function addDocument(payload: {
  title: string;
  url: string;
  size: string;
  category: string;
}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  if (!payload.title || !payload.url || !payload.category) {
    return { success: false, error: "Title, URL, and Category are required" };
  }

  try {
    const doc = await prisma.documents.create({
      data: {
        title: payload.title,
        file_url: payload.url,
        file_size: payload.size || "PDF | 100 KB",
        category: payload.category,
        is_active: true
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
    await prisma.documents.delete({
      where: { id }
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return { success: false, error: error.message || "Failed to delete document" };
  }
}
