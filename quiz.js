function qs(name){ const u=new URLSearchParams(location.search); return u.get(name); }

const category = qs('category') || 'general';     // 'old' | 'new' | 'general' | topic key | 'book'
const bookKey  = qs('book') || null;              // e.g., 'gen'
const level    = qs('level') || 'easy';           // 'easy' | 'moderate' | 'difficult'

let QUESTIONS = window.QUESTIONS || {};
let currentQuiz = [], currentIndex = 0, score = 0, wrong = [];
let quizMeta = { title: category, difficulty: level, total: 0 };

// Build quiz list based on params
function buildQuiz(){
  currentQuiz = [];
  const all = [];
  Object.keys(QUESTIONS).forEach(sec => QUESTIONS[sec].forEach(q => all.push(q)));

  const isOld = (bk)=> window.BOOKS && window.BOOKS.OLD.some(b=>b.key===bk);
  const isNew = (bk)=> window.BOOKS && window.BOOKS.NEW.some(b=>b.key===bk);

  all.forEach(q=>{
    if(q.difficulty !== level) return;

    if (bookKey) { // specific book
      if (q.bookKey === bookKey) currentQuiz.push(q);
      return;
    }

    if (category === 'old' && isOld(q.bookKey)) currentQuiz.push(q);
    else if (category === 'new' && isNew(q.bookKey)) currentQuiz.push(q);
    else if (category === 'general') currentQuiz.push(q);
    else if (q.category === category) currentQuiz.push(q); // topic
  });

  if (currentQuiz.length === 0) {
    // Fallback: ignore difficulty
    all.forEach(q=>{
      if (bookKey && q.bookKey !== bookKey) return;
      if (category === 'old' && !isOld(q.bookKey)) return;
      if (category === 'new' && !isNew(q.bookKey)) return;
      if (!['old','new','general'].includes(category) && q.category !== category) return;
      currentQuiz.push(q);
    });
  }

  currentQuiz = shuffle(currentQuiz).slice(0, 10);
  quizMeta.total = currentQuiz.length;
}

function render(){
  const q = currentQuiz[currentIndex];
  const area = document.getElementById('qcard');
  area.innerHTML='';

  if(!q){ area.innerHTML='<div class="small">No question available.</div>'; return; }

  document.getElementById('quizTitle').innerText =
    `${q.book || quizMeta.title} • ${quizMeta.difficulty}`;

  const meta=document.createElement('div');
  meta.className='small';
  meta.innerHTML = `<strong>Q ${currentIndex+1}/${quizMeta.total}</strong>`;
  area.appendChild(meta);

  const p = document.createElement('div');
  p.innerHTML = `<h3 style="margin-top:8px">${q.question}</h3>`;
  area.appendChild(p);

  q.options.forEach((opt,i)=>{
    const b=document.createElement('button');
    b.className='option';
    b.innerText=opt;
    b.onclick=()=> answer(b,i,q);
    area.appendChild(b);
  });

  scoreUI(); progressUI();
}

function answer(btn, idx, q){
  const opts=[...document.querySelectorAll('.option')];
  opts.forEach(o=>o.disabled=true);

  const correctIdx = q.answer;
  if (idx===correctIdx) {
    btn.classList.add('correct');
    toneOK();
    score++;
  } else {
    btn.classList.add('wrong');
    toneBad();
    if (opts[correctIdx]) opts[correctIdx].classList.add('correct');
    wrong.push({ q:q.question, correct:q.options[correctIdx], your:q.options[idx] });
  }
  scoreUI(); progressUI();

  setTimeout(()=>{
    if (currentIndex < currentQuiz.length-1) { currentIndex++; render(); }
    else finish();
  }, 1600);
}

function nextQ(){ if(currentIndex<currentQuiz.length-1){ currentIndex++; render(); } else finish(); }
function prevQ(){ if(currentIndex>0){ currentIndex--; render(); } }
function endQ(){ if(confirm('End quiz?')) finish(); }

function finish(){
  const result = { score, total:quizMeta.total, title:quizMeta.title, type:(bookKey? `book:${bookKey}`:category), wrong };
  localStorage.setItem('faith_last_result', JSON.stringify(result));
  const hs = JSON.parse(localStorage.getItem('faith_highscores')||'[]');
  hs.push({score, when:new Date().toISOString(), title:result.title});
  hs.sort((a,b)=>b.score-a.score);
  localStorage.setItem('faith_highscores', JSON.stringify(hs.slice(0,10)));
  location.href='results.html';
}

function scoreUI(){ document.getElementById('scoreBoard').innerText = `Score: ${score}`; }
function progressUI(){
  const pct = ((currentIndex+1)/Math.max(1,quizMeta.total))*100;
  document.getElementById('progressBar').style.width = pct + '%';
}

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]] } return a; }

// Sounds (unlocked by first tap)
function toneOK(){
  try{
    const ctx=window.__audio_ctx||(window.__audio_ctx=new (window.AudioContext||window.webkitAudioContext)());
    const o=ctx.createOscillator(), g=ctx.createGain(); o.connect(g); g.connect(ctx.destination);
    o.type='sine'; o.frequency.value=880; g.gain.value=0.05; o.start(); setTimeout(()=>o.stop(),140);
  }catch(e){}
}
function toneBad(){
  try{
    const ctx=window.__audio_ctx||(window.__audio_ctx=new (window.AudioContext||window.webkitAudioContext)());
    const o=ctx.createOscillator(), g=ctx.createGain(); o.connect(g); g.connect(ctx.destination);
    o.type='square'; o.frequency.value=220; g.gain.value=0.06; o.start(); setTimeout(()=>o.stop(),200);
  }catch(e){}
}

window.addEventListener('load', ()=>{
  buildQuiz(); render();
  document.getElementById('nextBtn').addEventListener('click', nextQ);
  document.getElementById('prevBtn').addEventListener('click', prevQ);
  document.getElementById('endBtn').addEventListener('click', endQ);
  document.body.addEventListener('click', ()=>{ try{ window.__audio_ctx && window.__audio_ctx.resume && window.__audio_ctx.resume(); }catch(e){} }, {once:true});
});
