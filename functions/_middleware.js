// Cloudflare Pages middleware — Markdown for Agents (content negotiation).
// When a client sends `Accept: text/markdown`, HTML pages are returned as
// Markdown while browsers keep getting HTML. RFC-friendly agent readiness.

export async function onRequest(context) {
  const { request, next } = context;
  const accept = request.headers.get('Accept') || '';
  const wantsMarkdown = /text\/markdown/i.test(accept) && !/text\/html/i.test(accept.split(',')[0] || '');

  const response = await next();

  // Only transform successful HTML document responses.
  const ctype = response.headers.get('Content-Type') || '';
  if (!wantsMarkdown || !ctype.includes('text/html') || response.status !== 200) {
    // Advertise availability even when serving HTML.
    if (ctype.includes('text/html')) {
      const r = new Response(response.body, response);
      const vary = r.headers.get('Vary');
      r.headers.set('Vary', vary ? `${vary}, Accept` : 'Accept');
      return r;
    }
    return response;
  }

  const html = await response.text();
  const markdown = htmlToMarkdown(html, new URL(request.url).origin);
  const tokens = markdown.trim().split(/\s+/).length;

  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept',
      'X-Markdown-Tokens': String(tokens),
      'X-Robots-Tag': 'all',
    },
  });
}

// Lightweight, dependency-free HTML → Markdown for main page content.
function htmlToMarkdown(html, origin) {
  let title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').trim();
  let desc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] || '').trim();

  // Isolate the main content region if present, else the body.
  let body = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1]
    || html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]
    || html;

  // Drop non-content elements.
  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const decode = (s) => s
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—').replace(/&trade;/g, '™').replace(/&copy;/g, '©');

  let md = body
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n# ${strip(t)}\n\n`)
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${strip(t)}\n\n`)
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${strip(t)}\n\n`)
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n\n#### ${strip(t)}\n\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `- ${strip(t)}\n`)
    .replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, t) => {
      const txt = strip(t); if (!txt) return '';
      const url = href.startsWith('/') ? origin + href : href;
      return `[${txt}](${url})`;
    })
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `**${strip(t)}**`)
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, __, t) => `*${strip(t)}*`)
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `\n\n${strip(t)}\n\n`)
    .replace(/<br\s*\/?>(?!\n)/gi, '\n');

  function strip(s) { return decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim(); }

  md = decode(md.replace(/<[^>]+>/g, ' '))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '');

  const head = `# ${title || 'Page'}\n${desc ? `\n> ${desc}\n` : ''}`;
  return `${head}\n\n${md}\n`;
}
