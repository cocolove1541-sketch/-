import { useRef, type CSSProperties } from 'react';
import { Chicken, sauceColors } from './Chicken';

export const sauceNames = ['', '달콤한 양념', '간장 소스', '매콤한 양념'];

export function SauceStation({ recipe, progress, coverage, active, finished, onMix }: {
  recipe: number; progress: number; coverage: number; active: boolean; finished: boolean;
  onMix: (amount: number) => void;
}) {
  const stroke = useRef<{x:number;y:number;distance:number} | null>(null);
  return <section className={`sauce-station ${active ? 'ready' : ''} ${finished ? 'finished' : ''}`} style={{'--sauce-color':sauceColors[recipe]} as CSSProperties} aria-label="양념 조리대">
    <div className="sauce-copy">
      <div className="eyebrow">SAUCE & TOSS</div>
      <h3>{sauceNames[recipe]} 버무리기</h3>
      <p>{active ? '치킨 위를 쓱쓱 문질러 소스를 입혀요.' : finished ? '윤기 나는 소스와 깨까지! 이제 제공하세요.' : '치킨을 기름에서 건진 후 소스를 입혀요.'}</p>
      <div className="sauce-meter" role="progressbar" aria-label="양념 입힌 정도" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(coverage*100)}><i style={{width:`${coverage*100}%`}}/></div>
      <button className="mix-button" disabled={!active} onClick={()=>onMix(1/3)}>{finished ? '양념 완성 ✓' : `소스 버무리기 · ${Math.round(coverage*100)}%`}</button>
    </div>
    <div className={`sauce-bowl ${active ? 'interactive' : ''}`} data-testid="sauce-bowl" onPointerDown={e=>{
      if (!active) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      stroke.current = {x:e.clientX,y:e.clientY,distance:0};
    }} onPointerMove={e=>{
      if (!active || !stroke.current) return;
      const last = stroke.current;
      const distance = last.distance + Math.hypot(e.clientX-last.x,e.clientY-last.y);
      const steps = Math.floor(distance/22);
      stroke.current = {x:e.clientX,y:e.clientY,distance:distance%22};
      if (steps) onMix(steps*.1);
    }} onPointerUp={()=>{stroke.current=null;}} onPointerCancel={()=>{stroke.current=null;}}>
      <div className="sauce-pool"/>
      {(active || finished) && <div className="sauce-chicken"><Chicken progress={progress} sauce={coverage} recipe={recipe}/></div>}
      <span className="sauce-swirl" aria-hidden="true"/>
      {active && <span className="mix-hint">쓱쓱 ↔</span>}
    </div>
  </section>;
}
