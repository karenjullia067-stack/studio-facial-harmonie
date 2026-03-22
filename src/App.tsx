/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Procedures from './components/Procedures';
import AnamnesisForm from './components/AnamnesisForm';
import Footer from './components/Footer';
import AdminDashboard from './components/AdminDashboard';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, Heart, CheckCircle2, Construction } from 'lucide-react';
import { useFirebase } from './components/FirebaseProvider';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export default function App() {
  const { user, loading: authLoading } = useFirebase();
  const [siteSettings, setSiteSettings] = useState<{ isPublished: boolean } | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const isAdmin = user?.email === "karenjullia067@gmail.com";

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'config', 'site_settings'), (snapshot) => {
      if (snapshot.exists()) {
        setSiteSettings(snapshot.data() as any);
      } else {
        setSiteSettings({ isPublished: false });
      }
      setSettingsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-brand-nude flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-rose border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Maintenance Mode: If not published and not admin
  if (!siteSettings?.isPublished && !isAdmin) {
    return (
      <div className="min-h-screen bg-brand-nude flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-12 text-center space-y-8 border border-brand-rose/20">
          <div className="w-24 h-24 bg-brand-rose/10 rounded-full flex items-center justify-center mx-auto">
            <Construction className="w-12 h-12 text-brand-gold" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-serif font-bold text-neutral-900">Em Construção</h1>
            <p className="text-neutral-600">
              O Studio Facial Harmonie está preparando algo especial para você. 
              Em breve, nosso portal de simulações e anamnese estará disponível.
            </p>
          </div>
          <div className="pt-8 border-t border-neutral-100">
            <p className="text-xs text-neutral-400 uppercase tracking-widest">Acompanhe-nos no Instagram</p>
            <a 
              href="https://instagram.com/studiofacialharmonie" 
              target="_blank"
              className="text-brand-gold font-bold hover:underline"
            >
              @studiofacialharmonie
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-nude selection:bg-brand-rose selection:text-neutral-900">
      <Navbar />
      
      <main>
        <Hero />

        {/* About Section */}
        <section className="py-24 bg-brand-rose/10">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-brand-gold/20 rounded-full blur-2xl" />
                <img 
                  src="https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=2070&auto=format&fit=crop" 
                  alt="Studio Facial Harmonie"
                  className="rounded-[3rem] shadow-2xl relative z-10 aspect-square object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-neutral-900">
                    O Studio Facial <br />
                    <span className="text-brand-gold italic">Harmonie</span>
                  </h2>
                  <p className="text-lg text-neutral-600 leading-relaxed">
                    Somos o seu primeiro contato com o mundo da estética avançada. Atuamos como uma ponte inteligente entre você e as clínicas mais renomadas do Maranhão, com foco em Santa Inês.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-100">
                    <Sparkles className="w-6 h-6 text-brand-gold mb-4" />
                    <h4 className="font-bold mb-2">Simulação IA</h4>
                    <p className="text-sm text-neutral-500">Visualize resultados potenciais antes de qualquer agulhada.</p>
                  </div>
                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-neutral-100">
                    <ShieldCheck className="w-6 h-6 text-brand-gold mb-4" />
                    <h4 className="font-bold mb-2">Anamnese Técnica</h4>
                    <p className="text-sm text-neutral-500">Avaliação detalhada de saúde para garantir sua segurança.</p>
                  </div>
                </div>

                <div className="p-6 bg-neutral-900 text-white rounded-2xl flex items-center gap-4">
                  <Heart className="w-8 h-8 text-brand-rose shrink-0" />
                  <p className="text-sm italic">
                    "Nossa missão é direcionar mulheres que desejam mudar, mas precisam de um caminho seguro e profissional."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Procedures />

        {/* Partners Section */}
        <section className="py-24 bg-neutral-900 text-white" id="parcerias">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-6xl font-serif font-bold">
                  Seja uma Clínica <br />
                  <span className="text-brand-rose italic">Parceira</span>
                </h2>
                <p className="text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto">
                  O Studio Facial Harmonie é a maior vitrine de estética do Maranhão. Conectamos pacientes qualificados que já passaram por uma anamnese técnica diretamente ao seu consultório.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="flex items-center gap-4 p-6 bg-neutral-800/50 rounded-2xl border border-neutral-700">
                  <CheckCircle2 className="w-6 h-6 text-brand-rose shrink-0" />
                  <span className="text-sm font-medium">Receba leads com anamnese completa</span>
                </div>
                <div className="flex items-center gap-4 p-6 bg-neutral-800/50 rounded-2xl border border-neutral-700">
                  <CheckCircle2 className="w-6 h-6 text-brand-rose shrink-0" />
                  <span className="text-sm font-medium">Acesso a simulações de IA exclusivas</span>
                </div>
                <div className="flex items-center gap-4 p-6 bg-neutral-800/50 rounded-2xl border border-neutral-700">
                  <CheckCircle2 className="w-6 h-6 text-brand-rose shrink-0" />
                  <span className="text-sm font-medium">Destaque na nossa rede regional</span>
                </div>
              </div>

              <button 
                onClick={() => window.open('https://wa.me/5598985546758', '_blank')}
                className="inline-flex items-center gap-3 bg-brand-rose text-neutral-900 px-12 py-5 rounded-full font-bold text-lg hover:bg-brand-rose/90 transition-all shadow-xl hover:scale-105"
              >
                Quero ser Parceiro
              </button>
            </div>
          </div>
        </section>

        {/* Anamnesis Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-white z-0" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12 space-y-4">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-neutral-900">
                  Sua <span className="text-brand-gold italic">Simulação</span>
                </h2>
                <p className="text-neutral-600">
                  Responda às perguntas abaixo para que nossa tecnologia entenda seu perfil e objetivos.
                </p>
              </div>
              
              <AnamnesisForm />
            </div>
          </div>
        </section>

        {/* Admin Dashboard Section */}
        {isAdmin && (
          <section className="py-24 bg-neutral-50 border-t border-neutral-200">
            <div className="container mx-auto px-6">
              <AdminDashboard />
            </div>
          </section>
        )}

        {/* Warning Section */}
        <section className="py-16 bg-neutral-50 border-y border-neutral-100">
          <div className="container mx-auto px-6 text-center max-w-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-rose/20 text-brand-gold mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-4">Compromisso com sua Saúde</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              O Studio Facial Harmonie prioriza a ética. Pacientes com doenças autoimunes (Lúpus, Artrite Reumatoide, Esclerodermia) ou condições de pele específicas devem realizar avaliação médica prévia. Nossas simulações são ferramentas de planejamento e não substituem o diagnóstico clínico.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

