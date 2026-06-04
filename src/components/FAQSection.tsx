"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Is DKFFJ registered with the Government of India?",
    answer: "Yes, DK Foundation of Freedom and Justice (DKFFJ) is registered under Section 8 of the Companies Act, 2013 with the Ministry of Corporate Affairs, Govt. of India. It is also approved by NITI Aayog under Darpan ID and is compliant with IT Act exemptions.",
  },
  {
    question: "Are the certification courses really 100% free?",
    answer: "Absolutely. All legal studies, RTI drafting workshops, and citizen rights certifications conducted by the DKFFJ Academy are entirely free. Our objective is to empower citizens with legal knowledge, not to generate commercial revenue.",
  },
  {
    question: "How does the Grievance Assistance process work?",
    answer: "Once you submit a complaint or legal query via the portal, our case coordination team reviews the files. If it falls within human rights violations or administrative corruption, our state representatives guide you in drafting grievances and filing official RTIs.",
  },
  {
    question: "How can I verify if an activist is an official member?",
    answer: "You can verify any member using the 'Verify Credentials' widget on our home page. Simply enter their official Enrollment ID (e.g., 1252 or 1238) to view their designation, state jurisdiction, and registration status.",
  },
  {
    question: "Can I apply for state or local coordinator positions?",
    answer: "Yes! We welcome dedicated lawyers, students, and social workers to join our national coalition. You can apply through the Membership link, and upon approval, you will receive an official identity card and jurisdiction authority.",
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-6 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[10px] text-[#D62828] font-extrabold uppercase tracking-widest">Grievance Helpdesk</span>
          <h2 className="text-3xl font-bold font-serif text-slate-900 mt-2">Frequently Asked Questions</h2>
          <div className="h-1 w-16 bg-[#0F4C81] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-[#0F4C81]/30"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left transition-colors cursor-pointer select-none"
                >
                  <span className="text-sm font-bold text-slate-800 font-sans tracking-wide">
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300
                    ${isOpen ? "bg-[#0F4C81] text-white rotate-180" : "bg-slate-100 text-slate-500"}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden
                    ${isOpen ? "max-h-[200px] border-t border-slate-100" : "max-h-0"}`}
                >
                  <div className="px-6 py-5 text-xs text-slate-600 leading-relaxed font-light bg-slate-50/50">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
