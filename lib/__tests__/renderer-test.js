"use strict";

var _renderer = _interopRequireDefault(require("../renderer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var Markdown = new _renderer["default"](); // By parsing, rendering and reparsing we can test both sides of the serializer
// at the same time and ensure that parsing / rendering is compatible.

function getNodes(text) {
  var parsed = Markdown.deserialize(text);
  var rendered = Markdown.serialize(parsed);
  var reparsed = Markdown.deserialize(rendered);
  return reparsed.document.nodes;
} // Asserts whether the original Markdown string is the same as the one created
// by parsing and re-rendering the original.


function assertSymmetry(text, value) {
  var parsed = Markdown.deserialize(text);
  var rendered = Markdown.serialize(parsed);
  var reparsed = Markdown.deserialize(rendered);

  if (value) {
    expect(reparsed.toJSON()).toEqual(parsed.toJSON());
  } else {
    expect(reparsed.toJSON()).not.toEqual(parsed.toJSON());
  }

  return rendered;
}

test('parses paragraph', function () {
  var text = 'This is just a sentence';
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses paragraph with Markdown characters', function () {
  var text = 'This **is** a sen-ten-ce';
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses two paragraphs', function () {
  var text = "\nThis is the first sentence\nThis is the second sentence\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses two paragraphs', function () {
  var text = "\nThis is the first sentence\n\nThis is the second sentence\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('maintains multiple empty paragraphs', function () {
  var text = "\nThis is the first sentence\n\n\nTwo empty paragraphs above\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses heading1', function () {
  var output = Markdown.deserialize('# Heading');
  expect(output.document.nodes).toMatchSnapshot();
});
test('parses heading2', function () {
  var output = Markdown.deserialize('## Heading');
  expect(output.document.nodes).toMatchSnapshot();
});
test('parses heading3', function () {
  var output = Markdown.deserialize('### Heading');
  expect(output.document.nodes).toMatchSnapshot();
});
test('parses heading4', function () {
  var output = Markdown.deserialize('#### Heading');
  expect(output.document.nodes).toMatchSnapshot();
});
test('parses heading5', function () {
  var output = Markdown.deserialize('##### Heading');
  expect(output.document.nodes).toMatchSnapshot();
});
test('parses heading6', function () {
  var output = Markdown.deserialize('###### Heading');
  expect(output.document.nodes).toMatchSnapshot();
});
test('parses heading1 with italic mark', function () {
  var text = '# Heading *italic* not italic';
  var output = Markdown.deserialize(text);
  expect(output.document.nodes).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses heading1 with bold mark', function () {
  var text = '# Heading **bold** not bold';
  var output = Markdown.deserialize(text);
  expect(output.document.nodes).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('headings are not greedy about newlines', function () {
  var text = "\na paragraph\n\n## Heading\n\nanother paragraph\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses horizontal rule', function () {
  var text = "\n---\n\na paragraph\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('horizontal rule does not make text above a heading', function () {
  var text = "\nnot a heading\n---\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('horizontal rule does not make text above a heading', function () {
  var text = "\nnot a heading\n===\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('bold mark', function () {
  var text = "**this is bold**";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('italic mark', function () {
  var text = "*this is italic* _this is italic too_";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('bold mark inside italic mark', function () {
  var text = 'nothing _italic and **bold** and_ nothing';
  expect(getNodes(text)).toMatchSnapshot();
  var rendered = assertSymmetry(text, true);
  expect(rendered).toEqual(text);
});
test('italic mark inside bold mark', function () {
  var text = 'nothing **bold and _italic_ and** nothing';
  expect(getNodes(text)).toMatchSnapshot();
  var rendered = assertSymmetry(text, true);
  expect(rendered).toEqual(text);
});
test('deleted mark', function () {
  var text = "~~this is strikethrough~~";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('inserted mark', function () {
  var text = "++inserted text++";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('underlined mark', function () {
  var text = "__underlined text__";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('code mark', function () {
  var text = '`const foo = 123;`';
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('code mark with escaped characters', function () {
  var text = "`<script>alert('foo')</script>`";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('does not escape characters inside of code marks', function () {
  var text = "`<script>alert('foo')</script>`";
  var parsed = Markdown.deserialize(text);
  var rendered = Markdown.serialize(parsed);
  expect(rendered).toMatchSnapshot();
});
test('parses quote', function () {
  var text = "\n> this is a quote\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses quote followed by list with quote (outline/#723)', function () {
  var text = "\n> this is a quote\n1. > this is a list item with a quote\n\n> 1. this is a quote with a list item\n> 2. this is the second list item\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses quote with newlines and marks', function () {
  var text = "\n> this is a *quote*\n> this is the second part of the quote\n>\n> this is the third part of the quote\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('quotes do not get combined', function () {
  var text = "\n> this is a quote\n\n> this is a different quote\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('quote is not greedy about newlines', function () {
  var text = "\n> this is a quote\n\nthis is a paragraph\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses list items', function () {
  var text = "\n- one\n- two\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses nested list items', function () {
  var text = "\n* one\n* two\n   * nested\n\nnext para";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('does not add extra paragraphs around lists', function () {
  var text = "\nfirst paragraph\n\n- list\n\nsecond paragraph\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses indented list items', function () {
  var text = "\n - one\n - two\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses list items with marks', function () {
  var text = "\n - one **bold**\n - *italic* two\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses ordered list items', function () {
  var text = "\n1. one\n1. two\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses ordered list items with marks', function () {
  var text = "\n1. one **bold**\n1. *italic* two\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses ordered list items with different numbers', function () {
  var text = "\n1. one\n2. two\n3. three\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses mixed list items', function () {
  var text = "\n1. list\n\n- another\n\n1. different\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses tables', function () {
  var text = "\n| Tables   |      Are      |  Cool |\n|----------|:-------------:|------:|\n| col 1 is |  left-aligned | $1600 |\n| col 2 is |    centered   |   $12 |\n| col 3 is | right-aligned |    $1 |\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('tables are not greedy about newlines', function () {
  var text = "\n| Tables   |      Are      |  Cool |\n|----------|:-------------:|------:|\n| col 1 is |  left-aligned | $1600 |\n\na new paragraph\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses todo list items', function () {
  var text = "\n[ ] todo\n[x] done\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses nested todo list items', function () {
  var text = "\n[ ] todo\n   [ ] nested\n   [ ] deep\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses double nested todo list items', function () {
  var text = "\n[x] checked\n   [ ] empty\n   [x] checked\n\n[ ] three\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses todo list items with marks', function () {
  var text = "\n [x] ~~done~~\n [x] more **done**\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses ``` code fences', function () {
  var text = "\n```\nconst hello = 'world';\nfunction() {\n  return hello;\n}\n```\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses ``` code fences with language', function () {
  var text = "\n```javascript\nconst hello = 'world';\nfunction() {\n  return hello;\n}\n```\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('does not escape characters inside of code blocks', function () {
  var text = "\n```\nconst hello = 'world';\nfunction() {\n  return hello;\n}\n```\n";
  var parsed = Markdown.deserialize(text);
  var rendered = Markdown.serialize(parsed);
  expect(rendered).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('does not parse marks inside of code blocks', function () {
  var text = "\n```\nThis is *not* bold, how about __this__\n```\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('does not parse marks around code block boundaries', function () {
  var text = "\n```\nThis is *not\n```\n\nhello * bold\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('code is not greedy about newlines', function () {
  var text = "\none sentence\n\n```\nconst hello = 'world';\nfunction() {\n  return hello;\n}\n```\n\ntwo sentence\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses ~~~ code fences', function () {
  var text = "\n~~~\nconst hello = 'world';\nfunction() {\n  return hello;\n}\n~~~\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses indented code blocks', function () {
  var text = "\n    const hello = 'world';\n    function() {\n      return hello;\n    }\n";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses hashtag', function () {
  var text = "this is a #hashtag example";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses hashtag ignoring dash', function () {
  var text = "dash should end #hashtag-dash";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses image', function () {
  var text = "![example](http://example.com/logo.png)";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses link', function () {
  var text = "[google](http://google.com)";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses link within mark', function () {
  var text = "**[google](http://google.com)**";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses link with encoded characters', function () {
  var text = "[kibana](https://example.com/app/kibana#/discover?_g=%28refreshInterval:%28%27$$hashKey%27:%27object:1596%27,display:%2710%20seconds%27,pause:!f,section:1,value:10000%29,time:%28from:now-15m,mode:quick,to:now%29%29&_a=%28columns:!%28metadata.step,message,metadata.attempt_f,metadata.tries_f,metadata.error_class,metadata.url%29,index:%27logs-%27,interval:auto,query:%28query_string:%28analyze_wildcard:!t,query:%27metadata.at:%20Stepper*%27%29%29,sort:!%28time,desc%29%29)";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('parses link with percent symbol', function () {
  var text = "[kibana](https://example.com/app/kibana#/visualize/edit/Requests-%)";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, true);
});
test('ignores empty link', function () {
  var text = "[empty]()";
  expect(getNodes(text)).toMatchSnapshot();
  assertSymmetry(text, false);
});
test('parses empty string', function () {
  expect(getNodes('')).toMatchSnapshot();
});
test('parses whitespace string', function () {
  expect(getNodes('   ')).toMatchSnapshot();
});
test('handles escaped blocks', function () {
  expect(getNodes('\\# text')).toMatchSnapshot();
  expect(getNodes('\\- text')).toMatchSnapshot();
  expect(getNodes('\\* text')).toMatchSnapshot();
});
test('handles escaped marks', function () {
  expect(getNodes('this is \\*\\*not bold\\*\\*')).toMatchSnapshot();
  expect(getNodes('this is \\*not italic\\*')).toMatchSnapshot();
  expect(getNodes('this is \\[not\\]\\(a link\\)')).toMatchSnapshot();
  expect(getNodes('this is \\!\\[not\\]\\(an image\\)')).toMatchSnapshot();
});