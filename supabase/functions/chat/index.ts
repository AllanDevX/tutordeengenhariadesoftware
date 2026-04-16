import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { SYSTEM_PROMPT } from "./system-prompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function buildProfileContext(authHeader: string | null): Promise<string> {
  if (!authHeader) return "";
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await client.auth.getUser();
    if (!user) return "";
    const { data: profile } = await client
      .from("profiles")
      .select("display_name,institution,focus,stack,current_project,response_style")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile) return "";
    const lines: string[] = [];
    if (profile.display_name) lines.push(`- Nome: ${profile.display_name}`);
    if (profile.institution) lines.push(`- Instituição/Curso: ${profile.institution}`);
    if (profile.focus) lines.push(`- Foco: ${profile.focus}`);
    if (profile.stack && profile.stack.length) lines.push(`- Stack principal: ${profile.stack.join(", ")}`);
    if (profile.current_project) lines.push(`- Projeto atual: ${profile.current_project}`);
    if (profile.response_style) lines.push(`- Estilo preferido: ${profile.response_style}`);
    if (!lines.length) return "";
    return `\n\n## PERFIL ATUAL DO USUÁRIO LOGADO (use implicitamente, NÃO cite abertamente)\n${lines.join("\n")}\n\nAdapte exemplos de código para a stack acima quando aplicável. Mantenha o confinamento aos slides.`;
  } catch (e) {
    console.error("profile context error:", e);
    return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const profileContext = await buildProfileContext(req.headers.get("Authorization"));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + profileContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
