"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PROPTYPES_IDENTIFIERS = exports.NODE_TYPES = exports.IDENTIFIERS = exports.EXPRESSION_TYPES = void 0;

/**
 * Stores all constant values needed across source files
 */
const EXPRESSION_TYPES = Object.freeze({
  ASSIGNMENT_EXPRESSION: 'AssignmentExpression',
  BLOCK_STATEMENT: 'BlockStatement',
  CALL_EXPRESSION: 'CallExpression',
  IMPORT_DECLARATION: 'ImportDeclaration',
  MEMBER_EXPRESSION: 'MemberExpression',
  OBJECT_EXPRESSION: 'ObjectExpression'
});
exports.EXPRESSION_TYPES = EXPRESSION_TYPES;
const IDENTIFIERS = Object.freeze({
  BODY: 'body',
  CONST: 'const',
  PROPS: 'props',
  PROPTYPES: 'propTypes'
});
exports.IDENTIFIERS = IDENTIFIERS;
const NODE_TYPES = Object.freeze({
  CLASS_PROPERTY: 'ClassProperty',
  CONSTRUCTOR: 'constructor',
  IDENTIFIER: 'Identifier',
  OBJECT_PATTERN: 'ObjectPattern',
  PROGRAM: 'Program',
  STRING_LITERAL: 'StringLiteral'
});
exports.NODE_TYPES = NODE_TYPES;
const PROPTYPES_IDENTIFIERS = Object.freeze({
  ANY: 'any',
  ARRAY: 'array',
  ARRAY_OF: 'arrayOf',
  BOOLEAN: 'bool',
  ELEMENT: 'element',
  FUNCTION: 'func',
  INSTANCE_OF: 'instanceOf',
  IS_REQUIRED: 'isRequired',
  NODE: 'node',
  NUMBER: 'number',
  OBJECT: 'object',
  OBJECT_OF: 'objectOf',
  ONE_OF: 'oneOf',
  ONE_OF_TYPE: 'oneOfType',
  SHAPE: 'shape',
  STRING: 'string'
});
exports.PROPTYPES_IDENTIFIERS = PROPTYPES_IDENTIFIERS;