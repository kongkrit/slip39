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
    strengthButtons     : qsa("button.generate"),

    createDetails       : byId("create-details"),
	createPill          : byId("create-pill"),

    masterSecretHexText : byId("master-secret-hex-text"),
    masterSecretHex     : byId("master-secret-hex"),
    masterSecretHexCopy : byId("master-secret-hex-copy"),
    masterSecretHexError: byId("master-secret-hex-error"),

    masterSecretB58     : byId("master-secret-b58"),
    masterSecretB58copy : byId("master-secret-b58-copy"),
    masterSecretB58error: byId("master-secret-b58-error"),

    passphrase          : byId("passphrase"),
    passphraseToggle    : byId("passphrase-toggle"),

    totalShares         : byId("total-shares"),
    totalSharesError    : byId("total-shares-error"),

    threshold           : byId("threshold"),
    thresholdError      : byId("threshold-error"),

    newShares           : byId("new-shares"),
    newSharesBase58     : byId("new-shares-base58"),

    combineDetails      : byId("combine-details"),
	combinePill         : byId("combine-pill"),

    decodeLabel         : byId("decode-mode"),
    convertLabel        : byId("convert-to"),
    combineRadios       : qsa("input[name='combine-mode']"),

    existingShares      : byId("existing-shares"),
    reconstructedErr    : byId("reconstructed-error"),
    decodedBlock        : byId("decoded-block"),
    decodedMnemonics    : byId("decoded-mnemonics"),

    decrypter           : byId("decrypter"),
    decrypterToggle     : byId("decrypter-toggle"),
    reconstructedHexText: byId("reconstructed-hex-text"),
    reconstructedHex    : byId("reconstructed-hex"),
    reconstructedHexCopy: byId("reconstructed-hex-copy"),
    reconstructedB58    : byId("reconstructed-b58"),
    reconstructedB58Copy: byId("reconstructed-b58-copy"),
  };

  // --- show copy buttons ---
  function setIconForCopyButton(buttonEl) { buttonEl.innerHTML = icons.copy; }
  
  setIconForCopyButton(dom.masterSecretHexCopy);
  setIconForCopyButton(dom.masterSecretB58copy);
  setIconForCopyButton(dom.reconstructedHexCopy);
  setIconForCopyButton(dom.reconstructedB58Copy);
  
  // --- Modern clipboard helper with fallback ---
  async function copyToClipboard(elementId) {
    const el = document.getElementById(elementId);
    const text = el.value ?? '';
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
  
  // --- show/hide details on cards
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

  function checkMasterSecretHex(strFull) {
    const str = strFull;
    let text;
    
    if (str.length === 0) text = "EMPTY";
    else if (!(/^[0-9a-fA-F]*$/.test(str))) text = "Invalid hex string!";
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
      return;
    }
    dom.reconstructedErr.textContent = "";

    const secretHex = bytesToHex(secretBytes);
    dom.reconstructedHex.value = secretHex;
    updateHexText(secretHex, dom.reconstructedHexText);
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
    const masterSecretHex = generateMasterSecret(strength);
    updateHexText(masterSecretHex, dom.masterSecretHexText);
    updateMasterSecretB58(masterSecretHex, true);
    createShares();
  };

  // --- Strength buttons ---
  dom.strengthButtons.forEach(btn => {
    btn.addEventListener("click", generateStrength);
  });

  function updateHexText(v, el) {
    const hex = v.trim();
    const numBits  = hex.length * 4;
    const numBytes = hex.length * 0.5;
    const head = "Master Secret (hex)"
    const text = (numBits === 0 )? head : head+` - ${numBytes} bytes (${numBits} bits)`
    el.textContent = text;
  }

  function updateMasterSecretHex(b58, updateB58) {
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

  function updateMasterSecretB58(hex, updateHex) {
    if (updateHex) dom.masterSecretHex.value = hex;
    let b;
    if (hex.length > 0) {
      b = converter.bytesHexStringToBase58(hex, 1);
    } else {
      b = "";
    }
    dom.masterSecretB58.value = b;
  }

  // --- master-secret-hex input ---
  const filterNotHex = new RegExp(`[^${wordList.hexString}]`, "g");
  dom.masterSecretHex.addEventListener("input", e => {
    let v = e.target.value.trim();
    v = v.replace(filterNotHex, "").toLowerCase();
    e.target.value = v;
    
    debouncedMasterSecretHexInput(v);
  });
  
  const debouncedMasterSecretHexInput = debounce(v => {
    updateHexText(v, dom.masterSecretHexText);
    try {
      updateMasterSecretB58(v, false);
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
    if (v.length > 0) {
      try {
        if (checkMasterSecretB58(v) !== "") { clearShares(); return; }
        updateMasterSecretHex(v, false);
        updateHexText(dom.masterSecretHex.value, dom.masterSecretHexText);
        createShares();
      } catch (e) {
        dom.masterSecretB58error.textContent = e.message || String(e);
      }
    } else {
      dom.masterSecretB58error.textContent = "";
      updateMasterSecretHex("", false);
      updateHexText(dom.masterSecretHex.value, dom.masterSecretHexText);
    }
  }, 100);

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

  // --- Existing Shares Input ---
  dom.existingShares.addEventListener("input", debounce(() => {
//console.log("combineMode",combineMode);
//console.log("existing-shares input changed:", dom.existingShares.value);

    reconstruct();
  }, 100));

  dom.decrypter.addEventListener("input", debounce(() => {
//    console.log("decrypter input changed:", decrypter.value);
    reconstruct();
  }, 100));

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
  updateHexText(dom.masterSecretHex.value, dom.masterSecretHexText);
  updateHexText(dom.reconstructedHex.value, dom.reconstructedHexText);
  if(checkMasterSecretB58(dom.masterSecretB58.value) !== "") clearShares();
  if(checkMasterSecretHex(dom.masterSecretHex.value) !== "") clearShares();
  
  // expose helpers to outside
  root.copyToClipboard = copyToClipboard;

})(globalThis);
