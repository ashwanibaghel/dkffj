"use server";

import prisma from "@/lib/prisma";
import { verifyAdmin } from "../auth";

export interface ReferrerStats {
  id: string;
  name: string;
  membershipNo: string;
  totalReferred: number;
  approvedCount: number;
  pendingCount: number;
}

export interface ReferredMemberDetail {
  id: string;
  name: string;
  ackNo: string;
  membershipNo: string | null;
  createdAt: string;
  status: string;
}

export async function getReferralStats() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { totalReferred: 0, totalDirect: 0, uniqueReferrers: 0 };

  const [totalReferred, totalDirect, uniqueReferrersData] = await Promise.all([
    // Total Referred (has referrer)
    prisma.memberships.count({
      where: {
        referred_by_member_id: { not: null }
      }
    }),
    // Total Direct (has no referrer)
    prisma.memberships.count({
      where: {
        referred_by_member_id: null
      }
    }),
    // Unique referrers
    prisma.memberships.groupBy({
      by: ["referred_by_member_id"],
      where: {
        referred_by_member_id: { not: null }
      }
    })
  ]);

  return {
    totalReferred,
    totalDirect,
    uniqueReferrers: uniqueReferrersData.length
  };
}

export async function getReferrerList(): Promise<ReferrerStats[]> {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return [];

  // Query all memberships that have referred members
  const referrers = await prisma.memberships.findMany({
    where: {
      referred_members: {
        some: {}
      }
    },
    select: {
      id: true,
      full_name: true,
      membership_no: true,
      referred_members: {
        select: {
          status: true
        }
      }
    }
  });

  return referrers.map((ref) => {
    const totalReferred = ref.referred_members.length;
    const approvedCount = ref.referred_members.filter((m) => m.status === "APPROVED").length;
    const pendingCount = ref.referred_members.filter((m) => m.status === "PENDING" || m.status === "UNDER_REVIEW").length;

    return {
      id: ref.id,
      name: ref.full_name,
      membershipNo: ref.membership_no || "Awaiting ID",
      totalReferred,
      approvedCount,
      pendingCount
    };
  });
}

export async function getReferredMembersDetail(referrerId: string): Promise<ReferredMemberDetail[]> {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return [];

  const members = await prisma.memberships.findMany({
    where: {
      referred_by_member_id: referrerId
    },
    select: {
      id: true,
      full_name: true,
      ack_no: true,
      membership_no: true,
      created_at: true,
      status: true
    },
    orderBy: {
      created_at: "desc"
    }
  });

  return members.map((m) => ({
    id: m.id,
    name: m.full_name,
    ackNo: m.ack_no,
    membershipNo: m.membership_no,
    createdAt: m.created_at.toISOString(),
    status: m.status
  }));
}
