'use strict';

const Util = require('./Util');

// Regex which matches variable templates in a sparql template
const VARIABLE_REGEX = /\$([A-Z]+)\$/;

/**
 * A QueryBuilder builds SPARQL queries using a SPARQL template.
 * Different parts of the query can be added by repeatedly calling the push() method.
 * When done, build() should be called which will replace all $VARIABLES$ in the template by the given bindings and output a SPARQL query.
 */
class QueryBuilder {
  /**
   * Creates a new query builder that can bind queries containing the variables given in variableTypes.
   * @param variableTypes A object which maps variable names that might occur in the query to LiteralTypes.
   */
  constructor(variableTypes) {
    this._parts = [];
    this._variableTypes = variableTypes;
  }

  /**
   * Adds a new "part" of the query template to the currently built template.
   * @param part A "part" of the query template, represented by a string.
   */
  push(part) {
    this._parts.push(part);
  }

  /**
   * Builds a SPARQL query by replacing the all template variables ($VARIABLE) by
   * the values given in the bindings variable after converting them to their SPARQL
   * equivalent.
   * @param bindings An object which maps lowercase variable names to their bound values.
   */
  build(bindings) {
    let parts = this._parts.map(part => {
      // Check if this template part contains a variable
      let match = part.match(VARIABLE_REGEX);
      if (!match) return part;

      // If this variable is bound, fill in its value, otherwise replace it by a valid sparql variable
      let variable = match[1].toLowerCase(),
          type = this._variableTypes[variable],
          value = bindings[variable] ?
            Util.toSparqlLiteral(bindings[variable], type) : ('?' + variable);

      return part.replace(match[0], value);
    });

    return parts.join(' ');
  }
}

module.exports = QueryBuilder;
