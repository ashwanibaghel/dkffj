"use client";

import { useState } from "react";

const guidelines = [
  {
    step: "01",
    title: "Identification of Police Officers",
    description: "Police personnel carrying out the arrest and handling the interrogation of the arrestee should wear clear identification and name tags with their designations. The particulars of all such personnel must be recorded in a register.",
  },
  {
    step: "02",
    title: "Preparation of Arrest Memo",
    description: "The officer preparing the arrest must prepare a memo of arrest at the time of arrest. It must be attested by at least one witness (a family member or local respectable person) and countersigned by the arrestee with date and time.",
  },
  {
    step: "03",
    title: "Right to Inform Relative/Friend",
    description: "The person arrested has the right to have a friend, relative, or person known to him informed as soon as possible about his arrest and detention at the specific place, unless the attesting witness of the memo is himself a friend/relative.",
  },
  {
    step: "04",
    title: "Information to the Arrestee",
    description: "The arrestee must be made aware of his right to have someone informed of his arrest or detention as soon as he is put under arrest or is detained.",
  },
  {
    step: "05",
    title: "Medical Examination",
    description: "The arrestee should, where he so requests, be examined at the time of his arrest for major/minor injuries. A copy of the inspection memo must be signed by both the arrestee and the police officer. Major checkups must happen every 48 hours in custody.",
  },
  {
    step: "06",
    title: "Right to Consult a Lawyer",
    description: "The arrestee may be permitted to meet his attorney during interrogation, though not throughout the interrogation.",
  }
];

export default function ArrestGuidelines() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-stretch">
      {/* Left Stepper Selector */}
      <div className="md:w-1/3 flex flex-row md:flex-col gap-2 overflow-x-auto pb-3 md:pb-0 border-b md:border-b-0 md:border-r border-slate-100 pr-0 md:pr-6 snap-x scrollbar-thin">
        {guidelines.map((g, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveStep(idx)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 snap-center shrink-0 cursor-pointer w-[200px] md:w-full
              ${activeStep === idx 
                ? "bg-[#0F4C81]/10 border border-[#0F4C81]/25 text-[#0F4C81]" 
                : "bg-slate-50 border border-transparent text-slate-500 hover:bg-slate-100/80 hover:text-slate-800"
              }`}
          >
            <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded transition-colors
              ${activeStep === idx ? "bg-[#0F4C81] text-white" : "bg-slate-200 text-slate-600"}`}
            >
              {g.step}
            </span>
            <span className="text-[11px] font-bold tracking-wide uppercase truncate">
              {g.title}
            </span>
          </button>
        ))}
      </div>

      {/* Right Stepper Content Display */}
      <div className="flex-1 flex flex-col justify-between py-1">
        <div key={activeStep} className="flex flex-col gap-3 min-h-[140px] animate-fadeIn transition-opacity duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D62828] animate-pulse"></span>
            <span className="text-[10px] text-[#D62828] font-bold uppercase tracking-widest font-mono">Mandatory Clause {guidelines[activeStep].step}</span>
          </div>
          <h4 className="text-base font-bold text-slate-800 font-serif">
            {guidelines[activeStep].title}
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-light">
            {guidelines[activeStep].description}
          </p>
        </div>

        {/* Navigation Indicator Dots */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
          <span className="text-[10px] text-slate-400 font-medium font-mono">
            Step {activeStep + 1} of {guidelines.length}
          </span>
          <div className="flex gap-1.5">
            {guidelines.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveStep(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeStep === idx ? "w-6 bg-[#0F4C81]" : "bg-slate-200 hover:bg-slate-300"
                }`}
                aria-label={`Go to step ${idx + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
