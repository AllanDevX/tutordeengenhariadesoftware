import { Plus, MessageSquare, Trash2, GraduationCap, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation } from "@/hooks/useConversations";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: ChatSidebarProps) {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const collapsed = state === "collapsed";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Hoje";
    if (days === 1) return "Ontem";
    if (days < 7) return `${days} dias atrás`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-3">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <GraduationCap className="w-5 h-5 text-primary shrink-0" />
          {!collapsed && (
            <span className="text-sm font-semibold text-foreground truncate">
              Tutor ES II
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-3 mb-2">
          <Button
            onClick={onNew}
            variant="outline"
            size={collapsed ? "icon" : "default"}
            className={cn("w-full", collapsed && "w-9 h-9")}
          >
            <Plus className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Nova conversa</span>}
          </Button>
        </div>

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs text-muted-foreground px-3">
              Histórico
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {conversations.length === 0 && !collapsed && (
                <p className="text-xs text-muted-foreground px-3 py-4 text-center">
                  Nenhuma conversa ainda
                </p>
              )}
              {conversations.map((conv) => (
                <SidebarMenuItem key={conv.id}>
                  <SidebarMenuButton
                    onClick={() => onSelect(conv.id)}
                    className={cn(
                      "group relative w-full",
                      activeId === conv.id && "bg-accent text-accent-foreground"
                    )}
                    tooltip={collapsed ? conv.title : undefined}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    {!collapsed && (
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm truncate">{conv.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(conv.updatedAt)}
                        </p>
                      </div>
                    )}
                    {!collapsed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-2">
        {!collapsed && user && (
          <p className="text-[10px] text-muted-foreground text-center truncate">
            {user.email}
          </p>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn("w-full text-muted-foreground hover:text-destructive", collapsed && "w-9 h-9")}
          onClick={signOut}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
