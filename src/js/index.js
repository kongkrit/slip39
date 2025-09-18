(function(root){
  "use strict";

  const MAX_SHARES = 16;

  // --- Utility ---
  const byId = id  => document.getElementById(id);
  const qs   = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));

  // debounce wrapper
  function debounce(fn, delay = 100) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), delay);
    };
  }

  // --- DOM elements ---
  const dom = {
	secretRadios         : qsa("input[name='secret-mode']"),
	randomButtons        : byId("random-buttons"),
    strengthButtons      : qsa("button.generate"),
						 
    createDetails        : byId("create-details"),
	createPill           : byId("create-pill"),

    secretTextInput      : byId("secret-text-input"),
	
    masterSecretTxtLabel : byId("master-secret-txt-label"),						 
    masterSecretTxt      : byId("master-secret-txt"),
	masterSecretTxtCopy  : byId("master-secret-txt-copy"),
	
	masterSecretHexLabel : byId("master-secret-hex-label"),
    masterSecretHex      : byId("master-secret-hex"),
    masterSecretHexCopy  : byId("master-secret-hex-copy"),
    masterSecretHexError : byId("master-secret-hex-error"),
	
	masterSecretB58Label : byId("master-secret-b58-label"),
    masterSecretB58      : byId("master-secret-b58"),
    masterSecretB58copy  : byId("master-secret-b58-copy"),
    masterSecretB58error : byId("master-secret-b58-error"),
						 
    passphrase           : byId("passphrase"),
    passphraseToggle     : byId("passphrase-toggle"),
						 
    totalShares          : byId("total-shares"),
    totalSharesError     : byId("total-shares-error"),
						 
    threshold            : byId("threshold"),
    thresholdError       : byId("threshold-error"),
						 
    newShares            : byId("new-shares"),
    newSharesBase58      : byId("new-shares-base58"),
						 
    combineDetails       : byId("combine-details"),
	combinePill          : byId("combine-pill"),

    combineRadios        : qsa("input[name='combine-mode']"),
    decodeMode           : byId("decode-mode"),
    convertLabel         : byId("convert-to"),
    combineRadios        : qsa("input[name='combine-mode']"),
						 
    existingShares       : byId("existing-shares"),
    reconstructedErr     : byId("reconstructed-error"),
    decodedBlock         : byId("decoded-block"),
    decodedMnemonics     : byId("decoded-mnemonics"),
						 
    decrypter            : byId("decrypter"),
    decrypterToggle      : byId("decrypter-toggle"),

    reconstructedTxtAll  : byId("reconstructed-txt-all"),
    reconstructedTxtLabel: byId("reconstructed-txt-label"),
	reconstructedTxt     : byId("reconstructed-txt"),
	reconstructedTxtCopy : byId("reconstructed-txt-copy"),
	
    reconstructedHexLabel: byId("reconstructed-hex-label"),
    reconstructedHex     : byId("reconstructed-hex"),
    reconstructedHexCopy : byId("reconstructed-hex-copy"),
	
    reconstructedB58Label: byId("reconstructed-b58-label"),
	reconstructedB58     : byId("reconstructed-b58"),
    reconstructedB58Copy : byId("reconstructed-b58-copy"),
  };

  // --- show copy buttons ---
  function setIconForCopyButton(buttonEl) { buttonEl.innerHTML = icons.copy; }
  
  setIconForCopyButton(dom.masterSecretTxtCopy);
  setIconForCopyButton(dom.masterSecretHexCopy);
  setIconForCopyButton(dom.masterSecretB58copy);
  setIconForCopyButton(dom.reconstructedTxtCopy);
  setIconForCopyButton(dom.reconstructedHexCopy);
  setIconForCopyButton(dom.reconstructedB58Copy);
  
  // --- Modern clipboard helper with fallback ---
async function copyToClipboard(elementId, trimEdges = false) {
  const el = document.getElementById(elementId);
  let text = el.value ?? '';
  if (trimEdges) {
    text = text.trim(); // trim only edges if requested
  }
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  } catch {
    console.warn("Clipboard write failed");
  }
}
  
  // --- show/hide details on cards ---
  function setDetailVisibility(detailsEl, pillEl) {
	pillEl.textContent = detailsEl.open ? "Collapse" : "Expand";
	pillEl.hidden      = detailsEl.open ? true : false;
  }
  
  function attachDetailVisibility(detailsEl, pillEl) {
    const update = () => setDetailVisibility(detailsEl, pillEl);
    detailsEl.addEventListener('toggle', update);
    update(); // set initial label
  }
  
  attachDetailVisibility(dom.createDetails, dom.createPill);
  attachDetailVisibility(dom.combineDetails, dom.combinePill);
  
  // --- Show/Hide passphrase controls ---
  function setState(inputEl, toggleEl, show) {
    inputEl.type = show ? 'text' : 'password';
    toggleEl.innerHTML = show ? icons.eyeClosed : icons.eyeOpen;
    toggleEl.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    toggleEl.setAttribute('aria-pressed', String(show));
  }

  function attachToggle(inputEl, toggleEl) {
    toggleEl.addEventListener('click', () => {
      const showing = inputEl.type === 'text';
      setState(inputEl, toggleEl, !showing);
    });
    // initialize hidden
    setState(inputEl, toggleEl, false);
  }

  attachToggle(dom.passphrase, dom.passphraseToggle);
  attachToggle(dom.decrypter,  dom.decrypterToggle);

  // --- stepper buttons with clamping ---
  (() => {
	qsa('button.decrement').forEach(btn => {
      btn.innerHTML = icons.chevronsLeft;
      btn.setAttribute('aria-label', 'decrement'); // a11y since icon has no text
    });
	qsa('button.increment').forEach(btn => {
      btn.innerHTML = icons.chevronsRight;
      btn.setAttribute('aria-label', 'increment'); // a11y since icon has no text
    });
  })();

  document.addEventListener('click', e => {
    const btn = e.target.closest('button[data-target]');
    if (!btn) return;

    const id  = btn.dataset.target;          // "total-shares" | "threshold"
    const inp = document.getElementById(id);
    const otherId = id === 'total-shares' ? 'threshold' : 'total-shares';
    const other = document.getElementById(otherId);

    let v     = parseInt(inp.value, 10) || 1;
    let step  = btn.classList.contains('decrement') ? -1 : 1;
    v += step;

    /* ---- clamp rules ---- */
    if (v < 1) v = 1;                        // total-shares and threshold must be both >=1
    if (id === 'total-shares') {
      if (v > MAX_SHARES) v = MAX_SHARES;    // total-shares must be <= MAX_SHARES
      // if we shrink total-shares below threshold, pull threshold down too
      if (v < +other.value) other.value = v;
    } else {                                 // threshold
      if (v > +other.value) v = +other.value; // threshold must be <= total-shares
    }
//console.log("id",id); console.log("v", v); console.log("otherId", otherId);
    inp.value = v;
    other.value = +other.value;

    checkMasterSecretHex(dom.masterSecretHex.value.trim());

    inp.dispatchEvent(new Event('input', { bubbles: true }));
    other.dispatchEvent(new Event('input', { bubbles: true })); // refresh errors
  });

  // --- Utility Functons ---
  function bytesToHex(u8) {
    let h = "";
    for (let i = 0; i < u8.length; i++) {
      let hexChars = u8[i].toString(16);
      while (hexChars.length % 2 != 0) {
        hexChars = "0" + hexChars;
      }
      h += hexChars;
    }
    return h;
  }

  function hexToBytes(h) {
    // Is left padding suitable here?
    if (h.length % 2 != 0) {
      h = "0" + h;
    }
    // create bytes
    let a = [];
    for (let i = 0; i < h.length; i += 2) {
      let b = parseInt(h.substring(i, i + 2), 16)
      a.push(b);
    }
    return a;
  }
  
  function textToBytes(t) {
    let hex = "";
    for (let i = 0; i < t.length; i++) {
      let code = t.charCodeAt(i).toString(16); // convert to hex
      if (code.length < 2) code = "0" + code;  // ensure 2 digits
      hex += code;
    }
    return hex;
  }

  function bytesToText(hex) {
    // if odd length, pad one 0 in front
    if (hex.length % 2 !== 0) hex = "0" + hex;
  
    let text = "";
    for (let i = 0; i < hex.length; i += 2) {
      let byte = parseInt(hex.substr(i, 2), 16);
      text += String.fromCharCode(byte);
    }
    return text;
  }

  function showmasterSecretHexError(msg) {
    dom.masterSecretHexError.textContent = msg || "";
  }
  function showTotalSharesError(msg) {
    dom.totalSharesError.textContent = msg || "";
  }
  function showThresholdError(msg) {
    dom.thresholdError.textContent = msg || "";
  }

  function clearShares() {
    dom.newShares.value = "";
//    dom.newSharesBase58.value = "";
//    showmasterSecretHexError("");
//    showTotalSharesError("");
//    showThresholdError("");
  }

  function clearReconstructed() {
    dom.reconstructedErr.textContent = "";
    dom.reconstructedTxt.value = "";
    dom.reconstructedHex.value = "";
    dom.reconstructedB58.value = "";
  }
  clearReconstructed();

  function generateMasterSecret(strengthBits) {
    // TODO test crypto.getRandomValues exists
    // generate secure entropy for the secret
    let buffer = new Uint8Array(strengthBits / 8);
    let data = crypto.getRandomValues(buffer);
    // fill the masterSecret value
    let masterSecret = bytesToHex(data);
    return masterSecret;
  }

  function totalSharesAndThresholdAreOk(totalShares, threshold) {
    if (Number.isNaN(totalShares)) {
      showTotalSharesError("Value must be a number");
      return false;
    }
    if (totalShares <= 0) {
      showTotalSharesError("Must be at least 1");
      return false;
    }
    if (totalShares > MAX_SHARES) {
      showTotalSharesError("Total shares must be " + MAX_SHARES + " or less");
      return false;
    }

    if (Number.isNaN(threshold)) {
      showThresholdError("Value must be a number");
      return false;
    }
    if (threshold > totalShares) {
      showThresholdError("Must be less than or equal to total shares");
      return false;
    }
    if (threshold <= 0) {
      showThresholdError("Must be greater than 1");
      return false;
    }
    return true;
  }
  
  function checkMasterSecretTxt(strFull) {
	const str = strFull;
	let text;

    if (str.length === 0) text = "EMPTY";
    else if (filterNotHex.test(str)) text = "Invalid hex string!";
    else if (str.slice(0,2) === "00") text = "Master Secret (hex) must not begin with 00";
    else if (str.length < 32) text = "Master Secret (hex) must be at least 128 bits (32 hex chars)";
    else if (str.length % 4 !== 0) text = "Master Secret (hex) must be an even number of bytes (multiples of 4 hex chars)";
    else text = "";
	
	return "";
  }

  function checkMasterSecretHex(strFull) {
    const str = strFull;
    let text;
    
    if (str.length === 0) text = "EMPTY";
    else if (filterNotHex.test(str)) text = "Invalid hex string!";
    else if (str.slice(0,2) === "00") text = "Master Secret (hex) must not begin with 00";
    else if (str.length < 32) text = "Master Secret (hex) must be at least 128 bits (32 hex chars)";
    else if (str.length % 4 !== 0) text = "Master Secret (hex) must be an even number of bytes (multiples of 4 hex chars)";
    else text = "";
    
    dom.masterSecretHexError.textContent = (text === "EMPTY")? "" : text;
//console.log("L01",text);
    return text;
  }

  function checkMasterSecretB58(strFull) {
    const str = strFull;
    let text;
    
    if (str.length === 0) text = "EMPTY";
    else if (str[0] === converter.base58code0) text = `Master Secret (Base-58) cannot begin with "${converter.base58code0}"`;
    else if (!converter.isBase58(str)) text = "Master Secret (Base-58) is an invalid Base-58 string";
    else text = "";

    dom.masterSecretB58error.textContent = (text === "EMPTY")? "" : text;
    return text;
  }

  function createShares() {
    clearShares();

    try {
      // parse parameters
      const masterSecretHex   = dom.masterSecretHex.value;
      const masterSecretB58   = dom.masterSecretB58.value;

      const checkHex = checkMasterSecretHex(masterSecretHex);
      const checkB58 = checkMasterSecretB58(masterSecretB58);
//console.log("L10", checkHex);
//console.log("L11", checkB58);
      if (checkHex !== "" || checkB58 !== "") { clearShares(); return; }

      const masterSecretBytes = hexToBytes(masterSecretHex);

      const totalShares  = parseInt(dom.totalShares.value, 10);

      const threshold  = parseInt(dom.threshold.value, 10);
//console.log("threshold",threshold);
//console.log("totalShares",totalShares);
      if (!totalSharesAndThresholdAreOk(totalShares, threshold)) {
          return;
      }

      // groups: currently 1-of-1 per member, repeated totalShares times
      const groups = [];
      for (let i = 0; i < totalShares; i++) groups.push([1, 1]);

      // create shares (uses slip39-libs.js)
      const passphrase = dom.passphrase.value || "";
      const slip = slip39libs.slip39.fromArray(masterSecretBytes, {
        passphrase: passphrase,
        threshold: threshold,
        groups: groups,
      });

      // show in the UI
      let someFirstIndexIsZero = false;
      let tries = 0;
      let sharesStr = "";
      let sharesBase58str = "";
      do {
        let phrasesIntArray = [];
        for (let i = 0; i < totalShares; i++) {
          const derivationPath = "r/" + i;
          const mnemonics = slip.fromPath(derivationPath).mnemonics;
          const phraseText = mnemonics[0];
          const phrase = phraseText.split(" ");
          const base58text = converter.slip39toBase58(phraseText);
// console.log("phraseText",phraseText);
// console.log("base58text",base58text);
          if (!converter.conversionOk(phraseText, base58text)) return;

          const firstMnemonic = phrase[0];
          const firstIndex = converter.slip39arrayToIndices([firstMnemonic])[0];
          if (firstIndex < 1) someFirstIndexIsZero = true;
//console.log("firstMnemonic:",firstMnemonic," firstIndex:",firstIndex);
          sharesStr += mnemonics + "\n\n";
          sharesBase58str += base58text + "\n\n";
        }
        tries++;
      } while (someFirstIndexIsZero && (tries < 5));
//console.log("tries:",tries);
//console.log("sharesStr",sharesStr);
      if (someFirstIndexIsZero) {
        alert("🎉 Lottery winner!\nThe random seed gave an invalid share five times in a row.\nBuy a ticket.");
        return;   // stops the rest of your function
      }
      dom.newShares.value = sharesStr.trim();
      dom.newSharesBase58.value = sharesBase58str.trim();
    } catch (err) {
      // Surface any unexpected errors in the master secret error pill by default
      showmasterSecretHexError(String(err && err.message ? err.message : err));
    }
  }

  function reconstruct() {
    clearReconstructed();

    const recInput = dom.existingShares.value.trim();
    if (recInput.length === 0) return;

    let mnemonics, base58s;

    try {
      if (combineMode === "base58") {
          base58s = recInput.split("\n").map(m => m.trim()).filter(m => m.length > 0);
          mnemonics = base58s.map(converter.base58toSlip39);
      } else {
          mnemonics = recInput.split("\n").map(m => m.trim()).filter(m => m.length > 0);
          base58s = mnemonics.map(converter.slip39toBase58);
      }
    } catch (e) {
      dom.reconstructedErr.textContent = e.message || String(e);
      dom.reconstructedTxt.value = "";
      dom.reconstructedTxtAll.hidden = true;
      dom.reconstructedHex.value = "";
      dom.reconstructedB58.value = "";
      return;
    }

    const mnemonicsStr = mnemonics.join("\n\n");
    const base58Str = base58s.join("\n\n");
    if (combineMode === "base58") {
        dom.decodedMnemonics.value = mnemonicsStr;
    } else {
        dom.decodedMnemonics.value = base58Str;
    }

    const passphraseText = decrypter.value;
    let secretBytes;

    try {
      secretBytes = slip39libs.slip39.recoverSecret(mnemonics, passphraseText);
    } catch (e) {
      dom.reconstructedErr.textContent = e.message || String(e);
      dom.reconstructedTxtAll.hidden = true;
      return;
    }
    dom.reconstructedErr.textContent = "";

    const secretHex = bytesToHex(secretBytes);
    dom.reconstructedHex.value = secretHex;
    updateLabel(secretHex, headHexLabel, dom.reconstructedHexLabel);
    
    if (canConvertHexToText(hexToBytes(secretHex))) {
      dom.reconstructedTxt.value = converter.bytesHexStringToPrintableASCII(secretHex);
      dom.reconstructedTxtAll.hidden = false;
    } else {
      dom.reconstructedTxt.value = "";
      dom.reconstructedTxtAll.hidden = true;
    }
    updateLabel(dom.reconstructedTxt.value, headTxtLabel, dom.reconstructedTxtLabel);
    
    dom.reconstructedB58.value = converter.bytesHexStringToBase58(secretHex, 1);
  }

  function generateStrength(e) {
    // get strength value
    const strengthStr = e.target.getAttribute("data-strength");
    const strength = parseInt(strengthStr);
    // validate strength value
    if (isNaN(strength)) {
      // TODO
    }
    if (strength % 16 != 0) {
      // TODO
    }
    // generate master secret
    const hex = generateMasterSecret(strength);
	dom.masterSecretHex.value = hex;
    updateLabel(hex, headHexLabel, dom.masterSecretHexLabel);
    updateMasterSecret("hex", "b58", dom.masterSecretB58, hex, true);
    updateLabel(dom.masterSecretB58.value, headB58Label, dom.masterSecretB58Label);
    createShares();
  };

  // --- Strength buttons ---
  dom.strengthButtons.forEach(btn => {
    btn.addEventListener("click", generateStrength);
  });

  const headTxtLabel = { dtype: "txt", txt : "Master Secret Text",     bitsPerChar: 8,};
  const headHexLabel = { dtype: "hex", txt : "Master Secret (Hex)",    bitsPerChar: 4,};
  const headB58Label = { dtype: "b58", txt : "Master Secret (Base58)", bitsPerChar: 8,};

  function updateLabel(value, head, el) {
	const txt = value.trim();
    const numBits  = txt.length * head.bitsPerChar;
    const numBytes = numBits * 0.125;
//console.log("numBits",numBits);
//console.log("head.dtype",head.dtype);
	const text = (numBits === 0 )? head.txt : head.txt + (head.dtype !== "b58" ? ` - ${numBytes} bytes (${numBits} bits)` : ` - ${numBytes} characters`);
//console.log("text",text);
    el.textContent = text;
  }

  const validSrcDest = ["b58hex", "b58txt", "hexb58", "hextxt", "txtb58", "txthex"];
  function updateMasterSecret(sourceType, destType, destEl, sourceValue, updateSource) {
  	
    // check invalid sourceType, destType
    const srcDest = `${sourceType}${destType}`;
    if (!validSrcDest.includes(srcDest)) {
//alert (`updateMasterSecret sourceType=${sourceType} and destType=${destType} not possible`);
  	throw new Error (`updateMasterSecret sourceType=${sourceType} and destType=${destType} not possible`);
    }
    
    const srcTrim = sourceValue.trim();
    
    if (updateSource) {
  	if      (sourceType === "b58") dom.masterSecretB58.value = srcTrim; 
  	else if (sourceType === "txt") dom.masterSecretTxt.value = srcTrim;
  	else if (sourceType === "hex") dom.masterSecretHex.value = srcTrim;
    }
    
    let destV = "";
    if (sourceValue.length > 0) {
//console.log("converting",converter.printableASCIItoBytesHexString("a"));
      if      (sourceType === "hex") {
   	    if      (destType === "txt") destV = converter.bytesHexStringToPrintableASCII(srcTrim);
   	    else if (destType === "b58") destV = converter.bytesHexStringToBase58(srcTrim);
      } else if (sourceType === "b58") {
        if      (destType === "txt") destV = converter.base58toPrintableASCII(srcTrim);
     	else if (destType === "hex") destV = converter.base58ToBytesHexString(srcTrim);
      } else if (sourceType === "txt") {
        if      (destType === "hex") destV = converter.printableASCIItoBytesHexString(srcTrim);
     	else if (destType === "b58") destV = converter.printableASCIItoBase58(srcTrim);
      }
	}
console.log(`updateMasterSecret: ${sourceType} ${destType} source:${sourceValue} sourceValue.length:${sourceValue.length} sourcetrim:${srcTrim} destV:${destV} ${updateSource}`);
    destEl.value = destV;
  }
/*
  function updateMasterSecretHexFromTxt(txt, updateTxt) {
    if (updateTxt) dom.masterSecretTxt.value = txt;
    let t;
    if (txt.length > 0) {
      t = converter.bytesHexStringToPrintableASCII(hex);
    } else {
      t = "";
    }
    dom.masterSecretTxt.value = t;
    return checkMasterSecretTxt(t);
  }

  function updateMasterSecretB58FromTxt(hex, updateB58) {
    if (updateHex) dom.masterSecretHex.value = hex;
    let t;
    if (hex.length > 0) {
      t = converter.bytesHexStringToPrintableASCII(hex);
    } else {
      t = "";
    }
    dom.masterSecretTxt.value = t;
    return checkMasterSecretTxt(t);
  }

  function updateMasterSecretHexFromB58(b58, updateB58) {
    if (updateB58) dom.masterSecretB58.value = b58;
    let b;
    if (b58.length > 0) {
      b = converter.base58ToBytesHexString(b58, 1);
    } else {
      b = "";
    }
    dom.masterSecretHex.value = b;
    return checkMasterSecretHex(b);
  }

  function updateMasterSecretB58FromHex(hex, updateHex) {
    if (updateHex) dom.masterSecretHex.value = hex;
    let b;
    if (hex.length > 0) {
      b = converter.bytesHexStringToBase58(hex, 1);
    } else {
      b = "";
    }
    dom.masterSecretB58.value = b;
  }
*/

  // --- master-seceret-txt input ---
  
  const filterNotASCIIprintables = /[^\x20-\x7E]/g;
  dom.masterSecretTxt.addEventListener("input", e => {
    let v = e.target.value;
	if (v === " ") v = ""; // reject first space
	v = v.replace(filterNotASCIIprintables, "");
	e.target.value = v;
	
	debouncedMasterSecretTxtInput(v);
  });
  
  const debouncedMasterSecretTxtInput = debounce(v => {
	const vtrim = v.trim();
//console.log("v",v,"vtrim",vtrim);
    const txt2hex = converter.printableASCIItoBytesHexString(vtrim);
	const txt2b58 = converter.printableASCIItoBase58(vtrim);
//console.log("txt2hex",txt2hex);
//console.log("txt2b58",txt2b58);
	const tHex = checkMasterSecretHex(txt2hex) !== "";
	const tB58 = checkMasterSecretB58(txt2b58) !== "";
//console.log("tHex", tHex, "tB58", tB58);

    try {
//console.log("trying");
      updateLabel(dom.masterSecretTxt.value, headTxtLabel, dom.masterSecretTxtLabel);
      updateMasterSecret("txt", "hex", dom.masterSecretHex, v, false);
	  updateLabel(dom.masterSecretHex.value, headHexLabel, dom.masterSecretHexLabel);
      updateMasterSecret("txt", "b58", dom.masterSecretB58, v, false);
//console.log(`dom.masterSecretB58.value:${dom.masterSecretB58.value}:`);
      updateLabel(dom.masterSecretB58.value, headB58Label, dom.masterSecretB58Label);
	  if (vtrim.length > 0) createShares();
    } catch (e) {
      dom.masterSecretTxtError.textContent = e.message || String(e);
    }

	if (tHex || tB58) { clearShares(); return; }

  }, 100);

  // --- master-secret-hex input ---
  
  const filterNotHex = new RegExp(`[^${wordList.hexString}]`, "g");
  dom.masterSecretHex.addEventListener("input", e => {
    let v = e.target.value.trim();
    v = v.replace(filterNotHex, "").toLowerCase();
    e.target.value = v;
    
    debouncedMasterSecretHexInput(v);
  });
  
  const debouncedMasterSecretHexInput = debounce(v => {
    updateLabel(v, headHexLabel, dom.masterSecretHexLabel);
    try {
      updateMasterSecret("hex", "b58", dom.masterSecretB58, v, false);
      const vBlank = (v === "");
      const vError = checkMasterSecretHex(v);
      if (vError !== "" || vBlank) { clearShares(); return; }
      createShares();
    } catch (e) {
      dom.masterSecretHexError.textContent = e.message || String(e);
    }
  }, 100);

  // --- master-secret-b58 input ---
  
  const filterNotB58 = new RegExp(`[^${wordList.base58string}]`, "g");
  dom.masterSecretB58.addEventListener("input", e => {
    let v = e.target.value.trim();
    v = v.replace(filterNotB58, "");
    e.target.value = v;
    
    debouncedMasterSecretB58Input(v);
  });
  
  const debouncedMasterSecretB58Input = debounce(v => {
	updateLabel(v, headB58Label, dom.masterSecretB58Label);
    if (v.length > 0) {
      try {
        if (checkMasterSecretB58(v) !== "") { clearShares(); return; }
        updateMasterSecret("b58", "hex", dom.masterSecretHex, v, false);
        updateLabel(dom.masterSecretHex.value, headHexLabel, dom.masterSecretHexLabel);
        createShares();
      } catch (e) {
        dom.masterSecretB58error.textContent = e.message || String(e);
      }
    } else {
      dom.masterSecretB58error.textContent = "";
      updateMasterSecret("b58", "hex", dom.masterSecretHex, "", false);
      updateLabel(dom.masterSecretHex.value, headHexLabel, dom.masterSecretHexLabel);
    }
  }, 100);

  // --- passphrase ---
  dom.passphrase.addEventListener("input", debounce(() => {
    createShares();
  }, 100));

  // --- Total Shares ---
  dom.totalShares.addEventListener("input", debounce(() => {
    const n = parseInt(dom.totalShares.value, 10);
    dom.totalSharesError.textContent = (n > 0) ? "" : "Total shares must be > 0";
    createShares();
  }, 1));

  // --- Threshold ---
  dom.threshold.addEventListener("input", debounce(() => {
    const t = parseInt(dom.threshold.value, 10);
    dom.thresholdError.textContent = (t > 0) ? "" : "Threshold must be > 0";
    createShares();
  }, 1));

  // --- Existing Shares Input ---
  dom.existingShares.addEventListener("input", debounce(() => {
    reconstruct();
  }, 100));

  dom.decrypter.addEventListener("input", debounce(() => {
//    console.log("decrypter input changed:", decrypter.value);
    reconstruct();
  }, 100));

  // --- update secret generation mode ---
  let secretMode = qs("input[name='secret-mode']:checked").value;
  
  function canConvertHexToText(hexArray) {
	let can = true;
	for (const item of hexArray) {
      if (item < 0x20 || item > 0x7e) { can = false; break; }
	}
	return can;
  }
  
  function updateSecretUI(mode) {
	secretMode = mode;
//console.log("uSUI", mode);
//console.log("mstv",dom.masterSecretTxt.value);
//console.log("mshv",dom.masterSecretHex.value);
//console.log("msbv",dom.masterSecretB58.value);
    if (mode === "hex") {
		
	  // switch to hex input
	  
      dom.randomButtons.hidden = false;
	  dom.secretTextInput.hidden = true;
	  dom.masterSecretHex.readOnly = false;
	  dom.masterSecretHex.placeholder = "enter hex string eg 0123456789abcdef0123456789ABCDEF";
	  dom.masterSecretB58.readOnly = false;
	  dom.masterSecretB58.placeholder = "enter base58 string [1-9A-HJ-NP-Za-km-z]";
	  
    } else if (mode === "txt") {
		
	  const hexLen = dom.masterSecretHex.value.trim().length;
	  const b58Len = dom.masterSecretB58.value.trim().length;
	  const blank =  hexLen === 0 && b58Len === 0;
	  const canConvertHex = canConvertHexToText(hexToBytes(dom.masterSecretHex.value));
	  const convertedB58 = converter.base58ToBytesHexString(dom.masterSecretB58.value, 1);
//console.log("convertedB58",convertedB58);
	  const canConvertB58 = canConvertHexToText(hexToBytes(convertedB58));
//console.log("canConvertB58",canConvertB58);
	  const canConvert = blank? true :  canConvertHex && canConvertB58;
//console.log("blank", blank);
//console.log("canConvert",canConvert);

	  let goAhead;
	  if ( !blank && !canConvert) {

        goAhead = confirm("Master Secret (hex and Base58) is not empty,\nand cannot be converted safely to printable ASCII text (0x20-0x7e).\nSwitching to text mode will clear them.");
	  
	  } else goAhead = true;
//console.log("goAhead",goAhead);		
	  if (goAhead) {	
		
		// switch to txt input
		
		// clear Hex and B58 if necessary
		if ( blank || !canConvert) {
      dom.masterSecretTxt.value = "";
		  dom.masterSecretHex.value = "";
		  dom.masterSecretB58.value = "";
		} else {
      dom.masterSecretTxt.value = converter.bytesHexStringToPrintableASCII(dom.masterSecretHex.value);
    }

        checkMasterSecretHex(dom.masterSecretHex.value);
		checkMasterSecretB58(dom.masterSecretB58.value);
	    updateLabel(dom.masterSecretHex.value, headHexLabel, dom.masterSecretHexLabel);
    updateLabel(dom.masterSecretB58.value, headB58Label, dom.masterSecretB58Label);
    updateLabel(dom.masterSecretTxt.value, headTxtLabel, dom.masterSecretTxtLabel);
		
		dom.randomButtons.hidden = true;
	    dom.secretTextInput.hidden = false;
	    dom.masterSecretHex.readOnly = true;
		dom.masterSecretHex.placeholder = "will be converted from text";
	    dom.masterSecretB58.readOnly = true;
		dom.masterSecretB58.placeholder = "will be converted from text";
		
	  } else { // user backs out of switching to text
	  
	    document.querySelectorAll("input[name='secret-mode']").forEach(radio => {
		  radio.checked = (radio.value === "hex"); // select hex
        });
      }
    }
  }
  
  // secret radios
  dom.secretRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      updateSecretUI(radio.value);
    });
  });
  
  // update at startup
  updateSecretUI(secretMode);
  
  // --- Combine mode ---
  let combineMode = qs("input[name='combine-mode']:checked").value;

  function updateCombineUI(mode) {
    combineMode = mode;

    if (combineMode === "mnemonics") {
      dom.existingShares.placeholder = "Enter your mnemonic shares here, one per line";
      dom.decodeMode.textContent = "Mnemonics Input";
      dom.convertLabel.textContent = "Converted to Base-58";
      dom.decodedMnemonics.placeholder = "Decoded Base-58 appear here."
    } else if (combineMode === "base58") {
      dom.existingShares.placeholder = "Enter your Base-58 shares here, one per line";
      dom.decodeMode.textContent = "Base-58 Input";
      dom.convertLabel.textContent = "Converted to mnemonics";
      dom.decodedMnemonics.placeholder = "Decoded mnemonics appear here."
    } else {
      dom.existingShares.placeholder = "Invalid combine mode detected.";
      dom.decodeMode.textContent = "Error!";
      dom.convertLabel.textContent = "Error!";
    }

    // Clear outputs when switching modes
    dom.existingShares.value = "";
    dom.decodedMnemonics.value = "";
    clearReconstructed();
  }

  // combine radios
  dom.combineRadios.forEach(radio => {
    radio.addEventListener("change", () => updateCombineUI(radio.value));
  });

  // update at startup
  updateCombineUI(combineMode);
  
  // --- run once on startup ---
  updateLabel(dom.masterSecretTxt.value,  headTxtLabel, dom.masterSecretTxtLabel);
  updateLabel(dom.masterSecretHex.value,  headHexLabel, dom.masterSecretHexLabel);
  updateLabel(dom.masterSecretB58.value,  headB58Label, dom.masterSecretB58Label);
  updateLabel(dom.reconstructedTxt.value, headTxtLabel, dom.reconstructedTxtLabel);
  updateLabel(dom.reconstructedHex.value, headHexLabel, dom.reconstructedHexLabel);
  updateLabel(dom.reconstructedB58.value, headB58Label, dom.reconstructedB58Label);
  if(checkMasterSecretB58(dom.masterSecretB58.value) !== "") clearShares();
  if(checkMasterSecretHex(dom.masterSecretHex.value) !== "") clearShares();
  
  // expose helpers to outside
  root.copyToClipboard = copyToClipboard;

})(globalThis);
