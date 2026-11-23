import test from 'node:test';
import assert from 'node:assert/strict';
import {heroProgress, heroPose, heroScene} from '../lib/configurator/motion.ts';

test('scroll progress clamps before/after a scene and rejects unusable dimensions', () => {
  assert.equal(heroProgress(50,100,200),0);
  assert.equal(heroProgress(200,100,200),.5);
  assert.equal(heroProgress(500,100,200),1);
  for (const distance of [0,-10,NaN,Infinity]) assert.equal(heroProgress(150,100,distance),0);
  assert.equal(heroProgress(NaN,100,200),0);
});
test('a hero pose is deterministic and reversible with no dependence on elapsed time', () => {
  const forward=[0,.25,.5,.75,1].map(p => heroPose(p));
  const backward=[1,.75,.5,.25,0].map(p => heroPose(p)).reverse();
  assert.deepEqual(forward,backward);
  assert.equal(Math.abs(forward[0].yaw),0);
  assert.equal(forward[4].yaw,-.3);
  assert.ok(forward[2].yaw<forward[1].yaw);
  assert.deepEqual(heroPose(-1),heroPose(0));
  assert.deepEqual(heroPose(10),heroPose(1));
});

test('the complete frame recedes then holds before its scene leaves', () => {
  assert.equal(heroScene(0).frameScale, 1);
  assert.equal(heroScene(1).frameScale, .54);
  assert.deepEqual(heroScene(.82), heroScene(1));
  const scale = [0,.2,.4,.6,.8,1].map(p => heroScene(p).frameScale);
  assert.ok(scale.every((value, index) => index === 0 || value <= scale[index - 1]));
  assert.equal(heroPose(1).scale, 1); // Layout owns scaling; rotation never changes the model geometry.
});


test('the travelling product completes one turn at the collection poster pose', () => {
  const end = heroPose(1, 1);
  assert.equal(end.yaw, Math.PI * 2);
  assert.ok(Math.abs(end.pitch) < 1e-10);
  assert.ok(Math.abs(end.roll) < 1e-10);
  const path = [0,.2,.4,.6,.8,1].map(t => heroPose(1,t));
  assert.ok(path.every((pose,i) => i === 0 || pose.yaw > path[i-1].yaw));
  assert.deepEqual(path, [1,.8,.6,.4,.2,0].map(t => heroPose(1,t)).reverse());
  assert.deepEqual(heroPose(1,-1),heroPose(1,0));
  assert.deepEqual(heroPose(1,2),end);
});
