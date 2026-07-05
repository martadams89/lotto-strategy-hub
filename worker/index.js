// Cloudflare Worker (Static Assets) — agent surface for lotto-hub.
// This project deploys as a Worker with static assets (wrangler `assets` +
// SPA fallback). Pages-style functions/_middleware.js does NOT run here, so the
// agent surface lives in this Worker `main`:
//   /mcp                  -> MCP server (JSON-RPC 2.0)
//   /.well-known/mcp.json -> MCP Server Card
//   /agents               -> human/agent MCP docs (rich-results JSON-LD)
//   discovery docs        -> agent-skills, auth.md, Web Bot Auth directory
//   everything else       -> env.ASSETS (the built SPA), with Markdown
//                            negotiation + WebMCP injection on HTML.
const PROTOCOL_VERSION = '2025-06-18';
const WEB3FORMS_KEY = '';
// Web Bot Auth signing directory (published public key; RFC-9421 message signatures).
const WEBBOTAUTH = { keys: [{ crv: 'Ed25519', x: '8pb8MgByDTQEwjSlGawfpPUXCDmMK5epo_b_34O1rHo', kty: 'OKP', kid: 'zYX3GdCfOks5c-YLnzhauxW6X4biN5zVyIa4eN2hG04', use: 'sig', alg: 'Ed25519' }] };

export default {
  async fetch(request, env) {
    const url = new URL(request.url), origin = url.origin, site = url.hostname, p = url.pathname;

    if (p === '/.well-known/mcp.json') return json(mcpCard(origin, site));
    if (p === '/mcp') return handleMcp(request, origin, site);
    if (p === '/.well-known/http-message-signatures-directory') return json(WEBBOTAUTH, 200, 'application/http-message-signatures-directory+json');
    if (p === '/.well-known/agent-skills/index.json') return json(await agentSkills(origin));
    if (p === '/auth.md') return new Response(authMd(origin, site), { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Access-Control-Allow-Origin': '*' } });
    if (p === '/agents' || p === '/agents/') return new Response(agentsPage(origin, site), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });

    const accept = request.headers.get('Accept') || '';
    const wantsMd = /text\/markdown/i.test(accept) && !/text\/html/i.test((accept.split(',')[0] || ''));
    const res = await env.ASSETS.fetch(request);
    const ct = res.headers.get('Content-Type') || '';
    if (!ct.includes('text/html')) return res;
    if (wantsMd && res.status === 200) return new Response(htmlToMarkdown(await res.text(), origin), { status: 200, headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Vary': 'Accept', 'X-Robots-Tag': 'all' } });
    // HTML: inject a WebMCP registration so in-browser agents see the same tools.
    const html = await res.text();
    const out = html.includes('</body>') ? html.replace('</body>', webmcpScript() + '</body>') : html + webmcpScript();
    const h = new Headers(res.headers); h.set('Vary', 'Accept'); h.delete('Content-Length');
    return new Response(out, { status: res.status, headers: h });
  },
};

function webmcpScript() {
  return `<script>(function(){try{var m=navigator.modelContext;if(!m||!m.provideContext)return;async function c(n,a){var r=await fetch('/mcp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:n,arguments:a||{}}})});var d=await r.json();return (d.result&&d.result.content&&d.result.content[0]&&d.result.content[0].text)||JSON.stringify(d);}m.provideContext({tools:[{name:'get_site_overview',description:'Overview of this business/product.',inputSchema:{type:'object',properties:{}},execute:function(){return c('get_site_overview');}},{name:'submit_enquiry',description:'Send a contact enquiry (name,email,message).',inputSchema:{type:'object',properties:{name:{type:'string'},email:{type:'string'},message:{type:'string'}},required:['email','message']},execute:function(a){return c('submit_enquiry',a);}}]});}catch(e){}})();</script>`;
}
async function sha256hex(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
async function agentSkills(origin) {
  const skills = await Promise.all(TOOLS.map(async t => ({ name: t.name, type: 'mcp-tool', description: t.description, url: `${origin}/mcp`, sha256: await sha256hex(t.name + '\n' + t.description) })));
  return { '$schema': 'https://agentskills.io/schema/v0.2.0/index.json', version: '0.2.0', skills };
}
function authMd(origin, site) {
  // H1 MUST contain the literal "auth.md" (isitagentready auth.md skill).
  return `# auth.md — ${site}\n\n`
    + `Agent authentication & access metadata for **${site}**, following the auth.md convention (https://workos.com/auth-md).\n\n`
    + `## Audience\nAI agents and answer engines connecting to this site's Model Context Protocol server.\n\n`
    + `## Connect\n- MCP endpoint: \`${origin}/mcp\` (JSON-RPC 2.0, streamable HTTP)\n- Server card: \`${origin}/.well-known/mcp.json\`\n- Skills index: \`${origin}/.well-known/agent-skills/index.json\`\n\n`
    + `## Registration & provisioning\nNo registration is required — the tools are public and read-only, except \`submit_enquiry\`, which forwards a contact message (also no credentials).\n\n`
    + `## Supported methods & credentials\nOpen access over HTTPS; no authentication or bearer token is needed. There is no protected resource on this site.\n\n`
    + `## Identity / signed requests\nAgents may verify this origin via Web Bot Auth: \`${origin}/.well-known/http-message-signatures-directory\`.\n\n`
    + `## Contact & data rights\nUse the \`submit_enquiry\` or \`get_contact_and_data_rights\` tools, or the contact form on ${site}.\n`;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Human + machine readable "/agents" landing page (WebAPI + FAQPage JSON-LD for rich results).
function agentsPage(origin, site) {
  const faq = [
    ['What is this?', `${site} publishes a Model Context Protocol (MCP) server so AI agents and assistants can read the site and take a few safe actions on a visitor's behalf.`],
    ['How do I connect?', `Point any MCP client at ${origin}/mcp — JSON-RPC 2.0 over HTTPS (streamable-http). No API key or registration is required.`],
    ['What can an agent do here?', `${TOOLS.map(t => t.name).join(', ')}.`],
    ['Do agents need to authenticate?', `No. The tools are public and read-only, except submit_enquiry, which forwards a contact message.`],
    ['How do I discover this automatically?', `Fetch ${origin}/.well-known/mcp.json (server card), ${origin}/.well-known/agent-skills/index.json (skills), or ${origin}/llms.txt. There is also a DNS-AID record at _index._agents.${site}.`],
  ];
  const toolRows = TOOLS.map(t => `<tr><td><code>${esc(t.name)}</code></td><td>${esc(t.description)}</td></tr>`).join('');
  const jsonld = [
    { '@context': 'https://schema.org', '@type': 'WebAPI', name: `${site} MCP server`,
      description: `Model Context Protocol server for ${site}: site overview, page content as Markdown, and a contact/enquiry tool.`,
      documentation: `${origin}/agents`, provider: { '@type': 'Organization', name: site, url: origin },
      serviceType: 'Model Context Protocol', url: `${origin}/mcp` },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: site, item: origin },
        { '@type': 'ListItem', position: 2, name: 'AI agents & MCP', item: `${origin}/agents` },
      ] },
  ];
  const faqHtml = faq.map(([q, a]) => `<div class="q"><h3>${esc(q)}</h3><p>${esc(a)}</p></div>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI agents &amp; MCP — ${esc(site)}</title>
<meta name="description" content="How AI agents connect to ${esc(site)} via its Model Context Protocol (MCP) server, and what tools are available.">
<link rel="canonical" href="${origin}/agents">
<meta property="og:title" content="AI agents &amp; MCP — ${esc(site)}">
<meta property="og:description" content="Connect any MCP client to ${esc(site)} and read the site or send an enquiry.">
<meta property="og:type" content="website"><meta property="og:url" content="${origin}/agents">
<link rel="alternate" type="application/json" href="${origin}/.well-known/mcp.json" title="MCP Server Card">
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<style>
:root{color-scheme:light dark;--bg:#fff;--fg:#1a1f2b;--dim:#5b6472;--card:#f6f8fb;--bd:#e3e8ef;--ac:#2b6cff;--code:#eef2f7}
@media(prefers-color-scheme:dark){:root{--bg:#0e1117;--fg:#e6eaf0;--dim:#9aa4b2;--card:#161b23;--bd:#232a35;--ac:#6ea0ff;--code:#1b2230}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
main{max-width:820px;margin:0 auto;padding:48px 20px 80px}
h1{font-size:2rem;margin:0 0 6px}.sub{color:var(--dim);margin:0 0 32px}
h2{font-size:1.15rem;margin:36px 0 12px}h3{font-size:1rem;margin:0 0 4px}
a{color:var(--ac)}code{background:var(--code);padding:2px 6px;border-radius:5px;font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
.card{background:var(--card);border:1px solid var(--bd);border-radius:12px;padding:16px 18px;margin:0 0 14px}
pre{background:var(--card);border:1px solid var(--bd);border-radius:10px;padding:14px 16px;overflow-x:auto}
pre code{background:none;padding:0}table{width:100%;border-collapse:collapse;font-size:14px}
td{padding:9px 10px;border-top:1px solid var(--bd);vertical-align:top}tr td:first-child{white-space:nowrap;width:1%}
ul.links{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px}ul.links a{display:inline-block;background:var(--card);border:1px solid var(--bd);border-radius:99px;padding:6px 12px;font-size:13px;text-decoration:none}
.q{margin:0 0 14px}.q p{margin:2px 0 0;color:var(--dim)}
</style></head><body><main>
<h1>AI agents &amp; MCP</h1>
<p class="sub">${esc(site)} speaks the <strong>Model Context Protocol</strong> — connect an agent and it can read the site or send an enquiry.</p>
<h2>Connect</h2>
<div class="card">Endpoint: <code>${origin}/mcp</code> · JSON-RPC 2.0 over HTTPS (streamable-http) · no key required</div>
<pre><code>curl -X POST ${origin}/mcp \\
  -H 'Content-Type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'</code></pre>
<h2>Tools</h2>
<div class="card" style="padding:0"><table><tbody>${toolRows}</tbody></table></div>
<h2>Questions</h2>
${faqHtml}
<h2>Machine-readable discovery</h2>
<ul class="links">
<li><a href="${origin}/.well-known/mcp.json">mcp.json</a></li>
<li><a href="${origin}/.well-known/agent-skills/index.json">agent-skills</a></li>
<li><a href="${origin}/llms.txt">llms.txt</a></li>
<li><a href="${origin}/auth.md">auth.md</a></li>
<li><a href="${origin}/.well-known/security.txt">security.txt</a></li>
</ul>
</main></body></html>`;
}

function mcpCard(origin, site) {
  return { name: `${site} MCP`, description: `Model Context Protocol server for ${site}: product/service info, page content, and a contact/enquiry tool.`,
    version: '1.0.0', protocolVersion: PROTOCOL_VERSION, transport: 'streamable-http', endpoint: `${origin}/mcp`, authentication: 'none',
    tools: TOOLS.map(t => ({ name: t.name, description: t.description })) };
}
const TOOLS = [
  { name: 'get_site_overview', description: 'Structured overview of this business/product (from its llms.txt).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: async (_a, origin) => text(await fetchText(`${origin}/llms.txt`)) },
  { name: 'list_pages', description: 'List public pages (from the XML sitemap).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: async (_a, origin) => { const x = await fetchText(`${origin}/sitemap.xml`); return text([...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).join('\n') || 'none'); } },
  { name: 'read_page', description: 'Fetch a page on this site as Markdown. Arg: url.',
    inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'], additionalProperties: false },
    run: async (a, origin) => { const u = String(a?.url || origin); if (!u.startsWith(origin)) return text('Refused: off-site url.'); return text(htmlToMarkdown(await fetchText(u), origin)); } },
  { name: 'submit_enquiry', description: 'Send a contact enquiry to this business. Args: name, email, message.',
    inputSchema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, message: { type: 'string' } }, required: ['email', 'message'], additionalProperties: false },
    run: async (a, origin, site) => {
      if (!WEB3FORMS_KEY) return text(`This site has no enquiry API; email the contact in ${origin}/.well-known/security.txt`);
      if (!a?.email || !a?.message) return text('email and message are required.');
      const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: WEB3FORMS_KEY, name: a.name || 'Agent enquiry', email: a.email, message: a.message, subject: `Enquiry via ${site} MCP`, from_name: `${site} MCP` }) });
      const d = await r.json().catch(() => ({}));
      return text(d.success ? `Sent ✓ — the ${site} team will reply to ${a.email}.` : `Could not send: ${d.message || r.status}`);
    } },
  { name: 'get_contact_and_data_rights', description: 'How to contact this business and exercise data rights (export/deletion).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: async (_a, origin, site) => text(`Contact & data rights for ${site}:\n- Website: ${origin}/\n- Enquiries: use the submit_enquiry tool, or the contact form at ${origin}/\n- Data export & deletion: sign in on the site and use the in-app privacy controls.\n- Security: ${origin}/.well-known/security.txt`) },
];

async function handleMcp(request, origin, site) {
  if (request.method === 'GET') return json({ name: `${site} MCP`, endpoint: `${origin}/mcp`, protocolVersion: PROTOCOL_VERSION });
  if (request.method !== 'POST') return json(rpcError(null, -32600, 'POST only'), 405);
  let req; try { req = await request.json(); } catch { return json(rpcError(null, -32700, 'Parse error')); }
  const { id = null, method, params } = req || {};
  if (method === 'initialize') return json(rpcOk(id, { protocolVersion: PROTOCOL_VERSION, capabilities: { tools: { listChanged: false } }, serverInfo: { name: `${site} MCP`, version: '1.0.0' } }));
  if (String(method).startsWith('notifications/')) return new Response(null, { status: 202 });
  if (method === 'ping') return json(rpcOk(id, {}));
  if (method === 'tools/list') return json(rpcOk(id, { tools: TOOLS.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) }));
  if (method === 'tools/call') {
    const tool = TOOLS.find(t => t.name === params?.name);
    if (!tool) return json(rpcError(id, -32602, `Unknown tool: ${params?.name}`));
    try { return json(rpcOk(id, { content: [await tool.run(params?.arguments || {}, origin, site)], isError: false })); }
    catch (e) { return json(rpcOk(id, { content: [text('Error: ' + (e && e.message || e))], isError: true })); }
  }
  return json(rpcError(id, -32601, `Method not found: ${method}`));
}
const text = s => ({ type: 'text', text: String(s).slice(0, 100000) });
const rpcOk = (id, result) => ({ jsonrpc: '2.0', id, result });
const rpcError = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });
function json(o, s = 200, ct = 'application/json; charset=utf-8') { return new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': ct, 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } }); }
async function fetchText(u) { const r = await fetch(u, { headers: { 'User-Agent': 'agent-mcp' } }); return r.ok ? (await r.text()).slice(0, 200000) : ''; }
function htmlToMarkdown(html, origin) {
  const S = s => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
  const title = S(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
  const desc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] || '').trim();
  let b = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  b = b.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<svg[\s\S]*?<\/svg>/gi, '').replace(/<(nav|header|footer|noscript)[\s\S]*?<\/\1>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  let m = b.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n# ${S(t)}\n\n`).replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${S(t)}\n\n`).replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${S(t)}\n\n`).replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `- ${S(t)}\n`).replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, h, t) => { const x = S(t); return x ? `[${x}](${h[0] === '/' ? origin + h : h})` : ''; }).replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `\n\n${S(t)}\n\n`);
  m = S(m.replace(/<[^>]+>/g, ' ')).replace(/\n{3,}/g, '\n\n');
  return `# ${title || 'Page'}\n${desc ? `\n> ${desc}\n` : ''}\n\n${m}\n`;
}
