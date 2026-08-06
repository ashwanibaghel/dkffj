/**
 * Official Hierarchy Ranking for Executive Council Members & Leaders
 * Used for sorting members in strict seniority order across the website
 */

export function getDesignationRank(roleStr: string): number {
  const role = (roleStr || "").toUpperCase().trim();

  // 1. Top Executive Directorship
  if (role.includes("DIRECTOR") && !role.includes("ADD")) return 1; // DIRECTOR (Danish Khan)
  if (role.includes("ADD DIRECTOR") || role.includes("ADDITIONAL DIRECTOR")) return 2; // ADD DIRECTOR (Mohd Wasim Qureshi)

  // 2. Presidential Officers
  if (role.includes("NATIONAL PRESIDENT")) return 3;
  if (role.includes("PRESIDENT") && !role.includes("VICE") && !role.includes("EXECUTIVE") && !role.includes("DEPUTY")) return 4;
  if (role.includes("EXECUTIVE PRESIDENT")) return 5;
  if (role.includes("CHIEF EXECUTIVE OFFICER") || role.includes("CEO")) return 6;
  if (role.includes("DEPUTY EXECUTIVE PRESIDENT")) return 7;

  // 3. Vice Presidential Officers
  if (role.includes("SENIOR VICE PRESIDENT")) return 8;
  if (role.includes("NATIONAL VICE PRESIDENT")) return 9;
  if (role.includes("STATE VICE PRESIDENT")) return 10;
  if (role.includes("VICE PRESIDENT")) return 11;
  if (role.includes("DEPUTY VICE PRESIDENT")) return 12;

  // 4. Observers
  if (role.includes("CHIEF OBSERVER")) return 13;
  if (role.includes("NATIONAL OBSERVER")) return 14;
  if (role.includes("OBSERVER")) return 15;

  // 5. Secretarial Officers
  if (role.includes("GENERAL SECRETARY")) return 16;
  if (role.includes("JOINT SECRETARY")) return 17;
  if (role.includes("ORGANISING SECRETARY") || role.includes("ORGANIZING SECRETARY")) return 18;
  if (role.includes("SECRETARY")) return 19;

  // 6. Legal & Compliance Advisors
  if (role.includes("LEGAL ADVISOR") || role.includes("LEGAL")) return 20;

  // 7. Coordinators
  if (role.includes("CHIEF COORDINATOR")) return 21;
  if (role.includes("NATIONAL COORDINATOR")) return 22;
  if (role.includes("STATE COORDINATOR")) return 23;
  if (role.includes("DISTRICT COORDINATOR") || role.includes("COORDINATOR")) return 24;

  // 8. Finance
  if (role.includes("TREASURER")) return 25;

  // Default rank for general executive members
  return 99;
}

export function sortMembersByDesignationRank<T extends { role: string; name: string }>(members: T[]): T[] {
  return [...members].sort((a, b) => {
    const rankA = getDesignationRank(a.role);
    const rankB = getDesignationRank(b.role);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    return a.name.localeCompare(b.name);
  });
}
