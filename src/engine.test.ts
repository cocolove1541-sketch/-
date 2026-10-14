import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,cook,grade,reward,assessDish} from './engine.ts';
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
