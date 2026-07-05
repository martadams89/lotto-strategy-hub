// Cloudflare Pages middleware — agent surface. Path-routed:
//   /mcp                  -> MCP server (JSON-RPC 2.0)
//   /.well-known/mcp.json -> MCP Server Card
//   else                  -> Markdown-for-Agents negotiation, else passthrough
// submit_enquiry posts to this site's real contact form (Web3Forms).
const PROTOCOL_VERSION = '2025-06-18';
const WEB3FORMS_KEY = ''; // no contact API on this site

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url), origin = url.origin, site = url.hostname;

  if (url.pathname === '/.well-known/mcp.json') return json(mcpCard(origin, site));
  if (url.pathname === '/mcp') return handleMcp(request, origin, site);

  const accept = request.headers.get('Accept') || '';
  const wantsMd = /text\/markdown/i.test(accept) && !/text\/html/i.test((accept.split(',')[0] || ''));
  const res = await next();
  const ct = res.headers.get('Content-Type') || '';
  if (!ct.includes('text/html')) return res;
  if (!wantsMd || res.status !== 200) { const r = new Response(res.body, res); r.headers.set('Vary', 'Accept'); return r; }
  return new Response(htmlToMarkdown(await res.text(), origin), { status: 200, headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Vary': 'Accept', 'X-Robots-Tag': 'all' } });
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
function json(o, s = 200) { return new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } }); }
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
