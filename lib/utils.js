"use strict";

exports.__esModule = true;
exports.nodeResolvePath = nodeResolvePath;
exports.isRelativePath = isRelativePath;
exports.toPosixPath = toPosixPath;
exports.toLocalPath = toLocalPath;
exports.stripExtension = stripExtension;
exports.replaceExtension = replaceExtension;
exports.matchesPattern = matchesPattern;
exports.mapPathString = mapPathString;
exports.isImportCall = isImportCall;
exports.escapeRegExp = escapeRegExp;

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.regexp.match");

var _path = _interopRequireDefault(require("path"));

var _resolve = _interopRequireDefault(require("resolve"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function nodeResolvePath(modulePath, basedir, extensions) {
  try {
    return _resolve.default.sync(modulePath, {
      basedir,
      extensions
    });
  } catch (e) {
    return null;
  }
}

function isRelativePath(nodePath) {
  return nodePath.match(/^\.?\.\//);
}

function toPosixPath(modulePath) {
  return modulePath.replace(/\\/g, '/');
}

function toLocalPath(modulePath) {
  var localPath = modulePath.replace(/\/index$/, ''); // remove trailing /index

  if (!isRelativePath(localPath)) {
    localPath = `./${localPath}`; // insert `./` to make it a relative path
  }

  return localPath;
}

function stripExtension(modulePath, stripExtensions) {
  var name = _path.default.basename(modulePath);

  stripExtensions.some(function (extension) {
    if (name.endsWith(extension)) {
      name = name.slice(0, name.length - extension.length);
      return true;
    }

    return false;
  });
  return name;
}

function replaceExtension(modulePath, opts) {
  var filename = stripExtension(modulePath, opts.stripExtensions);
  return _path.default.join(_path.default.dirname(modulePath), filename);
}

function matchesPattern(types, calleePath, pattern) {
  var node = calleePath.node;

  if (types.isMemberExpression(node)) {
    return calleePath.matchesPattern(pattern);
  }

  if (!types.isIdentifier(node) || pattern.includes('.')) {
    return false;
  }

  var name = pattern.split('.')[0];
  return node.name === name;
}

function mapPathString(nodePath, state) {
  if (!state.types.isStringLiteral(nodePath)) {
    return;
  }

  var sourcePath = nodePath.node.value;
  var currentFile = state.file.opts.filename;
  var modulePath = state.normalizedOpts.resolvePath(sourcePath, currentFile, state.opts);

  if (modulePath) {
    if (nodePath.node.pathResolved) {
      return;
    }

    nodePath.replaceWith(state.types.stringLiteral(modulePath));
    nodePath.node.pathResolved = true;
  }
}

function isImportCall(types, calleePath) {
  return types.isImport(calleePath.node.callee);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}