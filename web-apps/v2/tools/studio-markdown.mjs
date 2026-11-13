// Deliberately small, offline Markdown renderer. Raw HTML is always escaped.
// Supported: headings, lists, quotes, tables, fences, emphasis, links and Obsidian links.
export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const plain = s => s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_,a,b)=>b||a).replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[*_`]/g,'').trim();
export const slug = s => plain(s).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'section';
export function frontMatter(text) {
  text = text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
  const match = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  const meta = {};
  if (match) for (const line of match[1].split('\n')) {
    const pair = line.match(/^([\w-]+):\s*(.+?)\s*$/);
    if (pair) meta[pair[1]] = pair[2].replace(/^(["'])(.*)\1$/, '$2');
  }
  return {meta, body: match ? text.slice(match[0].length) : text};
}
export function safeHref(value) {
  value = value.trim().replace(/^<|>$/g,'');
  // Reject control-obfuscated protocols, protocol-relative URLs, and unsafe schemes.
  if (/[\u0000-\u0020\u007f\\]/.test(value) || value.startsWith('//')) return null;
  if (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^https?:|^mailto:/i.test(value)) return null;
  return value;
}
function cells(line) {
  return line.trim().replace(/^\||\|$/g,'').split(/(?<!\\)\|/).map(s=>s.trim().replace(/\\\|/g,'|'));
}
export function renderMarkdown(markdown, options = {}) {
  const headings = [], counts = new Map();
  const inline = text => {
    const tokens = [];
    const keep = html => { const n=tokens.push(html)-1; return `\u0001${n}\u0002`; };
    text = text.replace(/\u0001|\u0002/g,'');
    text = text.replace(/`([^`\n]+)`/g,(_,code)=>keep(`<code>${escapeHtml(code)}</code>`));
    text = text.replace(/\[\[([^\]\n]+)\]\]/g,(_,target)=>{
      const [ref,label] = target.split('|');
      const link = options.resolveLink?.(ref, true);
      return keep(link ? `<a href="${escapeHtml(link)}">${inline(label||ref)}</a>` : `<span class="studio-unresolved" title="No unambiguous local target">${escapeHtml(label||ref)}</span>`);
    });
    // Balanced parentheses handle the expansion filenames, which often contain (v0.1).
    text = text.replace(/\[([^\]\n]+)\]\(([^\n]*?)\)(?=$|[\s.,;:!?<]|\))/g, (whole,label,target)=>{
      const opens = (target.match(/\(/g)||[]).length, closes=(target.match(/\)/g)||[]).length;
      if (opens !== closes) return whole;
      const resolved = options.resolveLink?.(target, false) ?? safeHref(target);
      return keep(resolved ? `<a href="${escapeHtml(resolved)}">${inline(label)}</a>` : escapeHtml(label));
    });
    text = escapeHtml(text);
    text = text.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/__([^_]+)__/g,'<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g,'<em>$1</em>').replace(/~~([^~]+)~~/g,'<del>$1</del>');
    text = text.replace(/\b(Radiance|Void|Flux|Aether|Echo)\b/g, name=>options.energy ? keep(options.energy(name)) : name);
    return text.replace(/\u0001(\d+)\u0002/g,(_,n)=>tokens[Number(n)]);
  };
  const lines=markdown.replace(/\r\n?/g,'\n').split('\n');
  function blocks(input, collect=true) {
    const out=[]; let i=0, disclosureLevel=0;
    const headingLine = line => /^(#{1,6})\s+(.+?)(?:\s+#+)?$/.exec(line);
    const listLine = line => /^(\s*)([-+*]|\d+[.)])\s+(.*)$/.exec(line);
    const startsBlock = (line,next='') => !line.trim() || headingLine(line) || /^\s*```|^\s*~~~|^>\s?|^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line) || listLine(line) || (line.includes('|') && /^\s*\|?\s*:?-{3,}/.test(next));
    while(i<input.length) {
      const line=input[i];
      if(!line.trim()) {i++;continue;}
      const fence=line.match(/^\s*(`{3,}|~{3,})\s*(.*)$/);
      if(fence) {
        const code=[];i++;
        while(i<input.length && !input[i].trim().startsWith(fence[1])) code.push(input[i++]);
        i++;out.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);continue;
      }
      const head=headingLine(line);
      if(head) {
        const depth=head[1].length;
        if(disclosureLevel && depth<=disclosureLevel) {out.push('</div></details>');disclosureLevel=0;}
        const base=slug(head[2]), count=(counts.get(base)||0)+1;counts.set(base,count);
        const id=base+(count>1?`-${count}`:'');
        // The document title already has the page's only h1.
        const level=Math.min(6,Math.max(2,depth+1));
        if(collect) headings.push({id,title:plain(head[2]),level:depth});
        if(/iteration log|changelog|revision history/i.test(head[2])) {
          out.push(`<details class="studio-iteration" id="${id}"><summary>${inline(head[2])}</summary><div>`);disclosureLevel=depth;
        } else out.push(`<h${level} id="${id}">${inline(head[2])}</h${level}>`);
        i++;continue;
      }
      if(/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) {out.push('<hr>');i++;continue;}
      if(/^>/.test(line)) {
        const quote=[];while(i<input.length && /^>/.test(input[i])) quote.push(input[i++].replace(/^>\s?/,''));
        out.push(`<blockquote>${blocks(quote,false)}</blockquote>`);continue;
      }
      if(line.includes('|') && /^\s*\|?\s*:?-{3,}/.test(input[i+1]||'')) {
        const header=cells(line), rows=[];i+=2;
        while(i<input.length && input[i].includes('|') && input[i].trim()) rows.push(cells(input[i++]));
        out.push(`<div class="studio-table" role="region" aria-label="Design table" tabindex="0"><table><thead><tr>${header.map(c=>`<th scope="col">${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${header.map((_,n)=>`<td>${inline(row[n]||'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);continue;
      }
      const first=listLine(line);
      if(first) {
        const ordered=/\d/.test(first[2]), indent=first[1].length, tag=ordered?'ol':'ul', items=[];
        const start=ordered?Number(first[2].match(/\d+/)[0]):1;
        while(i<input.length) {
          const item=listLine(input[i]);
          if(!item || item[1].length!==indent || /\d/.test(item[2])!==ordered) break;
          const content=[item[3]];i++;
          while(i<input.length) {
            if(!input[i].trim()) {
              const next=listLine(input[i+1]||'');
              if(next && next[1].length===indent) {i++;break;}
              break;
            }
            const next=listLine(input[i]);
            if(next && next[1].length<=indent) break;
            if(/^\s+/.test(input[i])) {const continuation=input[i++];content.push(continuation.slice(Math.min(indent+2,continuation.match(/^\s*/)[0].length)));}
            else break;
          }
          items.push(`<li>${blocks(content,false)}</li>`);
        }
        out.push(`<${tag}${ordered && start!==1?` start="${start}"`:''}>${items.join('')}</${tag}>`);continue;
      }
      const para=[line];i++;
      while(i<input.length && !startsBlock(input[i],input[i+1])) para.push(input[i++]);
      out.push(`<p>${inline(para.join('\n'))}</p>`);
    }
    if(disclosureLevel) out.push('</div></details>');
    return out.join('\n');
  }
  return {html:blocks(lines),headings};
}
