import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";
import tutorAvatar from "@/assets/tutor-avatar.png";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
        isUser ? "bg-primary" : "bg-accent border border-border"
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <img src={tutorAvatar} alt="Tutor" className="w-7 h-7 rounded-full" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
        isUser
          ? "bg-chat-user text-chat-user-foreground rounded-tr-sm"
          : "bg-chat-ai text-chat-ai-foreground rounded-tl-sm border border-border"
      }`}>
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:text-chat-ai-foreground prose-p:text-chat-ai-foreground prose-li:text-chat-ai-foreground prose-strong:text-chat-ai-foreground prose-code:bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        <p className={`text-[10px] mt-1.5 ${isUser ? "text-chat-user-foreground/60" : "text-muted-foreground"}`}>
          {new Date(message.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
