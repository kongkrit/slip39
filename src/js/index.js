(function(){
  "use strict";

  const MAX_SHARES = 16;
  
  // --- Utility ---
  const byId = id => document.getElementById(id);
  const qsa = sel => Array.from(document.querySelectorAll(sel));

  // --- Debounce helper ---
  function debounce(fn, delay = 100) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), delay);
    };
  }

  // --- DOM elements ---
  const dom = {
	strengthButtons     : qsa("button.generate"),
	masterSecretHexText : byId("master-secret-hex-text"),
    masterSecretHex     : byId("master-secret-hex"),
    masterSecretB58     : byId("master-secret-b58"),
    masterSecretHexError: byId("master-secret-hex-error"),
    masterSecretB58error: byId("master-secret-b58-error"),
  				    
    passphrase          : byId("passphrase"),
    totalShares         : byId("total-shares"),
    totalSharesError    : byId("total-shares-error"),
  				    
    threshold           : byId("threshold"),
    thresholdError      : byId("threshold-error"),
  				    
    newShares           : byId("new-shares"),
    newSharesBase58     : byId("new-shares-base58"),
  				    
    decodeLabel         : byId("decode-mode"),
    convertLabel        : byId("convert-to"),
    combineRadios       : qsa("input[name='combine-mode']"),
  				    
    existingShares      : byId("existing-shares"),
    reconstructedErr    : byId("reconstructed-error"),
    decodedBlock        : byId("decoded-block"),
    decodedMnemonics    : byId("decoded-mnemonics"),
  				    
    decrypter           : byId("decrypter"),
    reconstructedHex    : byId("reconstructed-hex"),
    reconstructedBase58 : byId("reconstructed-base58"),
  };

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
    dom.reconstructedHex.value = "";
	dom.reconstructedBase58.value = "";
  }
  clearReconstructed();

  function generateMasterSecret(strengthBits) {
    // TODO test crypto.getRandomValues exists
    // generate secure entropy for the secret
    let buffer = new Uint8Array(strengthBits / 8);
    let data = crypto.getRandomValues(buffer);
    // fill the masterSecret value
    let masterSecret = bytesToHex(data);
//console.log("masterSecret",masterSecret);
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

  function masterSecretHexOk(strFull) {
//console.log("strFull",strFull);
	const str = strFull;
    try {
      if (!(/^[0-9a-fA-F]*$/.test(str))) {
      	throw new Error ("Invalid hex string!");
      }
      if (str.length < 32) {
        throw new Error("Master Secret (hex) must be at least 128 bits (32 hex chars)");
      }
      if (str.slice(0,4) === "0000") {
        throw new Error("Master Secret (hex) must not begin with 0000");
      }
      if (str.length % 4 !== 0) {
        throw new Error("Master Secret (hex) must be an even number of bytes (multiples of 4 hex chars)");
      }
    } catch (e) {
//dom.masterSecretB58.value = "";
      dom.masterSecretHexError.textContent = e.message || String(e);
      return false;
    }
	dom.masterSecretHexError.textContent = "";
	return true;
  }
  
  function masterSecretB58ok(strFull) {
    const isBase58 = converter.isBase58(strFull);
//console.log("isBase58", isBase58);
	try {
	  if (strFull[0] === converter.base58code0) throw new Error (`Master Secret (Base-58) cannot begin with "${converter.base58code0}"`); 
	  if (!isBase58) throw new Error ("Master Secret (Base-58) is an invalid Base-58 string");
	} catch (e) {
//	  dom.masterSecretHex.value = "";
//console.log("posting secretB58error", e.message);
	  dom.masterSecretB58error.textContent = e.message || String(e);
	  return false;
	}
	dom.masterSecretB58error.textContent = "";
    return isBase58;
  }

  function createShares() {
    clearShares();

    try {
      // parse parameters
      const masterSecretHex   = dom.masterSecretHex.value;
	  const masterSecretB58   = dom.masterSecretB58.value;

	  if (!masterSecretHexOk(masterSecretHex)) { clearShares(); return; }
	  if (!masterSecretB58ok(masterSecretB58)) { clearShares(); return; }

	  const masterSecretBytes = hexToBytes(masterSecretHex);

      const totalShares  = dom.totalShares.value;
      const totalSharesV = parseInt(totalShares, 10);

      const threshold  = dom.threshold.value;
      const thresholdV = parseInt(threshold, 10);
	  if (!totalSharesAndThresholdAreOk(totalShares, thresholdV)) {
		  return;
	  }

      // groups: currently 1-of-1 per member, repeated totalShares times
      const groups = [];
      for (let i = 0; i < totalSharesV; i++) groups.push([1, 1]);

      // create shares (uses slip39-libs.js)
      const passphrase = dom.passphrase.value || "";
      const slip = slip39libs.slip39.fromArray(masterSecretBytes, {
        passphrase,
        threshold,
        groups,
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
//      console.error(err);
    }
  }

  function reconstruct() {
    clearReconstructed();
	
	const recInput = dom.existingShares.value.trim();
	if (recInput.length === 0) return;
	
	let mnemonics, base58s;
	
	if (combineMode === "base58") {
		base58s = recInput.split("\n").map(m => m.trim()).filter(m => m.length > 0);
//		console.log("base58s",base58s);
		mnemonics = base58s.map(converter.base58toSlip39);
	} else {
	    mnemonics = recInput.split("\n").map(m => m.trim()).filter(m => m.length > 0);
//	    console.log("mnemonics", mnemonics);
		base58s = mnemonics.map(converter.slip39toBase58);
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
      return;
    }
	dom.reconstructedErr.textContent = "";

    const secretHex = bytesToHex(secretBytes);
    dom.reconstructedHex.value = secretHex;
	dom.reconstructedBase58.value = converter.twoBytesHexStringToBase58(secretHex);
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
    const masterSecretHex = generateMasterSecret(strength);
	updateMasterSecretHexText(masterSecretHex);
	updateMasterSecretB58(masterSecretHex, true);
    createShares();
  };

  // --- Strength buttons ---
  dom.strengthButtons.forEach(btn => {
    btn.addEventListener("click", generateStrength);
  });
  
  function updateMasterSecretHexText(v) {
	const hex = v.trim();
	const numBits  = hex.length * 4;
	const numBytes = hex.length * 0.5;
//console.log(numBytes, numBits);
	dom.masterSecretHexText.textContent = `Master Secret (hex) - ${numBytes} bytes (${numBits} bits)`;
  }
  
  function updateMasterSecretHex(b58, updateB58) {
	if (updateB58) dom.masterSecretB58.value = b58;
	const b = converter.base58ToTwoBytesHexString(b58);
	dom.masterSecretHex.value = b;
  }
  
  function updateMasterSecretB58(hex, updateHex) {
	if (updateHex) dom.masterSecretHex.value = hex;
	const b = converter.twoBytesHexStringToBase58(hex);
//console.log(b);
	dom.masterSecretB58.value = b;
  }

  // master-secret-hex input
  dom.masterSecretHex.addEventListener("input", debounce(() => {
    const v = dom.masterSecretHex.value;
	updateMasterSecretHexText(v);
  	try {
	  updateMasterSecretB58(v, false);
      if (!masterSecretHexOk(v)) { clearShares(); return; }
      createShares();
	} catch (e) {
	  dom.masterSecretHexError.textContent = e.message || String(e);
	}
  }, 100));

  // master-secret-b58 input
  dom.masterSecretB58.addEventListener("input", debounce(() => {
    const v = dom.masterSecretB58.value;
  	try {
      if (!masterSecretB58ok(v)) { clearShares(); return; }
      updateMasterSecretHex(v, false);
	  updateMasterSecretHexText(dom.masterSecretHex.value);
      createShares();
	} catch (e) {
	  dom.masterSecretB58error.textContent = e.message || String(e);
	}
  }, 100));

  // passphrase
  dom.passphrase.addEventListener("input", debounce(() => {
//    console.log("passphrase changed:", passphrase.value);
    createShares();
  }, 100));

  // Total Shares
  dom.totalShares.addEventListener("input", debounce(() => {
//    console.log("total-shares changed:", totalShares.value);
    const n = parseInt(dom.totalShares.value, 10);
    dom.totalSharesError.textContent = (n > 0) ? "" : "Total shares must be > 0";
    createShares();
  }, 1));

  // Threshold
  dom.threshold.addEventListener("input", debounce(() => {
//    console.log("threshold changed:", threshold.value);
    const t = parseInt(dom.threshold.value, 10);
    dom.thresholdError.textContent = (t > 0) ? "" : "Threshold must be > 0";
    createShares();
  }, 1));

  // Existing Shares
  dom.existingShares.addEventListener("input", debounce(() => {
//    console.log("existing-shares input changed:", existingShares.value);
    reconstruct();
  }, 100));

  dom.decrypter.addEventListener("input", debounce(() => {
//    console.log("decrypter input changed:", decrypter.value);
    reconstruct();
  }, 100));

  /* ---------- stepper buttons with clamping ---------- */
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

    inp.value = v;
	other.value = +other.value;

    masterSecretHexOk(dom.masterSecretHex.value.trim());
  
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    other.dispatchEvent(new Event('input', { bubbles: true })); // refresh errors
  });

  // --- Combine mode ---
  let combineMode = document.querySelector("input[name='combine-mode']:checked").value;

  function updateCombineUI(mode) {
    combineMode = mode;
//    console.log("Combine mode:", combineMode);

    if (combineMode === "mnemonics") {
      dom.existingShares.placeholder = "Enter your mnemonic shares here, one per line";
      dom.decodeLabel.textContent = "Mnemonics Input";
      dom.convertLabel.textContent = "Converted to Base-58";
	  dom.decodedMnemonics.placeholder = "Decoded Base-58 appear here."
    } else if (combineMode === "base58") {
      dom.existingShares.placeholder = "Enter your Base-58 shares here, one per line";
      dom.decodeLabel.textContent = "Base-58 Input";
      dom.convertLabel.textContent = "Converted to mnemonics";
	  dom.decodedMnemonics.placeholder = "Decoded mnemonics appear here."
    } else {
      dom.existingShares.placeholder = "Invalid combine mode detected.";
      dom.decodeLabel.textContent = "Error!";
      dom.convertLabel.textContent = "Error!";
    }

    // Clear outputs when switching modes
    dom.existingShares.value = "";
    dom.decodedMnemonics.value = "";
    clearReconstructed();
  }

  // hook up radios
  dom.combineRadios.forEach(radio => {
    radio.addEventListener("change", () => updateCombineUI(radio.value));
  });

  // run once on startup
  updateCombineUI(combineMode);
  updateMasterSecretHexText(dom.masterSecretHex.value);
  if(!masterSecretHexOk(dom.masterSecretHex.value)) clearShares();

})();
