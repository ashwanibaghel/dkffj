"use server";

import prisma from "@/lib/prisma";
import { teamMembers as staticMembers } from "@/lib/teamData";
import { getVersionedCache } from "@/lib/redis";
import { sortMembersByDesignationRank } from "@/lib/designationRank";

// Lookup description map for standard leaders to keep descriptions consistent
const leaderDescriptions: Record<string, string> = {
  "1000": "India's renowned RTI & Social Activist. Raised voice against custodial deaths, corruption, and social injustice before national media.", // Danish Khan
  "1004": "Prominent industrialist and social welfare contributor representing national operations from Ajmer, Rajasthan.", // Mohd Wasim Qureshi
  "1010": "Government-approved journalist, National CEO of DKFFJ, overseeing executive operations and grievance reporting from BKT, Lucknow.", // Vipin Kumar Sharma
  "1012": "Leading administrative operations, registrations compliance, and national coordinate activities from Ayodhya, UP." // Jay Prakash Tiwari
};

import { leaderPhotos } from "@/lib/leaderPhotos";

// 1. Fetch Executive Council members for Homepage
export async function getHomeLeaders() {
  return getVersionedCache("members", "home_leaders_v3", async () => {
    try {
      // Primary source: memberships table in Supabase where show_home is true
      const homeMembers = await prisma.memberships.findMany({
        where: {
          show_home: true,
          status: "APPROVED"
        },
        orderBy: {
          created_at: "asc"
        }
      });

      if (homeMembers.length > 0) {
        const formatted = homeMembers.map((m) => {
          const mNo = m.membership_no || "";
          const cleanNo = mNo.replace("DKFFJ-", "");
          let photoPath = leaderPhotos[cleanNo] || leaderPhotos[mNo] || m.photo_url || "";
          if (photoPath.includes("default.jpg") || photoPath.includes("default.png")) {
            photoPath = "";
          }
          if (photoPath.startsWith("/uploads/")) {
            const fileName = photoPath.split("/").pop();
            photoPath = `/members/${fileName}`;
          }
          return {
            id: m.membership_no || m.ack_no || m.id,
            name: m.full_name,
            role: m.designation || "Executive Member",
            education: m.education || "",
            location: m.district || m.state || m.address || "India",
            mobile: m.mobile,
            photo: photoPath,
            status: 1,
            showHome: 1,
            description: leaderDescriptions[cleanNo] || leaderDescriptions[mNo] || `Certified active executive council officer of DKFFJ representing operations in ${m.district || m.state || "India"}.`
          };
        });
        return sortMembersByDesignationRank(formatted);
      }

      // Fallback source: teamMember table in database
      const dbLeaders = await prisma.teamMember.findMany({
        where: {
          showHome: 1,
          status: 1
        },
        orderBy: {
          id: "asc"
        }
      });

      if (dbLeaders.length > 0) {
        const formatted = dbLeaders.map((m) => {
          let p = leaderPhotos[m.id] || m.photo || "";
          if (p.includes("default.jpg") || p.includes("default.png")) p = "";
          if (p.startsWith("/uploads/")) {
            const fileName = p.split("/").pop();
            p = `/members/${fileName}`;
          }
          return {
            id: m.id,
            name: m.name,
            role: m.role,
            education: m.education,
            location: m.location,
            mobile: m.mobile,
            photo: p,
            status: m.status,
            showHome: m.showHome,
            description: m.description || leaderDescriptions[m.id] || `Certified active executive council officer of DKFFJ representing operations in ${m.location}.`
          };
        });
        return sortMembersByDesignationRank(formatted);
      }
    } catch (error) {
      console.error("Error fetching homepage leaders from database:", error);
    }

    // Fallback to static member registry
    const formattedStatic = staticMembers
      .filter((m) => m.showHome === 1)
      .map((m) => {
        let p = leaderPhotos[m.id] || m.photo || "";
        if (p.includes("default.jpg") || p.includes("default.png")) p = "";
        if (p.startsWith("/uploads/")) {
          const fileName = p.split("/").pop();
          p = `/members/${fileName}`;
        }
        return {
          id: m.id,
          name: m.name,
          role: m.role,
          education: m.education,
          location: m.location,
          mobile: m.mobile,
          photo: p,
          status: m.status,
          showHome: m.showHome,
          description: leaderDescriptions[m.id] || "DKFFJ Executive Council Member."
        };
      });
    return sortMembersByDesignationRank(formattedStatic);
  });
}

// 2. Fetch Latest News for Homepage
export async function getHomeNews() {
  try {
    const dbNews = await prisma.news.findMany({
      where: {
        is_published: true
      },
      orderBy: {
        created_at: "desc"
      },
      take: 3
    });

    if (dbNews.length > 0) {
      return dbNews.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        category: n.category || "General",
        date: new Date(n.created_at).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      }));
    }
  } catch (error) {
    console.error("Error fetching homepage news from database:", error);
  }

  // Fallback to static news
  return [
    {
      id: "1",
      title: "डीके फाउंडेशन ऑफ फ़्रीडम एंड जस्टिस नियमावली",
      content: "Foundation parameters defining executive operations, local RTI coordinator guidelines, and social relief camp registrations.",
      category: "Guidelines",
      date: "September 2024"
    },
    {
      id: "2",
      title: "मानवधिकार हनन को रोकना देश के हर नागरिक का प्रथम कर्तव्य है",
      content: "CEO Vipin Sharma's address to the legal advocacy cell on helping unjustly detained youth and lodging standard writs of Habeas Corpus.",
      category: "Address",
      date: "August 2024"
    },
    {
      id: "3",
      title: "National Executive Meeting at Ajmer Guest House",
      content: "Director Danish Khan and National President Wasim Qureshi finalize structural deployment parameters for standard member certificates.",
      category: "Meeting",
      date: "June 2025"
    }
  ];
}

// 2b. Fetch ALL News for the dedicated /news page (no limit)
export async function getAllNews() {
  try {
    const dbNews = await prisma.news.findMany({
      where: {
        is_published: true
      },
      orderBy: {
        created_at: "desc"
      }
    });

    if (dbNews.length > 0) {
      return dbNews.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        image_url: n.image_url || "",
        category: n.category || "General",
        date: new Date(n.created_at).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric"
        })
      }));
    }
  } catch (error) {
    console.error("Error fetching all news from database:", error);
  }

  // Fallback to static news (all items)
  return [
    {
      id: "1",
      title: "डीके फाउंडेशन ऑफ फ़्रीडम एंड जस्टिस नियमावली",
      content: "Foundation parameters defining executive operations, local RTI coordinator guidelines, and social relief camp registrations.",
      image_url: "",
      category: "Guidelines",
      date: "September 2024"
    },
    {
      id: "2",
      title: "मानवधिकार हनन को रोकना देश के हर नागरिक का प्रथम कर्तव्य है",
      content: "CEO Vipin Sharma's address to the legal advocacy cell on helping unjustly detained youth and lodging standard writs of Habeas Corpus.",
      image_url: "",
      category: "Address",
      date: "August 2024"
    },
    {
      id: "3",
      title: "National Executive Meeting at Ajmer Guest House",
      content: "Director Danish Khan and National President Wasim Qureshi finalize structural deployment parameters for standard member certificates.",
      image_url: "",
      category: "Meeting",
      date: "June 2025"
    }
  ];
}

// 3. Fetch Official Documents for Homepage
export async function getHomeDocuments() {
  try {
    const dbDocs = await prisma.documents.findMany({
      where: {
        is_active: true
      },
      orderBy: {
        created_at: "desc"
      }
    });

    if (dbDocs.length > 0) {
      return dbDocs.map((d) => {
        let iconType: "download" | "shield" | "building" | "award" = "download";
        if (d.category === "registration") iconType = "building";
        else if (d.category === "tax") iconType = "shield";
        else if (d.category === "appreciation") iconType = "award";

        return {
          title: d.title,
          url: d.file_url,
          size: d.file_size,
          category: d.category as "all" | "registration" | "tax" | "appreciation",
          iconType
        };
      });
    }
  } catch (error) {
    console.error("Error fetching homepage documents from database:", error);
  }

  // Fallback to static documents list
  return [
    {
      title: "MCA Articles of Association",
      url: "/documents/1750940512.pdf",
      size: "PDF | 181 KB",
      category: "registration",
      iconType: "building"
    },
    {
      title: "12A Income Tax Exemption",
      url: "/documents/1713277338.pdf",
      size: "PDF | 55 KB",
      category: "tax",
      iconType: "shield"
    },
    {
      title: "80G Income Tax Certificate",
      url: "/documents/1713277369.pdf",
      size: "PDF | 55 KB",
      category: "tax",
      iconType: "shield"
    },
    {
      title: "CSR Registration Certificate",
      url: "/documents/1713277422.pdf",
      size: "PDF | 48 KB",
      category: "registration",
      iconType: "building"
    },
    {
      title: "NITI Aayog Registration",
      url: "/documents/1713278028.PDF",
      size: "PDF | 56 KB",
      category: "registration",
      iconType: "building"
    },
    {
      title: "Police Appreciation Certificate",
      url: "/documents/1750870809.pdf",
      size: "PDF | 672 KB",
      category: "appreciation",
      iconType: "award"
    }
  ] as const;
}

// 4. Fetch Home Banners for Slider
export async function getHomeBanners() {
  try {
    const dbBanners = await prisma.banner.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (dbBanners.length > 0) {
      return dbBanners.map((b) => ({
        imageUrl: b.imageUrl,
        title: b.title || "",
        subtitle: b.subtitle || "",
        linkUrl: b.linkUrl || ""
      }));
    }
  } catch (error) {
    console.error("Error fetching homepage banners from database:", error);
  }

  // Fallback to static banners
  return [
    {
      imageUrl: "/slider/constitution_of_india.png",
      title: "Protecting Human Rights",
      subtitle: "Securing Dignity, Liberty, and Equal Justice for all citizens of India.",
      linkUrl: "#about"
    },
    {
      imageUrl: "/slider/citizens_rights.png",
      title: "Empowering Citizen Awareness",
      subtitle: "Educating marginalized communities about standard legal procedurals & RTI Act.",
      linkUrl: "#courses"
    },
    {
      imageUrl: "/slider/supreme_court_justice.png",
      title: "Constitutional Legal Defense",
      subtitle: "Active assistance in lodging public grievances and fighting administrative corruption.",
      linkUrl: "#contact"
    }
  ];
}
