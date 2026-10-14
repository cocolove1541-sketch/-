import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,cook,grade,reward,assessDish,randomRecipe,recipes} from './engine.ts';
test('175 degrees produces fully cooked perfect chicken',()=>assert.equal(grade(cook(fresh(),175,12)),'perfect'));
test('high heat cannot sell raw inside',()=>assert.equal(grade(cook(fresh(),220,6)),'raw'));
test('burnt chicken has no reward',()=>assert.equal(reward(grade(cook(fresh(),220,15)),4,0),0));
test('low temperature is soggy',()=>assert.equal(grade(cook(fresh(),150,15)),'soggy'));
test('combo increases reward',()=>assert.ok(reward('perfect',3,0)>reward('perfect',0,0)));
test('seasoned order needs full sauce coverage before serving',()=>{
 const cooked = cook(fresh(),175,12);
 assert.equal(assessDish(cooked,1,0),'unsauced');
 assert.equal(assessDish(cooked,1,.9),'unsauced');
 assert.equal(assessDish(cooked,1,1),'perfect');
 assert.equal(assessDish(cooked,0,0),'perfect');
});
test('sauce cannot hide undercooked or burnt chicken',()=>{
 assert.equal(assessDish(cook(fresh(),175,3),1,1),'raw');
 assert.equal(assessDish(cook(fresh(),215,15),1,1),'burnt');
});
test('customer orders include all three starter recipes and never a spicy or locked recipe',()=>{
 assert.equal(recipes.length,3);
 assert.equal(randomRecipe(()=>0),0);
 assert.equal(randomRecipe(()=>.5),1);
 assert.equal(randomRecipe(()=>.99999),2);
 assert.deepEqual(Array.from({length:300},(_,i)=>randomRecipe(()=>i/300)).reduce((counts,r)=>{counts[r]++;return counts;},[0,0,0]),[100,100,100]);
});
test('soy chicken requires sauce and has its own completed order reward',()=>{
 const cooked=cook(fresh(),175,13.44,1.12);
 assert.equal(assessDish(cooked,2,0),'unsauced');
 assert.equal(assessDish(cooked,2,1),'perfect');
 assert.equal(reward('perfect',0,2),260);
});
