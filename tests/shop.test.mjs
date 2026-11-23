import test from 'node:test';
import assert from 'node:assert/strict';
import {addToBag, changeQuantity, bagQuantity, bagTotal, demoPrice, MAX_QUANTITY} from '../lib/configurator/shop.ts';
import {createConfiguration, parseConfiguration, encodeConfiguration, decodeConfiguration, configurationSummary} from '../lib/configurator/config.ts';

test('bag keeps sizes and colours separate while combining the same variant', () => {
  let bag = addToBag([], 'beach', '40');
  bag = addToBag(bag, 'beach', '40');
  bag = addToBag(bag, 'beach', '41');
  bag = addToBag(bag, 'street', '40');
  assert.equal(bag.length, 3);
  assert.equal(bag[0].quantity, 2);
  assert.equal(bagQuantity(bag), 4);
  assert.equal(bagTotal(bag), demoPrice * 4);
  bag = changeQuantity(bag, 'beach', '40', 0);
  assert.equal(bagQuantity(bag), 2);
  assert.equal(bagTotal(bag), demoPrice * 2);
});
test('bag rejects invalid variants and quantities and caps repeated additions', () => {
  let bag = [];
  assert.deepEqual(addToBag(bag, 'invalid', '40'), []);
  assert.deepEqual(addToBag(bag, 'beach', '99'), []);
  for (let i=0; i<15; i++) bag=addToBag(bag,'beach','40');
  assert.equal(bagQuantity(bag), MAX_QUANTITY);
  for(const quantity of [-1, 1.5, NaN, Infinity, MAX_QUANTITY+1]) assert.deepEqual(changeQuantity(bag,'beach','40',quantity),bag);
});
test('saved shop appearance survives sharing and defaults safely for older designs', () => {
  const config = createConfiguration('shift');
  config.shop = {colorway:'midnight',motion:false};
  config.content.name = 'Můj obchod';
  assert.deepEqual(decodeConfiguration(encodeConfiguration(config)),config);
  assert.match(configurationSummary(config),/3D shop: colorway midnight; motion off/);
  const {shop,...older}=config;
  assert.deepEqual(parseConfiguration(older).shop,{colorway:'beach',motion:true});
  const legacy=createConfiguration('savor');
  assert.deepEqual(parseConfiguration(legacy),legacy);
  assert.equal(parseConfiguration({...legacy,shop}).shop,undefined);
});
test('untrusted shop settings are rejected and unrelated shopper state is stripped', () => {
  const config=createConfiguration('shift');
  for(const shop of [null,[],{colorway:'../secret',motion:true},{colorway:'beach',motion:'true'},{motion:true}]) assert.equal(parseConfiguration({...config,shop}),null);
  assert.deepEqual(parseConfiguration({...config,bag:[{size:'40',quantity:2}],shop:{...config.shop,customerEmail:'private@example.com'}}),config);
});
