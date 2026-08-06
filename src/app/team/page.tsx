import prisma from "@/lib/prisma";
import { teamMembers as staticMembers } from "@/lib/teamData";
import TeamRegistryClient, { TeamMember } from "./TeamRegistryClient";

export const dynamic = "force-dynamic";

export default async function TeamRegistryPage() {
  let dbMembers: TeamMember[] = [];
  
  try {
    const homeLeaders = await prisma.memberships.findMany({
      where: {
        status: "APPROVED",
        show_home: true
      },
      orderBy: {
        created_at: "asc"
      }
    });
    
    if (homeLeaders && homeLeaders.length > 0) {
      dbMembers = homeLeaders.map((m) => {
        let p = m.photo_url || "";
        if (p.includes("default.jpg") || p.includes("default.png")) p = "";
        return {
          id: m.membership_no || m.ack_no || m.id,
          name: m.full_name,
          role: m.designation || "Executive Member",
          education: m.education || "",
          location: m.district ? `${m.district}, ${m.state || "India"}` : (m.state || m.address || "India"),
          mobile: m.mobile || "",
          photo: p,
          status: 1,
          showHome: 1,
        };
      });
    }
  } catch (error) {
    console.error("Failed to query memberships from database, falling back to static teamData.ts:", error);
  }

  // Fallback if database query failed or returned no results - ONLY show showHome === 1 members
  const teamMembersList = dbMembers.length > 0 
    ? dbMembers 
    : staticMembers.filter((m) => m.showHome === 1);

  return <TeamRegistryClient teamMembers={teamMembersList} />;
}
