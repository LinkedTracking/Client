const api = require('./lib/API');

api.findEntities({name: 'Entity'}, entities => {
  console.log('found ' + entities.length + ' entities:');
  entities.forEach(entity => {
    console.log(entity);
  });
});
