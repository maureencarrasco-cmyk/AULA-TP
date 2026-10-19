import test from 'node:test';
import assert from 'node:assert/strict';
import {nextQuiz,terminalPosition,routePoints,routeArrows} from '../city-panel/engine/route.js';

test('the route follows the first unanswered quiz, including after an incorrect answer',()=>{
  const questions=Array.from({length:10},()=>({}));
  assert.equal(nextQuiz(questions,{}),0);
  assert.equal(nextQuiz(questions,{'0':{correct:false}}),1);
  assert.equal(nextQuiz(questions,{'0':{},'2':{}}),1);
  assert.equal(nextQuiz(questions,Object.fromEntries(questions.map((_,i)=>[i,{}]))),-1);
});
test('every terminal has a distinct place and is approached through the clear aisle',()=>{
  const places=new Set();
  for(let i=0;i<10;i++){
    const target=terminalPosition(i),player={x:2,z:1};places.add(JSON.stringify(target));
    const path=routePoints(player,target);assert.equal(path[1].x,0);assert.equal(path[2].x,0);assert.equal(path[2].z,target.z);
    const arrows=routeArrows(path);assert.ok(arrows.length>0);
    assert.ok(arrows.every(arrow=>Number.isFinite(arrow.yaw)&&Number.isFinite(arrow.x)&&Number.isFinite(arrow.z)));
  }
  assert.equal(places.size,10);
  assert.deepEqual(routeArrows([{x:0,z:0},{x:0,z:0}]),[]);
});
