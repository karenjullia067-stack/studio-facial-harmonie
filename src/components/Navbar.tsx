import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Menu, X, Sparkles, LogIn, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useFirebase } from './FirebaseProvider';

export default function Navbar() {
  const { user, login, logout } = useFirebase();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.email === "karenjullia067@gmail.com";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 py-4",
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex justify-between items-center">
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand-rose" />
          </div>
          <span className="text-xl font-serif font-bold tracking-tight text-neutral-900">
            Harmonie
          </span>
        </a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-bold uppercase tracking-widest hover:text-brand-gold transition-colors">Início</a>
          <a href="#procedimentos" className="text-sm font-bold uppercase tracking-widest hover:text-brand-gold transition-colors">Procedimentos</a>
          <a href="#parcerias" className="text-sm font-bold uppercase tracking-widest hover:text-brand-gold transition-colors">Parcerias</a>
          <a href="#anamnese" className="text-sm font-bold uppercase tracking-widest hover:text-brand-gold transition-colors">Anamnese</a>
          
          {isAdmin && (
            <a href="#admin" className="flex items-center gap-1 text-sm font-bold uppercase tracking-widest text-brand-gold hover:text-brand-gold/80 transition-colors">
              <Shield className="w-4 h-4" />
              Painel
            </a>
          )}

          <div className="flex items-center gap-4 pl-4 border-l border-neutral-200">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Bem-vinda</span>
                  <span className="text-xs font-bold text-neutral-900 truncate max-w-[100px]">{user.displayName?.split(' ')[0]}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-brand-gold transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Entrar
              </button>
            )}
            
            <a href="https://instagram.com/studiofacial_harmonie" target="_blank" className="bg-neutral-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-neutral-800 transition-all">
              Instagram
            </a>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-neutral-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 w-full bg-white border-t border-neutral-100 p-6 flex flex-col gap-4 md:hidden shadow-xl"
        >
          <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">Início</a>
          <a href="#procedimentos" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">Procedimentos</a>
          <a href="#parcerias" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">Parcerias</a>
          <a href="#anamnese" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest">Anamnese</a>
          
          {isAdmin && (
            <a href="#admin" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest text-brand-gold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Painel Administrativo
            </a>
          )}

          <div className="pt-4 border-t border-neutral-100 flex flex-col gap-4">
            {user ? (
              <div className="flex items-center justify-between bg-neutral-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-rose/20 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-brand-rose" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Conectada como</p>
                    <p className="text-sm font-bold text-neutral-900">{user.displayName}</p>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-red-500"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { login(); setIsMobileMenuOpen(false); }}
                className="flex items-center justify-center gap-2 bg-brand-gold text-white py-3 rounded-xl font-bold"
              >
                <LogIn className="w-5 h-5" />
                Entrar com Google
              </button>
            )}

            <a href="https://instagram.com/studiofacial_harmonie" target="_blank" className="bg-neutral-900 text-white px-6 py-3 rounded-xl text-center font-bold">
              Instagram
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
