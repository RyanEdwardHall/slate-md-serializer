"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _urls = require("./urls");

var _utils = require("./utils");

var _parser = _interopRequireDefault(require("./parser"));

var _immutable = require("immutable");

var _slate = require("slate");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var String = new _immutable.Record({
  object: 'string',
  text: ''
});
/**
 * Rules to (de)serialize nodes.
 *
 * @type {Object}
 */

var tableHeader = '';
var RULES = [// this adds a user mention serialization rule
{
  serialize: function serialize(obj) {
    if (obj.type === 'userMention') {
      return "@{".concat(obj.data.get('userID'), "}");
    }
  }
}, {
  serialize: function serialize(obj, children) {
    if (obj.object === 'string') {
      return children;
    }
  }
}, {
  serialize: function serialize(obj, children, document) {
    if (obj.object !== 'block') return;
    var parent = document.getParent(obj.key);

    switch (obj.type) {
      case 'table':
        tableHeader = '';
        return "".concat(children.trim(), "\n");

      case 'table-head':
        {
          switch (obj.getIn(['data', 'align'])) {
            case 'left':
              tableHeader += '|:--- ';
              break;

            case 'center':
              tableHeader += '|:---:';
              break;

            case 'right':
              tableHeader += '| ---:';
              break;

            default:
              tableHeader += '| --- ';
          }

          return "| ".concat(children, " ");
        }

      case 'table-row':
        {
          var output = '';

          if (tableHeader) {
            output = "".concat(tableHeader, "|\n");
            tableHeader = '';
          }

          return "".concat(children, "|\n").concat(output);
        }

      case 'table-cell':
        return "| ".concat(children, " ");

      case 'paragraph':
        return "".concat(children, "\n");

      case 'code':
        {
          var language = obj.getIn(['data', 'language']) || '';
          return "```".concat(language, "\n").concat(children.replace(/```/g, '\\`\\`\\`'), "\n```\n");
        }

      case 'code-line':
        return "".concat(children.replace(/```/g, '\\`\\`\\`'), "\n");

      case 'block-quote':
        // Handle multi-line blockquotes
        return "".concat(children.split('\n').map(function (text) {
          return "> ".concat(text);
        }).join('\n'), "\n");

      case 'todo-list':
      case 'bulleted-list':
      case 'ordered-list':
        // Remove excessive newlines.
        return children.replace(/\n+$/, '\n');

      case 'list-item':
        {
          if (parent.type === 'ordered-list') {
            // There should be enough left pad to align all lines with first one,
            // otherwise some parsers parse the markdown incorrectly.
            var index = (parent.nodes.indexOf(obj) + 1).toString();
            var pad = ' '.repeat(index.length + 2);
            return children.replace(/^(.+)/gm, "".concat(pad, "$1")).replace(/^\s+/, "".concat(index, ". "));
          }

          return children.replace(/^(.+)/gm, '  $1').replace(/^ /, '-');
        }

      case 'heading1':
        return "# ".concat(children, "\n");

      case 'heading2':
        return "## ".concat(children, "\n");

      case 'heading3':
        return "### ".concat(children, "\n");

      case 'heading4':
        return "#### ".concat(children, "\n");

      case 'heading5':
        return "##### ".concat(children, "\n");

      case 'heading6':
        return "###### ".concat(children, "\n");

      case 'horizontal-rule':
        return "---\n";

      case 'image':
        {
          var alt = obj.getIn(['data', 'alt']) || '';
          var src = (0, _urls.encode)(obj.getIn(['data', 'src']) || '');
          var title = obj.getIn(['data', 'title']) || '';
          var titleTag = title ? " \"".concat(title, "\"") : '';
          return "![".concat(alt, "](").concat(src).concat(titleTag, ")\n");
        }
    }
  }
}, {
  serialize: function serialize(obj, children) {
    if (obj.type === 'hashtag') return children;
  }
}, {
  serialize: function serialize(obj, children) {
    if (obj.type === 'link') {
      var href = (0, _urls.encode)(obj.getIn(['data', 'href']) || '');
      var text = children.trim() || href;
      return "[".concat(text, "](").concat(href, ")");
    }
  }
}, {
  serialize: function serialize(obj, children, open, close) {
    if (obj.object !== 'mark') return;
    if (!children) return;

    switch (obj.type) {
      case 'bold':
        return "".concat(open ? '**' : '').concat(children).concat(close ? '**' : '');

      case 'italic':
        return "".concat(open ? '_' : '').concat(children).concat(close ? '_' : '');

      case 'code':
        return "`".concat(children, "`");

      case 'inserted':
        return "++".concat(children, "++");

      case 'deleted':
        return "~~".concat(children, "~~");

      case 'underlined':
        return "__".concat(children, "__");
    }
  }
}];
/**
 * Markdown serializer.
 *
 * @type {Markdown}
 */

var Markdown =
/*#__PURE__*/
function () {
  /**
   * Create a new serializer with `rules`.
   *
   * @param {Object} options
   * @property {Array} rules
   * @return {Markdown} serializer
   */
  function Markdown() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Markdown);

    this.rules = [].concat(_toConsumableArray(options.rules || []), RULES);
    this.serializeNode = this.serializeNode.bind(this);
    this.serializeLeaves = this.serializeLeaves.bind(this);
    this.serializeString = this.serializeString.bind(this);
  }
  /**
   * Serialize a `state` object into an HTML string.
   *
   * @param {State} state
   * @return {String} markdown
   */


  _createClass(Markdown, [{
    key: "serialize",
    value: function serialize(state) {
      var _this = this;

      var document = state.document;
      var elements = document.nodes.map(function (node) {
        return _this.serializeNode(node, document);
      });
      return elements.join('\n').trim();
    }
    /**
     * Serialize a `node`.
     *
     * @param {Node} node
     * @return {String}
     */

  }, {
    key: "serializeNode",
    value: function serializeNode(node, document) {
      var _this2 = this;

      var openMarks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var prevNode = arguments.length > 3 ? arguments[3] : undefined;
      var nextNode = arguments.length > 4 ? arguments[4] : undefined;

      if (node.object === 'text') {
        var inCodeBlock = Boolean(document.getClosest(node.key, function (n) {
          return n.type === 'code';
        }));
        var inCodeMark = Boolean((node.marks || []).filter(function (mark) {
          return mark.type === 'code';
        }).size);
        return this.serializeLeaves(node, !inCodeBlock && !inCodeMark, openMarks, prevNode, nextNode);
      }

      var isMultilineListItem = node.type === 'list-item' && (node.nodes.size !== 2 || node.nodes.first().type !== 'paragraph' || !['ordered-list', 'bulleted-list', 'todo-list'].includes(node.nodes.last().type));
      var children = node.nodes.map(function (childNode, index) {
        var serialized = _this2.serializeNode(childNode, document, openMarks, node.nodes.get(index - 1), node.nodes.get(index + 1));

        return (serialized && serialized.join ? serialized.join('') : serialized) || '';
      }).join( // Special case for blockquotes && multi-line list items
      node.type === 'block-quote' || isMultilineListItem ? '\n' : '');
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.rules[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var rule = _step.value;
          if (!rule.serialize) continue;
          var ret = rule.serialize(node, children, document);
          if (ret) return ret;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
    /**
     * Serialize `leaves`.
     *
     * @param {Leave[]} leaves
     * @return {String}
     */

  }, {
    key: "serializeLeaves",
    value: function serializeLeaves(leaves) {
      var _this3 = this;

      var escape = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var openMarks = arguments.length > 2 ? arguments[2] : undefined;
      var prevNode = arguments.length > 3 ? arguments[3] : undefined;
      var nextNode = arguments.length > 4 ? arguments[4] : undefined;
      var leavesText = leaves.text;

      if (escape) {
        // escape markdown characters
        leavesText = (0, _utils.escapeMarkdownChars)(leavesText);
      }

      var string = new String({
        text: leavesText
      });
      var marks = leaves.marks;
      var text = this.serializeString(string);
      if (!marks) return text;
      var prevNodeMarks = prevNode && prevNode.object === 'text' && prevNode.marks ? prevNode.marks.reduce(function (hash, mark) {
        hash[mark.type] = true;
        return hash;
      }, {}) : {};
      var nextNodeMarks = nextNode && nextNode.object === 'text' && nextNode.marks ? nextNode.marks.reduce(function (hash, mark) {
        hash[mark.type] = true;
        return hash;
      }, {}) : {}; // The order of items in the `marks` array matters. The marks that
      // transitioned from the previous node should go last. For some reason,
      // Slate sometimes doesn't respect this order, so we must ensure it by
      // sorting the array ourselves.

      if (Object.keys(prevNodeMarks).length && marks) {
        marks = marks.sort(function (a, b) {
          var prevHasA = prevNodeMarks[a.type] ? 1 : -1;
          var prevHasB = prevNodeMarks[b.type] ? 1 : -1;
          return prevHasA - prevHasB;
        });
      }

      return marks.reduce(function (children, mark) {
        var close = !nextNodeMarks[mark.type];
        var open = !openMarks[mark.type];
        openMarks[mark.type] = nextNodeMarks[mark.type];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = _this3.rules[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var rule = _step2.value;
            if (!rule.serialize) continue;
            var ret = rule.serialize(mark, children, open, close);
            if (ret) return ret;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        return undefined;
      }, text);
    }
    /**
     * Serialize a `string`.
     *
     * @param {String} string
     * @return {String}
     */

  }, {
    key: "serializeString",
    value: function serializeString(string) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.rules[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var rule = _step3.value;
          if (!rule.serialize) continue;
          var ret = rule.serialize(string, string.text);
          if (ret) return ret;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
            _iterator3["return"]();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
    /**
     * Deserialize a markdown `string`.
     *
     * @param {String} markdown
     * @return {State} state
     */

  }, {
    key: "deserialize",
    value: function deserialize(markdown) {
      var document = _parser["default"].parse(markdown);

      return _slate.Value.fromJSON({
        document: document
      });
    }
  }]);

  return Markdown;
}();

var _default = Markdown;
exports["default"] = _default;