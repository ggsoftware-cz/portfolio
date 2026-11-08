import test from 'node:test';
import assert from 'node:assert/strict';
import {heroProgress, heroPose} from '../lib/configurator/motion.ts';

test('scroll progress clamps before/after a scene and rejects unusable dimensions', () => {
  assert.equal(heroProgress(50,100,200),0);
  assert.equal(heroProgress(200,100,200),.5);
  assert.equal(heroProgress(500,100,200),1);
  for (const distance of [0,-10,NaN,Infinity]) assert.equal(heroProgress(150,100,distance),0);
  assert.equal(heroProgress(NaN,100,200),0);
});
test('a hero pose is deterministic and reversible with no dependence on elapsed time', () => {
  const forward=[0,.25,.5,.75,1].map(heroPose);
  const backward=[1,.75,.5,.25,0].map(heroPose).reverse();
  assert.deepEqual(forward,backward);
  assert.equal(forward[0].yaw,0);
  assert.equal(forward[4].yaw,2.15);
  assert.ok(forward[2].yaw>forward[1].yaw);
  assert.deepEqual(heroPose(-1),heroPose(0));
  assert.deepEqual(heroPose(10),heroPose(1));
});
