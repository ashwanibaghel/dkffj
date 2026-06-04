"use client";

import { useState } from "react";
import { ChevronDown, ShieldAlert, Award, UserCheck, HeartHandshake, Eye } from "lucide-react";

interface AccordionItem {
  id: number;
  title: string;
  shortDesc: string;
  details: string;
  icon: any;
}

const guidelines: AccordionItem[] = [
  {
    id: 1,
    title: "Visible Identification & Credentials",
    shortDesc: "Arresting officers must display clear identification details.",
    details: "All police personnel carrying out arrests and interrogations must wear clear, visible, and accurate name tags with designations. The particulars of all such personnel must be recorded in a register at the police station.",
    icon: UserCheck
  },
  {
    id: 2,
    title: "Preparation of Arrest Memo",
    shortDesc: "A binding memo must be prepared on-site during arrest.",
    details: "The arresting officer must prepare an arrest memo at the time of arrest. The memo must be witnessed by at least one witness (a family member of the arrestee or a respectable citizen of the locality) and countersigned by the arrestee with date and time.",
    icon: Award
  },
  {
    id: 3,
    title: "Right to Inform Relatives/Friends",
    shortDesc: "The arrestee has the right to notify someone of their custody.",
    details: "The arrested person has the right to have a relative, friend, or other person known to them informed of their arrest and place of detention as soon as possible, and not later than 8 to 12 hours after the arrest.",
    icon: HeartHandshake
  },
  {
    id: 4,
    title: "Medical Inspection & Health Records",
    shortDesc: "Mandatory medical tests at arrest and every 48 hours.",
    details: "The arrestee must, at the time of arrest, be examined for major or minor injuries, recorded in an 'Inspection Memo' signed by both the police officer and arrestee. Furthermore, a trained doctor must examine the arrestee every 48 hours during custody.",
    icon: ShieldAlert
  },
  {
    id: 5,
    title: "Legal Representation & Magistrate Copy",
    shortDesc: "Right to consult legal counsel and send reports to Magistrate.",
    details: "The arrestee must be permitted to meet their attorney during interrogation, though not throughout the entire interrogation process. Additionally, copies of all arrest-related memos must be dispatched to the Area Magistrate within the legal time frame.",
    icon: Eye
  }
];

export default function GuidelinesAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {guidelines.map((item, index) => {
        const IconComponent = item.icon;
        const isOpen = openIndex === index;

        return (
          <div
            key={item.id}
            className={`border rounded-2xl transition-all duration-300 ${
              isOpen
                ? "bg-slate-50 border-[#0F4C81]/30 shadow-sm"
                : "bg-white border-slate-100 hover:border-[#0F4C81]/20 hover:bg-slate-50/50"
            }`}
          >
            {/* Header Accordion Button */}
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-5 text-left font-sans cursor-pointer focus:outline-none"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isOpen
                      ? "bg-[#0F4C81] text-white"
                      : "bg-[#0F4C81]/10 text-[#0F4C81]"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 tracking-wide font-serif">
                    {item.title}
                  </h4>
                  <p className="text-slate-500 text-[11px] font-normal leading-tight mt-0.5">
                    {item.shortDesc}
                  </p>
                </div>
              </div>
              
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${
                  isOpen ? "rotate-180 text-[#0F4C81]" : ""
                }`}
              />
            </button>

            {/* Content Section */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-[250px] opacity-100 border-t border-slate-200/60" : "max-h-0 opacity-0"
              }`}
            >
              <div className="p-5 text-xs text-slate-600 leading-relaxed font-light font-sans bg-white/70 rounded-b-2xl">
                {item.details}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
