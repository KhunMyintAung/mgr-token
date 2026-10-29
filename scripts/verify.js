// Verifies a deployed MyToken contract on BscScan (or any Etherscan-family explorer)
// through the Etherscan V2 API.
//
// Usage (PowerShell):
//   $env:ETHERSCAN_API_KEY = "<your key>"
//   npm run verify -- <contractAddress> [chainId] [rpcUrl]
//
// Without an API key it only checks that the on-chain code matches contracts/MyToken.sol.
const { ethers } = require("ethers");
const solc = require("solc");
const input = require("./solc-input");

const API = "https://api.etherscan.io/v2/api";
const RPCS = {
  1: "https://ethereum-rpc.publicnode.com",
  56: "https://bsc-rpc.publicnode.com",
  137: "https://polygon-bor-rpc.publicnode.com",
  8453: "https://base-rpc.publicnode.com",
  42161: "https://arbitrum-one-rpc.publicnode.com",
  11155111: "https://ethereum-sepolia-rpc.publicnode.com",
};

const [address, chainArg = "56", rpcArg] = process.argv.slice(2);
const chainId = Number(chainArg);
const apiKey = process.env.ETHERSCAN_API_KEY;

function fail(msg) { console.error("✖ " + msg); process.exit(1); }

async function api(params, body) {
  const url = `${API}?chainid=${chainId}&` + new URLSearchParams(body ? {} : { ...params, apikey: apiKey });
  const res = await fetch(url, body
    ? { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ ...params, apikey: apiKey }) }
    : undefined);
  return res.json();
}

async function main() {
  if (!address || !ethers.isAddress(address)) fail("Usage: npm run verify -- <contractAddress> [chainId] [rpcUrl]");
  const rpc = rpcArg || RPCS[chainId];
  if (!rpc) fail(`No default RPC for chain ${chainId}; pass one as the third argument.`);
  const provider = new ethers.JsonRpcProvider(rpc, chainId, { staticNetwork: true });

  const out = JSON.parse(solc.compile(JSON.stringify(input)));
  const c = out.contracts["MyToken.sol"].MyToken;
  const creationCode = "0x" + c.evm.bytecode.object;
  const compilerVersion = "v" + solc.version().replace(/\.Emscripten.*$/, "");

  // Constructor arguments: taken from the real deployment transaction when we have an
  // API key to find it, otherwise rebuilt from the token's current on-chain values.
  let args;
  if (apiKey) {
    const r = await api({ module: "contract", action: "getcontractcreation", contractaddresses: address });
    const txHash = Array.isArray(r.result) && r.result[0]?.txHash;
    if (!txHash) fail(`Could not find the creation transaction: ${typeof r.result === "string" ? r.result : r.message}`);
    const tx = await provider.getTransaction(txHash);
    if (!tx.data.toLowerCase().startsWith(creationCode.toLowerCase()))
      fail("The deployment bytecode does not match contracts/MyToken.sol with the current compiler settings.");
    args = "0x" + tx.data.slice(creationCode.length);
    console.log("Creation tx:", txHash);
  } else {
    const t = new ethers.Contract(address, c.abi, provider);
    const [name, symbol, decimals, supply] = await Promise.all([t.name(), t.symbol(), t.decimals(), t.totalSupply()]);
    args = ethers.AbiCoder.defaultAbiCoder().encode(["string", "string", "uint8", "uint256"], [name, symbol, decimals, supply]);
    console.log(`Token: ${name} (${symbol}), decimals ${decimals}, supply ${ethers.formatUnits(supply, decimals)}`);
  }

  // Simulate the deployment and compare the resulting runtime code with what is on chain.
  const [onChain, simulated] = await Promise.all([provider.getCode(address), provider.call({ data: creationCode + args.slice(2) })]);
  if (onChain === "0x") fail("No contract at that address on this chain.");
  if (onChain.toLowerCase() !== simulated.toLowerCase()) fail("On-chain code does not match contracts/MyToken.sol.");
  console.log("✔ On-chain code matches contracts/MyToken.sol (" + compilerVersion + ")");

  if (!apiKey) {
    console.log("\nSet ETHERSCAN_API_KEY to submit the verification.");
    return;
  }

  const submit = await api({
    module: "contract",
    action: "verifysourcecode",
    contractaddress: address,
    sourceCode: JSON.stringify(input),
    codeformat: "solidity-standard-json-input",
    contractname: "MyToken.sol:MyToken",
    compilerversion: compilerVersion,
    constructorArguements: args.slice(2), // (sic) the API spells it this way
  }, true);
  if (submit.status !== "1") {
    if (/already verified/i.test(submit.result)) return console.log("✔ Already verified.");
    fail(`Submit failed: ${submit.result || submit.message}`);
  }
  console.log("Submitted, guid", submit.result);

  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const s = await api({ module: "contract", action: "checkverifystatus", guid: submit.result });
    if (/pending/i.test(s.result)) { process.stdout.write("."); continue; }
    if (s.status === "1" || /already verified/i.test(s.result)) return console.log("\n✔ " + s.result);
    fail(s.result || s.message);
  }
  fail("Timed out waiting for the explorer; check the contract page later.");
}

main().catch((e) => fail(e.shortMessage || e.message));
