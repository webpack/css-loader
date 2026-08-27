// Emulates sass-loader with `charset: true`, which prefixes a BOM when the
// stylesheet is non-ASCII.
module.exports = (content) => "\uFEFF" + content;
