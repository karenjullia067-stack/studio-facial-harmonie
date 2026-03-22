import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-rose/30 -skew-x-12 translate-x-1/4 z-0" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-rose/20 rounded-full blur-3xl z-0" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-brand-rose/50 text-brand-gold text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Tecnologia & Estética Avançada</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif font-bold leading-[0.9] tracking-tight text-neutral-900">
              Simule antes <br />
              <span className="text-brand-gold italic">de decidir.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-neutral-600 max-w-lg leading-relaxed">
              Sua beleza com segurança e precisão. O Studio Facial Harmonie utiliza IA para prever resultados e conectar você às melhores clínicas do Maranhão.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a 
                href="#anamnese"
                className="group flex items-center justify-center gap-2 bg-neutral-900 text-white px-8 py-4 rounded-full font-bold hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-200"
              >
                Iniciar Anamnese
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="#procedimentos"
                className="flex items-center justify-center gap-2 bg-white text-neutral-900 px-8 py-4 rounded-full font-bold border border-neutral-200 hover:border-brand-rose transition-all"
              >
                Ver Procedimentos
              </a>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-neutral-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-brand-gold">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Segurança</span>
                </div>
                <p className="text-sm font-medium">Protocolos Médicos</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-brand-gold">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Precisão</span>
                </div>
                <p className="text-sm font-medium">Simulação IA</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-brand-gold">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Exclusivo</span>
                </div>
                <p className="text-sm font-medium">Plano Personalizado</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070&auto=format&fit=crop" 
                alt="Estética Facial"
                className="w-full aspect-[4/5] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white">
                <p className="text-sm font-serif italic mb-2">"A harmonia facial começa com um planejamento seguro."</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-rose" />
                  <span className="text-xs font-bold uppercase tracking-tighter">Studio Facial Harmonie</span>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-brand-gold/10 rounded-full blur-2xl z-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
