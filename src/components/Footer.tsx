import React from 'react';
import { Instagram, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold tracking-tight">
              Studio Facial <span className="text-brand-rose">Harmonie</span>
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Transformando a jornada estética através da tecnologia e cuidado humano. Sua beleza, planejada com precisão.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/studiofacial_harmonie" target="_blank" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-brand-rose hover:text-neutral-900 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-brand-rose">Links Rápidos</h4>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li><a href="#" className="hover:text-white transition-colors">Início</a></li>
              <li><a href="#procedimentos" className="hover:text-white transition-colors">Procedimentos</a></li>
              <li><a href="#parcerias" className="hover:text-white transition-colors">Parcerias</a></li>
              <li><a href="#anamnese" className="hover:text-white transition-colors">Anamnese Digital</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-brand-rose">Atendimento</h4>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-rose shrink-0" />
                <span>Polo Central: Santa Inês - MA<br />Atendimento em todo o Maranhão</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-rose shrink-0" />
                <span>contato@studiofacialharmonie.com.br</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-brand-rose">Newsletter</h4>
            <p className="text-xs text-neutral-400">Receba dicas de estética e novidades sobre nossos parceiros.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Seu email" 
                className="bg-neutral-800 border-none rounded-lg px-4 py-2 text-sm w-full focus:ring-1 focus:ring-brand-rose outline-none"
              />
              <button className="bg-brand-rose text-neutral-900 p-2 rounded-lg hover:bg-brand-rose/90 transition-all">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
          <p>© 2026 Studio Facial Harmonie. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacidade</a>
            <a href="#" className="hover:text-white">Termos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
