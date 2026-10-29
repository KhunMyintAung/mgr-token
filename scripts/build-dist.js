// Assembles dist/ for token.maharpos.shop:
//   /            site/ (MGR token page and logos)
//   /wallet/     wallet.html with ethers.js, QR library and the token artifact served locally,
//                so the live wallet loads no code from third-party CDNs.
// Usage: npm run build:dist
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const p = (...a) => path.join(root, ...a);

// Empty dist/ rather than deleting it: Windows refuses to remove a folder a shell is open in.
fs.mkdirSync(dist, { recursive: true });
for (const e of fs.readdirSync(dist)) fs.rmSync(path.join(dist, e), { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "wallet", "vendor"), { recursive: true });

// The token list is fetched by wallets and DEXes, so it must match the official schema.
{
  const Ajv = require("ajv");
  const addFormats = require("ajv-formats");
  const schema = require("@uniswap/token-lists/dist/tokenlist.schema.json");
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);
  const list = JSON.parse(fs.readFileSync(p("site", "tokenlist.json"), "utf8"));
  if (!ajv.validate(schema, list)) throw new Error("site/tokenlist.json: " + ajv.errorsText());
}

for (const f of fs.readdirSync(p("site"))) fs.copyFileSync(p("site", f), path.join(dist, f));

const libs = {
  "https://cdn.jsdelivr.net/npm/ethers@6.13.2/dist/ethers.umd.min.js": ["node_modules/ethers/dist/ethers.umd.min.js", "vendor/ethers-6.13.2.umd.min.js"],
  "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js": ["node_modules/qrcode-generator/qrcode.js", "vendor/qrcode-1.4.4.js"],
  "build/MyToken.js": ["build/MyToken.js", "MyToken.js"],
};
let html = fs.readFileSync(p("wallet.html"), "utf8");
for (const [src, [from, to]] of Object.entries(libs)) {
  if (!html.includes(`src="${src}"`)) throw new Error(`wallet.html no longer loads ${src}; update build-dist.js`);
  html = html.replace(`src="${src}"`, `src="${to}"`);
  fs.copyFileSync(p(from), path.join(dist, "wallet", to));
}
fs.writeFileSync(path.join(dist, "wallet", "index.html"), html);

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    e.isDirectory() ? walk(f) : files.push(path.relative(dist, f).replace(/\\/g, "/"));
  }
})(dist);
console.log("dist/:", files.join(", "));
