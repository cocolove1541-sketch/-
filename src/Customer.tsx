import { useEffect, useState } from 'react';
import customerAtlas from './assets/customer-atlas.png';

export type CustomerMood = 'waiting' | 'impatient' | 'happy' | 'angry';
export const customerNames = ['파란 귀 친구', '토끼 친구', '하얀 친구'];
const moodNames = {waiting:'기다리는 중',impatient:'초조해하는 중',happy:'기뻐하는 중',angry:'화난 표정'};
let imageLoaded=false;
let imageRequest:Promise<boolean> | undefined;
function loadPortrait() {
  if (!imageRequest) imageRequest=new Promise(resolve=>{
    const image=new Image();
    image.onload=()=>{imageLoaded=true;resolve(true);};
    image.onerror=()=>resolve(false);
    image.src=customerAtlas;
  });
  return imageRequest;
}

export function CustomerPortrait({index,mood}:{index:0|1|2;mood:CustomerMood}) {
  const [ready,setReady]=useState(imageLoaded);
  useEffect(()=>{
    let mounted=true;
    void loadPortrait().then(ok=>{if(mounted)setReady(ok);});
    return ()=>{mounted=false;};
  },[]);
  const angry=mood==='angry';
  return <div className={`customer-portrait ${mood} ${ready?'portrait-ready':'portrait-fallback'}`} role="img" aria-label={`${customerNames[index]}, ${moodNames[mood]}`} data-customer-index={index} data-mood={mood}>
    {ready?<span className="customer-sprite" style={{backgroundImage:`url(${customerAtlas})`,backgroundPosition:`${index*50}% ${angry?100:0}%`}}/>:
      <svg viewBox="0 0 100 100" aria-hidden="true">
        {index===1?<><path d="M35 43V10Q35 1 43 7L48 42M54 42l5-33Q63 0 69 9L66 46" fill="#fff0ad" stroke="#38312d" strokeWidth="3"/></>:<>
          {index===0?<path d="M22 44l7-26 21 16 20-16 8 28" fill="#85bace" stroke="#38312d" strokeWidth="3"/>:<><circle cx="29" cy="35" r="9" fill="#fff" stroke="#38312d" strokeWidth="3"/><circle cx="70" cy="35" r="9" fill="#fff" stroke="#38312d" strokeWidth="3"/></>}
        </>}
        <ellipse cx="50" cy="62" rx="33" ry="31" fill={index===1?'#fff0ad':'#fffdf7'} stroke="#38312d" strokeWidth="3"/>
        {index===0&&<path d="M23 45Q28 30 49 34Q70 30 77 45Q62 51 49 43Q35 51 23 45" fill="#85bace" stroke="#38312d" strokeWidth="2"/>}
        <ellipse cx="32" cy="67" rx="8" ry="5" fill="#f2a5b7"/><ellipse cx="69" cy="67" rx="8" ry="5" fill="#f2a5b7"/>
        <ellipse cx="38" cy="57" rx="4" ry={angry?'3':'5'} fill="#292321"/><ellipse cx="62" cy="57" rx="4" ry={angry?'3':'5'} fill="#292321"/>
        {angry?<><path d="M31 47l12 5M57 52l12-5M43 77q7-14 14 0Z" fill="#e9a1a7" stroke="#292321" strokeWidth="3" strokeLinecap="round"/><path d="M78 37l7 3 4-6M77 42l-2 7 7 2" fill="none" stroke="#d95843" strokeWidth="3"/></>:<path d="M42 70q4 6 8 0q4 6 8 0" fill="none" stroke="#292321" strokeWidth="3" strokeLinecap="round"/>}
        <ellipse cx="27" cy="78" rx="6" ry="8" fill={index===1?'#fff0ad':'#fffdf7'} stroke="#38312d" strokeWidth="2"/><ellipse cx="73" cy="78" rx="6" ry="8" fill={index===1?'#fff0ad':'#fffdf7'} stroke="#38312d" strokeWidth="2"/>
      </svg>}
  </div>;
}
