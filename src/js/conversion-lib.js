// conversion-lib.js
(function () {

  async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function check() {
	if (wordList.slip39.length !== 1024) {
	  throw new Error ("slip39 doesn't contain 1024 words");
	}
	if (wordList.base58.length !== 58) {
	  throw new Error ("base58 doesn't contain 58 characters");
	}
	const slip39_sha256 = await sha256(wordList.slip39.join(""));
	const base58_sha256 = await sha256(wordList.base58.join(""));
	const slip39_sha256_actual = "5abb0310bd667eb61edd76119b63e5c403c47a7c37be8641dc3f670675157bca"
	const base58_sha256_actual = "72cf75f6ffbebe07f71523271916703471c005d39c2630cd63da31b929b6d21f"
	if (slip39_sha256 !== slip39_sha256_actual) {
		throw new Error (`check:mismatch: slip39_sha256 is: ${slip39_sha256}, expected: ${slip39_sha256_actual}`);
	} else { console.log("check:slip39_sha256 is ok"); }
	if (base58_sha256 !== base58_sha256_actual) {
		throw new Error (`check:mismatch: base58_sha256 is: ${base58_sha256}, expected: ${base58_sha256_actual}`);
	} else { console.log("check:base58_sha256 is ok"); }
	// console.log("slip39_sha256",typeof(slip39_sha256),slip39_sha256);
	// console.log("base58_sha256",typeof(base58_sha256),base58_sha256);
	// console.log("wordList.slip39", wordList.slip39);
	// console.log("wordList.base58", wordList.base58);
	return 0;
  }

  // Build cached lookup maps once.
  const slip39Words = (window.wordList && window.wordList.slip39) || [];
  const base58Chars = (window.wordList && window.wordList.base58) || [];

  const slip39ToIndex = new Map(slip39Words.map((w, i) => [w, i]));
  const base58ToIndex = new Map(base58Chars.map((c, i) => [c, i]));
  
  // --- Array ↔ Indices mappers ---
  function slip39arrayToIndices(words) {
    if (!Array.isArray(words)) throw new TypeError("Expected array of words");
    return words.map((w, i) => {
      const idx = slip39ToIndex.get(w);
      if (idx === undefined) throw new Error(`Unknown SLIP-39 word "${w}" at position ${i}`);
      return idx;
    });
  }

  function indicesToSlip39Array(indices) {
    if (!Array.isArray(indices)) throw new TypeError("Expected array of integers");
    return indices.map((n, i) => {
      if (!Number.isInteger(n)) throw new TypeError(`Index at ${i} not integer`);
      if (n < 0 || n >= slip39Words.length) throw new RangeError(`SLIP-39 index ${n} out of range`);
      return slip39Words[n];
    });
  }

  function base58arrayToIndices(chars) {
    if (!Array.isArray(chars)) throw new TypeError("Expected array of characters");
    return chars.map((ch, i) => {
      const idx = base58ToIndex.get(ch);
      if (idx === undefined) throw new Error(`Unknown Base58 char "${ch}" at ${i}`);
      return idx;
    });
  }

  function indicesToBase58Array(indices) {
    if (!Array.isArray(indices)) throw new TypeError("Expected array of integers");
    return indices.map((n, i) => {
      if (!Number.isInteger(n)) throw new TypeError(`Index at ${i} not integer`);
      if (n < 0 || n >= base58Chars.length) throw new RangeError(`Base58 index ${n} out of range`);
      return base58Chars[n];
    });
  }
  
  // expose
  window.converter = window.converter || {};
  window.converter.check = check;
  window.converter.slip39arrayToIndices = slip39arrayToIndices;
  window.converter.indicesToSlip39Array = indicesToSlip39Array;
  window.converter.base58arrayToIndices = base58arrayToIndices;
  window.converter.indicesToBase58Array = indicesToBase58Array;
  
})();
