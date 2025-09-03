(function(){
  "use strict";
  
  const wordListName_slip39 = "slip39"
  const wordList_slip39 ="academic acid acne acquire acrobat activity actress adapt adequate adjust admit adorn adult advance advocate afraid again agency agree aide aircraft airline airport ajar alarm album alcohol alien alive alpha already alto aluminum always amazing ambition amount amuse analysis anatomy ancestor ancient angel angry animal answer antenna anxiety apart aquatic arcade arena argue armed artist artwork aspect auction august aunt average aviation avoid award away axis axle beam beard beaver become bedroom behavior being believe belong benefit best beyond bike biology birthday bishop black blanket blessing blimp blind blue body bolt boring born both boundary bracelet branch brave breathe briefing broken brother browser bucket budget building bulb bulge bumpy bundle burden burning busy buyer cage calcium camera campus canyon capacity capital capture carbon cards careful cargo carpet carve category cause ceiling center ceramic champion change charity check chemical chest chew chubby cinema civil class clay cleanup client climate clinic clock clogs closet clothes club cluster coal coastal coding column company corner costume counter course cover cowboy cradle craft crazy credit cricket criminal crisis critical crowd crucial crunch crush crystal cubic cultural curious curly custody cylinder daisy damage dance darkness database daughter deadline deal debris debut decent decision declare decorate decrease deliver demand density deny depart depend depict deploy describe desert desire desktop destroy detailed detect device devote diagnose dictate diet dilemma diminish dining diploma disaster discuss disease dish dismiss display distance dive divorce document domain domestic dominant dough downtown dragon dramatic dream dress drift drink drove drug dryer duckling duke duration dwarf dynamic early earth easel easy echo eclipse ecology edge editor educate either elbow elder election elegant element elephant elevator elite else email emerald emission emperor emphasis employer empty ending endless endorse enemy energy enforce engage enjoy enlarge entrance envelope envy epidemic episode equation equip eraser erode escape estate estimate evaluate evening evidence evil evoke exact example exceed exchange exclude excuse execute exercise exhaust exotic expand expect explain express extend extra eyebrow facility fact failure faint fake false family famous fancy fangs fantasy fatal fatigue favorite fawn fiber fiction filter finance findings finger firefly firm fiscal fishing fitness flame flash flavor flea flexible flip float floral fluff focus forbid force forecast forget formal fortune forward founder fraction fragment frequent freshman friar fridge friendly frost froth frozen fumes funding furl fused galaxy game garbage garden garlic gasoline gather general genius genre genuine geology gesture glad glance glasses glen glimpse goat golden graduate grant grasp gravity gray greatest grief grill grin grocery gross group grownup grumpy guard guest guilt guitar gums hairy hamster hand hanger harvest have havoc hawk hazard headset health hearing heat helpful herald herd hesitate hobo holiday holy home hormone hospital hour huge human humidity hunting husband hush husky hybrid idea identify idle image impact imply improve impulse include income increase index indicate industry infant inform inherit injury inmate insect inside install intend intimate invasion involve iris island isolate item ivory jacket jerky jewelry join judicial juice jump junction junior junk jury justice kernel keyboard kidney kind kitchen knife knit laden ladle ladybug lair lamp language large laser laundry lawsuit leader leaf learn leaves lecture legal legend legs lend length level liberty library license lift likely lilac lily lips liquid listen literary living lizard loan lobe location losing loud loyalty luck lunar lunch lungs luxury lying lyrics machine magazine maiden mailman main makeup making mama manager mandate mansion manual marathon march market marvel mason material math maximum mayor meaning medal medical member memory mental merchant merit method metric midst mild military mineral minister miracle mixed mixture mobile modern modify moisture moment morning mortgage mother mountain mouse move much mule multiple muscle museum music mustang nail national necklace negative nervous network news nuclear numb numerous nylon oasis obesity object observe obtain ocean often olympic omit oral orange orbit order ordinary organize ounce oven overall owner paces pacific package paid painting pajamas pancake pants papa paper parcel parking party patent patrol payment payroll peaceful peanut peasant pecan penalty pencil percent perfect permit petition phantom pharmacy photo phrase physics pickup picture piece pile pink pipeline pistol pitch plains plan plastic platform playoff pleasure plot plunge practice prayer preach predator pregnant premium prepare presence prevent priest primary priority prisoner privacy prize problem process profile program promise prospect provide prune public pulse pumps punish puny pupal purchase purple python quantity quarter quick quiet race racism radar railroad rainbow raisin random ranked rapids raspy reaction realize rebound rebuild recall receiver recover regret regular reject relate remember remind remove render repair repeat replace require rescue research resident response result retailer retreat reunion revenue review reward rhyme rhythm rich rival river robin rocky romantic romp roster round royal ruin ruler rumor sack safari salary salon salt satisfy satoshi saver says scandal scared scatter scene scholar science scout scramble screw script scroll seafood season secret security segment senior shadow shaft shame shaped sharp shelter sheriff short should shrimp sidewalk silent silver similar simple single sister skin skunk slap slavery sled slice slim slow slush smart smear smell smirk smith smoking smug snake snapshot sniff society software soldier solution soul source space spark speak species spelling spend spew spider spill spine spirit spit spray sprinkle square squeeze stadium staff standard starting station stay steady step stick stilt story strategy strike style subject submit sugar suitable sunlight superior surface surprise survive sweater swimming swing switch symbolic sympathy syndrome system tackle tactics tadpole talent task taste taught taxi teacher teammate teaspoon temple tenant tendency tension terminal testify texture thank that theater theory therapy thorn threaten thumb thunder ticket tidy timber timely ting tofu together tolerate total toxic tracks traffic training transfer trash traveler treat trend trial tricycle trip triumph trouble true trust twice twin type typical ugly ultimate umbrella uncover undergo unfair unfold unhappy union universe unkind unknown unusual unwrap upgrade upstairs username usher usual valid valuable vampire vanish various vegan velvet venture verdict verify very veteran vexed victim video view vintage violence viral visitor visual vitamins vocal voice volume voter voting walnut warmth warn watch wavy wealthy weapon webcam welcome welfare western width wildlife window wine wireless wisdom withdraw wits wolf woman work worthy wrap wrist writing wrote year yelp yield yoga zero";
  const wordSeparator_slip39 = " ";
  const wordCount_slip39 = 1024;
  const wordArray_slip39 = genIndex(wordListName_slip39, wordList_slip39, wordSeparator_slip39, wordCount_slip39);
  
  const wordListName_zbase32 = "zbase32"
  const wordList_zbase32 = "ybndrfg8ejkmcpqxot1uwisza345h769"
  const wordSeparator_zbase32 = "";
  const wordCount_zbase32 = 32;
  const wordArray_zbase32 = genIndex(wordListName_zbase32, wordList_zbase32, wordSeparator_zbase32, wordCount_zbase32);
  
  const wordListName_base58 = "base58"
  const wordList_base58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  const wordSeparator_base58 = "";
  const wordCount_base58 = 58;
  const wordArray_base58 = genIndex(wordListName_base58, wordList_base58, wordSeparator_base58, wordCount_base58);

  const wordListName_base64 = "base64"
  const wordList_base64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const wordSeparator_base64 = "";
  const wordCount_base64 = 64;
  const wordArray_base64 = genIndex(wordListName_base64, wordList_base64, wordSeparator_base64, wordCount_base64);

  const wordSchema = [
    {
      name: wordListName_slip39,
      count: wordCount_slip39,
      array: wordArray_slip39,
      map: new Map(wordArray_slip39.map((w, i) => [w, i])),
      bitsPerWord: Math.log2(wordCount_slip39)
    },
    {
      name: wordListName_zbase32,
      count: wordCount_zbase32,
      array: wordArray_zbase32,
      map: new Map(wordArray_zbase32.map((w, i) => [w, i])),
      bitsPerWord: Math.log2(wordCount_zbase32)
    },
    {
      name: wordListName_base58,
      count: wordCount_base58,
      array: wordArray_base58,
      map: new Map(wordArray_base58.map((w, i) => [w, i])),
      bitsPerWord: Math.log2(wordCount_base58)
    },
    {
      name: wordListName_base64,
      count: wordCount_base64,
      array: wordArray_base64,
      map: new Map(wordArray_base64.map((w, i) => [w, i])),
      bitsPerWord: Math.log2(wordCount_base64)
    }
  ];

  function genIndex(name,wordList, wordSeparator, wordCount) {
    // Handle special case: empty separator = split every character
    const arr = wordSeparator === "" 
      ? wordList.split("") 
      : wordList.split(wordSeparator);
  
    if (arr.length !== wordCount) {
      const msg = `In ${name}: expected ${wordCount} entries, but got ${arr.length}`;
      const status = document.getElementById("listStatus");
      if (status) {
        status.textContent = "Error: " + msg;
        status.className = "pill err";
      }
      throw new Error(msg);
    }
    return arr;
  }

  function wordsToBigInt(wordSchema, name, wordArray) {
    const schema = wordSchema.find(s => s.name === name);
    if (!schema) throw new Error(`Schema "${name}" not found`);
  
    const base = BigInt(schema.count);
  
    // Accumulate with explicit multiplier (last word = least significant)
    let value = 0n;
    let pow = 1n;
    for (let i = wordArray.length - 1; i >= 0; i--) {
      const w = wordArray[i];
      if (!schema.map.has(w)) throw new Error(`Unknown word in ${name}: "${w}"`);
      const idx = BigInt(schema.map.get(w));
      value += idx * pow;
      pow *= base;
    }
  
    // capacity bits (may be fractional for non-2^k bases like base58)
    const bits = wordArray.length * schema.bitsPerWord;
  
    return { value, bits };
  }

  function bigIntToWords(wordSchema, name, obj) {
    const schema = wordSchema.find(s => s.name === name);
    if (!schema) throw new Error(`Schema "${name}" not found`);
  
    if (typeof obj !== 'object' || obj === null || !('value' in obj) || !('bits' in obj)) {
      throw new Error("bigIntToWords requires an object { value, bits } from wordsToBigInt");
    }
  
    const base = BigInt(schema.count);
    const bitsPerWord = schema.bitsPerWord;
  
    let value = (typeof obj.value === 'bigint') ? obj.value : BigInt(obj.value);
    if (value < 0n) throw new Error("bigIntToWords requires a non-negative BigInt");
  
    // Determine required word count from bits only
    const EPS = 1e-12; // guard against FP jitter (e.g., 17.999999999 -> 18)
    const minWords = Math.max(1, Math.ceil((obj.bits - EPS) / bitsPerWord));
  
    // Zero value → MSB padding with zero-word to meet capacity
    if (value === 0n) {
      const words = Array(minWords).fill(schema.array[0]);
      return {
        words,
        wordsLength: words.length,
        capacityBits: words.length * bitsPerWord
      };
    }
  
    // Convert value → base-`count` digits (LSB first)
    const out = [];
    while (value > 0n) {
      const rem = value % base;
      out.push(schema.array[Number(rem)]);
      value = value / base;
    }
  
    // Pad MSB side with zero-word to satisfy capacity
    while (out.length < minWords) out.push(schema.array[0]);
  
    out.reverse(); // MSB .. LSB
  
    return {
      words: out,
      wordsLength: out.length,
      capacityBits: out.length * bitsPerWord
    };
  }

/*
  function bigIntToWords(wordSchema, name, obj) {
    const schema = wordSchema.find(s => s.name === name);
    if (!schema) throw new Error(`Schema "${name}" not found`);
  
    const base = BigInt(schema.count);
    const bitsPerWord = schema.bitsPerWord;
  
    if (typeof obj !== 'object' || obj === null || !('value' in obj)) {
      throw new Error("bigIntToWords requires the object returned by wordsToBigInt");
    }
  
    let value = (typeof obj.value === 'bigint') ? obj.value : BigInt(obj.value);
    if (value < 0n) throw new Error("bigIntToWords requires a non-negative BigInt");
  
    const EPS = 1e-12;
    let minWords = 1;
  
    if (typeof obj.bits === "number" && isFinite(obj.bits) && obj.bits > 0) {
      // epsilon avoids rounding up due to float noise (e.g., 17.999999999 -> 18)
      minWords = Math.max(minWords, Math.ceil((obj.bits - EPS) / bitsPerWord));
    }
  
    if (typeof obj.wordLength === "number" && isFinite(obj.wordLength)) {
      const wl = Math.max(0, Math.floor(obj.wordLength));
      if (wl > minWords) minWords = wl; // preserve original MSB padding if longer
    }
  
    if (value === 0n) {
      const words = Array(minWords).fill(schema.array[0]);
      return {
        words,
        wordsLength: words.length,
        capacityBits: words.length * bitsPerWord
      };
    }
  
    const out = [];
    while (value > 0n) {
      const rem = value % base;
      out.push(schema.array[Number(rem)]);
      value = value / base;
    }
  
    while (out.length < minWords) {
      out.push(schema.array[0]);
    }
  
    out.reverse();
  
    return {
      words: out,
      wordsLength: out.length,
      capacityBits: out.length * bitsPerWord
    };
  }
*/

  /*** Utilities ***/
  const qs = sel => document.querySelector(sel);
  const byId = id => document.getElementById(id);
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  function setStatus(el, text, cls="") {
    el.textContent = text;
    el.className = "pill " + (cls||"");
  }

  function copyText(el) {
    el.select();
    document.execCommand("copy");
  }

  function normalizeSpaces(s) {
    return s.trim().replace(/[\s\u00A0]+/g, " ");
  }

  function bytesToB64(bytes, bitlength) {
    console.log("bytes",bytes,"bitlength",bitlength);
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let output = "";
    let buffer = 0;
    let bitsInBuffer = 0;
  
    for (let i = 0; i < Math.ceil(bitlength / 8); i++) {
      buffer = (buffer << 8) | bytes[i];
      bitsInBuffer += 8;
  
      while (bitsInBuffer >= 6) {
        bitsInBuffer -= 6;
        const index = (buffer >> bitsInBuffer) & 0x3f;
        output += alphabet[index];
      }
    }
  
    if (bitsInBuffer > 0) {
      const index = (buffer << (6 - bitsInBuffer)) & 0x3f;
      output += alphabet[index];
    }
  
    // Add '=' padding based on true bitlength
    const totalBase64Chars = Math.ceil(bitlength / 6);
    const paddedLength = Math.ceil(totalBase64Chars / 4) * 4;
    while (output.length < paddedLength) {
      output += "=";
    }
  
    return output;
  }
  
  function b64ToBytes(b64, bitlength) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const lookup = new Uint8Array(256).fill(255);
    for (let i = 0; i < alphabet.length; i++) {
      lookup[alphabet.charCodeAt(i)] = i;
    }
  
    const neededBytes = Math.ceil(bitlength / 8);
    const out = new Uint8Array(neededBytes);
  
    let buffer = 0;
    let bitsInBuffer = 0;
    let bytePos = 0;
  
    for (let i = 0; i < b64.length; i++) {
      const ch = b64.charCodeAt(i);
      if (ch === 61) break; // '=' padding
      const val = lookup[ch];
      if (val === 255) continue; // skip invalid chars
  
      buffer = (buffer << 6) | val;
      bitsInBuffer += 6;
  
      // Extract full bytes
      while (bitsInBuffer >= 8 && bytePos < neededBytes) {
        bitsInBuffer -= 8;
        out[bytePos++] = (buffer >> bitsInBuffer) & 0xff;
      }
    }
    // Emit final zero-right-padded byte if leftover bits remain
    if (bitsInBuffer > 0 && bytePos < neededBytes) {
      const last = (buffer & ((1 << bitsInBuffer) - 1)) << (8 - bitsInBuffer);
      out[bytePos++] = last & 0xff;
    }

    return out;
  }


  /*** Wordlist & mapping ***/
  let wordlist = null;
  let index = null; // word -> number

  function loadWordlistFromText(text) {
    // Normalize input and tolerate BOMs, Windows newlines, commas, and arbitrary whitespace.
    let t = (text || "")
      .replace(/^\uFEFF/, "")     // strip BOM if present
      .replace(/\r\n?/g, "\n")    // normalize CRLF/CR -> LF
      .trim();
  
    // Single pass: split on ANY whitespace or commas.
    // This lets users paste CSV, space-separated, newline-separated, or any mixture.
    const raw = t.split(/[\s,]+/);
  
    // Clean each token:
    // - Trim
    // - Remove leading numbering like "0 ", "0.", "0:", "001) ", etc.
    // - Lowercase
    // - Drop empties
    const words = raw
      .map(s => s.trim()
        .replace(/^\s*\d+\s*[:.)-]?\s*/, "") // strip leading indices
        .toLowerCase()
      )
      .filter(Boolean);
  
    if (words.length !== 1024) {
      throw new Error("Expected 1024 words, got " + words.length);
    }
  
    // Ensure uniqueness and fixed ordering (word -> index)
    const map = new Map();
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (map.has(w)) {
        throw new Error("Duplicate word detected: " + w);
      }
      map.set(w, i);
    }
  
    // Commit globals used elsewhere
    wordlist = words; // array index == word index (0..1023)
    index = map;      // Map<string, number>
  
    return true;
  }



  /*** Pack 10-bit indices -> bytes; handle leftovers per setting ***/
  function indicesToBytes(indices) {
    let bitbuf = 0;
    let bitlen = 0;
    const out = [];
    for (const v of indices) {
      if (!(v >=0 && v < 1024)) { throw new Error("Index out of range: " + v); }
      bitbuf = (bitbuf << 10) | v;
      bitlen += 10;
      while (bitlen >= 8) {
        const byte = (bitbuf >> (bitlen - 8)) & 0xff;
        out.push(byte);
        bitlen -= 8;
      }
    }
    if (bitlen > 0) {
      // Always pad the final (partial) byte with zeros on the right.
      // Base64 emission will be trimmed to the true bit length upstream.
      const byte = (bitbuf << (8 - bitlen)) & 0xff;
      out.push(byte);
      bitlen = 0;
    }
    return new Uint8Array(out);
  }

  /*** Unpack bytes -> 10-bit indices; handle leftovers per setting ***/
  function bytesToIndices(bytes, bitLength) {
    let bitbuf = 0;
    let bitlen = 0;
    const out = [];
    for (let i=0;i<bytes.length;i++) {
      bitbuf = (bitbuf << 8) | bytes[i];
      bitlen += 8;
      while (bitlen >= 10) {
        const v = (bitbuf >> (bitlen - 10)) & 0x3ff;
        out.push(v);
        bitlen -= 10;
      }
    }
    // If there are leftover bits, always pad the final 10-bit chunk.
    if (bitlen > 0) {
      const v = (bitbuf << (10 - bitlen)) & 0x3ff;
      out.push(v);
      bitlen = 0;
    }
    // If a true bit length is provided (e.g., Base64 sextets * 6),
    // trim to exactly the number of 10-bit words represented.
    if (typeof bitLength === "number") {
      const needed = Math.ceil(bitLength / 10);
      if (out.length > needed) out.length = needed;
    }
    return out;
  }

  function wordsToIndices(words) {
    if (!index) throw new Error("Wordlist not loaded.");
    const out = [];
    for (const raw of words) {
      const w = raw.toLowerCase();
      if (!index.has(w)) {
        throw new Error("Unknown word: " + raw);
      }
      out.push(index.get(w));
    }
    return out;
  }

  function indicesToWords(indices) {
    if (!wordlist) throw new Error("Wordlist not loaded.");
    return indices.map(i => {
      if (!(i >= 0 && i < 1024)) throw new Error("Index out of range: " + i);
      return wordlist[i];
    });
  }

  /*** UI handlers ***/

  byId("btnM2B").addEventListener("click", () => {
    try {
      if (!wordlist) throw new Error("Load the 1024‑word list first.");
      const normalize = byId("normalize").checked;
      let text = byId("mnemonic").value;
      if (normalize) text = normalizeSpaces(text);
      const words = text.split(" ").filter(Boolean);
      if (words.length === 0) throw new Error("No words provided.");
      const idxs = wordsToIndices(words);
	  const bytes = indicesToBytes(idxs);
      const trueBits = words.length * 10;
	  const b64 = bytesToB64(bytes, trueBits);
      const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");

      byId("b64Out").value = b64;
      byId("hexOut").value = hex;
      byId("statWords").textContent = words.length;
      byId("statBytes").textContent = bytes.length;
      byId("statBits").textContent = (words.length * 10);
      setStatus(byId("m2bStatus"), "OK", "ok");
    } catch (e) {
      console.error(e);
      setStatus(byId("m2bStatus"), "Error: " + e.message, "err");
    }
  });

  byId("btnM2BURL").addEventListener("click", () => {
    try {
      if (!wordlist) throw new Error("Internal wordlist missing (should never happen).");
      const normalize = byId("normalize").checked;
      let text = byId("mnemonic").value;
      if (normalize) text = normalizeSpaces(text);
      const words = text.split(" ").filter(Boolean);
      if (words.length === 0) throw new Error("No words provided.");
      const idxs = wordsToIndices(words);
      const bytes = indicesToBytes(idxs);
      const trueBits = words.length * 10;
      const b64 = bytesToB64(bytes, trueBits).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
      const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
      byId("b64Out").value = b64;
      byId("hexOut").value = hex;
      byId("statWords").textContent = words.length;
      byId("statBytes").textContent = bytes.length;
      byId("statBits").textContent = (words.length * 10);
      setStatus(byId("m2bStatus"), "OK", "ok");
    } catch (e) {
      console.error(e);
      setStatus(byId("m2bStatus"), "Error: " + e.message, "err");
    }
  });

  byId("btnB2M").addEventListener("click", () => {
    try {
      if (!wordlist) throw new Error("Load the 1024‑word list first.");
      let b64 = byId("b64In").value;
      // strip whitespace
      b64 = b64.replace(/\s+/g, "");
      if (!b64) throw new Error("No Base64 input.");
      // normalize URL-safe -> standard
      b64 = b64.replace(/-/g, "+").replace(/_/g, "/");

      // compute decoded bytes from non-padding chars: floor(sextets*6 / 8)
      const sextets = b64.replace(/=/g, "").length;
      const byteCount = Math.floor((sextets * 6) / 8);  // exact decoded bytes
      const trueBitsIn = byteCount * 8;                 // base64 encodes whole bytes
      // decode exactly that many bytes
      const bytes = b64ToBytes(b64, trueBitsIn);
      // use only whole 10-bit words from those bits
      const roundedBits = Math.floor(trueBitsIn / 10) * 10;

      // unpack into 10-bit indices using only the rounded bit length
      const idxs = bytesToIndices(bytes, roundedBits);

      const words = indicesToWords(idxs);
      const lower = byId("lowercase").checked;
      const out = (lower ? words.map(w => w.toLowerCase()) : words).join(" ");
      byId("mnemonicOut").value = out;

      // Display bytes as full bytes represented by whole 10-bit words (≤ true bytes)
      byId("statBytesIn").textContent = Math.ceil(roundedBits / 8);
      byId("statBitsIn").textContent = roundedBits;
      byId("statWordsOut").textContent = words.length;
      setStatus(byId("b2mStatus"), "OK", "ok");
    } catch (e) {
      console.error(e);
      setStatus(byId("b2mStatus"), "Error: " + e.message, "err");
    }
  });

  byId("btnCopyB64").addEventListener("click", () => copyText(byId("b64Out")));
  byId("btnCopyHex").addEventListener("click", () => copyText(byId("hexOut")));
  byId("btnCopyWords").addEventListener("click", () => copyText(byId("mnemonicOut")));

  // Auto-initialize with built-in SLIP-39 list
  document.addEventListener("DOMContentLoaded", () => {
	testA();
    try {
      wordlist = wordArray_slip39;
      index = new Map(wordlist.map((w, i) => [w, i]));
      setStatus(document.getElementById("listStatus"), "Wordlist ready ✓", "ok");
      const wl = document.getElementById("wordlist");
      if (wl) {
        wl.value = wordList_slip39;
        wl.readOnly = true;
      }
    } catch (e) {
      console.error(e);
      setStatus(document.getElementById("listStatus"), "Init failed: " + e.message, "err");
    }
  });

function testA() {
// --- Test: SLIP-39 ["academic","academic","zero","yoga"] ⇄ Base58 ---
const slipIn = ["academic","academic","zero","yoga"];

const NAME_SLIP39 = wordListName_slip39 || "slip39";
const NAME_BASE58 = wordListName_base58 || "base58";

// 1) SLIP-39 -> BigInt
const enc = wordsToBigInt(wordSchema, NAME_SLIP39, slipIn);
console.log("[1] SLIP->BigInt:", enc.value, "bits:", enc.bits);

// 2) BigInt -> Base58 words
const b58Obj = bigIntToWords(wordSchema, NAME_BASE58, enc);
console.log("[2] BigInt->Base58 words:", b58Obj.words, "capacity:", b58Obj.capacityBits);

// 3) Base58 -> BigInt
const encBack = wordsToBigInt(wordSchema, NAME_BASE58, b58Obj.words);
console.log("[3] Base58->BigInt:", encBack.value, "bits:", encBack.bits);

// Check value equality
console.assert(encBack.value === enc.value, "❌ Value mismatch after Base58 round-trip");

// 4) Back to SLIP-39
const slipOut = bigIntToWords(wordSchema, NAME_SLIP39, encBack);
console.log("[4] BigInt->SLIP-39 words:", slipOut.words, "capacity:", slipOut.capacityBits);

// Check word sequence equality
const same = slipIn.length === slipOut.words.length &&
             slipIn.every((w, i) => w === slipOut.words[i]);
console.assert(same, "❌ SLIP-39 round-trip words mismatch");

console.log("✓ Round-trip SLIP-39 ⇄ Base58 passed");

	
}

})();
