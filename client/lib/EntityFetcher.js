'use strict';

const Factory      = require('./Factory'),
      EventEmitter = require('events').EventEmitter,
      _            = require('lodash'),
      Util         = require('./Util');

// Fix setImmediate when run in the browser
var setImmediate = setImmediate;
if (!setImmediate) setImmediate = (fn) => setTimeout(fn, 0);

/**
 * Simulates a SparqlIterator, used for debugging.
 */
class DummyResults extends EventEmitter {
  constructor(results) {
    super();
    setImmediate(() => {
      results.forEach(result => this.emit('data', result));
      this.emit('end');
    });
  }
}

/**
 * An EntityFetcher can fetch one or multiple Entities from the server,
 * given the class of the Entity and the query that needs to be executed
 * to fetch data of this entity.
 */
class EntityFetcher {
  /**
   * Creates a new EntityFetcher which fetches data from the
   * given fragmentsClient.
   * @param fragmentsClient An LDF client that can be used to fetch LDFs.
   */
  constructor(fragmentsClient) {
    this._factories = new Map();
    this._fragmentsClient = fragmentsClient;
  }

  /**
   * Returns a factory that can create Entities of the given Clazz.
   * @param Clazz The Clazz of the entities.
   */
  factory(Clazz) {
    let factory = this._factories.get(Clazz);
    if (!factory) {
      factory = new Factory(Clazz);
      this._factories.set(Clazz, factory);
    }
    return factory;
  }

  // Executes query and returns results one by one via the callback
  _executeQuery(query, dataCallback, endCallback) {
    // let fragmentsClient = this._fragmentsClient,
    //     results = new ldf.SparqlIteratory(query, { fragmentsClient }),
    // DEBUG
    let results = new DummyResults(query);

    function done() {
      results.removeListener('data', dataCallback);
      results.removeListener('end', done);
      endCallback && endCallback();
    }
    results.on('data', dataCallback);
    results.on('end', done);
  }

  _extendData(data, defaultData, types) {
    _.forEach(defaultData, (value, key) => {
      let variable = '?' + key,
          type = types[key];

      if (!(variable in data)) {
        data[variable] = Util.toSparqlLiteral(value, type);
      }
    });
    return data;
  }

  /**
   * Fetches a single Entity of the given class and id from the server.
   * @param Clazz The class of the Entity.
   * @param id The unique id (uri) of the entity.
   * @param query A SPARQL query that can be used to fetch data of the entity.
   * @param defaultData Data that should be added to the bindings returned by executing the query (will be converted to SPARQL literals).
   * @param types The types of the variables defined in defaultData.
   * @param callback A callback that returns the entity.
   */
  fetchSingle(Clazz, id, query, defaultData, types, callback) {
    let factory = this.factory(Clazz),
        dataFound = null;

    this.factory(Clazz).createAsync(id, dataCallback => {
      this._executeQuery(query, data => {
        dataFound = this._extendData(data, defaultData, types)
      }, () => {
        dataCallback(dataFound);
      });
    }, callback);
  }

  /**
   * Fetches multiple Entities of the given class using the given query.
   * @param Clazz The class of the entities.
   * @param query A SPARQL query that can be used to fetch data of the entities.
   * @param defaultData Data that should be added to the bindings returned by executing the query (will be converted to SPARQL literals).
   * @param types The types of the variables defined in defaultData.
   * @param callback A callback that returns an array of entities.
   */
  fetchMultiple(Clazz, query, defaultData, types, callback) {
    let entities = [],
        factory = this.factory(Clazz);

    this._executeQuery(query, entityData => {
      let extendedData = this._extendData(entityData, defaultData, types);
      let entity = factory.createSync(entityData);
      entities.push(entity);
    }, () => callback(entities));
  }
}

module.exports = EntityFetcher;
