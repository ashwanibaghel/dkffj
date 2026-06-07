import prisma from "@/lib/prisma";
import { teamMembers as staticMembers } from "@/lib/teamData";
import TeamRegistryClient, { TeamMember } from "./TeamRegistryClient";

export const dynamic = "force-dynamic";

export default async function TeamRegistryPage() {
  let dbMembers: TeamMember[] = [];
  
  try {
    const rawMembers = await prisma.teamMember.findMany({
      orderBy: {
        id: "asc",
      },
    });
    
    dbMembers = rawMembers.map((m: any) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      education: m.education,
      location: m.location,
      mobile: m.mobile,
      photo: m.photo,
      status: m.status,
      showHome: m.showHome,
    }));
  } catch (error) {
    console.error("Failed to query team members from database, falling back to static teamData.ts:", error);
  }

  // Fallback if database query failed or returned no results
  const teamMembersList = dbMembers.length > 0 ? dbMembers : staticMembers;

  return <TeamRegistryClient teamMembers={teamMembersList} />;
}
