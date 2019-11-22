"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removePropTypeImport;

var _constants = require("./constants");

function removePropTypeImport(j, ast) {
  // remove `PropTypes` from import React, { PropTypes } from 'react'
  ast.find(j.ImportDeclaration, {
    type: _constants.EXPRESSION_TYPES.IMPORT_DECLARATION,
    source: {
      type: _constants.NODE_TYPES.STRING_LITERAL,
      value: 'react'
    }
  }).find(j.ImportSpecifier, {
    imported: {
      name: 'PropTypes'
    }
  }).remove(); // remove whole line import { PropTypes } from 'react'

  ast.find(j.ImportDeclaration, {
    type: _constants.EXPRESSION_TYPES.IMPORT_DECLARATION,
    source: {
      type: _constants.NODE_TYPES.STRING_LITERAL,
      value: 'react'
    }
  }).filter(p => p.value.specifiers.length === 0).remove(); // remove react16 import PropType from 'prop-types' or import { bool } from 'prop-types'

  ast.find(j.ImportDeclaration, {
    type: _constants.EXPRESSION_TYPES.IMPORT_DECLARATION,
    source: {
      type: _constants.NODE_TYPES.STRING_LITERAL,
      value: 'prop-types'
    }
  }).remove();
}