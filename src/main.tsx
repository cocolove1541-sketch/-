import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { cook, fresh, reward, assessDish, recipes, recipeLabels, randomRecipe, type Cook } from './engine';
import { Chicken, Tongs } from './Chicken';
import { OilParticles, LiftedChicken } from './Fryer';
import { SauceStation, sauceNames } from './SauceStation';
import './style.css';
import './kitchen.css';

type Save = { money:number; sales:number; best:number; fryer:number; oil:number; date:string; score:number };
type Phase = 'raw' | 'flour' | 'coated' | 'frying' | 'saucing' | 'plated' | 'done' | 'failed';
const base:Save = {money:0,sales:0,best:0,fryer:0,oil:0,date:new Date().toLocaleDateString(),score:0};
function saved():Save {
  try {
    const v = {...base,...JSON.parse(localStorage.getItem('chicken-king') || '{}')};
    // Recipe unlocks have retired; keep the wallet, records and equipment.
    delete v.recipes;
    return v.date === base.date ? v : {...v,sales:0,date:base.date};
  } catch { return base; }
}
function readHelp() { try { return !!localStorage.getItem('chicken-help'); } catch { return false; } }
function store(key:string,value:string) { try { localStorage.setItem(key,value); } catch {} }
const customerQuotes = ['“후라이드, 바삭하게 부탁드려요!”','“달콤한 양념 듬뿍 부탁드려요!”','“간장 소스에 맛있게 버무려 주세요!”'];

function App() {
  const [save,setSave] = useState(saved);
  const [phase,setPhase] = useState<Phase>('raw');
  const [c,setC] = useState<Cook>(fresh);
  const [temp,setTemp] = useState(175);
  const [left,setLeft] = useState(30 + save.fryer*3);
  const [combo,setCombo] = useState(0);
  const [recipe,setRecipe] = useState(randomRecipe);
  const [orderNumber,setOrderNumber] = useState(1);
  const [sound,setSound] = useState(true);
  const [shop,setShop] = useState(false);
  const [help,setHelp] = useState(!readHelp());
  const [result,setResult] = useState('');
  const [drag,setDrag] = useState<{x:number;y:number} | null>(null);
  const [splash,setSplash] = useState(false);
  const [lifting,setLifting] = useState(false);
  const [sauce,setSauce] = useState(0);
  const sauceValue = useRef(0);
  const fryer = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLButtonElement>(null);
  const sauceStation = useRef<HTMLDivElement>(null);
  const audio = useRef<AudioContext | null>(null);
  const liftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const splashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(()=>{store('chicken-king',JSON.stringify(save));},[save]);
  useEffect(()=>()=>{
    if (liftTimer.current) clearTimeout(liftTimer.current);
    if (splashTimer.current) clearTimeout(splashTimer.current);
  },[]);
  function sfx(kind='pop') {
    if (sound) {
      try {
        const a = audio.current || (audio.current = new AudioContext());
        void a.resume();
        const o=a.createOscillator(),g=a.createGain();
        o.connect(g);g.connect(a.destination);
        o.frequency.setValueAtTime(kind==='win'?880:kind==='sauce'?320:180,a.currentTime);
        o.frequency.exponentialRampToValueAtTime(kind==='win'?1320:50,a.currentTime+.16);
        g.gain.setValueAtTime(.09,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.25);
        o.start();o.stop(a.currentTime+.26);
      } catch {}
    }
    if (navigator.vibrate) navigator.vibrate(20);
  }
  useEffect(()=>{
    if (phase!=='frying' || !sound) return;
    try {
      const a=audio.current || (audio.current=new AudioContext());void a.resume();
      const b=a.createBuffer(1,a.sampleRate*2,a.sampleRate),data=b.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
      const n=a.createBufferSource(),g=a.createGain(),filter=a.createBiquadFilter();
      filter.type='highpass';filter.frequency.value=1800;n.buffer=b;n.loop=true;
      n.connect(filter);filter.connect(g);g.connect(a.destination);g.gain.value=.025;n.start();
      return ()=>{n.stop();g.disconnect();};
    } catch {}
  },[phase,sound]);
  useEffect(()=>{
    if (['done','failed','raw'].includes(phase) || help || shop) return;
    let prev=performance.now();
    const id=setInterval(()=>{
      const now=performance.now(),dt=(now-prev)/1000;prev=now;
      setLeft(v=>Math.max(0,v-dt));
      if(phase==='frying')setC(v=>cook(v,temp,dt,1+recipe*.06,save.oil));
    },50);
    return ()=>clearInterval(id);
  },[phase,temp,recipe,save.oil,help,shop]);
  useEffect(()=>{
    if(left<=0 && !['done','failed'].includes(phase)) {
      setPhase('failed');setCombo(0);setDrag(null);setResult('손님이 떠났어요. 다음 주문은 잘할 수 있어요!');
    }
  },[left,phase]);
  useEffect(()=>{
    if (phase==='saucing' && window.innerWidth<=740) {
      sauceStation.current?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
    }
  },[phase]);

  function dropOil() {
    if(phase!=='coated')return;
    setPhase('frying');setSplash(true);
    if(splashTimer.current)clearTimeout(splashTimer.current);
    splashTimer.current=setTimeout(()=>setSplash(false),750);sfx();
  }
  function lift() {
    if(phase!=='frying')return;
    setPhase(recipe>0?'saucing':'plated');setLifting(true);sfx();
    if(liftTimer.current)clearTimeout(liftTimer.current);
    liftTimer.current=setTimeout(()=>setLifting(false),1050);
  }
  function mixSauce(amount:number) {
    if(phase!=='saucing' || left<=0)return;
    const value=Math.min(1,sauceValue.current+amount);
    const old=sauceValue.current;
    sauceValue.current=value;setSauce(value);
    if(value>=1) {setPhase('plated');sfx('sauce');}
    else if(Math.floor(value*3)>Math.floor(old*3))sfx('sauce');
  }
  function serve() {
    if(phase!=='plated' || left<=0)return;
    const g=assessDish(c,recipe,sauce);
    if(g==='unsauced') {setPhase('saucing');return;}
    const ok=g==='good'||g==='perfect',nextCombo=ok?combo+1:0;
    const money=Math.round(reward(g,combo,recipe)*(1+save.oil*.1));
    setCombo(nextCombo);
    setSave(v=>({...v,money:v.money+money,sales:v.sales+money,score:v.score+(g==='perfect'?300:g==='good'?150:0),best:Math.max(v.best,nextCombo)}));
    setPhase(g==='burnt'||g==='raw'?'failed':'done');
    const finished=recipe>0?`${recipeLabels[recipe]} 완성!`:'겉바속촉!';
    setResult(g==='perfect'?`★★★★★ PERFECT! ${finished} +₩${money}`:
      g==='good'?`★★★★ ${finished} +₩${money}`:
      g==='raw'?(recipe>0?'속이 덜 익었어요. 양념을 입혀도 판매할 수 없어요.':'속이 덜 익었어요. 조금 더 튀겨주세요!'):
      g==='burnt'?'앗, 타버렸어요! 판매할 수 없어요.':`조금 눅눅해요. 170~180℃를 유지해요. +₩${money}`);
    sfx(ok?'win':'pop');
  }
  function next() {
    setC(fresh());setPhase('raw');setLeft(30+save.fryer*3);setRecipe(randomRecipe());setResult('');
    setOrderNumber(v=>v+1);
    setSauce(0);sauceValue.current=0;setDrag(null);setLifting(false);setSplash(false);
  }
  function startDrag(e:React.PointerEvent) {
    e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);setDrag({x:e.clientX,y:e.clientY});
  }
  function moveDrag(e:React.PointerEvent) {if(drag)setDrag({x:e.clientX,y:e.clientY});}
  function endDrag(e:React.PointerEvent) {
    if(!drag)return;
    const hit=(el:HTMLElement|null)=>{
      const r=el?.getBoundingClientRect();
      return r && e.clientX>=r.left && e.clientX<=r.right && e.clientY>=r.top && e.clientY<=r.bottom;
    };
    if(hit(fryer.current))dropOil();
    if(hit(plate.current))lift();
    setDrag(null);
  }
  const steps=recipe>0?['튀김옷','기름에 퐁당','소스 버무리기','손님에게 제공']:['튀김옷 입히기','기름에 퐁당','접시에 담아 제공'];
  const stage=['raw','flour','coated'].includes(phase)?0:phase==='frying'?1:phase==='saucing'?2:steps.length-1;
  const canServe=phase==='plated';
  const displayChicken=['plated','saucing','done','failed'].includes(phase)&&c.elapsed>0;
  const readyToLift=c.inside>=1 && c.crust>=.88 && c.crust<=1.15;

  return <div className="app">
    <header>
      <a className="brand" href="#"><span className="brand-icon">♜</span><div>치킨왕<small>오늘도 튀긴다!</small></div></a>
      <span className="header-note">작은 주방, 바삭한 행복</span>
      <div className="header-actions"><button onClick={()=>setHelp(true)}>도움말</button><button aria-label="효과음 설정" onClick={()=>setSound(!sound)}>{sound?'♪ 사운드 ON':'♪ 사운드 OFF'}</button></div>
    </header>
    <main>
      <div className="title-row"><div><div className="eyebrow">THE CRISPY LITTLE KITCHEN</div><h1>오늘도, 맛있게 튀겨볼까요?</h1><p>기름에 퐁당, 바삭하게! 양념은 달콤하게.</p></div><button className="shop-button" onClick={()=>setShop(true)}>✧ 내 가게 업그레이드 <span>↗</span></button></div>
      <div className="stats"><div><span>내 지갑</span><strong>₩ {save.money.toLocaleString()}</strong></div><div><span>오늘의 매출</span><strong>₩ {save.sales.toLocaleString()}</strong></div><div><span>점수 · {save.score}</span><strong>{combo} <small>COMBO</small></strong></div><div><span>최고 기록</span><strong>{save.best} <small>COMBO</small></strong></div></div>
      <div className="game-layout">
        <section className="kitchen">
          <div className="kitchen-top"><span><i/> 영업 중 <b>동네 치킨집</b></span><span>기름솥에 담아 튀기는 진짜 치킨</span></div>
          <div className={`steps ${recipe>0?'four-steps':''}`}>{steps.map((s,i)=><div key={s} className={stage===i?'active':''}><b>{i+1}</b>{s}</div>)}</div>
          <div className={`cooking-scene ${result.includes('PERFECT')?'celebrate':''}`}>
            <div className="wall-label">넉넉한 기름에 푹 담가 바삭하게</div>
            <div className="hanging-tools" aria-hidden="true"><Tongs/></div>
            <div className="pot-temperature">둥근 기름솥 <span>{temp}℃</span></div>
            <div className="fryer-wrap" ref={fryer} role="button" tabIndex={0} aria-label="둥근 기름솥에 치킨 넣기" onClick={()=>{if(phase==='coated')dropOil();}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();dropOil();}}}>
              <div className="pot-shadow"/><div className="pot-handle left"/><div className="pot-handle right"/>
              <div className="pot-body"/>
              <div className={`oil ${phase==='frying'?'frying':''} ${splash?'splash':''}`}>
                {phase==='frying'&&<div className={`frying-chicken ${drag?'is-held':''}`} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={()=>setDrag(null)}><div className="immersed-chicken"><Chicken progress={c.crust}/></div></div>}
                <div className="oil-surface"/><div className="oil-shine"/>
                <OilParticles active={phase==='frying'} splash={splash}/>
              </div>
              <div className="pot-brand" aria-hidden="true">CRISPY KING</div>
            </div>
            {lifting&&<LiftedChicken progress={c.crust}/>}
            <div className="scene-caption">{phase==='frying'?'기름 속에 푹 잠겨 지글지글… 노릇해지는 중!':phase==='coated'?'치킨을 둥근 기름솥 한가운데로 드래그해요.':phase==='saucing'?`바삭하게 튀겼다면, 이제 ${sauceNames[recipe]}를 입혀요.`:'황금빛 기름에 퐁당! 오늘도 맛있는 한 조각.'}</div>
            {result&&<div className="result" role="status"><strong>{result}</strong><button onClick={next}>다음 주문 →</button></div>}
          </div>
          <div className="temp-panel"><div><span>기름 온도</span><strong>{temp}<small>℃</small></strong></div><div className="slider-wrap"><div className="slider-labels"><span>낮음 · 눅눅</span><span className="green">170–180℃ · 바삭!</span><span>높음 · 주의</span></div><input aria-label="기름 온도" type="range" min="145" max="215" value={temp} onChange={e=>setTemp(+e.target.value)}/><div className="slider-labels"><span>145℃</span><span>180℃</span><span>215℃</span></div></div><span className={`temp-status ${temp>=170&&temp<=180?'ideal':''}`}>{temp>=170&&temp<=180?'● 딱 좋은 온도':'● 온도를 조절해요'}</span></div>
          <div className="prep">
            <button className="prep-item" onClick={()=>{if(phase==='raw'){setPhase('flour');sfx();}}}><Chicken raw/><strong>신선한 닭</strong><small>{phase==='raw'?'클릭해서 밀가루 입히기':'매일 신선하게!'}</small></button>
            <button className={`prep-item flour ${phase==='flour'?'selected':''}`} onClick={()=>{if(phase==='flour'){setPhase('coated');sfx();}}}><div className="bowl"><span/></div><strong>바삭 튀김옷</strong><small>{phase==='flour'?'클릭해서 튀김옷 완성':'밀가루 + 비밀 레시피'}</small></button>
            <button className="prep-item tongs" onClick={()=>phase==='coated'?dropOil():lift()}><Tongs/><strong>집게</strong><small>{phase==='frying'?'치킨을 건져 올려요':'치킨을 잡고 옮겨요'}</small></button>
            <button ref={plate} className="prep-item plate" disabled={phase==='saucing'} onClick={canServe?serve:lift}><div className="plate-art">{displayChicken&&<Chicken progress={c.crust} sauce={sauce} recipe={recipe}/>}</div><strong>{canServe?'손님에게 제공 →':phase==='saucing'?'소스를 먼저 입혀요':'완성 접시'}</strong><small>{phase==='saucing'?'아래 조리대에서 쓱쓱!':'맛있게 담아주세요'}</small></button>
            {phase==='coated'&&<div className="ready-chicken" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={()=>setDrag(null)}><Chicken/><span>드래그해서 기름에 퐁당 ↗</span></div>}
          </div>
          {recipe>0&&<div ref={sauceStation}><SauceStation recipe={recipe} progress={c.crust} coverage={sauce} active={phase==='saucing'} finished={sauce>=1} onMix={mixSauce}/></div>}
        </section>
        <aside>
          <div className="order-card">
            <div className="card-label">손님 주문 <span>ORDER #{orderNumber}</span></div>
            <div className="order-assigned"><span className="assigned-dot"/> 손님이 고른 메뉴를 만들어 주세요</div>
            <div className="customer"><div className="avatar"><div className="hair"/><div className="face">•ᴗ•</div><div className="shirt"/></div><div><strong>배고픈 단골손님</strong><span>{customerQuotes[recipe]}</span></div></div>
            <div className="order-food" data-recipe={recipe}><Chicken progress={1} sauce={recipe>0?1:0} recipe={recipe}/><div><strong>{recipes[recipe]}</strong><small>{recipe===2?'달콤짭짤 간장 소스':recipe===1?'달콤한 양념 소스':'갓 튀긴 치킨 1조각'}</small></div><b>×1</b></div>
            <div className="order-instruction">{recipe>0?`기름에서 튀긴 후 ${sauceNames[recipe]}를 입혀주세요.`:'소스 없이 바삭한 후라이드로 제공하세요.'}</div>
            <div className="wait-label"><span>손님 대기 시간</span><strong>{Math.ceil(left)}<small>초</small></strong></div><div className="wait-bar"><i style={{width:`${left/(30+save.fryer*3)*100}%`}}/></div><p>따뜻할 때 드리면 더 좋아해요.</p>
          </div>
          <div className="cook-card">
            <div className="card-label">치킨의 상태 <span>LIVE</span></div>
            <div className="cook-status"><span className="status-dot"/><strong>{phase==='frying'?'기름 속에서 튀겨지는 중':phase==='saucing'?'소스를 버무려 주세요':phase==='plated'?'제공할 준비 완료':phase==='coated'?'튀길 준비 완료':'조리 준비 중'}</strong></div>
            <label>속 익힘 <b>{Math.min(100,Math.round(c.inside*100))}%</b></label><div className="meter"><i style={{width:`${Math.min(100,c.inside*100)}%`}}/></div>
            <label>겉 바삭함 <b>{c.crust>=1.45?'탔어요':c.crust>=.88?'바삭해요':'아직 부드러워요'}</b></label><div className="meter crust"><i style={{width:`${Math.min(100,c.crust/1.45*100)}%`}}/><span/></div>
            {recipe>0&&<><label>{sauceNames[recipe]} <b>{Math.round(sauce*100)}%</b></label><div className="meter sauce"><i style={{width:`${sauce*100}%`}}/></div></>}
            <div className="timing">{phase==='saucing'?'조리대에서 소스를 묻히면 제공할 수 있어요.':phase==='plated'?'준비 끝! 손님에게 맛있게 제공하세요.':readyToLift?'지금이에요! 치킨을 건져주세요 ✧':'속이 다 익고, 황금빛이 될 때까지!'}</div>
            <button className="lift-button" disabled={phase!=='frying'&&!canServe} onClick={canServe?serve:lift}>{canServe?'치킨 제공하기 →':phase==='saucing'?'소스 버무리기 중…':'집게로 건져 올리기 ↑'}</button>
          </div>
          <div className="tip"><span>✦</span><div><strong>{recipe===2?'달콤짭짤, 바삭하게':recipe===1?'달콤하게, 바삭하게':'바삭한 한 끗'}</strong><p>{recipe>0?'먼저 기름에서 속까지 익혀 건져 올리고, 소스 조리대에서 치킨을 쓱쓱 문질러 주세요. 버튼으로도 버무릴 수 있어요.':'170~180℃를 유지하고, 속이 완전히 익었을 때 건져 올리세요. 완벽한 치킨은 추가 보상!'}</p></div></div>
        </aside>
      </div>
      <footer><span>정성을 담아, 한 조각씩.</span><span>직접 만든 주방 · CHICKEN KING</span></footer>
    </main>
    {drag&&<div className="drag-chicken" style={{left:drag.x,top:drag.y}}><Tongs/><Chicken progress={c.crust}/></div>}
    {help&&<div className="overlay"><div className="modal"><div className="eyebrow">WELCOME TO YOUR LITTLE KITCHEN</div><h2>손님의 주문을 받아볼까요?</h2><Chicken progress={1}/><p>① 손님이 후라이드·양념·간장 중 하나를 주문해요.<br/>② 닭 → 튀김옷을 누른 뒤 둥근 기름솥에 퐁당!<br/>③ 175℃에서 12~14초, 속이 100% 익으면 건져요.<br/>④ 양념·간장 주문은 해당 소스를 쓱쓱 입혀요.<br/>⑤ 완성 접시를 눌러 손님에게 제공하세요.</p><button className="primary" onClick={()=>{setHelp(false);store('chicken-help','1');sfx();}}>좋아요, 영업 시작!</button></div></div>}
    {shop&&<div className="overlay"><div className="modal"><button className="close" aria-label="업그레이드 닫기" onClick={()=>setShop(false)}>×</button><div className="eyebrow">A LITTLE BETTER EVERY DAY</div><h2>내 가게 업그레이드</h2><p>내 지갑 ₩{save.money}</p><p className="shop-menu-note">후라이드·양념·간장, 모든 메뉴는 처음부터 판매해요.</p>{(['fryer','oil'] as const).map((key,i)=>{
      const level=save[key],cost=200*(level+1),max=3;
      return <button className="upgrade" key={key} disabled={save.money<cost||level>=max} onClick={()=>setSave(v=>({...v,money:v.money-cost,[key]:level+1}))}><span>{['기름솥 · 대기 시간 +3초','좋은 기름 · 보너스 매출 +10%'][i]}<small>레벨 {level} / {max}</small></span><b>{level>=max?'MAX':`₩${cost}`}</b></button>;
    })}<button className="primary" onClick={()=>setShop(false)}>주방으로 돌아가기</button></div></div>}
  </div>;
}

createRoot(document.getElementById('root')!).render(<App/>);
