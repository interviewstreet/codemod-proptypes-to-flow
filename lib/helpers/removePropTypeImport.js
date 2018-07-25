'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = removePropTypeImport;
function removePropTypeImport(j, ast) {
  // remove `PropTypes` from import React, { PropTypes } from 'react'
  ast.find(j.ImportDeclaration, {
    type: 'ImportDeclaration',
    source: {
      type: 'Literal',
      value: 'react'
    }
  }).find(j.ImportSpecifier, { imported: { name: 'PropTypes' } }).remove();

  // remove whole line import { PropTypes } from 'react'
  ast.find(j.ImportDeclaration, {
    type: 'ImportDeclaration',
    source: {
      type: 'Literal',
      value: 'react'
    }
  }).filter(function (p) {
    return p.value.specifiers.length === 0;
  }).remove();

  // remove react16 import PropType from 'prop-types' or import { bool } from 'prop-types'
  ast.find(j.ImportDeclaration, {
    type: 'ImportDeclaration',
    source: {
      type: 'Literal',
      value: 'prop-types'
    }
  }).remove();
}