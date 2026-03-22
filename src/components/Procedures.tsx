import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Droplets, 
  Zap, 
  Heart,
  Info,
  CheckCircle2
} from 'lucide-react';

const procedureGroups = [
  {
    id: "nao-invasivos",
    title: "Não Invasivos",
    icon: Sparkles,
    description: "Procedimentos estéticos de cuidados básicos e avançados sem agulhas.",
    categories: [
      {
        name: "Limpeza & Cuidados",
        items: [
          "Limpeza de pele profunda", "Detox facial", "Peeling químico superficial",
          "Peeling de diamante", "Radiofrequência", "Luz pulsada (IPL)",
          "LEDterapia", "Hidragloss labial"
        ]
      },
      {
        name: "Nutrição & Hidratação",
        items: [
          "Hidratação facial profunda", "Nutrição com vitaminas",
          "Terapia capilar", "Massagem lifting facial"
        ]
      }
    ]
  },
  {
    id: "minimamente-invasivos",
    title: "Minimamente Invasivos",
    icon: Zap,
    description: "Procedimentos injetáveis para resultados mais expressivos e duradouros.",
    categories: [
      {
        name: "Injetáveis Faciais",
        items: [
          "Toxina botulínica (botox)", "Preenchimento com ácido hialurônico",
          "Bioestimuladores de colágeno", "Fios de sustentação",
          "Skinbooster injetável", "Microagulhamento profundo"
        ]
      },
      {
        name: "Contorno & Definição",
        items: [
          "Lipo de papada enzimática", "Intradermoterapia (mesoterapia)",
          "Harmonização facial estratégica"
        ]
      }
    ]
  },
  {
    id: "invasivos",
    title: "Invasivos / Cirúrgicos",
    icon: Heart,
    description: "Procedimentos médicos de alta complexidade (Indicação e Encaminhamento).",
    categories: [
      {
        name: "Face (Cirúrgico)",
        items: [
          "Rinoplastia (nariz)", "Blefaroplastia (pálpebras)",
          "Lifting facial (ritidoplastia)", "Otoplastia (orelha)",
          "Mentoplastia (queixo)", "Bichectomia", "Frontoplastia (testa)"
        ]
      },
      {
        name: "Corpo (Cirúrgico)",
        items: [
          "Lipoaspiração", "Abdominoplastia",
          "Mamoplastia (aumento/redução)", "Gluteoplastia",
          "Braquioplastia (braço)", "Cruroplastia (coxas)"
        ]
      }
    ]
  }
];

export default function Procedures() {
  const [activeGroup, setActiveGroup] = useState(procedureGroups[0].id);

  return (
    <section className="py-24 bg-white" id="procedimentos">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-neutral-900 mb-6">
            Nossos <span className="text-brand-gold italic">Procedimentos</span>
          </h2>
          <p className="text-lg text-neutral-600">
            Uma curadoria completa dividida por níveis de complexidade, desde cuidados diários até procedimentos cirúrgicos de alta performance.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-12">
          {procedureGroups.map((group) => {
            const Icon = group.icon;
            const isActive = activeGroup === group.id;
            return (
              <button
                key={group.id}
                onClick={() => setActiveGroup(group.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                  isActive 
                    ? "bg-neutral-900 text-white shadow-xl scale-105" 
                    : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-brand-rose" : "text-neutral-400"}`} />
                {group.title}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-neutral-50 rounded-[3rem] p-8 md:p-12 border border-neutral-100">
          <AnimatePresence mode="wait">
            {procedureGroups.map((group) => group.id === activeGroup && (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <div className="max-w-2xl">
                  <h3 className="text-3xl font-serif font-bold text-neutral-900 mb-4">{group.title}</h3>
                  <p className="text-neutral-600">{group.description}</p>
                  {group.id === 'invasivos' && (
                    <div className="mt-4 p-4 bg-brand-rose/10 rounded-xl border border-brand-rose/20 text-sm text-neutral-700 italic">
                      ⚠️ O Studio Facial Harmonie atua na orientação e encaminhamento para clínicas médicas parceiras especializadas nestes procedimentos.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {group.categories.map((cat, idx) => (
                    <div key={idx} className="space-y-6">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-brand-gold border-b border-brand-gold/20 pb-2">
                        {cat.name}
                      </h4>
                      <ul className="space-y-3">
                        {cat.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-neutral-700 group">
                            <CheckCircle2 className="w-4 h-4 text-brand-rose shrink-0 mt-0.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-16 p-8 rounded-3xl bg-brand-nude border border-brand-rose/50 flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
            <Info className="w-8 h-8 text-brand-gold" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-serif font-bold text-neutral-900">Personalização Harmonie</h4>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Cada pele é única. Através da nossa anamnese digital e simulação por IA, identificamos a combinação ideal de procedimentos para seus objetivos específicos, garantindo resultados naturais e seguros.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
