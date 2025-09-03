(function() {
	"use strict";

	const slip39wordList = "academic acid acne acquire acrobat activity actress adapt adequate adjust admit adorn adult advance advocate afraid again agency agree aide aircraft airline airport ajar alarm album alcohol alien alive alpha already alto aluminum always amazing ambition amount amuse analysis anatomy ancestor ancient angel angry animal answer antenna anxiety apart aquatic arcade arena argue armed artist artwork aspect auction august aunt average aviation avoid award away axis axle beam beard beaver become bedroom behavior being believe belong benefit best beyond bike biology birthday bishop black blanket blessing blimp blind blue body bolt boring born both boundary bracelet branch brave breathe briefing broken brother browser bucket budget building bulb bulge bumpy bundle burden burning busy buyer cage calcium camera campus canyon capacity capital capture carbon cards careful cargo carpet carve category cause ceiling center ceramic champion change charity check chemical chest chew chubby cinema civil class clay cleanup client climate clinic clock clogs closet clothes club cluster coal coastal coding column company corner costume counter course cover cowboy cradle craft crazy credit cricket criminal crisis critical crowd crucial crunch crush crystal cubic cultural curious curly custody cylinder daisy damage dance darkness database daughter deadline deal debris debut decent decision declare decorate decrease deliver demand density deny depart depend depict deploy describe desert desire desktop destroy detailed detect device devote diagnose dictate diet dilemma diminish dining diploma disaster discuss disease dish dismiss display distance dive divorce document domain domestic dominant dough downtown dragon dramatic dream dress drift drink drove drug dryer duckling duke duration dwarf dynamic early earth easel easy echo eclipse ecology edge editor educate either elbow elder election elegant element elephant elevator elite else email emerald emission emperor emphasis employer empty ending endless endorse enemy energy enforce engage enjoy enlarge entrance envelope envy epidemic episode equation equip eraser erode escape estate estimate evaluate evening evidence evil evoke exact example exceed exchange exclude excuse execute exercise exhaust exotic expand expect explain express extend extra eyebrow facility fact failure faint fake false family famous fancy fangs fantasy fatal fatigue favorite fawn fiber fiction filter finance findings finger firefly firm fiscal fishing fitness flame flash flavor flea flexible flip float floral fluff focus forbid force forecast forget formal fortune forward founder fraction fragment frequent freshman friar fridge friendly frost froth frozen fumes funding furl fused galaxy game garbage garden garlic gasoline gather general genius genre genuine geology gesture glad glance glasses glen glimpse goat golden graduate grant grasp gravity gray greatest grief grill grin grocery gross group grownup grumpy guard guest guilt guitar gums hairy hamster hand hanger harvest have havoc hawk hazard headset health hearing heat helpful herald herd hesitate hobo holiday holy home hormone hospital hour huge human humidity hunting husband hush husky hybrid idea identify idle image impact imply improve impulse include income increase index indicate industry infant inform inherit injury inmate insect inside install intend intimate invasion involve iris island isolate item ivory jacket jerky jewelry join judicial juice jump junction junior junk jury justice kernel keyboard kidney kind kitchen knife knit laden ladle ladybug lair lamp language large laser laundry lawsuit leader leaf learn leaves lecture legal legend legs lend length level liberty library license lift likely lilac lily lips liquid listen literary living lizard loan lobe location losing loud loyalty luck lunar lunch lungs luxury lying lyrics machine magazine maiden mailman main makeup making mama manager mandate mansion manual marathon march market marvel mason material math maximum mayor meaning medal medical member memory mental merchant merit method metric midst mild military mineral minister miracle mixed mixture mobile modern modify moisture moment morning mortgage mother mountain mouse move much mule multiple muscle museum music mustang nail national necklace negative nervous network news nuclear numb numerous nylon oasis obesity object observe obtain ocean often olympic omit oral orange orbit order ordinary organize ounce oven overall owner paces pacific package paid painting pajamas pancake pants papa paper parcel parking party patent patrol payment payroll peaceful peanut peasant pecan penalty pencil percent perfect permit petition phantom pharmacy photo phrase physics pickup picture piece pile pink pipeline pistol pitch plains plan plastic platform playoff pleasure plot plunge practice prayer preach predator pregnant premium prepare presence prevent priest primary priority prisoner privacy prize problem process profile program promise prospect provide prune public pulse pumps punish puny pupal purchase purple python quantity quarter quick quiet race racism radar railroad rainbow raisin random ranked rapids raspy reaction realize rebound rebuild recall receiver recover regret regular reject relate remember remind remove render repair repeat replace require rescue research resident response result retailer retreat reunion revenue review reward rhyme rhythm rich rival river robin rocky romantic romp roster round royal ruin ruler rumor sack safari salary salon salt satisfy satoshi saver says scandal scared scatter scene scholar science scout scramble screw script scroll seafood season secret security segment senior shadow shaft shame shaped sharp shelter sheriff short should shrimp sidewalk silent silver similar simple single sister skin skunk slap slavery sled slice slim slow slush smart smear smell smirk smith smoking smug snake snapshot sniff society software soldier solution soul source space spark speak species spelling spend spew spider spill spine spirit spit spray sprinkle square squeeze stadium staff standard starting station stay steady step stick stilt story strategy strike style subject submit sugar suitable sunlight superior surface surprise survive sweater swimming swing switch symbolic sympathy syndrome system tackle tactics tadpole talent task taste taught taxi teacher teammate teaspoon temple tenant tendency tension terminal testify texture thank that theater theory therapy thorn threaten thumb thunder ticket tidy timber timely ting tofu together tolerate total toxic tracks traffic training transfer trash traveler treat trend trial tricycle trip triumph trouble true trust twice twin type typical ugly ultimate umbrella uncover undergo unfair unfold unhappy union universe unkind unknown unusual unwrap upgrade upstairs username usher usual valid valuable vampire vanish various vegan velvet venture verdict verify very veteran vexed victim video view vintage violence viral visitor visual vitamins vocal voice volume voter voting walnut warmth warn watch wavy wealthy weapon webcam welcome welfare western width wildlife window wine wireless wisdom withdraw wits wolf woman work worthy wrap wrist writing wrote year yelp yield yoga zero".split(" ");
	
	const zBase32codes = "ybndrfg8ejkmcpqxot1uwisza345h769";
	
	// Convert mnemonic words to indices using the SLIP39 wordlist
	function mnemonicToIndices(words, wordlist) {
		return words.map(function (w) {
			let i = wordlist.indexOf(w);
			if (i === -1) {
				throw new Error("Invalid mnemonic word: " + w);
			}
			return i;
		});
	}
	
	// Helper: Z-Base32
	function indexToZbase32(indices) {
		return indices.map(index => {
			const upper = (index >> 5);
			const lower = (index & 0x1f);
			return zBase32codes[upper]+zBase32codes[lower];
		});
	}
	
    // Inverse: Z-Base-32 pairs ("aa bb cc ...") -> indices[]
    function zbase32ToIndices(tokens) {
        return tokens.map(function(tok) {
            if (tok.length !== 2) {
                throw new Error("Invalid Z-Base-32 token length: " + tok);
            }
            const hi = zBase32codes.indexOf(tok[0]);
            const lo = zBase32codes.indexOf(tok[1]);
            if (hi === -1 || lo === -1) {
                throw new Error("Invalid Z-Base-32 characters in token: " + tok);
            }
            return (hi << 5) | lo;
        });
    }

    // Switch Combine mode UI + re-run reconstruct
    function setCombineMode(mode) {
        combineMode = mode;
        if (mode === "mnemonics") {
            DOM.toggleMnemonics.addClass("active");
            DOM.toggleZbase32.removeClass("active");
            DOM.existingSharesLabel.text("Mnemonics Input");
            DOM.existingShares.attr("placeholder", "Enter your mnemonic shares here, one per line");
			// hide decoded mnemonics when using Mnemonics mode
            DOM.decodedMnemonicsSection.hide();
        } else {
            DOM.toggleZbase32.addClass("active");
            DOM.toggleMnemonics.removeClass("active");
            DOM.existingSharesLabel.text("Z-Base-32 Input");
            DOM.existingShares.attr("placeholder", "Enter your Z-Base-32 shares here, one per line (two chars per word)");
			// show decoded mnemonics only in Z-Base-32 mode
            DOM.decodedMnemonicsSection.show();
        }
        reconstruct();
    }

    // should be 16 but some issues with 16 shares, giving
    // Error: Invalid digest of the shared secret.
    let MAX_SHARES = 16;

    let DOM = {};
    DOM.masterSecretHex = $("#master-secret-hex");
    DOM.passphrase = $("#passphrase");
    DOM.totalShares = $("#total-shares");
    DOM.threshold = $("#threshold");
    DOM.newShares = $("#new-shares");
	DOM.newSharesZbase32 = $("#new-shares-zbase32");
    DOM.generate = $(".generate");
    DOM.masterSecretError = $("#master-secret-error");
    DOM.totalSharesError = $("#total-shares-error");
    DOM.thresholdError = $("#threshold-error");
    // Toggle buttons (Combine section)
    DOM.toggleMnemonics = $("#toggle-mnemonics");
    DOM.toggleZbase32 = $("#toggle-zbase32");
	DOM.existingSharesLabel = $("#existing-shares-label");
    DOM.existingShares = $("#existing-shares");
	DOM.decodedMnemonicsSection = $("#decoded-mnemonics-section");
	// show by default because Z-Base-32 is the default mode
    DOM.decodedMnemonicsSection.show();
	DOM.decodedMnemonics = $("#decoded-mnemonics");
    DOM.decrypter = $("#decrypter");
    DOM.reconstructedHex = $("#reconstructed-hex");
    DOM.reconstructedError = $("#reconstructed-error");

    // Tiny debounce helper (keeps UI snappy while typing)
    function debounce(fn, wait) {
        let t;
        return function debounced(/* ...args */) {
            const self = this, args = arguments;
            clearTimeout(t);
            t = setTimeout(function(){ fn.apply(self, args); }, wait);
        };
    }
    // Debounced handlers (50ms)
    const debouncedCreateShares = debounce(createShares, 50);
    const debouncedReconstruct  = debounce(reconstruct, 50);

    DOM.masterSecretHex.on("input", debouncedCreateShares);
    DOM.passphrase.on("input", debouncedCreateShares);
    DOM.totalShares.on("input", debouncedCreateShares);
    DOM.threshold.on("input", debouncedCreateShares);
    DOM.generate.on("click", generateClicked);
    DOM.existingShares.on("input", debouncedReconstruct);
    DOM.decrypter.on("input", debouncedReconstruct);

    // toggle events
    let combineMode = "zbase32"; // "mnemonics" | "zbase32"
    DOM.toggleMnemonics.on("click", function(){
        DOM.existingShares.val(""); // clear textarea
        setCombineMode("mnemonics");
    });
    DOM.toggleZbase32.on("click", function(){
        DOM.existingShares.val(""); // clear textarea
        setCombineMode("zbase32");
    });
	// Initialize UI based on current combineMode
    setCombineMode(combineMode);
    DOM.masterSecretHex.focus();

    function generateClicked(e) {
        // get strength value
        let strengthStr = e.target.getAttribute("data-strength");
        let strength = parseInt(strengthStr);
        // validate strength value
        if (isNaN(strength)) {
            // TODO
        }
        if (strength % 16 != 0) {
            // TODO
        }
        // generate master secret
        let masterSecretHex = generateMasterSecret(strength);
        DOM.masterSecretHex.val(masterSecretHex);
        createShares();
    }

    function createShares() {
        clearShares();
        // parse parameters
        let masterSecretHex = DOM.masterSecretHex.val();
        let masterSecretBytes = hexToBytes(masterSecretHex);
        if (masterSecretHex.length < 32) {
            showMasterSecretError("Master Secret must be at least 128 bits (32 hex chars)");
            return;
        }
        if (masterSecretBytes.length % 2 != 0) {
            showMasterSecretError("Master Secret must be an even number of bytes (multiples of 4 hex chars)");
            return;
        }
        let totalShares = parseInt(DOM.totalShares.val());
        if (isNaN(totalShares)) {
            showTotalSharesError("Value must be a number");
            return;
        }
        if (totalShares <= 0) {
            showTotalSharesError("Must be at least 1");
            return;
        }
        if (totalShares > MAX_SHARES) {
            showTotalSharesError("Total shares must be " + MAX_SHARES + " or less");
            return;
        }
        let threshold = parseInt(DOM.threshold.val());
        if (isNaN(threshold)) {
            showThresholdError("Value must be a number");
            return;
        }
        if (threshold > totalShares) {
            showThresholdError("Must be less than or equal to total shares");
            return;
        }
        if (threshold <= 0) {
            showThresholdError("Must be greater than 1");
            return;
        }
        let groups = [];
        // for now only one group.
        // in the future this can be more complex.
        // Using 1-of-1 member shares because of this error in slip39 lib:
        // Creating multiple member shares with member threshold 1 is not
        // allowed. Use 1-of-1 member sharing instead.
        for (let i=0; i<totalShares; i++) {
            groups.push([1,1]);
        }
        // create shares
        let slip = slip39libs.slip39.fromArray(
            masterSecretBytes, {
            passphrase: DOM.passphrase.val(),
            threshold: threshold,
            groups: groups,
        });
        // show in the UI
        let sharesStr = "";
		let sharesZbase32StrCommas = "";

		for (let i=0; i<totalShares; i++) {
			let derivationPath = "r/" + i;
			let oneLine = slip.fromPath(derivationPath).mnemonics;
			let oneZbase32 = indexToZbase32(mnemonicToIndices(oneLine[0].split(" "),slip39wordList));
			sharesStr += oneLine + "\n\n";
			sharesZbase32StrCommas += oneZbase32 + "\n\n";
		}
		let sharesZbase32Str = sharesZbase32StrCommas.replace(/,\s*/g, "");
        DOM.newShares.val(sharesStr.trim());
		DOM.newSharesZbase32.val(sharesZbase32Str.trim());
	}

    function reconstruct() {
        clearReconstructed();
		let raw = DOM.existingShares.val();
		if (raw.length == 0) {
            return;
        }
		
		let mnemonicsStr;
		let mnemonics;
		if (combineMode === "mnemonics") {
			mnemonicsStr = raw;
			mnemonics = mnemonicsStr.split("\n");
		}
		else {
			// decode Z-Base-32 back to SLIP-39
            try {
                // Split shares by line; strip whitespace inside each line
                const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
                mnemonics = lines.map(function(line) {
                    const compact = line.replace(/\s+/g, "");
                    if (compact.length % 2 !== 0) {
                        throw new Error("Z-Base-32 string length must be even");
                    }
                    const tokens = compact.match(/.{1,2}/g) || [];
                    const indices = zbase32ToIndices(tokens);
                    const words = indices.map(function(i) {
                        if (i < 0 || i >= slip39wordList.length) {
                            throw new Error("Index out of range in decoded Z-Base-32: " + i);
                        }
                        return slip39wordList[i];
                    });
                    return words.join(" ");
                });
            } catch (e) {
                DOM.reconstructedError.text(e.message || String(e));
                DOM.reconstructedHex.val("");
                return;
            }
            // Show one decoded mnemonic per line
            mnemonicsStr = mnemonics.join("\n\n");
		}

        let passphrase = DOM.decrypter.val();
        mnemonics = mnemonics.map(function(m) {
            return m.trim();
        });
        mnemonics = mnemonics.filter(function(m) {
            return m.length > 0;
        });
        let secretBytes = "";
        try {
            secretBytes = slip39libs.slip39.recoverSecret(mnemonics, passphrase);
        }
        catch (e) {
            // TODO modify error text and make it easier for users
            DOM.reconstructedError.text(e);
            return;
        }
        let secretHex = bytesToHex(secretBytes);
		DOM.decodedMnemonics.val(mnemonicsStr);
        DOM.reconstructedHex.val(secretHex);
    }

    function generateMasterSecret(strengthBits) {
        // TODO test crypto.getRandomValues exists
        // generate secure entropy for the secret
        let buffer = new Uint8Array(strengthBits / 8);
        let data = crypto.getRandomValues(buffer);
        // fill the masterSecret value
        let masterSecret = bytesToHex(data);
        return masterSecret;
    }

    function showMasterSecretError(msg) {
        DOM.masterSecretError.text(msg);
        DOM.masterSecretError.removeClass("hidden");
    }

    function showTotalSharesError(msg) {
        DOM.totalSharesError.text(msg);
        DOM.totalSharesError.removeClass("hidden");
    }

    function showThresholdError(msg) {
        DOM.thresholdError.text(msg);
        DOM.thresholdError.removeClass("hidden");
    }

    function clearShares() {
        DOM.newShares.val("");
        DOM.masterSecretError.html("&nbsp;");
        DOM.totalSharesError.addClass("hidden");
        DOM.thresholdError.addClass("hidden");
    }

    function clearReconstructed() {
		DOM.decodedMnemonics.val("");
        DOM.reconstructedHex.val("");
        DOM.reconstructedError.html("&nbsp;");
    }

    function bytesToHex(u8) {
        let h = "";
        for (let i=0; i<u8.length; i++) {
            let hexChars = u8[i].toString(16);
            while (hexChars.length % 2 != 0) {
                hexChars = "0" + hexChars;
            }
            h += hexChars;
        }
        return h;
    }

    function hexToBytes(h) {
        // Left-pad if odd number of hex chars
        if (h.length % 2 != 0) {
            h = "0" + h;
        }
        // create bytes
        let a = [];
        for (let i=0; i<h.length; i+=2) {
            const b = parseInt(h.substring(i, i+2), 16)
            a.push(b);
        }
        return a;
    }

})();
