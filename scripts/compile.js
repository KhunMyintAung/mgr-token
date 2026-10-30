// Compiles the contracts and writes, for each, build/<Name>.json (abi + bytecode),
// build/<Name>.js (the same as a script for wallet.html) and build/<Name>.standard-input.json
// (what BscScan's "Standard JSON Input" verification asks for).
// Usage: npm install && npm run compile
const fs = require("fs");
const path = require("path");
const solc = require("solc");
const { inputFor } = require("./solc-input");

const root = path.join(__dirname, "..");
// The global each artifact is exposed as in the wallet.
const contracts = { MyToken: "TOKEN_ARTIFACT", MaharShwePoint: "MSP_ARTIFACT" };

fs.mkdirSync(path.join(root, "build"), { recursive: true });
for (const [name, global] of Object.entries(contracts)) {
  const input = inputFor(name);
  const out = JSON.parse(solc.compile(JSON.stringify(input)));
  for (const e of out.errors || []) console.error(e.formattedMessage);
  if ((out.errors || []).some((e) => e.severity === "error")) process.exit(1);

  const c = out.contracts[name + ".sol"][name];
  const artifact = { compiler: solc.version(), abi: c.abi, bytecode: "0x" + c.evm.bytecode.object };
  fs.writeFileSync(path.join(root, "build", name + ".json"), JSON.stringify(artifact, null, 2));
  fs.writeFileSync(path.join(root, "build", name + ".js"), `window.${global} = ${JSON.stringify(artifact)};\n`);
  fs.writeFileSync(path.join(root, "build", name + ".standard-input.json"), JSON.stringify(input, null, 2));
  console.log(`Wrote build/${name}.{json,js,standard-input.json} with`, solc.version());
}
