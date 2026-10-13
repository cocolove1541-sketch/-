import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,cook,grade,reward} from './engine.ts';
test('175 degrees produces fully cooked perfect chicken',()=>assert.equal(grade(cook(fresh(),175,12)),'perfect'));
test('high heat cannot sell raw inside',()=>assert.equal(grade(cook(fresh(),220,6)),'raw'));
test('burnt chicken has no reward',()=>assert.equal(reward(grade(cook(fresh(),220,15)),4,0),0));
test('low temperature is soggy',()=>assert.equal(grade(cook(fresh(),150,15)),'soggy'));
test('combo increases reward',()=>assert.ok(reward('perfect',3,0)>reward('perfect',0,0)));
