const TypingIndicator = () => (
  <div className="flex gap-3 animate-in fade-in duration-300">
    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-accent border border-border flex items-center justify-center">
      <span className="text-sm">🤖</span>
    </div>
    <div className="bg-chat-ai border border-border rounded-2xl rounded-tl-sm px-4 py-3">
      <div className="flex gap-1.5 items-center h-5">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  </div>
);

export default TypingIndicator;
