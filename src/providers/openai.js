export async function callOpenAI(messages, { json = false, temperature = 0.2, max_tokens = 1200 } = {}) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const projectId = process.env.OPENAI_PROJECT_ID;
  const orgId = process.env.OPENAI_ORG_ID;
  
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY in environment');
  }
  
  // Debug: Log API key prefix to verify it's the right one
  console.log(`Using API key starting with: ${apiKey.substring(0, 10)}...`);
  console.log(`API key length: ${apiKey.length}`);
  console.log(`Using model: ${model}`);
  console.log(`Project ID: ${projectId || 'not set'}`);
  console.log(`Org ID: ${orgId || 'not set'}`);
  
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
  
  // Add project context for project keys
  if (apiKey.startsWith('sk-proj-') && projectId) {
    headers['OpenAI-Project'] = projectId;
  }
  if (orgId) {
    headers['OpenAI-Organization'] = orgId;
  }
  
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      temperature,
      max_tokens,
      response_format: json ? { type: 'json_object' } : undefined,
      messages
    })
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI error ${resp.status}: ${text}`);
  }
  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content || '';
  return content;
}

export function forceJson(text) {
  // Extract a JSON object from a model response that might have extra text
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) return null;
  try {
    return JSON.parse(text.slice(first, last + 1));
  } catch (e) {
    return null;
  }
}
