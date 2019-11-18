"use strict";

var _utils = require("../utils");

describe('escapeMarkdownChars', function () {
  test('handles headings', function () {
    expect((0, _utils.escapeMarkdownChars)('# text')).toEqual('\\# text');
  });
  test('handles unordered list items', function () {
    expect((0, _utils.escapeMarkdownChars)('- text')).toEqual('\\- text');
    expect((0, _utils.escapeMarkdownChars)('* text')).toEqual('\\* text');
  });
  test('handles bolds', function () {
    expect((0, _utils.escapeMarkdownChars)('this is **not bold**')).toEqual('this is \\*\\*not bold\\*\\*');
  });
  test('handles italics', function () {
    expect((0, _utils.escapeMarkdownChars)('this is *not italic*')).toEqual('this is \\*not italic\\*');
  });
  test('handles hashtags', function () {
    expect((0, _utils.escapeMarkdownChars)('this not a # hashtag')).toEqual('this not a \\# hashtag');
    expect((0, _utils.escapeMarkdownChars)('this is a #hashtag-notatag')).toEqual('this is a #hashtag\\-notatag');
    expect((0, _utils.escapeMarkdownChars)('this is a #hashtag')).toEqual('this is a #hashtag');
  });
  test('handles links', function () {
    expect((0, _utils.escapeMarkdownChars)('this is [not](a link)')).toEqual('this is \\[not\\]\\(a link\\)');
  });
  test('handles images', function () {
    expect((0, _utils.escapeMarkdownChars)('this is ![not](an image)')).toEqual('this is \\!\\[not\\]\\(an image\\)');
  });
  test('handles ordered list items', function () {
    expect((0, _utils.escapeMarkdownChars)(' 1a. item.')).toEqual(' 1a\\. item.');
  });
  test('does not escape links', function () {
    expect((0, _utils.escapeMarkdownChars)('https://github.com/')).toEqual('https://github.com/');
  });
});