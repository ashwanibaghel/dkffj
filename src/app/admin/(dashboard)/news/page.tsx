import React from "react";
import { Newspaper, Plus, Trash2, Edit2 } from "lucide-react";

export default function AdminNewsPage() {
  const dummyNews = [
    { id: "1", title: "DKFFJ State Conference on Human Rights 2026", category: "Announcements", status: "Published", date: "01/06/2026" },
    { id: "2", title: "Free Legal Aid Camps Launched in 10 Districts", category: "Press Release", status: "Published", date: "18/05/2026" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-[#0F4C81]" /> News & Blog Desk
          </h1>
          <p className="text-slate-500 text-xs mt-1">Publish news updates, press statements, and human rights journals.</p>
        </div>
        <button className="px-4 py-2 bg-[#0F4C81] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-not-allowed opacity-75">
          <Plus className="w-4 h-4" /> Create Blog Post
        </button>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Active Press Postings</h3>
        </div>
        <div className="divide-y divide-slate-150 text-xs font-semibold text-slate-700">
          {dummyNews.map((post) => (
            <div key={post.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#0F4C81]/5 border border-slate-250 flex items-center justify-center text-[#0F4C81]">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{post.title}</h4>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{post.category} | Status: <strong className="text-emerald-600 font-bold uppercase">{post.status}</strong> | Published: {post.date}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="p-2 border rounded hover:bg-slate-100 transition-colors text-slate-400 cursor-not-allowed">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="px-3 py-1.5 border border-[#0F4C81] text-[#0F4C81] hover:bg-[#0F4C81]/5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
