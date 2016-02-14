'use strict';

const Util         = require('./Util'),
      LiteralTypes = require('./LiteralTypes');

/**
 * A Factory can create Entities of a given type.
 * The factory will only instantiate a new instance of an Entity
 * if there is no other instance of this Entity created already.
 */
class Factory {
  constructor(clazz) {
    this._clazz = clazz;
    this._cache = new Map();
  }

  _createEntity(id, data) {
    let Clazz = this._clazz,
        cache = this._cache;

    let entity = new Clazz(data);
    cache.set(id, entity);
    return entity;
  }

  /**
   * Returns an instance of an entity with the given id.
   * If no matching instance exists yet, a new one will be created using the given data.
   * Otherwise an existing instance will be returned.
   * @param id The id of the entity (optional).
   * @param data An object containing the bindings as returned by executing a sparql query.
   */
  createSync(id, data) {
    // id is optional
    if (typeof id === 'object') {
      data = id;
      id = Util.fromSparqlLiteral(data['?id'], LiteralTypes.URI);
    }

    // Fetch the entity from the cache
    return this._cache.get(id) || this._createEntity(id, data);
  }

  /**
   * Returns an instance of an entity with the given id through the resultCallback.
   * If no matching instance exists yet, a new one will be created using the data returned
   * by the fetchData callback.
   * Otherwise an existing instance will be returned.
   * @param id The id of the entity.
   * @param fetchData A function that accepts a data callback function and returns the data for the given instance through this callback when called.
   * @param resultCallback A callback function that returns the resulting entity.
   */
  createAsync(id, fetchData, resultCallback) {
    let entity = this._cache.get(id);
    if (entity) return resultCallback(entity);

    fetchData(data => {
      entity = data ? this._createEntity(id, data) : null;
      resultCallback(entity);
    });
  }
}

module.exports = Factory;
