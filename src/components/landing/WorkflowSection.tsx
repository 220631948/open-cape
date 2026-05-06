import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Database, Key, CheckCircle, Share } from 'lucide-react';

const STEPS = [
  { icon: Database, title: "Provision Tenant", desc: "Create an isolated workspace for your organisation's spatial data." },
  { icon: Key, title: "Assign Roles", desc: "Define access control limits using robust bit-level encryption schemas." },
  { icon: ShieldCheck, title: "Secure Impersonation", desc: "Administrators log in as users without sharing credentials, strictly audited by cloud functions." },
  { icon: CheckCircle, title: "Automated OSINT", desc: "Upload raw points, allowing our AI agent to parse and cross-reference them securely." },
  { icon: Share, title: "Collaborate", desc: "Share vector maps inside your tenant with enforced data sovereignty." },
];

export const WorkflowSection = () => {
  return (
    <section className="py-32 px-6 relative z-10 pointer-events-none">
      <div className="max-w-7xl mx-auto pointer-events-auto">
        <div className="mb-20 text-center">
           <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
             How it works
           </h2>
        </div>

        <div className="flex flex-col gap-6 max-w-4xl mx-auto relative before:absolute before:inset-y-0 before:left-[39px] before:w-px before:bg-white/10 md:before:hidden">
           {STEPS.map((step, i) => (
             <motion.div
               key={step.title}
               initial={{ opacity: 0, x: -20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ delay: i * 0.15, duration: 0.5 }}
               className="relative grid grid-cols-[80px_1fr] md:grid-cols-1 md:flex md:flex-col items-start md:items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm"
             >
               <div className="w-20 h-20 shrink-0 md:mb-4 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shadow-xl relative z-10 md:w-16 md:h-16">
                  <span className="absolute -top-2 -left-2 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-slate-950">
                    {i + 1}
                  </span>
                  <step.icon className="w-8 h-8 text-cyan-400 md:w-6 md:h-6" strokeWidth={1.5} />
               </div>
               <div className="md:text-center pt-2 md:pt-0">
                 <h4 className="text-lg font-bold text-white mb-2">
                   {step.title}
                 </h4>
                 <p className="text-sm text-white/60">
                   {step.desc}
                 </p>
               </div>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
};

