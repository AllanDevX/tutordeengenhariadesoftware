import { useState, useRef, useEffect, useCallback } from "react";
import { GraduationCap, BookOpen } from "lucide-react";
import ChatMessage, { Message } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import SuggestionChip from "@/components/SuggestionChip";
import { ChatSidebar } from "@/components/ChatSidebar";
import { UserMenu } from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useConversations } from "@/hooks/useConversations";
import { streamChat } from "@/lib/streamChat";
import { toast } from "sonner";
import tutorAvatar from "@/assets/tutor-avatar.png";

const SUGGESTIONS = [
  "Quais são os 4 valores do Manifesto Ágil?",
  "Explique as propriedades de Segurança de Software",
  "Qual a diferença entre Reuso e Componentes?",
  "Como a IA se aplica na Engenharia de Software?",
];

const Index = () => {
  const {
    conversations,
    activeId,
    activeConversation,
    createConversation,
    updateMessages,
    deleteConversation,
    selectConversation,
    startNewChat,
  } = useConversations();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const skipSyncRef = useRef(false);

  // Sync messages when switching conversations
  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    if (activeConversation) {
      setMessages(activeConversation.messages);
    } else {
      setMessages([]);
    }
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = useCallback(
    async (content: string) => {
      // If no active conversation, create one
      let convId = activeId;
      if (!convId) {
        skipSyncRef.current = true;
        convId = createConversation();
      }

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      updateMessages(convId, updatedMessages);
      setIsLoading(true);

      let assistantSoFar = "";
      const assistantId = crypto.randomUUID();

      const chatMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        await streamChat({
          messages: chatMessages,
          onDelta: (chunk) => {
            assistantSoFar += chunk;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              const newMessages =
                last?.id === assistantId
                  ? prev.map((m, i) =>
                      i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
                    )
                  : [
                      ...prev,
                      {
                        id: assistantId,
                        role: "assistant" as const,
                        content: assistantSoFar,
                        timestamp: new Date(),
                      },
                    ];
              // Persist to conversation
              updateMessages(convId!, newMessages);
              return newMessages;
            });
          },
          onDone: () => setIsLoading(false),
          onError: (error) => {
            toast.error(error);
            setIsLoading(false);
          },
        });
      } catch (e) {
        console.error(e);
        toast.error("Erro ao conectar com o tutor. Tente novamente.");
        setIsLoading(false);
      }
    },
    [activeId, messages, createConversation, updateMessages]
  );

  const handleNewChat = useCallback(() => {
    startNewChat();
    setMessages([]);
  }, [startNewChat]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      selectConversation(id);
    },
    [selectConversation]
  );

  const isEmpty = messages.length === 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ChatSidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelectConversation}
          onNew={handleNewChat}
          onDelete={deleteConversation}
        />

        <div className="flex-1 flex flex-col h-screen min-w-0">
          {/* Header */}
          <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-3 shrink-0">
            <SidebarTrigger className="mr-1" />
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
              13 módulos
            </div>
            <ThemeToggle />
            <UserMenu />
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
                  Posso responder perguntas sobre <strong>Métodos Ágeis</strong>,{" "}
                  <strong>Segurança de Software</strong>,{" "}
                  <strong>IA na Engenharia de Software</strong>,{" "}
                  <strong>Componentes</strong> e <strong>Reuso de Software</strong>.
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
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <TypingIndicator />
                )}
              </div>
            )}
          </div>

          {/* Input */}
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
