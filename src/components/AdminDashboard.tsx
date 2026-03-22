import React, { useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp, setDoc } from 'firebase/firestore';
import { useFirebase } from './FirebaseProvider';
import { 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ExternalLink, 
  Search,
  Filter,
  ArrowRight,
  MessageCircle,
  Mail,
  MapPin,
  AlertCircle,
  Sparkles,
  Globe,
  Rocket,
  Shield,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface AnamnesisRecord {
  id: string;
  nome: string;
  idade: number;
  email: string;
  cidade: string;
  peso: string;
  procedimento: string;
  doencas: string;
  diabetes: string;
  experiencia: string;
  resultado: string;
  preocupacao: string;
  aiAnalise: string;
  aiRecomendacaoPrincipais: string[];
  aiRecomendacaoComplementares: string[];
  aiJustificativa: string;
  fullAnalysisMarkdown?: string;
  createdAt: Timestamp;
  status: 'pending' | 'contacted' | 'scheduled';
  userId: string;
}

type Tab = 'leads' | 'publish';

export default function AdminDashboard() {
  const { user } = useFirebase();
  const [activeTab, setActiveTab] = useState<Tab>('leads');
  const [records, setRecords] = useState<AnamnesisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<AnamnesisRecord | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [siteSettings, setSiteSettings] = useState<{ isPublished: boolean; lastPublishedAt: any } | null>(null);

  const isAdmin = user?.email === "karenjullia067@gmail.com";
  const publicUrl = "https://ais-pre-gv6uway2hhbld2xt5chg55-535343648162.us-east1.run.app";

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch site settings
    const settingsUnsubscribe = onSnapshot(doc(db, 'config', 'site_settings'), (snapshot) => {
      if (snapshot.exists()) {
        setSiteSettings(snapshot.data() as any);
      } else {
        // Initialize if not exists
        setSiteSettings({ isPublished: false, lastPublishedAt: null });
      }
    });

    const q = query(collection(db, 'anamnesis'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AnamnesisRecord[];
      setRecords(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'anamnesis');
    });

    return () => {
      unsubscribe();
      settingsUnsubscribe();
    };
  }, [isAdmin]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Simulate a build/deploy process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await setDoc(doc(db, 'config', 'site_settings'), {
        isPublished: true,
        lastPublishedAt: Timestamp.now(),
        publicUrl: publicUrl
      }, { merge: true });

      setIsPublishing(false);
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 5000);
    } catch (error) {
      console.error("Error publishing site:", error);
      setIsPublishing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'anamnesis', id), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `anamnesis/${id}`);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro?')) return;
    try {
      await deleteDoc(doc(db, 'anamnesis', id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `anamnesis/${id}`);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         record.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-serif font-bold">Acesso Restrito</h2>
          <p className="text-neutral-500">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-12" id="admin">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-serif font-bold text-neutral-900">Painel de Controle</h2>
          <p className="text-neutral-500">Gerencie as anamneses e leads do Studio Facial Harmonie.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-sm border border-neutral-100">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'leads' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Leads
          </button>
          <button
            onClick={() => setActiveTab('publish')}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'publish' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50'
            }`}
          >
            <Globe className="w-4 h-4" />
            Publicação
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'leads' ? (
          <motion.div
            key="leads"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* List View */}
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-4 sticky top-24">
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 mb-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-brand-rose/10 rounded-lg">
                    <Users className="w-4 h-4 text-brand-rose" />
                    <span className="font-bold text-neutral-900">{records.length}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-brand-gold/10 rounded-lg">
                    <Clock className="w-4 h-4 text-brand-gold" />
                    <span className="font-bold text-neutral-900">{records.filter(r => r.status === 'pending').length}</span>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-rose outline-none transition-all"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['all', 'pending', 'contacted', 'scheduled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                        statusFilter === status 
                          ? 'bg-neutral-900 text-white' 
                          : 'bg-white text-neutral-500 border border-neutral-200 hover:border-brand-rose'
                      }`}
                    >
                      {status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : status === 'contacted' ? 'Contatados' : 'Agendados'}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="h-24 bg-neutral-100 animate-pulse rounded-2xl" />
                    ))
                  ) : filteredRecords.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-neutral-200">
                      <p className="text-neutral-400 text-sm">Nenhum registro encontrado.</p>
                    </div>
                  ) : (
                    filteredRecords.map((record) => (
                      <button
                        key={record.id}
                        onClick={() => setSelectedRecord(record)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all group ${
                          selectedRecord?.id === record.id 
                            ? 'bg-brand-rose/5 border-brand-rose shadow-md' 
                            : 'bg-white border-neutral-100 hover:border-brand-rose/30 shadow-sm'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="space-y-1">
                            <h4 className="font-bold text-neutral-900 truncate max-w-[150px]">{record.nome}</h4>
                            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">{record.procedimento}</p>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            record.status === 'pending' ? 'bg-yellow-400' : 
                            record.status === 'contacted' ? 'bg-blue-400' : 'bg-green-400'
                          }`} />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {record.createdAt?.toDate().toLocaleDateString('pt-BR')}
                          </span>
                          <ArrowRight className={`w-3 h-3 transition-transform ${selectedRecord?.id === record.id ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {selectedRecord ? (
                  <motion.div
                    key={selectedRecord.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="bg-neutral-900 p-8 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-rose/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-3xl font-serif font-bold">{selectedRecord.nome}</h3>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              selectedRecord.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' : 
                              selectedRecord.status === 'contacted' ? 'bg-blue-400/20 text-blue-400' : 'bg-green-400/20 text-green-400'
                            }`}>
                              {selectedRecord.status === 'pending' ? 'Pendente' : selectedRecord.status === 'contacted' ? 'Contatado' : 'Agendado'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
                            <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> {selectedRecord.email}</span>
                            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {selectedRecord.cidade}</span>
                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {selectedRecord.idade} anos</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => updateStatus(selectedRecord.id, 'contacted')}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                            title="Marcar como Contatado"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => updateStatus(selectedRecord.id, 'scheduled')}
                            className="p-3 bg-brand-rose text-neutral-900 hover:bg-brand-rose/90 rounded-xl transition-all"
                            title="Marcar como Agendado"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => deleteRecord(selectedRecord.id)}
                            className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-all"
                            title="Excluir Registro"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h5 className="text-xs font-bold uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">Informações Clínicas</h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-neutral-50 p-4 rounded-2xl">
                              <p className="text-[10px] text-neutral-400 uppercase mb-1">Procedimento</p>
                              <p className="text-sm font-bold">{selectedRecord.procedimento}</p>
                            </div>
                            <div className="bg-neutral-50 p-4 rounded-2xl">
                              <p className="text-[10px] text-neutral-400 uppercase mb-1">Diabetes</p>
                              <p className="text-sm font-bold">{selectedRecord.diabetes}</p>
                            </div>
                          </div>
                          <div className="bg-neutral-50 p-4 rounded-2xl">
                            <p className="text-[10px] text-neutral-400 uppercase mb-1">Doenças/Condições</p>
                            <p className="text-sm">{selectedRecord.doencas || 'Nenhuma informada'}</p>
                          </div>
                          <div className="bg-neutral-50 p-4 rounded-2xl">
                            <p className="text-[10px] text-neutral-400 uppercase mb-1">Experiência Anterior</p>
                            <p className="text-sm">{selectedRecord.experiencia || 'Nenhuma informada'}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h5 className="text-xs font-bold uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-2">Desejos & Objetivos</h5>
                          <div className="bg-neutral-50 p-4 rounded-2xl">
                            <p className="text-[10px] text-neutral-400 uppercase mb-1">Preocupação Principal</p>
                            <p className="text-sm">{selectedRecord.preocupacao}</p>
                          </div>
                          <div className="bg-neutral-50 p-4 rounded-2xl">
                            <p className="text-[10px] text-neutral-400 uppercase mb-1">Resultado Esperado</p>
                            <p className="text-sm">{selectedRecord.resultado}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h5 className="text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-neutral-100 pb-2 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Análise da IA
                          </h5>
                          <div className="bg-brand-rose/5 p-6 rounded-2xl border border-brand-rose/10 space-y-4">
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Diagnóstico Facial</p>
                              <p className="text-sm italic text-neutral-700 leading-relaxed">"{selectedRecord.aiAnalise}"</p>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-gold">Procedimentos Recomendados</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedRecord.aiRecomendacaoPrincipais.map((item, i) => (
                                  <span key={i} className="px-3 py-1 bg-white border border-brand-rose/20 rounded-full text-[10px] font-bold text-neutral-700">{item}</span>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Complementares</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedRecord.aiRecomendacaoComplementares.map((item, i) => (
                                  <span key={i} className="px-3 py-1 bg-white/50 border border-neutral-200 rounded-full text-[10px] text-neutral-500">{item}</span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-4 border-t border-brand-rose/10">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Justificativa Técnica</p>
                              <p className="text-xs text-neutral-600 leading-relaxed">{selectedRecord.aiJustificativa}</p>
                            </div>
                          </div>

                          {selectedRecord.fullAnalysisMarkdown && (
                            <div className="space-y-4 pt-4">
                              <h5 className="text-xs font-bold uppercase tracking-widest text-brand-gold border-b border-neutral-100 pb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Análise Completa (Markdown)
                              </h5>
                              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm prose prose-neutral max-w-none prose-headings:font-serif prose-h1:text-2xl prose-h3:text-lg prose-h3:text-brand-gold prose-p:text-xs prose-li:text-xs overflow-y-auto max-h-[400px] custom-scrollbar">
                                <ReactMarkdown>{selectedRecord.fullAnalysisMarkdown}</ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-4">
                          <a 
                            href={`mailto:${selectedRecord.email}`}
                            className="flex-1 flex items-center justify-center gap-2 bg-neutral-100 text-neutral-900 py-3 rounded-xl font-bold hover:bg-neutral-200 transition-all"
                          >
                            <Mail className="w-4 h-4" />
                            Email
                          </a>
                          <a 
                            href={`https://wa.me/5598985546758`} 
                            target="_blank"
                            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold hover:bg-[#128C7E] transition-all"
                          >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-neutral-50 rounded-3xl border border-dashed border-neutral-200 text-center p-8">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                      <Users className="w-10 h-10 text-neutral-200" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-neutral-900 mb-2">Selecione um Lead</h3>
                    <p className="text-neutral-500 max-w-xs">Escolha um registro na lista ao lado para visualizar os detalhes completos da anamnese e análise de IA.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="publish"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-neutral-100 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-rose/10 rounded-2xl">
                    <Rocket className="w-8 h-8 text-brand-rose" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold">Publicar Site</h3>
                    <p className="text-sm text-neutral-500">Transforme suas edições em versão pública.</p>
                  </div>
                </div>

                <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-neutral-600">Status Atual</span>
                    {siteSettings?.isPublished ? (
                      <span className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-widest">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        Online
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                        <div className="w-2 h-2 bg-neutral-300 rounded-full" />
                        Não Publicado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-neutral-600">Última Publicação</span>
                    <span className="text-xs text-neutral-400">
                      {siteSettings?.lastPublishedAt 
                        ? siteSettings.lastPublishedAt.toDate().toLocaleString('pt-BR')
                        : 'Nunca'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className={cn(
                      "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3",
                      isPublishing 
                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed" 
                        : "bg-neutral-900 text-white hover:bg-neutral-800 shadow-xl"
                    )}
                  >
                    {isPublishing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                        Publicando...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        Publicar Site Agora
                      </>
                    )}
                  </button>
                  {publishSuccess && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center text-sm font-bold text-green-600"
                    >
                      Site publicado com sucesso!
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl border border-neutral-100 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-gold/10 rounded-2xl">
                    <Globe className="w-8 h-8 text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold">Link Público</h3>
                    <p className="text-sm text-neutral-500">Este é o link que seus clientes devem acessar.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200 group">
                  <code className="text-xs text-neutral-600 truncate flex-1">{publicUrl}</code>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-white rounded-lg transition-all text-neutral-400 hover:text-brand-rose"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-4">
                  <a 
                    href={publicUrl} 
                    target="_blank" 
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-100 text-neutral-900 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visualizar Site
                  </a>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                  <Shield className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    <strong>Acesso Seguro:</strong> Este link abre o site em modo "View-Only". Ninguém poderá editar o conteúdo ou acessar este painel através dele.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-neutral-100 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-bold flex items-center gap-3">
                  <Globe className="w-6 h-6 text-brand-gold" />
                  Domínio Personalizado
                </h3>
                <p className="text-sm text-neutral-500">
                  Siga estas instruções para conectar seu domínio (ex: www.studioharmonie.com.br).
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Passo 1: Configurar Registro A</h4>
                  <div className="p-4 bg-neutral-900 rounded-xl space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                      <span>TIPO</span>
                      <span>NOME</span>
                      <span>VALOR</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono text-white">
                      <span>A</span>
                      <span>@</span>
                      <span>76.76.21.21</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Passo 2: Configurar CNAME</h4>
                  <div className="p-4 bg-neutral-900 rounded-xl space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                      <span>TIPO</span>
                      <span>NOME</span>
                      <span>VALOR</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono text-white">
                      <span>CNAME</span>
                      <span>www</span>
                      <span>cname.vercel-dns.com</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-brand-nude rounded-2xl border border-brand-rose/30 space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> Importante
                  </h5>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Após configurar o DNS no seu provedor (Registro.br, GoDaddy, etc), a propagação pode levar até 24 horas. Para concluir a conexão, você precisará exportar o código e vinculá-lo a uma plataforma de hospedagem como Vercel ou Netlify.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
