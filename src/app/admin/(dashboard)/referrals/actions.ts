"use server";

import prisma from "@/lib/prisma";
import { verifyAdmin } from "../auth";

export interface ReferrerStats {
  id: string;
  name: string;
  membershipNo: string;
  
  // Membership Referrals Breakdown
  membershipTotal: number;
  membershipApproved: number;
  membershipPending: number;
  
  // Appreciation Referrals Breakdown
  appreciationTotal: number;
  appreciationApproved: number;
  appreciationPending: number;
  
  // Combined Totals
  totalReferred: number;
  totalApproved: number;
}

export interface ReferredMemberDetail {
  id: string;
  name: string;
  ackNo: string;
  membershipNo: string | null;
  createdAt: string;
  status: string;
  type: "MEMBERSHIP";
}

export interface ReferredAppreciationDetail {
  id: string;
  name: string;
  applicationNo: string;
  socialWorkField: string;
  createdAt: string;
  status: string;
  type: "APPRECIATION";
}

export async function getReferralStats() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return {
      totalMembershipReferred: 0,
      totalAppreciationReferred: 0,
      totalCombinedReferred: 0,
      uniqueReferrers: 0
    };
  }

  const [
    totalMembershipReferred,
    totalAppreciationReferred,
    membershipReferrers,
    appreciationReferrers
  ] = await Promise.all([
    prisma.memberships.count({
      where: { referred_by_member_id: { not: null } }
    }),
    prisma.appreciation_applications.count({
      where: { referred_by_member_id: { not: null } }
    }),
    prisma.memberships.groupBy({
      by: ["referred_by_member_id"],
      where: { referred_by_member_id: { not: null } }
    }),
    prisma.appreciation_applications.groupBy({
      by: ["referred_by_member_id"],
      where: { referred_by_member_id: { not: null } }
    })
  ]);

  // Merge unique referrer IDs from both tables
  const referrerSet = new Set<string>();
  membershipReferrers.forEach((r) => { if (r.referred_by_member_id) referrerSet.add(r.referred_by_member_id); });
  appreciationReferrers.forEach((r) => { if (r.referred_by_member_id) referrerSet.add(r.referred_by_member_id); });

  return {
    totalMembershipReferred,
    totalAppreciationReferred,
    totalCombinedReferred: totalMembershipReferred + totalAppreciationReferred,
    uniqueReferrers: referrerSet.size
  };
}

export async function getReferrerList(): Promise<ReferrerStats[]> {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return [];

  // Query all memberships that have referred either members or appreciation applications
  const referrers = await prisma.memberships.findMany({
    where: {
      OR: [
        { referred_members: { some: {} } },
        { referred_appreciation_applications: { some: {} } }
      ]
    },
    select: {
      id: true,
      full_name: true,
      membership_no: true,
      referred_members: {
        select: {
          status: true
        }
      },
      referred_appreciation_applications: {
        select: {
          status: true
        }
      }
    }
  });

  return referrers.map((ref) => {
    // Membership stats
    const membershipTotal = ref.referred_members.length;
    const membershipApproved = ref.referred_members.filter((m) => m.status === "APPROVED").length;
    const membershipPending = ref.referred_members.filter((m) => m.status === "PENDING" || m.status === "UNDER_REVIEW").length;

    // Appreciation stats
    const appreciationTotal = ref.referred_appreciation_applications.length;
    const appreciationApproved = ref.referred_appreciation_applications.filter((a) => a.status === "APPROVED").length;
    const appreciationPending = ref.referred_appreciation_applications.filter((a) => a.status === "PENDING").length;

    // Combined totals
    const totalReferred = membershipTotal + appreciationTotal;
    const totalApproved = membershipApproved + appreciationApproved;

    return {
      id: ref.id,
      name: ref.full_name,
      membershipNo: ref.membership_no || "Awaiting ID",
      membershipTotal,
      membershipApproved,
      membershipPending,
      appreciationTotal,
      appreciationApproved,
      appreciationPending,
      totalReferred,
      totalApproved
    };
  }).sort((a, b) => b.totalReferred - a.totalReferred); // Highest referrers on top
}

export async function getReferrerDetails(referrerId: string): Promise<{
  memberships: ReferredMemberDetail[];
  appreciations: ReferredAppreciationDetail[];
}> {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return { memberships: [], appreciations: [] };

  const [members, appreciations] = await Promise.all([
    prisma.memberships.findMany({
      where: { referred_by_member_id: referrerId },
      select: {
        id: true,
        full_name: true,
        ack_no: true,
        membership_no: true,
        created_at: true,
        status: true
      },
      orderBy: { created_at: "desc" }
    }),
    prisma.appreciation_applications.findMany({
      where: { referred_by_member_id: referrerId },
      select: {
        id: true,
        full_name: true,
        application_no: true,
        social_work_field: true,
        created_at: true,
        status: true
      },
      orderBy: { created_at: "desc" }
    })
  ]);

  const membershipList: ReferredMemberDetail[] = members.map((m) => ({
    id: m.id,
    name: m.full_name,
    ackNo: m.ack_no,
    membershipNo: m.membership_no,
    createdAt: m.created_at.toISOString(),
    status: m.status,
    type: "MEMBERSHIP"
  }));

  const appreciationList: ReferredAppreciationDetail[] = appreciations.map((a) => ({
    id: a.id,
    name: a.full_name,
    applicationNo: a.application_no,
    socialWorkField: a.social_work_field,
    createdAt: a.created_at.toISOString(),
    status: a.status,
    type: "APPRECIATION"
  }));

  return {
    memberships: membershipList,
    appreciations: appreciationList
  };
}
