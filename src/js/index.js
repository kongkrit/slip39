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

  // --- Inputs and textareas ---
  const masterSecretHex     = byId("master-secret-hex");
  const masterSecretBase58  = byId("master-secret-base58");
  const masterSecretError   = byId("master-secret-error");
  const masterSecret58Error = byId("master-secret-b58-error");
						    
  const passphrase          = byId("passphrase");
  const totalShares         = byId("total-shares");
  const totalSharesError    = byId("total-shares-error");
						    
  const threshold           = byId("threshold");
  const thresholdError      = byId("threshold-error");
						    
  const newShares           = byId("new-shares");
  const newSharesBase58     = byId("new-shares-base58");
						    
  const decodeLabel         = byId("decode-mode");
  const convertLabel        = byId("convert-to");
  const combineRadios       = qsa("input[name='combine-mode']");
						    
  const existingShares      = byId("existing-shares");
  const reconstructedErr    = byId("reconstructed-error");
  const decodedBlock        = byId("decoded-block");
  const decodedMnemonics    = byId("decoded-mnemonics");
						    
  const decrypter           = byId("decrypter");
  const reconstructedHex    = byId("reconstructed-hex");
  const reconstructedBase58 = byId("reconstructed-base58");

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

  function showMasterSecretError(msg) {
    document.getElementById("master-secret-error").textContent = msg || "";
  }
  function showTotalSharesError(msg) {
    document.getElementById("total-shares-error").textContent = msg || "";
  }
  function showThresholdError(msg) {
    document.getElementById("threshold-error").textContent = msg || "";
  }

  function clearShares() {
    document.getElementById("new-shares").value = "";
    document.getElementById("new-shares-base58").value = "";
    showMasterSecretError(""); 
    showTotalSharesError("");
    showThresholdError("");
  }

  function clearReconstructed() {
	reconstructedErr.textContent = "";
    reconstructedHex.value = "";
	reconstructedBase58.value = "";
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

  function masterSecretHexIsOk(masterSecretHex, masterSecretBytes, updateError=true) {
//console.log(masterSecretHex, masterSecretBytes);
    if (masterSecretHex.length < 32) {
      if (updateError) showMasterSecretError("Master Secret must be at least 128 bits (32 hex chars)");
      return false;
    }
	if (masterSecretHex.slice(0,4) === "0000") {
	  if (updateError) showMasterSecretError("Master Secret must not begin with 0000");
	  masterSecretBase58.value = "";
	  return false;
	}
    if (masterSecretBytes.length % 2 !== 0) {
      if (updateError) showMasterSecretError("Master Secret must be an even number of bytes (multiples of 4 hex chars)");
      return false;
    }
	return true;
  }

  function createShares() {
    clearShares();

    try {
      // parse parameters
      const masterSecretHex = document.getElementById("master-secret-hex").value;
      const masterSecretBytes = hexToBytes(masterSecretHex);

      if (!masterSecretHexIsOk(masterSecretHex, masterSecretBytes)) {
		  return;
	  }

      const totalSharesStr = document.getElementById("total-shares").value;
      const totalShares = parseInt(totalSharesStr, 10);

      const thresholdStr = document.getElementById("threshold").value;
      const threshold = parseInt(thresholdStr, 10);
	  if (!totalSharesAndThresholdAreOk(totalShares, threshold)) {
		  return;
	  }

      // groups: currently 1-of-1 per member, repeated totalShares times
      const groups = [];
      for (let i = 0; i < totalShares; i++) groups.push([1, 1]);

      // create shares (uses slip39-libs.js)
      const passphrase = document.getElementById("passphrase").value || "";
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
	  
//	  console.log("tries:",tries);
	  if (someFirstIndexIsZero) {
		alert("🎉 Lottery winner!\nThe random seed gave an invalid share five times in a row.\nBuy a ticket.");
		return;   // stops the rest of your function
	  }
	  
      document.getElementById("new-shares").value = sharesStr.trim();
	  document.getElementById("new-shares-base58").value = sharesBase58str.trim();

      // (Optional) If you also want to produce base58-encoded mnemonics, do it here
      // document.getElementById("new-shares-base58").value = ...

    } catch (err) {
      // Surface any unexpected errors in the master secret error pill by default
      showMasterSecretError(String(err && err.message ? err.message : err));
      console.error(err);
    }
  }

  function reconstruct() {
    clearReconstructed();
	
	const recInput = byId("existing-shares").value.trim();
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
		decodedMnemonics.value = mnemonicsStr;
	} else {
		decodedMnemonics.value = base58Str;
	}
//	console.log("mnemonicsStr",mnemonicsStr);
//	console.log("base58Str", base58Str);
/*
    const mnemonicsStr = document.getElementById("existing-shares").value;

    mnemonics = mnemonicsStr.split("\n")
      .map(m => m.trim())
      .filter(m => m.length > 0);
*/
    const passphrase = document.getElementById("decrypter").value;
    let secretBytes;

    try {
      secretBytes = slip39libs.slip39.recoverSecret(mnemonics, passphrase);
    } catch (e) {
      document.getElementById("reconstructed-error").textContent = e.message || String(e);
      return;
    }
	reconstructedErr.textContent = "";

    const secretHex = bytesToHex(secretBytes);
    reconstructedHex.value = secretHex;
	reconstructedBase58.value = converter.twoBytesHexStringToBase58(secretHex);
  }

  function generateClicked(e) {
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
	updateMasterSecret(masterSecretHex, true);
    createShares();
  };

  // --- Strength buttons ---
  const strengthButtons = qsa("button.generate");
  strengthButtons.forEach(btn => {
    btn.addEventListener("click", generateClicked);
  });
  
  function updateMasterSecret(hex, updateMasterSecretHex) {
	if (updateMasterSecretHex) masterSecretHex.value = hex;
	const b = converter.twoBytesHexStringToBase58(hex);
	masterSecretBase58.value = b;
  }

  // master-secret-hex input
  masterSecretHex.addEventListener("input", debounce(() => {
    const v = masterSecretHex.value.trim();
//	console.log("master-secret-hex changed:", v);
    if (/^[0-9a-fA-F]*$/.test(v)) {
      masterSecretError.textContent = "";
    } else {
      masterSecretError.textContent = "Invalid hex string!";
    }
	updateMasterSecret(v, false);
    createShares();
  }, 100));

  // passphrase
  passphrase.addEventListener("input", debounce(() => {
//    console.log("passphrase changed:", passphrase.value);
    createShares();
  }, 100));

  // Total Shares
  totalShares.addEventListener("input", debounce(() => {
//    console.log("total-shares changed:", totalShares.value);
    const n = parseInt(totalShares.value, 10);
    totalSharesError.textContent = (n > 0) ? "" : "Total shares must be > 0";
    createShares();
  }, 1));

  // Threshold
  threshold.addEventListener("input", debounce(() => {
//    console.log("threshold changed:", threshold.value);
    const t = parseInt(threshold.value, 10);
    thresholdError.textContent = (t > 0) ? "" : "Threshold must be > 0";
    createShares();
  }, 1));

  // Existing Shares
  existingShares.addEventListener("input", debounce(() => {
//    console.log("existing-shares input changed:", existingShares.value);
    reconstruct();
  }, 100));

  decrypter.addEventListener("input", debounce(() => {
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
	
    const hex   = byId('master-secret-hex').value.trim();
    const bytes = hexToBytes(hex);
    if (!masterSecretHexIsOk(hex, bytes, false)) return;   // silent abort without updating MasterSecretHex error
  
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    other.dispatchEvent(new Event('input', { bubbles: true })); // refresh errors
  });

  // --- Combine mode ---
  let combineMode = document.querySelector("input[name='combine-mode']:checked").value;

  function updateCombineUI(mode) {
    combineMode = mode;
//    console.log("Combine mode:", combineMode);

    if (combineMode === "mnemonics") {
      existingShares.placeholder = "Enter your mnemonic shares here, one per line";
      decodeLabel.textContent = "Mnemonics Input";
      convertLabel.textContent = "Converted to Base-58";
	  decodedMnemonics.placeholder = "Decoded Base-58 appear here."
    } else if (combineMode === "base58") {
      existingShares.placeholder = "Enter your Base-58 shares here, one per line";
      decodeLabel.textContent = "Base-58 Input";
      convertLabel.textContent = "Converted to mnemonics";
	  decodedMnemonics.placeholder = "Decoded mnemonics appear here."
    } else {
      existingShares.placeholder = "Invalid combine mode detected.";
      decodeLabel.textContent = "Error!";
      convertLabel.textContent = "Error!";
    }

    // Clear outputs when switching modes
    existingShares.value = "";
    decodedMnemonics.value = "";
    clearReconstructed();
  }

  // hook up radios
  combineRadios.forEach(radio => {
    radio.addEventListener("change", () => updateCombineUI(radio.value));
  });

  // run once on startup
  updateCombineUI(combineMode);

})();
