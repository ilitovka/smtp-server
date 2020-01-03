const test = require('tape');
const sequelize = require('../../libs/db').sequelize;

const after = test;

after("after all tests", function (assert) {
  // after logic

  sequelize.close();

  // when done call
  assert.end()
});
