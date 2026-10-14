import { useRef, type CSSProperties } from 'react';
import { Chicken, sauceColors } from './Chicken';
import { type Recipe, recipeLabels } from './engine';

export const sauceNames = ['소스 없음', '달콤한 양념', '간장 소스'];

export function SauceStation({ order, selected, progress, coverage, ready, active, finished, hasChicken, notice, onSelect, onMix, onServe }: {
  order: Recipe; selected: Recipe; progress: number; coverage: number; ready: boolean; active: boolean;
  finished: boolean; hasChicken: boolean; notice: string;
  onSelect: (sauce: Recipe) => void; onMix: (amount: number) => void; onServe: () => void;
}) {
  const stroke=useRef<{x:number;y:number;distance:number} | null>(null);
  return <section className={`sauce-station all-sauces ${active?'ready':''} ${finished?'finished':''}`} style={{'--sauce-color':sauceColors[selected]} as CSSProperties} aria-label="소스 조리대">
    <div className="sauce-heading"><div className="eyebrow">CHOOSE, SAUCE & TOSS</div><h3>소스 조리대</h3><p>손님 주문: <b>{recipeLabels[order]}</b> · {order===0?'소스 없이 제공하세요.':`${sauceNames[order]}를 선택해 입혀주세요.`}</p></div>
    <div className="sauce-choices" role="group" aria-label="소스 선택">
      {([0,1,2] as const).map(id=><button key={id} className="sauce-choice" data-sauce={id} aria-pressed={selected===id} disabled={!ready||(coverage>0&&selected!==id)} onClick={()=>onSelect(id)} style={{'--choice-color':sauceColors[id]} as CSSProperties}>
        {id===0?<span className="plain-mini-plate" aria-hidden="true"/>:<span className="sauce-mini-bowl" aria-hidden="true"/>}
        <strong>{id===0?'후라이드 그대로':sauceNames[id]}</strong><small>{id===0?'소스 없이':id===1?'달콤하게':'달콤짭짤하게'}</small>
      </button>)}
    </div>
    <div className="sauce-workspace">
      <div className="sauce-copy"><h4>{selected===0?'소스를 입히지 않았어요':`${sauceNames[selected]} 버무리기`}</h4>
        <p>{active?'치킨 위를 쓱쓱 문질러 소스를 입혀요.':finished?'윤기 나는 소스 완성! 주문과 맞는지 확인해요.':ready?'소스를 고르거나 후라이드 그대로 제공해요.':'치킨을 기름에서 건진 후 소스를 골라요.'}</p>
        <div className="sauce-meter" role="progressbar" aria-label="소스 입힌 정도" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(coverage*100)}><i style={{width:`${coverage*100}%`}}/></div>
        <button className="mix-button" disabled={!active||selected===0} onClick={()=>onMix(1/3)}>{finished?'소스 완성 ✓':`소스 버무리기 · ${Math.round(coverage*100)}%`}</button>
        <button className="station-serve" disabled={!ready||active} onClick={onServe}>완성 치킨 제공하기 →</button>
      </div>
      <div className={`sauce-bowl ${selected===0?'empty':''} ${active?'interactive':''}`} data-testid="sauce-bowl" onPointerDown={e=>{
        if(!active)return;e.currentTarget.setPointerCapture(e.pointerId);stroke.current={x:e.clientX,y:e.clientY,distance:0};
      }} onPointerMove={e=>{
        if(!active||!stroke.current)return;
        const last=stroke.current,distance=last.distance+Math.hypot(e.clientX-last.x,e.clientY-last.y),steps=Math.floor(distance/22);
        stroke.current={x:e.clientX,y:e.clientY,distance:distance%22};if(steps)onMix(steps*.1);
      }} onPointerUp={()=>{stroke.current=null;}} onPointerCancel={()=>{stroke.current=null;}}>
        <div className="sauce-pool"/>{hasChicken&&<div className="sauce-chicken"><Chicken progress={progress} sauce={coverage} recipe={selected}/></div>}
        {selected>0&&<span className="sauce-swirl" aria-hidden="true"/>}{active&&<span className="mix-hint">쓱쓱 ↔</span>}
      </div>
    </div>
    {notice&&<div className="sauce-notice" role="alert">{notice}</div>}
    {coverage>0&&!finished&&<p className="sauce-lock-note">소스를 입히기 시작한 치킨은 다른 소스로 바꿀 수 없어요.</p>}
  </section>;
}
