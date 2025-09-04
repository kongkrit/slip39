// conversion-lib.js
(function () {

  const SLIP39_WORD_LIST = "a b c d"
  const BASE58_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const BASE58_ARRAY = BASE58_CHARS.split("");

  // 5) Expose a clean, small surface without touching slip39-libs.js:
  window.converter = window.converter || {};
  converter.BASE58_ARRAY    = BASE58_ARRAY;
})();
