import { useEffect, useId, useState, type CSSProperties } from 'react';
import chickenAtlas from './assets/chicken-atlas.png';

export const sauceColors = ['#d47f22', '#ba351f', '#713b21'];

type ChickenProps = {
  progress?: number;
  raw?: boolean;
  sauce?: number;
  recipe?: number;
};

let photoLoaded = false;
let photoRequest: Promise<boolean> | undefined;
function loadPhoto() {
  if (!photoRequest) photoRequest = new Promise<boolean>(resolve => {
    const img = new Image();
    img.onload = () => { photoLoaded = true; resolve(true); };
    img.onerror = () => resolve(false);
    img.src = chickenAtlas;
  });
  return photoRequest;
}

function sprite(column:number, row:number, opacity=1): CSSProperties {
  return {
    backgroundImage: `url(${chickenAtlas})`,
    backgroundPosition: `${column*50}% ${row===0?11.111111:88.888889}%`,
    opacity,
  };
}

export function Chicken({progress=0,raw=false,sauce=0,recipe=1}: ChickenProps) {
  const [ready,setReady] = useState(photoLoaded);
  useEffect(()=>{
    let mounted=true;
    void loadPhoto().then(ok=>{if(mounted)setReady(ok);});
    return ()=>{mounted=false;};
  },[]);
  const golden=Math.min(1,Math.max(0,progress*1.05));
  const burnt=Math.min(1,Math.max(0,(progress-1.12)/.33));
  return <span className={`chicken chicken-photo ${ready?'photo-ready':'photo-fallback'}`} aria-hidden="true" data-visual={raw?'raw':progress>=1.45?'burnt':sauce>=1?recipe===2?'soy':'seasoned':progress>.7?'golden':'coated'}>
    {!ready && <ChickenFallback progress={progress} raw={raw} sauce={sauce} recipe={recipe}/>}
    {ready && (raw ? <span className="chicken-photolayer" style={sprite(0,0)}/> : <>
      <span className="chicken-photolayer" style={sprite(1,0)}/>
      <span className="chicken-photolayer" style={sprite(2,0,golden)}/>
      <span className="chicken-photolayer chicken-glaze" style={sprite(recipe===2?1:0,1,sauce)}/>
      <span className="chicken-photolayer" style={sprite(2,1,burnt)}/>
    </>)}
  </span>;
}

function ChickenFallback({ progress = 0, raw = false, sauce = 0, recipe = 1 }: ChickenProps) {
  const id = useId().replace(/:/g, '');
  const body = 'M99 51C106 25 82 9 59 12 30 10 9 27 13 53 13 76 38 87 62 81 84 78 91 69 99 51Z';
  const color = raw ? '#efbba8' : progress >= 1.45 ? '#493023'
    : `hsl(${44 - Math.min(progress, 1.4) * 9} 88% ${80 - Math.min(progress, 1.4) * 27}%)`;
  return <svg className="chicken-fallback" viewBox="0 0 140 100" aria-hidden="true">
    <defs>
      <clipPath id={`body-${id}`}><path d={body}/></clipPath>
      <linearGradient id={`glaze-${id}`} x1="0" y1="0" x2="0.8" y2="1">
        <stop stopColor="#f36a31"/><stop offset=".45" stopColor={sauceColors[recipe]}/>
        <stop offset="1" stopColor="#692319"/>
      </linearGradient>
    </defs>
    <path d="M96 58l23 18" stroke="#fff6de" strokeWidth="15" strokeLinecap="round"/>
    <circle cx="125" cy="79" r="9" fill="#fff6de"/><circle cx="116" cy="86" r="8" fill="#fff6de"/>
    <path d={body} fill={color} stroke="#ad6429" strokeWidth="3"/>
    <path d="M28 35Q42 19 62 24" fill="none" stroke="#fff3c2" strokeWidth="7" strokeLinecap="round" opacity=".7"/>
    {[[30,53],[49,64],[72,37],[79,59],[54,42],[23,42]].map(([x,y],i)=><path key={i} d={`M${x} ${y}l4 -2`} stroke="#b36b2e" strokeWidth="3" strokeLinecap="round"/>)}
    <g clipPath={`url(#body-${id})`} opacity={sauce} className="chicken-glaze">
      <path d={body} fill={`url(#glaze-${id})`}/>
      <path d="M18 46Q37 26 50 45T83 43T100 32M29 65Q46 52 64 63" fill="none" stroke="#e4773d" strokeWidth="8" opacity=".6"/>
      <path d="M28 31Q41 22 58 27M72 35l8 3" fill="none" stroke="#ffe0b3" strokeWidth="4" strokeLinecap="round" opacity=".8"/>
      {[[31,42],[42,57],[57,34],[69,51],[55,68],[82,39],[27,62]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx="1.6" ry="3.4" transform={`rotate(${i*29} ${x} ${y})`} fill="#ffe8b9"/>)}
    </g>
  </svg>;
}

export function Tongs() {
  return <svg className="tongs-svg" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M28 14Q20 4 14 12Q7 22 20 31L69 77M28 14L82 62" fill="none" stroke="#6a756a" strokeWidth="8" strokeLinecap="round"/>
    <path d="M22 23L70 73M29 16L81 60" fill="none" stroke="#d7dfd2" strokeWidth="3" strokeLinecap="round"/>
    <path d="M69 75l-9 10 13 5 9-10M82 61l-3 15 13 5 4-15" fill="#a9b5a3" stroke="#6a756a" strokeWidth="2" strokeLinejoin="round"/>
  </svg>;
}
