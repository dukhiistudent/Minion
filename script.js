const bgm=document.getElementById('bgm');
const musicPill=document.getElementById('musicPill');
const musicText=document.getElementById('musicText');
const openBtn=document.getElementById('openBtn');
let musicOn=false;

async function startMusic(){
  try{
    bgm.volume=.38;
    await bgm.play();
    musicOn=true;
    musicPill.classList.add('on');
    musicText.textContent='music on';
  }catch(e){musicText.textContent='tap for music';}
}
openBtn.addEventListener('click',()=>{startMusic(); document.getElementById('s1').scrollIntoView({behavior:'smooth'});});
musicPill.addEventListener('click',async()=>{
  if(bgm.paused){await startMusic();}
  else{bgm.pause();musicOn=false;musicPill.classList.remove('on');musicText.textContent='music off';}
});

const revealEls=[...document.querySelectorAll('.chapter')];
const observer=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('seen');});
},{threshold:.12});
revealEls.forEach(e=>observer.observe(e));

// Photo reveals: wait until the chapter is visible, then unveil each image with a soft light sweep.
const photoObserver=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('revealed');
      photoObserver.unobserve(e.target);
    }
  });
},{threshold:.3});
document.querySelectorAll('.reveal-card,.reveal-photo').forEach(el=>photoObserver.observe(el));

// Cursor-follow light on the hero photo. Disabled on touch devices.
const cover=document.querySelector('.reveal-photo');
if(cover && window.matchMedia('(pointer:fine)').matches){
  cover.addEventListener('pointermove',(ev)=>{
    const r=cover.getBoundingClientRect();
    cover.style.setProperty('--mx',`${ev.clientX-r.left}px`);
    cover.style.setProperty('--my',`${ev.clientY-r.top}px`);
  });
}

let voiceAudio=null, activeVoice=null;
document.querySelectorAll('.voice').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const src=btn.dataset.src;
    if(activeVoice===btn && voiceAudio){
      if(voiceAudio.paused){voiceAudio.play();btn.classList.add('playing');btn.querySelector('.play').textContent='Ⅱ';}
      else{voiceAudio.pause();btn.classList.remove('playing');btn.querySelector('.play').textContent='▶';}
      return;
    }
    document.querySelectorAll('.voice.playing').forEach(b=>{b.classList.remove('playing');b.querySelector('.play').textContent='▶';});
    if(voiceAudio)voiceAudio.pause();
    voiceAudio=new Audio(src); activeVoice=btn;
    voiceAudio.play().then(()=>{btn.classList.add('playing');btn.querySelector('.play').textContent='Ⅱ';}).catch(()=>{});
    voiceAudio.addEventListener('ended',()=>{btn.classList.remove('playing');btn.querySelector('.play').textContent='▶';});
  });
});

// Heart animation evolved from the supplied Python parametric heart.
const canvas=document.getElementById('heart');
const ctx=canvas.getContext('2d');
let DPR=1,W=0,H=0;
const palettes=['#ffb6c1','#ffd6df','#ef8da1','#f5cad7','#d97b8c','#fff0f3'];
function sizeCanvas(){
  const r=canvas.getBoundingClientRect();
  DPR=Math.min(window.devicePixelRatio||1,2);
  W=r.width; H=r.height;
  canvas.width=W*DPR; canvas.height=H*DPR;
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
sizeCanvas(); window.addEventListener('resize',sizeCanvas);
function heartPoint(t,scale){
  const x=16*Math.pow(Math.sin(t),3);
  const y=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));
  return {x:x*scale,y:y*scale};
}
function hash(n){return Math.abs(Math.sin(n*12.9898)*43758.5453)%1;}
let time=0;
function drawHeart(){
  const cx=W/2,cy=H/2+5,scale=Math.min(W,H)/37;
  ctx.clearRect(0,0,W,H);
  const strands=18;
  for(let s=0;s<strands;s++){
    const phase=time*(.55+s*.02)+s*.38;
    const jitter=.7+1.6*hash(s+Math.floor(time*.7));
    ctx.beginPath();
    for(let i=0;i<=170;i++){
      const u=i/170*Math.PI*2;
      const p=heartPoint(u+jitter*.006*Math.sin(time+s),scale*(.92+.06*Math.sin(time*.75+s)));
      const wobble=1.3*Math.sin(u*7+phase)+.7*Math.sin(u*13-phase*.6);
      const x=cx+p.x+wobble*Math.cos(u+phase),y=cy+p.y+wobble*Math.sin(u+phase);
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.strokeStyle=palettes[s%palettes.length];
    ctx.globalAlpha=.11+.024*s;ctx.lineWidth=1+(s%3)*.35;ctx.stroke();
  }
  // Moving little turtle-like marks around the edge, making the original Python idea feel alive.
  for(let i=0;i<120;i++){
    const u=i*Math.PI*2/120,p=heartPoint(u,scale);
    const a=u+time*(.25+hash(i)*.25),len=3+8*hash(i+3);
    ctx.beginPath();ctx.moveTo(cx+p.x,cy+p.y);ctx.lineTo(cx+p.x+Math.cos(a)*len,cy+p.y+Math.sin(a)*len);
    ctx.strokeStyle=palettes[i%palettes.length];ctx.globalAlpha=.22;ctx.lineWidth=.8;ctx.stroke();
  }
  ctx.globalAlpha=1;time+=.012;requestAnimationFrame(drawHeart);
}
drawHeart();

const arena=document.getElementById('arena'),yes=document.getElementById('yes'),no=document.getElementById('no'),answer=document.getElementById('answer');
const noTexts=['no 😭','really?','bro','nahh 😭','you actually clicked that','okay twin 💀'];
let noIndex=0;
function dodge(){
  const pad=8,ar=arena.getBoundingClientRect(),nr=no.getBoundingClientRect();
  const maxX=Math.max(pad,ar.width-nr.width-pad),maxY=Math.max(120,ar.height-nr.height-pad);
  no.style.left=`${pad+Math.random()*(maxX-pad)}px`;no.style.top=`${pad+Math.random()*(maxY-pad)}px`;
  no.style.transform=`rotate(${(Math.random()*10-5).toFixed(1)}deg)`;
  no.textContent=noTexts[Math.min(++noIndex,noTexts.length-1)];
}
no.addEventListener('mouseenter',dodge);
no.addEventListener('touchstart',e=>{e.preventDefault();dodge();},{passive:false});
no.addEventListener('click',dodge);
yes.addEventListener('click',()=>{answer.textContent='okay 😭 come here twin. go back to sending me nonsense.';yes.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:500});});
document.getElementById('replay').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
