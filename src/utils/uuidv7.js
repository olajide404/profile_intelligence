function uuidv7() {
  const now   = Date.now();
  const tsHi  = Math.floor(now / 0x100000000);
  const tsLo  = now >>> 0;

  const randA = Math.floor(Math.random() * 0x1000);
  const rbHi  = Math.floor(Math.random() * 0x80000000);
  const rbLo  = Math.floor(Math.random() * 0x100000000);

  const tsLoHex = pad(tsLo, 8);
  const rbHiHex = pad(rbHi, 8);
  const rbLoHex = pad(rbLo, 8);

  const g1 = pad(tsHi, 4) + tsLoHex.slice(0, 4);
  const g2 = tsLoHex.slice(4, 8);
  const g3 = '7' + pad(randA, 3);
  const g4 = (8 + (rbHi >>> 29 & 3)).toString(16) + rbHiHex.slice(1, 4);
  const g5 = rbHiHex.slice(4, 8) + rbLoHex;

  return `${g1}-${g2}-${g3}-${g4}-${g5}`;
}

function pad(n, len) {
  return (n >>> 0).toString(16).padStart(len, '0');
}

module.exports = { uuidv7 };