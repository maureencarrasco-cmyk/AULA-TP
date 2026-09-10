import { NextResponse } from "next/server";
import {
  replyAsClimatizacionTutor,
  type TutorContext,
} from "@/lib/tutor-climatizacion-expert";

export const dynamic = "force-dynamic";

type Body = {
  message?: string;
  context?: TutorContext;
};

async function tryLlmReply(
  message: string,
  context: TutorContext,
): Promise<string | null> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const tutorUrl = process.env.TUTOR_LLM_URL;

  const system = [
    "Eres Tutor Aula TP · especialista en Refrigeración y Climatización (EMTP Chile).",
    "Pedagogía: pistas graduales; NUNCA entregues la respuesta completa ni listes todas las opciones correctas.",
    "Temas: NCh3241, EPP, refrigerantes (R-410A), recuperación, hermeticidad, manómetros, soldadura, planos, diagnóstico, montaje, mantención, reciclaje.",
    "Responde en español chileno, breve (máx. ~120 palabras). Termina con una pregunta guía.",
    "Disclaimer: no reemplazas normas ni al docente.",
    context.estacionTitulo
      ? `Estación: ${context.estacionTitulo}`
      : "",
    context.pregunta ? `Pregunta pedagógica: ${context.pregunta}` : "",
    context.evidenciaMinima
      ? `Evidencia mínima: ${context.evidenciaMinima}`
      : "",
    context.etapa ? `Etapa: ${context.etapa}` : "",
    context.agentHints?.length
      ? `Pistas de estación disponibles: ${context.agentHints
          .map((h) => `N${h.nivel}: ${h.pregunta}`)
          .join(" | ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    if (tutorUrl) {
      const res = await fetch(tutorUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, context, system }),
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { reply?: string; text?: string };
      return data.reply || data.text || null;
    }

    if (openaiKey) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_TUTOR_MODEL || "gpt-4o-mini",
          temperature: 0.4,
          max_tokens: 320,
          messages: [
            { role: "system", content: system },
            { role: "user", content: message },
          ],
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      return data.choices?.[0]?.message?.content?.trim() || null;
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: "JSON inválido" },
      { status: 400 },
    );
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json(
      { error: "message requerido" },
      { status: 400 },
    );
  }

  const context: TutorContext = body.context ?? {};

  const llm = await tryLlmReply(message, context);
  if (llm) {
    return NextResponse.json({ reply: llm, source: "llm" });
  }

  const expert = replyAsClimatizacionTutor(message, context);
  return NextResponse.json({
    reply: expert.reply,
    intent: expert.intent,
    nextHintLevel: expert.nextHintLevel,
    source: "expert",
  });
}
