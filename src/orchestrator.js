import { callOpenAI, forceJson } from './providers/openai.js';
import { DEFAULT_PERSONAS, personaSystemPrompt, MODERATOR_PROMPT, DEBATE_TURN_PROMPT, SCRIBE_PROMPT } from './personas.js';

function sanitizeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

function toMessages(system, user) {
  return [
    { role: 'system', content: system },
    { role: 'user', content: user }
  ];
}

export async function runSession(input) {
  const personas = (input.personas && input.personas.length ? input.personas : DEFAULT_PERSONAS).slice(0, 3);
  const context = input.context || '';
  const figmaUrl = input.figmaUrl || '';
  const sources = sanitizeArray(input.sources);
  const sliders = input.sliders || { harshness: 3, innovation_bias: 'neutral', horizon: 'MVP' };

  const baseUser = `
SESSION GOAL: Deliver a high‑value design critique so the human is better prepared for real reviews.
FIGMA: ${figmaUrl || '(none provided)'}
CONTEXT (from organizer): 
${context}

SOURCES (optional): 
${sources.join('\n') || '(none)'}

OUTPUT: Strict JSON per persona schema.
`;

  // Phase 1: Individual reviews
  const individual = [];
  for (const role of personas) {
    const sys = personaSystemPrompt(role, sliders);
    const res = await callOpenAI(toMessages(sys, baseUser), { json: true, temperature: 0.2 });
    let parsed = null;
    try {
      parsed = JSON.parse(res);
    } catch (e) {
      parsed = forceJson(res);
    }
    if (!parsed) {
      // Fallback minimal structure
      parsed = { findings: [], open_questions: [], actions: [] };
    }
    individual.push({ role, output: parsed, raw: res });
  }

  // Phase 2: Moderator summary of alignment/conflict
  const personaFindingsBrief = individual.map(p => ({
    role: p.role,
    findings: (p.output.findings || []).map(f => ({ area: f.area, severity: f.severity, finding: f.finding }))
  }));
  const moderatorInput = `Persona findings (brief):
${JSON.stringify(personaFindingsBrief, null, 2)}`;
  const moderatorRes = await callOpenAI(toMessages('You are concise and precise.', MODERATOR_PROMPT + '\n\n' + moderatorInput), { json: true });
  let moderator = null;
  try { moderator = JSON.parse(moderatorRes); } catch { moderator = forceJson(moderatorRes) || { alignment: [], conflicts: [] }; }

  // Phase 3: One debate turn (each persona reacts to others)
  const claims = [...(moderator.alignment || []), ...(moderator.conflicts || [])].map(c => `• ${c}`);
  const debateTurns = [];
  for (const p of individual) {
    const debateMsg = `Claims from others:\n${claims.join('\n') || '(none)'}\n\nRespond.`;
    const sys = personaSystemPrompt(p.role, sliders);
    const res = await callOpenAI(toMessages(sys, DEBATE_TURN_PROMPT + '\n\n' + debateMsg), { json: true, max_tokens: 800 });
    let arr = null;
    try { arr = JSON.parse(res); } catch { arr = forceJson(res) || []; }
    debateTurns.push({ role: p.role, reactions: arr });
  }

  // Phase 4: Synthesis
  const synthesisInput = {
    personas: individual.map(p => ({ role: p.role, output: p.output })),
    debate: debateTurns,
    moderator
  };
  const scribeUser = `SYNTHESIZE THIS:\n${JSON.stringify(synthesisInput, null, 2)}`;
  const scribeRes = await callOpenAI(toMessages('You convert debates into crisp deliverables.', SCRIBE_PROMPT + '\n\n' + scribeUser), { json: true, max_tokens: 1600 });
  let finalOut = null;
  try { finalOut = JSON.parse(scribeRes); } catch { finalOut = forceJson(scribeRes); }
  if (!finalOut) {
    finalOut = { summary: '', top_findings: [], open_questions: [], actions: [], transcript: [] };
  }

  // Attach raw transcript (compact) for transparency
  const transcript = [];
  for (const p of individual) {
    transcript.push({ agent: p.role, content: `Initial review: ${JSON.stringify(p.output)}` });
  }
  for (const d of debateTurns) {
    transcript.push({ agent: d.role, content: `Debate reactions: ${JSON.stringify(d.reactions)}` });
  }
  finalOut.transcript = finalOut.transcript && finalOut.transcript.length ? finalOut.transcript : transcript;

  return finalOut;
}
