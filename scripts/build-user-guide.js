const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const directory = path.resolve(__dirname, '../docs/user-guide');
const escape = text => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function inline(text) {
  return escape(text)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure><img src="$2" alt="$1"><figcaption>$1 · Fictional demonstration data</figcaption></figure>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}
function render(markdown) {
  const lines = markdown.split('\n');
  let html = '', list = null;
  const close = () => { if (list) { html += `</${list}>`; list = null; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) { close(); continue; }
    if (line.startsWith('|')) {
      close(); const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      i--;
      html += '<table><thead><tr>' + rows[0].split('|').slice(1,-1).map(x => `<th>${inline(x.trim())}</th>`).join('') + '</tr></thead><tbody>';
      html += rows.slice(2).map(row => '<tr>' + row.split('|').slice(1,-1).map(x => `<td>${inline(x.trim())}</td>`).join('') + '</tr>').join('') + '</tbody></table>';
      continue;
    }
    const heading = line.match(/^(#{1,3}) (.*)$/);
    if (heading) { close(); const level = heading[1].length; html += `<h${level} id="${slug(heading[2])}">${inline(heading[2])}</h${level}>`; continue; }
    const item = line.match(/^(?:\d+\. |(- )|\* )(.*)$/);
    if (item) { const type = /^\d/.test(line) ? 'ol' : 'ul'; if (list !== type) { close(); list = type; html += `<${type}>`; } html += `<li>${inline(item[2])}</li>`; continue; }
    close();
    html += line.startsWith('> ') ? `<aside>${inline(line.slice(2))}</aside>` : `<p>${inline(line)}</p>`;
  }
  close(); return html;
}
const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
(async () => {
  const source = fs.readFileSync(path.join(directory, 'SHIFTLY-USER-GUIDE.md'), 'utf8');
  const headings = [...source.matchAll(/^## (.+)$/gm)].map(x => x[1]);
  const content = render(source.replace(/^# Shiftly User Guide\n/, ''));
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Shiftly User Guide</title><style>
  @page { size:A4; margin:17mm 16mm 19mm; }
  *{box-sizing:border-box} body{font:11pt/1.5 Arial,sans-serif;color:#24334b;margin:0} h1,h2,h3{color:#122849;line-height:1.2} h2{font-size:21pt;border-bottom:2px solid #43b5ac;padding-bottom:10px;break-before:page;margin-top:0} h3{font-size:13pt;margin-top:22px;break-after:avoid} p{margin:9px 0} li{margin:5px 0} table{border-collapse:collapse;width:100%;font-size:9pt;margin:14px 0} th,td{padding:8px;border:1px solid #dce4eb;text-align:left;vertical-align:top} th{background:#e9f3f5;color:#122849} tr,figure,aside{break-inside:avoid} figure{margin:16px 0} img{width:100%;max-height:112mm;object-fit:contain;object-position:left;border:1px solid #dce4eb;border-radius:5px} img[src*="13-my-schedule"]{width:52%;max-height:150mm} figcaption{font-size:8pt;color:#64748b;margin-top:6px} aside{background:#eef7f6;border-left:3px solid #43b5ac;padding:12px;margin:14px 0} a{color:#137b85;text-decoration:none} .cover{height:250mm;display:flex;flex-direction:column;justify-content:center;break-after:page} .brand{font-size:16pt;letter-spacing:5px;color:#137b85;font-weight:bold} .cover h1{font-size:48pt;margin:30px 0 15px} .subtitle{font-size:20pt;max-width:400px;color:#526881} .cover .meta{margin-top:60px;border-top:3px solid #43b5ac;padding-top:20px} .contents{break-after:page}.contents h2{break-before:auto}.contents a{display:block;padding:6px 0;border-bottom:1px solid #e7edf1}.contents p{font-size:10pt;color:#64748b}
  </style></head><body><section class="cover"><div class="brand">SHIFTLY</div><h1>User guide</h1><div class="subtitle">Plan the week.<br>Keep your team in sync.</div><div class="meta">Administrators · Supervisors · Employees<br>Version 1.1 · October 6, 2026<br>Illustrated guide with fictional demonstration data</div></section><section class="contents"><h2>Contents</h2>${headings.map(x => `<a href="#${slug(x)}">${escape(x)}</a>`).join('')}<p>Choose a section to jump to its instructions. Screens and actions vary by role.</p></section>${content}</body></html>`;
  const htmlPath = path.join(directory, 'SHIFTLY-USER-GUIDE.html');
  fs.writeFileSync(htmlPath, html);
  const browser = await chromium.launch({headless:true, executablePath:process.env.PLAYWRIGHT_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  try {
    const page = await browser.newPage();
    await page.goto('file://' + htmlPath);
    await page.evaluate(() => Promise.all([...document.images].map(img => img.decode())));
    const images = await page.evaluate(() => [...document.images].map(img => ({src:img.getAttribute('src'), loaded:img.naturalWidth > 0})));
    if (images.some(img => !img.loaded)) throw new Error('Missing guide image');
    await page.pdf({path:path.join(directory,'SHIFTLY-USER-GUIDE.pdf'),format:'A4',printBackground:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="font-size:8px;color:#64748b;width:100%;padding:0 16mm;display:flex;justify-content:space-between"><span>SHIFTLY · User Guide · October 2026</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',outline:true,tagged:true});
    console.log(`PDF created; ${images.length} images verified.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
