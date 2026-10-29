// Standard-JSON compiler input for MyToken. Shared by compile.js and verify.js so the
// settings sent to BscScan are exactly the ones the deployed bytecode was built with.
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "..", "contracts", "MyToken.sol"), "utf8");

module.exports = {
  language: "Solidity",
  sources: { "MyToken.sol": { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    // "paris" avoids PUSH0 so the bytecode runs on chains that lag behind Ethereum upgrades.
    evmVersion: "paris",
    outputSelection: { "*": { MyToken: ["abi", "evm.bytecode.object"] } },
  },
};
