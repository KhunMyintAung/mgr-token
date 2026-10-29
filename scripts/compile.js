// Compiles contracts/MyToken.sol and writes build/MyToken.json (abi + bytecode).
// Usage: npm install && npm run compile
const fs = require("fs");
const path = require("path");
const solc = require("solc");
const input = require("./solc-input");

const root = path.join(__dirname, "..");

const out = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (out.errors || []).filter((e) => e.severity === "error");
for (const e of out.errors || []) console.error(e.formattedMessage);
if (errors.length) process.exit(1);

const c = out.contracts["MyToken.sol"].MyToken;
const artifact = { compiler: solc.version(), abi: c.abi, bytecode: "0x" + c.evm.bytecode.object };
fs.mkdirSync(path.join(root, "build"), { recursive: true });
fs.writeFileSync(path.join(root, "build", "MyToken.json"), JSON.stringify(artifact, null, 2));
// Same data as a script so wallet.html can load it with a plain <script> tag.
fs.writeFileSync(path.join(root, "build", "MyToken.js"), `window.TOKEN_ARTIFACT = ${JSON.stringify(artifact)};\n`);
console.log("Wrote build/MyToken.json and build/MyToken.js with", solc.version());
