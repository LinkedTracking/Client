'use strict';

const EntityFetcher = require('./EntityFetcher'),
      Entity        = require('./Entity'),
      QueryBuilder  = require('./QueryBuilder');

/**
 * Provides an entry point to fetch all the necessary data involving Series, Seasons, Episodes, ... from the server.
 */
class API {
  constructor(entityFetcher) {
    this._fetcher = entityFetcher;

    this._register('getEntityById', Entity, true, (builder, params) => {
      console.log(Entity.createQuery(builder, params));
      //return [ {'?name': 'Entity 1'} ];
      return [];
    });
    this._register('findEntities', Entity, false, (builder, params) => {
      console.log(Entity.createQuery(builder, params));
      return [
        { '?id': '<id1>' },
        { '?id': '<id2>' },
        { '?id': '<id3>' }
      ];
    });
  }

  /**
   * Registers a new method to the api.
   * example:
   *    _register('getEntities', Entity, false)
   * Will create the following public method:
   *    getEntity(params, entitiesCallback)
   * Where params contains a list of filters to match Entities on and entitiesCallback
   * is a callback which returns a list of entities.
   *
   * @param methodName Public method name.
   * @param Clazz The type of entities this method returns.
   * @param singleResult If set to true, this will fetch only a single entity, otherwise a list of entities will be returned.
   * @param createQuery (optional) A method that accepts (QueryBuilder, params) arguments and returns a SPARQL query when called.
   */
  _register(methodName, Clazz, singleResult, createQuery) {
    this[methodName] = (params, callback) => {
      let types = Clazz.types(),
          builder = new QueryBuilder(types),
          query = createQuery ? createQuery(builder, params) : Clazz.createQuery(builder, params);

      if (singleResult) {
        if (!params.id) throw new Error("You need to supply a valid id to fetch a single entity");
        this._fetcher.fetchSingle(Clazz, params.id, query, params, types, callback);
      } else {
        this._fetcher.fetchMultiple(Clazz, query, params, types, callback);
      }
    };
  }

  /**
   * Creates a new instance of the api.
   */
  static instance() {
    let fetcher = new EntityFetcher();
    return new API(fetcher);
  }
}

const instance = API.instance();
module.exports = instance;
