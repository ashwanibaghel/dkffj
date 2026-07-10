"use server";

import prisma from "@/lib/prisma";
import { verifyAdmin } from "../auth";
import { revalidatePath } from "next/cache";

export async function getLeaders() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) throw new Error("Unauthorized");

  return prisma.teamMember.findMany({
    orderBy: {
      id: "asc"
    }
  });
}

export async function addLeader(payload: {
  id: string;
  name: string;
  role: string;
  education: string;
  location: string;
  mobile: string;
  photo?: string;
  status: number;
  showHome: number;
  description?: string;
}) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  if (!payload.id || !payload.name || !payload.role) {
    return { success: false, error: "ID, Name, and Role are required" };
  }

  try {
    const leader = await prisma.teamMember.create({
      data: {
        id: payload.id,
        name: payload.name,
        role: payload.role,
        education: payload.education || "",
        location: payload.location || "",
        mobile: payload.mobile || "",
        photo: payload.photo || "",
        status: payload.status !== undefined ? payload.status : 1,
        showHome: payload.showHome !== undefined ? payload.showHome : 1,
        description: payload.description || ""
      }
    });

    revalidatePath("/");
    revalidatePath("/team");
    return { success: true, leader };
  } catch (error: unknown) {
    console.error("Error adding leader:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create leader" };
  }
}

export async function updateLeader(
  id: string,
  payload: {
    name?: string;
    role?: string;
    education?: string;
    location?: string;
    mobile?: string;
    photo?: string;
    status?: number;
    showHome?: number;
    description?: string;
  }
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  try {
    const leader = await prisma.teamMember.update({
      where: { id },
      data: {
        ...(payload.name !== undefined && { name: payload.name }),
        ...(payload.role !== undefined && { role: payload.role }),
        ...(payload.education !== undefined && { education: payload.education }),
        ...(payload.location !== undefined && { location: payload.location }),
        ...(payload.mobile !== undefined && { mobile: payload.mobile }),
        ...(payload.photo !== undefined && { photo: payload.photo }),
        ...(payload.status !== undefined && { status: payload.status }),
        ...(payload.showHome !== undefined && { showHome: payload.showHome }),
        ...(payload.description !== undefined && { description: payload.description })
      }
    });

    revalidatePath("/");
    revalidatePath("/team");
    return { success: true, leader };
  } catch (error: unknown) {
    console.error("Error updating leader:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update leader" };
  }
}

export async function deleteLeader(id: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { success: false, error: "Unauthorized access" };

  try {
    await prisma.teamMember.delete({
      where: { id }
    });

    revalidatePath("/");
    revalidatePath("/team");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting leader:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete leader" };
  }
}
