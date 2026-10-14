export type Cook = {inside:number; crust:number; low:number; elapsed:number};
export const fresh = ():Cook=>({inside:0,crust:0,low:0,elapsed:0});

export const recipes = ['오리지널 후라이드', '달콤한 양념치킨', '깊은 풍미 간장치킨'] as const;
export const recipeLabels = ['후라이드', '양념치킨', '간장치킨'] as const;
export type Recipe = 0 | 1 | 2;

// Every customer can order any of the three recipes from the very first visit.
export function randomRecipe(random: () => number = Math.random): Recipe {
 return Math.min(2, Math.max(0, Math.floor(random() * recipes.length))) as Recipe;
}
export function cook(c:Cook,temp:number,dt:number,size=1,oil=0):Cook {
 return {inside:c.inside+dt/ (10*size)*Math.min(1.3,temp/175),crust:c.crust+dt/(12*size)*Math.pow(temp/175,4),low:c.low+(temp<170?dt:0),elapsed:c.elapsed+dt};
}
export function grade(c:Cook):'burnt'|'raw'|'soggy'|'perfect'|'good'{
 if(c.crust>=1.45)return 'burnt'; if(c.inside<1)return 'raw'; if(c.low>4||c.crust<.7)return 'soggy'; if(c.crust>=.88&&c.crust<=1.15)return 'perfect';return 'good';
}
export const reward=(g:ReturnType<typeof grade>,combo:number,recipe:number)=>g==='perfect'?Math.round((180+recipe*40)*(1+Math.min(combo,10)*.1)):g==='good'?120+recipe*30:g==='soggy'?40:0;

// Sauce is a finishing step: it cannot make raw or burnt chicken safe to sell.
export function assessDish(c: Cook, recipe: number, coverage: number): ReturnType<typeof grade> | 'unsauced' {
 const doneness = grade(c);
 if (doneness === 'raw' || doneness === 'burnt') return doneness;
 if (recipe > 0 && coverage < 1) return 'unsauced';
 return doneness;
}
