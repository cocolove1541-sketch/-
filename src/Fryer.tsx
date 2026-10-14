import type { CSSProperties } from 'react';
import { Chicken, Tongs } from './Chicken';

export function OilParticles({ active, splash }: { active: boolean; splash: boolean }) {
  return <>
    {Array.from({ length: active ? 38 : 12 }, (_, i) => {
      const angle = i * 2.39996;
      const radius = 12 + (i * 7) % 31;
      return <i key={i} className="bubble" style={{
        left: `${50 + Math.cos(angle) * radius}%`, top: `${50 + Math.sin(angle) * radius}%`,
        animationDelay: `${i * .13}s`, animationDuration: `${(active ? .8 : 2) + (i % 3) * .3}s`,
        width: `${4 + (i % 4) * 2}px`, height: `${4 + (i % 4) * 2}px`,
      }}/>;
    })}
    {active && <><div className="foam-ring"/><div className="oil-ripple"/><div className="oil-ripple second"/></>}
    {splash && Array.from({ length: 12 }, (_, i) => <i key={`drop-${i}`} className="splash-drop" style={{
      '--dx': `${Math.cos(i * Math.PI / 6) * 95}px`, '--dy': `${Math.sin(i * Math.PI / 6) * 90}px`,
    } as CSSProperties}/>)}
  </>;
}

export function LiftedChicken({ progress }: { progress: number }) {
  return <div className="lifted-chicken" aria-hidden="true">
    <Tongs/><Chicken progress={progress}/>
    {[0,1,2,3,4].map(i=><i key={i} className="dripping-oil" style={{left:`${28+i*12}%`,animationDelay:`${i*.11}s`}}/>)}
  </div>;
}
