'use strict';

const LiteralTypes = require('./LiteralTypes'),
      Util         = require('./Util');

/**
 * A model class for entities, currently used for debugging.
 */
class Entity {
  /**
   * Creates a new entity given its id and the data returned by executing a sparql query.
   * @param data The bound data as returned by executing a sparql query.
   */
  constructor(data) {
    this._data = data;
    this._initGetters(Entity.types());
  }

  _initGetters(properties) {
    Object.keys(properties).forEach(name => {
      Object.defineProperty(this, name, {
        get: function() {
          return Util.fromSparqlLiteral(this._data['?' + name], properties[name]);
        }
      });
    });
  }

  /**
   * Returns an object which maps all public properties of this variable
   * to their LiteralTypes
   */
  static types() {
    return {
      id: LiteralTypes.URI,
      name: LiteralTypes.STRING,
      age: LiteralTypes.INTEGER
    };
  }

  /**
   * Returns a SPARQL query that can be used to get all data of this
   * entity given some search parameters.
   * @param queryBuilder A QueryBuilder that can be used to build the actual query.
   * @param params An object contain search parameters to limit which entities can be found.
   */
  static createQuery(queryBuilder, params) {
    let b = queryBuilder;
    b.push('SELECT * WHERE {');
      b.push('$ID$ a Entity ;');
      b.push('name $NAME$ ;');
      b.push('age $AGE$ .');
    b.push('}');
    return b.build(params);
  }
}

module.exports = Entity;
