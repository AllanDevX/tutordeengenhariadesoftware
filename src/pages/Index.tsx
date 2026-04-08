import { useState, useRef, useEffect } from "react";
import { GraduationCap, BookOpen } from "lucide-react";
import ChatMessage, { Message } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import SuggestionChip from "@/components/SuggestionChip";
import tutorAvatar from "@/assets/tutor-avatar.png";

const SUGGESTIONS = [
  "Quais são os 4 valores do Manifesto Ágil?",
  "Explique as propriedades de Segurança de Software",
  "Qual a diferença entre Reuso e Componentes?",
  "Como a IA se aplica na Engenharia de Software?",
];

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = (content: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Ótima pergunta! Vou responder com base nos materiais da disciplina.\n\n> _Funcionalidade de IA será conectada em breve._\n\nPor enquanto, esta é uma **demonstração visual** do chatbot.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-accent border border-border flex items-center justify-center overflow-hidden">
          <img src={tutorAvatar} alt="Tutor" className="w-8 h-8" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-primary" />
            Tutor de Engenharia de Software II
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            Prof. Dr. Helano Matos • Centro Universitário Farias Brito
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
          <BookOpen className="w-3.5 h-3.5" />
          5 unidades
        </div>
      </header>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-accent border border-border flex items-center justify-center mb-5 overflow-hidden">
              <img src={tutorAvatar} alt="Tutor" className="w-16 h-16" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Olá! Sou seu tutor de Eng. de Software II
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mb-8">
              Posso responder perguntas sobre <strong>Métodos Ágeis</strong>, <strong>Segurança de Software</strong>, <strong>IA na Engenharia de Software</strong>, <strong>Componentes</strong> e <strong>Reuso de Software</strong>.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {SUGGESTIONS.map((s) => (
                <SuggestionChip key={s} label={s} onClick={() => handleSend(s)} />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
};

export default Index;
