import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, User, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

const STACK_OPTIONS = [
  "Python (Flask)",
  "Python (Django)",
  "Java (Spring Boot)",
  "Node.js (Express)",
  "TypeScript",
  "React",
  "Next.js",
  "PostgreSQL",
  "Docker",
];

const FOCUS_OPTIONS = ["Backend", "Frontend", "Fullstack", "Mobile", "DevOps", "Data/IA"];

const profileSchema = z.object({
  display_name: z.string().trim().max(80, "Máximo 80 caracteres").optional().or(z.literal("")),
  institution: z.string().trim().max(120, "Máximo 120 caracteres").optional().or(z.literal("")),
  focus: z.string().trim().max(40).optional().or(z.literal("")),
  current_project: z.string().trim().max(200, "Máximo 200 caracteres").optional().or(z.literal("")),
  response_style: z.string().trim().max(300, "Máximo 300 caracteres").optional().or(z.literal("")),
});

type ProfileForm = {
  display_name: string;
  institution: string;
  focus: string;
  stack: string[];
  current_project: string;
  response_style: string;
  avatar_url: string;
};

const empty: ProfileForm = {
  display_name: "",
  institution: "",
  focus: "",
  stack: [],
  current_project: "",
  response_style: "",
  avatar_url: "",
};

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileForm>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Meu Perfil | Tutor ES II";
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) {
        toast.error("Erro ao carregar perfil");
      } else if (data) {
        setForm({
          display_name: data.display_name ?? "",
          institution: data.institution ?? "",
          focus: data.focus ?? "",
          stack: data.stack ?? [],
          current_project: data.current_project ?? "",
          response_style: data.response_style ?? "",
          avatar_url: data.avatar_url ?? "",
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const toggleStack = (tech: string) => {
    setForm((f) => ({
      ...f,
      stack: f.stack.includes(tech) ? f.stack.filter((s) => s !== tech) : [...f.stack, tech],
    }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error("Use uma imagem JPG, PNG ou WEBP");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Imagem deve ter no máximo 2MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });
    if (upErr) {
      setUploading(false);
      toast.error("Erro ao enviar imagem");
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = pub.publicUrl;
    const { error: dbErr } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setUploading(false);
    if (dbErr) {
      toast.error("Erro ao salvar avatar");
      return;
    }
    setForm((f) => ({ ...f, avatar_url: publicUrl }));
    toast.success("Avatar atualizado!");
  };

  const handleSave = async () => {
    if (!user) return;
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Dados inválidos");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...form, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) toast.error("Erro ao salvar perfil");
    else toast.success("Perfil atualizado!");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold">Meu Perfil</h1>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6">
        <Card className="p-5 sm:p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="display_name">Nome de exibição</Label>
            <Input
              id="display_name"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              placeholder="Ex.: Allan Richard"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution">Curso / Instituição</Label>
            <Input
              id="institution"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              placeholder="Ex.: Ciência da Computação - FBUNI"
            />
          </div>

          <div className="space-y-2">
            <Label>Foco de atuação</Label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_OPTIONS.map((f) => (
                <Badge
                  key={f}
                  variant={form.focus === f ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setForm({ ...form, focus: form.focus === f ? "" : f })}
                >
                  {f}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Stack principal</Label>
            <div className="flex flex-wrap gap-2">
              {STACK_OPTIONS.map((tech) => (
                <Badge
                  key={tech}
                  variant={form.stack.includes(tech) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleStack(tech)}
                >
                  {tech}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Clique para selecionar. O tutor priorizará exemplos nessas tecnologias.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_project">Projeto atual</Label>
            <Input
              id="current_project"
              value={form.current_project}
              onChange={(e) => setForm({ ...form, current_project: e.target.value })}
              placeholder="Ex.: Geração Tech (IA Generativa e RAG)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="response_style">Estilo de resposta preferido</Label>
            <Textarea
              id="response_style"
              value={form.response_style}
              onChange={(e) => setForm({ ...form, response_style: e.target.value })}
              placeholder="Ex.: Direto, técnico e acadêmico, com citações dos slides."
              rows={3}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando…" : "Salvar perfil"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
