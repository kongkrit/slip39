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
  
  function intArrayToBigInt(intArray, base) {
    if (!Array.isArray(intArray)) {
      throw new TypeError("intArray must be an array of numbers");
    }
    if (typeof base !== "number" || base <= 1) {
      throw new RangeError("base must be a number greater than 1");
    }
  
    let bigInt = 0n;
    const baseBigInt = BigInt(base);
  
    for (let i = 0; i < intArray.length; i++) {
      const val = BigInt(intArray[i]);
      if (val < 0n || val >= baseBigInt) {
        throw new RangeError(`Value ${intArray[i]} at index ${i} is out of range for base ${base}`);
      }
      bigInt = bigInt * baseBigInt + val;
    }
  
    return bigInt;
  }

  function bigIntToIntArray(bigInt, base) {
    if (typeof bigInt !== "bigint") {
      throw new TypeError("bigInt must be a BigInt");
    }
    if (typeof base !== "number" || base <= 1) {
      throw new RangeError("base must be a number greater than 1");
    }
	
    const baseBigInt = BigInt(base);
    const result = [];
  
    let n = bigInt;
    if (n === 0n) return [0];
  
    while (n > 0n) {
      const remainder = n % baseBigInt;
      result.push(Number(remainder)); // safe if remainder < base
      n = n / baseBigInt;
    }
  
    return result.reverse(); // most significant digit first
  }
  
  function arraysEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  
  function slip39toBase58(phrase) {
	if (!(typeof phrase === "string" || phrase instanceof String)) {
	  throw new TypeError("phrase must be a string");
    }
	
	const wordArray   = phrase.split(" ");
	const valueArray1 = slip39arrayToIndices(wordArray);
	const bigInt      = intArrayToBigInt(valueArray1, 1024);
	const valueArray2 = bigIntToIntArray(bigInt, 58);
	const base58array = indicesToBase58Array(valueArray2);
	
	return base58array.join("");
  }
  
  function base58toSlip39(address) {
	if (!(typeof address === "string" || address instanceof String)) {
	  throw new TypeError("address must be a string");
    }
	
	const wordArray   = address.split("");
	const valueArray1 = base58arrayToIndices(wordArray);
	const bigInt      = intArrayToBigInt(valueArray1, 58);
	const valueArray2 = bigIntToIntArray(bigInt, 1024);
	const slip39array = indicesToSlip39Array(valueArray2);
	
	return slip39array.join(" ");
  }
  
  function isString(textIn) {
	if (!(typeof textIn == "string" || textIn instanceof String)) {
	  throw new TypeError("textIn must be a string");
	  return false;
    }
	return true;
  }
	  
  function conversionOk(textSlip39, textBase58) {
	
	isString(textSlip39);
	isString(textBase58);

    const convSlip39 = base58toSlip39(textBase58);
	const convBase58 = slip39toBase58(textSlip39);
	
	if ((textSlip39 !== convSlip39) || (textBase58 !== convBase58)) {
		console.log("slip39 input:", textSlip39);
		console.log("base58 input:", textBase58);
		console.log("slip39 converted from base58: ",convSlip39);
		console.log("base58 converted from slip39: ",convBase58);
		throw new TypeError("slip39 and base58 inputs are not equivalent");
		return false;
	}
	return true;
  }
  
  // expose
  window.converter = window.converter || {};
  window.converter.check = check;
  window.converter.slip39arrayToIndices = slip39arrayToIndices;
  // window.converter.indicesToSlip39Array = indicesToSlip39Array;
  // window.converter.base58arrayToIndices = base58arrayToIndices;
  // window.converter.indicesToBase58Array = indicesToBase58Array;
  // window.converter.intArrayToBigInt     = intArrayToBigInt;
  // window.converter.bigIntToIntArray     = bigIntToIntArray;
  // window.converter.arraysEqual          = arraysEqual;
  window.converter.slip39toBase58       = slip39toBase58;
  window.converter.base58toSlip39       = base58toSlip39;
  window.converter.conversionOk         = conversionOk;
  
})();
