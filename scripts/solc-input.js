// Standard-JSON compiler inputs. Shared by compile.js and verify.js so the settings sent
// to BscScan are exactly the ones the deployed bytecode was built with.
const fs = require("fs");
const path = require("path");

function inputFor(contract) {
  const file = contract + ".sol";
  const source = fs.readFileSync(path.join(__dirname, "..", "contracts", file), "utf8");
  return {
    language: "Solidity",
    sources: { [file]: { content: source } },
    settings: {
      optimizer: { enabled: true, runs: 200 },
      // "paris" avoids PUSH0 so the bytecode runs on chains that lag behind Ethereum upgrades.
      evmVersion: "paris",
      outputSelection: { "*": { [contract]: ["abi", "evm.bytecode.object"] } },
    },
  };
}

module.exports = inputFor("MyToken");
module.exports.inputFor = inputFor;
