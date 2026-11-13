// Reading works without JavaScript. Only theme and disclosure conveniences live here.
const key = 'ad2:theme';
const button = document.querySelector('.studio-theme');
function setTheme(theme) {
  if (theme === 'day') document.documentElement.dataset.theme = 'day';
  else delete document.documentElement.dataset.theme;
  if (button) button.textContent = theme === 'day' ? 'Dark theme' : 'Daylight theme';
}
try { setTheme(JSON.parse(localStorage.getItem(key))); } catch { setTheme('dark'); }
button?.addEventListener('click', () => {
  const next=document.documentElement.dataset.theme==='day'?'dark':'day';
  setTheme(next);try {localStorage.setItem(key,JSON.stringify(next));}catch{}
});
const toc=document.querySelector('.studio-toc');
if(toc && matchMedia('(max-width: 800px)').matches) toc.open=false;
toc?.addEventListener('click', event => {
  if(event.target.closest('a') && matchMedia('(max-width: 800px)').matches) toc.open=false;
});
function revealHash() {
  let target;try {target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{return;}
  if(!target)return;
  for(let node=target;node;node=node.parentElement) if(node.tagName==='DETAILS')node.open=true;
  requestAnimationFrame(()=>target.scrollIntoView());
}
window.addEventListener('hashchange',revealHash);
if(location.hash)revealHash();
let printState=[];
window.addEventListener('beforeprint',()=>{printState=[...document.querySelectorAll('details')].map(el=>[el,el.open]);for(const [el] of printState)el.open=true;});
window.addEventListener('afterprint',()=>{for(const [el,open] of printState)el.open=open;});
