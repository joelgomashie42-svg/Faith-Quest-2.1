// Name animation + bounce-drop icon + quick verse load
const APP_NAME = "FAITH QUEST";

function playWhoosh(){
  try{
    const ctx = window.__audio_ctx || (window.__audio_ctx = new (window.AudioContext||window.webkitAudioContext)());
    const o=ctx.createOscillator(), g=ctx.createGain();
    o.type='sine'; o.frequency.value=880; g.gain.value=0.02;
    o.connect(g); g.connect(ctx.destination);
    o.start(); setTimeout(()=>{ o.frequency.value=420; g.gain.value=0.01 }, 80);
    setTimeout(()=> o.stop(), 220);
  }catch(e){}
}
function showVerse(){
  const s = window.SCRIPTURES || ['Proverbs 3:5 - Trust in the Lord.'];
  const el = document.getElementById('verse');
  if(el) el.innerText = s[Math.floor(Math.random()*s.length)];
}
function splashIntro(){
  const wrap=document.getElementById('title-wrap');
  wrap.innerHTML='';
  for(let i=0;i<APP_NAME.length;i++){
    const ch=APP_NAME[i]===' ' ? '\u00A0' : APP_NAME[i];
    const span=document.createElement('span');
    span.className='letter'; span.textContent=ch; wrap.appendChild(span);
  }
  const letters=[...document.querySelectorAll('.letter')];
  letters.forEach((el,i)=>{
    setTimeout(()=>{
      el.style.transition='transform 520ms cubic-bezier(.2,1.2,.4,1), opacity 260ms';
      el.style.opacity='1'; el.style.transform='translateY(0)';
      el.animate([{transform:'translateY(-40px)'},{transform:'translateY(6px)'},{transform:'translateY(0)'}],
                 {duration:520,easing:'ease-out'});
      playWhoosh();
    }, i*140);
  });
  setTimeout(()=>{
    const iconWrap=document.getElementById('splashIconWrap');
    iconWrap.classList.remove('hidden');
    const icon=document.getElementById('splashIcon');
    icon.style.opacity=0; icon.style.transform='scale(.6)';
    icon.animate([{opacity:0,transform:'scale(.6)'},{opacity:1,transform:'scale(1.04)'},{opacity:1,transform:'scale(1)'}],
                 {duration:600,easing:'ease-out'});
    icon.style.opacity=1; icon.style.transform='scale(1)';
  }, APP_NAME.length*140 + 200);

  setTimeout(()=>{
    document.getElementById('splash').classList.add('hidden');
    document.getElementById('main').classList.remove('hidden');
    showVerse();
    // One user gesture to resume audio later
    document.body.addEventListener('click', ()=>{ try{ window.__audio_ctx && window.__audio_ctx.resume && window.__audio_ctx.resume(); }catch(e){} }, {once:true});
  }, APP_NAME.length*140 + 2500);
}
window.addEventListener('load', splashIntro);
