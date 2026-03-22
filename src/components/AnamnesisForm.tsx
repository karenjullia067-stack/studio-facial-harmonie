import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  Sparkles, 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  AlertCircle, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Target,
  Send,
  X,
  Phone,
  Camera,
  LogIn,
  Scan,
  UserCircle,
  Activity
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { useFirebase } from './FirebaseProvider';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface FormData {
  analise: string;
  areas: string[];
  tipoProcedimento: string;
  objetivo: string;
  nome: string;
  idade: string;
  email: string;
  cidade: string;
  saude: string[];
  foto: string | null;
  consentimento: boolean;
}

const steps = [
  { id: 'type', title: 'Análise', icon: Scan },
  { id: 'areas', title: 'Áreas', icon: UserCircle },
  { id: 'preferences', title: 'Preferências', icon: Activity },
  { id: 'personal', title: 'Identificação', icon: User },
  { id: 'photo', title: 'Simulação', icon: Sparkles },
];

const ROSTO_AREAS = [
  "Testa", "Olhos", "Nariz", "Bochechas", "Lábios", 
  "Mandíbula/queixo", "Pele (manchas, acne, oleosidade)", 
  "Sobrancelhas", "Contorno facial"
];

const CORPO_AREAS = [
  "Pescoço", "Abdômen", "Braços", "Pernas", "Glúteos", "Seios", "Costas"
];

const PROCEDIMENTOS_TIPOS = [
  "Não invasivo", "Minimamente invasivo", "Cirúrgico", "Não sei (quero recomendação)"
];

const OBJETIVOS = [
  "Rejuvenescimento", "Harmonização facial", "Emagrecimento", 
  "Definição corporal", "Melhorar autoestima", "Tratar manchas/acne", "Outro"
];

const SAUDE_OPTIONS = [
  "Diabetes", "Doença Autoimune", "Alergia a Medicamentos", 
  "Problemas de Cicatrização", "Gestante/Lactante", "Nenhuma das anteriores"
];

export default function AnamnesisForm() {
  const { user, login } = useFirebase();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    analise: '',
    areas: [],
    tipoProcedimento: '',
    objetivo: '',
    nome: '',
    idade: '',
    email: '',
    cidade: '',
    saude: [],
    foto: null,
    consentimento: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [aiResult, setAiResult] = useState<{
    analise: string;
    recomendacao: {
      naoInvasivos: string[];
      minimamenteInvasivos: string[];
      cirurgicos: string[];
    };
    justificativa: string;
    fullAnalysisMarkdown: string;
    fotoDepois: string | null;
  } | null>(null);

  const handleSelection = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'analise') {
      setFormData(prev => ({ ...prev, areas: [] }));
    }
  };

  const handleMultiSelection = (field: 'areas' | 'saude', value: string) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, foto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const resetForm = () => {
    setFormData({
      analise: '',
      areas: [],
      tipoProcedimento: '',
      objetivo: '',
      nome: '',
      idade: '',
      email: '',
      cidade: '',
      saude: [],
      foto: null,
      consentimento: false,
    });
    setAiResult(null);
    setIsSubmitted(false);
    setCurrentStep(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      let parsedResult = null;
      let simulatedAfterPhoto = null;

      const prompt = `Você é um especialista sênior em estética avançada do Studio Facial Harmonie. 
      Analise os dados de um cliente que realizou um teste interativo de anamnese.
      
      DADOS DO PACIENTE:
      - Nome: ${formData.nome}
      - Idade: ${formData.idade}
      - Cidade: ${formData.cidade}
      - O que deseja analisar: ${formData.analise}
      - Áreas de interesse: ${formData.areas.join(', ')}
      - Tipo de procedimento preferido: ${formData.tipoProcedimento}
      - Objetivo principal: ${formData.objetivo}
      - Condições de saúde: ${formData.saude.join(', ')}

      Sua missão é gerar uma recomendação automática e profissional, separando por níveis de invasividade.

      Forneça um diagnóstico técnico detalhado e profissional (em português) seguindo EXATAMENTE esta estrutura de Markdown:

      # 🩺 Plano Estético Personalizado: [Nome do Paciente]

      ### 1. Análise de Perfil e Objetivos
      [Análise técnica baseada no objetivo de ${formData.objetivo} e nas áreas de ${formData.areas.join(', ')}]

      ### 2. Recomendações por Nível de Procedimento
      **💆 Não Invasivos:** [Recomende procedimentos como limpeza de pele, peelings, etc.]
      **💉 Minimamente Invasivos:** [Recomende toxina botulínica, preenchedores, bioestimuladores, etc.]
      **🔪 Cirúrgicos (Indicação):** [Se aplicável ao objetivo, mencione rinoplastia, lipo, etc., sempre com cautela e indicação médica]

      ### 3. Justificativa Estratégica
      [Explique por que essa combinação é a melhor para o paciente]

      ### 4. Sugestão de Próximos Passos
      [Oriente sobre a avaliação presencial e segurança]

      Além do markdown, retorne também os campos estruturados para o sistema.
      Responda APENAS em formato JSON válido:
      {
        "analise": "resumo curto da análise",
        "recomendacao": {
          "naoInvasivos": ["item 1", "item 2"],
          "minimamenteInvasivos": ["item 1", "item 2"],
          "cirurgicos": ["item 1", "item 2"]
        },
        "justificativa": "resumo curto da justificativa técnica",
        "fullAnalysisMarkdown": "O CONTEÚDO COMPLETO EM MARKDOWN SEGUINDO A ESTRUTURA ACIMA"
      }`;

      const contents: any[] = [{ text: prompt }];
      
      if (formData.foto) {
        contents.push({
          inlineData: {
            data: formData.foto.split(',')[1],
            mimeType: "image/jpeg"
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: contents },
        config: { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
      });

      const text = response.text;
      const jsonMatch = text?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      }

      // Generate "After" simulation image if photo exists
      if (parsedResult && formData.foto) {
        try {
          const imageEditPrompt = `Simule o resultado estético para o objetivo: ${formData.objetivo}. 
          Foque nas áreas: ${formData.areas.join(', ')}. 
          Mostre uma pele mais harmônica e rejuvenescida, simulando tratamentos de alta qualidade.`;

          const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [
                { inlineData: { data: formData.foto.split(',')[1], mimeType: "image/jpeg" } },
                { text: imageEditPrompt }
              ]
            }
          });

          for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData) {
              simulatedAfterPhoto = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        } catch (imgError) {
          console.error("Erro ao gerar simulação visual:", imgError);
        }
      }

      if (parsedResult) {
        setAiResult({
          ...parsedResult,
          fotoDepois: simulatedAfterPhoto
        });
      }

      // Save to Firestore
      const anamnesisPath = 'anamnesis';
      try {
        await addDoc(collection(db, anamnesisPath), {
          ...formData,
          aiAnalise: parsedResult?.analise || '',
          aiRecomendacaoNaoInvasivos: parsedResult?.recomendacao.naoInvasivos || [],
          aiRecomendacaoMinimamenteInvasivos: parsedResult?.recomendacao.minimamenteInvasivos || [],
          aiRecomendacaoCirurgicos: parsedResult?.recomendacao.cirurgicos || [],
          aiJustificativa: parsedResult?.justificativa || '',
          fullAnalysisMarkdown: parsedResult?.fullAnalysisMarkdown || '',
          createdAt: serverTimestamp(),
          status: 'pending',
          userId: user.uid
        });
      } catch (fsError) {
        handleFirestoreError(fsError, OperationType.CREATE, anamnesisPath);
      }

    } catch (error) {
      console.error("Erro na análise:", error);
    }
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const sendToWhatsApp = () => {
    const phone = "5598985546758";
    const message = `Olá, Studio Facial Harmonie! Concluí meu teste de anamnese digital.
    
*Meus Objetivos:*
- Desejo analisar: ${formData.analise}
- Áreas: ${formData.areas.join(', ')}
- Objetivo: ${formData.objetivo}

*Meus Dados:*
- Nome: ${formData.nome}
- Idade: ${formData.idade}

Gostaria de agendar uma avaliação com um especialista para discutir minhas recomendações!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h4 className="text-xl font-serif font-bold text-center">O que você deseja analisar?</h4>
            <div className="grid grid-cols-1 gap-4">
              {['Rosto (facial)', 'Corpo (pescoço para baixo)', 'Ambos'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelection('analise', option)}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all text-left flex items-center justify-between group",
                    formData.analise === option 
                      ? "border-brand-rose bg-brand-rose/5 text-neutral-900" 
                      : "border-neutral-100 bg-neutral-50 text-neutral-500 hover:border-brand-rose/30"
                  )}
                >
                  <span className="font-bold">{option}</span>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    formData.analise === option ? "border-brand-rose bg-brand-rose" : "border-neutral-300"
                  )}>
                    {formData.analise === option && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 1:
        const availableAreas = formData.analise.includes('Rosto') ? ROSTO_AREAS : 
                              formData.analise.includes('Corpo') ? CORPO_AREAS : 
                              [...ROSTO_AREAS, ...CORPO_AREAS];
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h4 className="text-xl font-serif font-bold text-center">Quais áreas te incomodam?</h4>
            <div className="grid grid-cols-2 gap-3">
              {availableAreas.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => handleMultiSelection('areas', area)}
                  className={cn(
                    "p-4 rounded-xl border transition-all text-sm font-medium text-center",
                    formData.areas.includes(area)
                      ? "border-brand-rose bg-brand-rose text-neutral-900 shadow-md"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-brand-rose/50"
                  )}
                >
                  {area}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-6">
              <h4 className="text-xl font-serif font-bold text-center">Tipo de procedimento desejado</h4>
              <div className="grid grid-cols-1 gap-3">
                {PROCEDIMENTOS_TIPOS.map((tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => handleSelection('tipoProcedimento', tipo)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left font-bold",
                      formData.tipoProcedimento === tipo
                        ? "border-brand-rose bg-brand-rose/5 text-neutral-900"
                        : "border-neutral-100 bg-neutral-50 text-neutral-500 hover:border-brand-rose/30"
                    )}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-xl font-serif font-bold text-center">Qual seu objetivo principal?</h4>
              <div className="grid grid-cols-2 gap-3">
                {OBJETIVOS.map((obj) => (
                  <button
                    key={obj}
                    type="button"
                    onClick={() => handleSelection('objetivo', obj)}
                    className={cn(
                      "p-4 rounded-xl border transition-all text-sm font-medium text-center",
                      formData.objetivo === obj
                        ? "border-brand-rose bg-brand-rose text-neutral-900 shadow-md"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-brand-rose/50"
                    )}
                  >
                    {obj}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-600">Nome Completo</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-rose outline-none"
                  placeholder="Seu nome"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-600">Idade</label>
                <input
                  type="number"
                  name="idade"
                  value={formData.idade}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-rose outline-none"
                  placeholder="Sua idade"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-600">Cidade (Maranhão)</label>
              <select
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-rose outline-none bg-white"
                required
              >
                <option value="">Selecione sua cidade</option>
                <option value="Santa Inês">Santa Inês (Polo)</option>
                <option value="São Luís">São Luís</option>
                <option value="Imperatriz">Imperatriz</option>
                <option value="Bacabal">Bacabal</option>
                <option value="Outra">Outra cidade do MA</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-sm font-medium text-neutral-600">Histórico de Saúde</label>
              <div className="grid grid-cols-2 gap-2">
                {SAUDE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleMultiSelection('saude', opt)}
                    className={cn(
                      "p-3 rounded-lg border text-[11px] font-bold transition-all",
                      formData.saude.includes(opt)
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="text-center space-y-2">
              <h4 className="font-serif font-bold text-lg">Foto para Simulação (Opcional)</h4>
              <p className="text-sm text-neutral-500">Envie uma foto frontal para que nossa IA gere uma simulação de resultados.</p>
            </div>
            
            <div className="flex justify-center">
              <div className="relative w-48 aspect-[3/4] bg-neutral-100 rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center overflow-hidden group hover:border-brand-rose transition-colors">
                {formData.foto ? (
                  <div className="relative w-full h-full">
                    <img src={formData.foto} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, foto: null }))}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 hover:bg-white shadow-sm z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-3 p-4 text-center w-full h-full justify-center">
                    <Camera className="w-8 h-8 text-brand-rose" />
                    <span className="text-xs font-bold text-neutral-700">Carregar Foto</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consentimento}
                  onChange={(e) => setFormData(prev => ({ ...prev, consentimento: e.target.checked }))}
                  className="mt-1 h-5 w-5 rounded border-neutral-300 text-brand-rose focus:ring-brand-rose"
                  required
                />
                <span className="text-[11px] text-neutral-500 leading-relaxed">
                  Autorizo o uso dos meus dados para fins de simulação estética. Compreendo que os resultados são digitais e não substituem avaliação médica.
                </span>
              </label>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (isSubmitting) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-xl text-center space-y-8 min-h-[500px] flex flex-col items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-24 h-24 border-4 border-brand-rose border-t-brand-gold rounded-full" />
        <div className="space-y-3">
          <h3 className="text-2xl font-serif font-bold text-neutral-900">Gerando seu Plano Estético...</h3>
          <p className="text-neutral-500 max-w-xs mx-auto">Nossa IA está processando suas escolhas para criar uma recomendação personalizada.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted && aiResult) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-2xl shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-neutral-900">Seu Plano está Pronto!</h3>
          <p className="text-neutral-600">Análise técnica completa para {formData.nome}.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {formData.foto && (
              <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                <h4 className="font-bold mb-4 flex items-center gap-2 text-brand-gold"><Sparkles className="w-4 h-4" /> Simulação Visual</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-center text-neutral-400">Original</p>
                    <img src={formData.foto} className="rounded-xl aspect-[3/4] object-cover border-2 border-white shadow-sm" alt="Antes" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-center text-brand-gold">Simulado</p>
                    <div className="rounded-xl aspect-[3/4] bg-neutral-200 overflow-hidden border-2 border-brand-rose/30 shadow-sm">
                      {aiResult.fotoDepois ? <img src={aiResult.fotoDepois} className="w-full h-full object-cover" alt="Depois" /> : <div className="h-full flex items-center justify-center text-neutral-400 text-[10px] p-4 text-center">Simulação em processamento...</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="prose prose-neutral max-w-none bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm">
              <ReactMarkdown>{aiResult.fullAnalysisMarkdown}</ReactMarkdown>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-neutral-900 text-white rounded-2xl space-y-6">
              <h4 className="font-bold text-brand-rose flex items-center gap-2"><Target className="w-4 h-4" /> Recomendações</h4>
              <div className="space-y-4">
                {aiResult.recomendacao.naoInvasivos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-neutral-500">💆 Não Invasivos</p>
                    {aiResult.recomendacao.naoInvasivos.map((item, i) => <div key={i} className="text-sm bg-neutral-800 p-2 rounded-lg border border-neutral-700">{item}</div>)}
                  </div>
                )}
                {aiResult.recomendacao.minimamenteInvasivos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-brand-rose">💉 Minimamente Invasivos</p>
                    {aiResult.recomendacao.minimamenteInvasivos.map((item, i) => <div key={i} className="text-sm bg-neutral-800 p-2 rounded-lg border border-neutral-700">{item}</div>)}
                  </div>
                )}
                {aiResult.recomendacao.cirurgicos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-brand-gold">🔪 Cirúrgicos (Indicação)</p>
                    {aiResult.recomendacao.cirurgicos.map((item, i) => <div key={i} className="text-sm bg-neutral-800 p-2 rounded-lg border border-neutral-700">{item}</div>)}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-brand-rose/10 rounded-2xl text-center space-y-4 border border-brand-rose/20">
              <p className="text-sm font-medium text-neutral-800">Agende agora sua avaliação presencial para validar seu plano!</p>
              <button onClick={sendToWhatsApp} className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-xl font-bold hover:bg-[#128C7E] transition-all shadow-lg">
                <Phone className="w-5 h-5" /> Quero agendar com especialista
              </button>
            </div>
            <button onClick={resetForm} className="w-full text-neutral-400 text-xs hover:underline">Refazer teste</button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100" id="anamnese">
      <div className="bg-neutral-900 p-8 text-white">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-brand-rose/20 rounded-2xl">
            <Sparkles className="w-8 h-8 text-brand-rose" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-bold">Teste Inteligente de Estética</h3>
            <p className="text-sm text-neutral-400">Descubra o melhor caminho para sua beleza</p>
          </div>
        </div>
        
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-800 -translate-y-1/2 z-0" />
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index <= currentStep;
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300", isActive ? "bg-brand-rose text-neutral-900 shadow-[0_0_15px_rgba(255,145,158,0.4)]" : "bg-neutral-800 text-neutral-500")}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={cn("text-[10px] uppercase tracking-widest font-bold hidden md:block", isActive ? "text-brand-rose" : "text-neutral-600")}>{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-8 md:p-12">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

        <div className="flex justify-between mt-12 pt-8 border-t border-neutral-100">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className={cn("flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all", currentStep === 0 ? "opacity-0 pointer-events-none" : "text-neutral-500 hover:bg-neutral-50")}
          >
            <ChevronLeft className="w-5 h-5" /> Voltar
          </button>
          
          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={
                (currentStep === 0 && !formData.analise) ||
                (currentStep === 1 && formData.areas.length === 0) ||
                (currentStep === 2 && (!formData.tipoProcedimento || !formData.objetivo))
              }
              className="flex items-center gap-2 bg-neutral-900 text-white px-10 py-3 rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex flex-col items-end gap-3">
              {!user ? (
                <button type="button" onClick={login} className="flex items-center gap-2 bg-brand-gold text-white px-10 py-3 rounded-xl font-bold hover:bg-brand-gold/90 transition-all shadow-xl">
                  <LogIn className="w-5 h-5" /> Entrar para Simular
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!formData.consentimento || !formData.nome || !formData.email}
                  className="flex items-center gap-2 bg-brand-rose text-neutral-900 px-10 py-3 rounded-xl font-bold hover:bg-brand-rose/90 transition-all shadow-xl disabled:opacity-50"
                >
                  Gerar Plano <Send className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
