'use strict';

const LiteralTypes = require('./LiteralTypes');

/**
 * A Util class that contains util methods
 * for converting to and from sparql literals.
 */
const Util = {
  parsers: {},
  toSparqlLiteral(literal, type) {
    if (typeof literal === "undefined") return literal;

    let parser = this.parsers[type];
    if (!parser) throw new Error("Can not parse type '" + type + '"');
    return parser.toSparql(literal);
  },
  fromSparqlLiteral(literal, type) {
    if (typeof literal === "undefined") return literal;

    let parser = this.parsers[type];
    if (!parser) throw new Error("Can not parse type '" + type + '"');
    return parser.fromSparql(literal);
  }
};

// Add parsers to util for all literal types
Util.parsers[LiteralTypes.URI] = {
  fromSparql(literal) { return literal.slice(1, literal.length-1); },
  toSparql(literal) { return '<' + literal + '>'; }
};
Util.parsers[LiteralTypes.STRING] = {
  fromSparql(literal) { return literal.replace(/"([^"]*)".*$/, "$1"); },
  toSparql(literal) { return '"' + literal + '"'; }
};
Util.parsers[LiteralTypes.INTEGER] = {
  fromSparql(literal) { return Util.parsers[LiteralTypes.STRING].fromSparql(literal); },
  toSparql(literal) { return '"' + literal + '"^^http://www.w3.org/2001/XMLSchema#integer'; }
};

module.exports = Util;
