# slip39
generate SLIP39 and convert mnemonics to [base58](https://bitcoinwiki.org/wiki/base58) encoding. it does *not* do [base58check](https://en.bitcoin.it/wiki/Base58Check_encoding). an easy read on base58 encoding is [here](https://learnmeabitcoin.com/technical/keys/base58/).

slip39 -> base58 encoding is done by treating slip39 mnemonics as concatenated 10-bit valuess. each value corresponds to the word index. this giant number is then converted to base58, with each base58 digit corresponding to the base58 alphabet. the first word in the mnemonic phrase is the mist significant 10 bits and the last word is the least significant 10.

base58 -> slip39 conversion reverses the above process.

by guaranteeing that the first slip39 word is not "academic" (which has index 0), the conversion is guaranteed to be perfectly reversible.

## Building slip39

Files mentioned below are from [github.com/ilap/slip39-ls](https://github.com/ilap/slip39-js). 

1. read `libs/readme.md`. This builds `src/js/slip39-libs.js`
2. run `python3 compile.py`. This builds `kslip2-standalone.html`
