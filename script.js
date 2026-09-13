const bgm=document.getElementById('bgm');
const musicBtn=document.getElementById('musicBtn');
const musicBox=document.querySelector('.music-box');
const musicText=musicBtn;
let musicReady=false;

async function startMusic(){
  if(musicReady) return;
  try{bgm.volume=.38;await bgm.play();musicReady=true;musicBox.classList.add('on');musicText.textContent='music on';}
  catch(e){musicText.textContent='tap music';}
}
musicBtn.addEventListener('click',async()=>{
  if(bgm.paused){await startMusic();}
  else{bgm.pause();musicBox.classList.remove('on');musicText.textContent='music';}
});
document.getElementById('start').addEventListener('click',()=>{startMusic();document.querySelector('[data-step="02"]').scrollIntoView({behavior:'smooth'});});
document.getElementById('replay').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

const slides=[...document.querySelectorAll('.slide')];
const current=document.getElementById('current');
const progress=document.getElementById('progressFill');
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('seen');current.textContent=String(slides.indexOf(e.target)+1).padStart(2,'0');}})
},{threshold:.55});
slides.forEach(s=>io.observe(s));
addEventListener('scroll',()=>{
  const max=document.documentElement.scrollHeight-innerHeight;
  progress.style.width=`${max>0?(scrollY/max)*100:0}%`;
},{passive:true});

const photoIO=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');photoIO.unobserve(e.target);}})
},{threshold:.3});
document.querySelectorAll('.reveal').forEach(x=>photoIO.observe(x));

// Subtle pointer movement on photos, disabled for touch.
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  document.querySelectorAll('.photo-card,.game-shot,.final-photo').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      card.style.setProperty('--rx',`${(-y*2).toFixed(2)}deg`);card.style.setProperty('--ry',`${(x*2).toFixed(2)}deg`);
    });
    card.addEventListener('mouseleave',()=>{card.style.removeProperty('--rx');card.style.removeProperty('--ry');});
  });
}

// Continuous parametric heart, inspired by the provided Python/Turtle heart.
const canvas=document.getElementById('heartCanvas'),ctx=canvas.getContext('2d');
let W=0,H=0,DPR=1,t=0;
const colors=['#ff9db0','#ffd2dd','#f48ea2','#dcb2e7','#fff1f4','#e8b2a4'];
function resizeHeart(){const r=canvas.getBoundingClientRect();W=r.width;H=r.height;DPR=Math.min(devicePixelRatio||1,2);canvas.width=W*DPR;canvas.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);} 
resizeHeart();addEventListener('resize',resizeHeart);
function point(a,scale){return{x:16*Math.sin(a)**3*scale,y:-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))*scale};}
function noise(n){return Math.abs(Math.sin(n*127.17)*43758.5453)%1;}
function drawHeart(){
  const cx=W/2,cy=H/2+8,scale=Math.min(W,H)/38,pulse=1+.035*Math.sin(t*.9);
  ctx.clearRect(0,0,W,H);
  // soft bloom
  const g=ctx.createRadialGradient(cx,cy,10,cx,cy,Math.min(W,H)*.42);g.addColorStop(0,'rgba(238,151,173,.12)');g.addColorStop(1,'rgba(238,151,173,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(let s=0;s<18;s++){
    ctx.beginPath();
    for(let i=0;i<=180;i++){
      const a=i/180*Math.PI*2;
      const p=point(a+t*.0015,scale*pulse*(.92+.045*Math.sin(t*.55+s)));
      const wob=1.2*Math.sin(a*7+t*.7+s)+.7*Math.cos(a*13-t*.45-s);
      const x=cx+p.x+wob*Math.cos(a+s*.16+t*.07),y=cy+p.y+wob*Math.sin(a+s*.16+t*.07);
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.strokeStyle=colors[s%colors.length];ctx.globalAlpha=.08+.018*s;ctx.lineWidth=.8+(s%3)*.35;ctx.stroke();
  }
  for(let i=0;i<120;i++){
    const a=i*Math.PI*2/120,p=point(a,scale*pulse),len=3+8*noise(i+Math.floor(t*.45)),dir=a+t*(.13+noise(i)*.07);
    ctx.beginPath();ctx.moveTo(cx+p.x,cy+p.y);ctx.lineTo(cx+p.x+Math.cos(dir)*len,cy+p.y+Math.sin(dir)*len);ctx.strokeStyle=colors[i%colors.length];ctx.globalAlpha=.25;ctx.lineWidth=.8;ctx.stroke();
  }
  for(let i=0;i<28;i++){
    const a=i*Math.PI*2/28+t*(.12+noise(i)*.04),p=point(a,scale*1.01),rr=.8+1.6*noise(i+3);
    ctx.fillStyle=colors[i%colors.length];ctx.globalAlpha=.45+.15*Math.sin(t+i);ctx.beginPath();ctx.arc(cx+p.x+Math.cos(a)*4,cy+p.y+Math.sin(a)*4,rr,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;t+=.018;requestAnimationFrame(drawHeart);
}
drawHeart();

// Gentle keyboard chapter navigation.
document.addEventListener('keydown',e=>{
  if(e.key!=='ArrowDown'&&e.key!=='ArrowUp'&&e.key!=='PageDown'&&e.key!=='PageUp')return;
  e.preventDefault();
  const idx=slides.findIndex(s=>{const r=s.getBoundingClientRect();return Math.abs(r.top)<innerHeight*.45});
  const dir=(e.key==='ArrowDown'||e.key==='PageDown')?1:-1;slides[Math.min(slides.length-1,Math.max(0,idx+dir))].scrollIntoView({behavior:'smooth'});
});
