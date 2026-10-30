// Verifies a deployed MyToken or MaharShwePoint (MSP) contract on BscScan (or any
// Etherscan-family explorer) through the Etherscan V2 API.
//
// Usage (PowerShell):
//   $env:ETHERSCAN_API_KEY = "<your key>"
//   npm run verify -- <contractAddress> [chainId] [rpcUrl]
//
// Without an API key it only checks that the on-chain code matches the source in contracts/.
const { ethers } = require("ethers");
const solc = require("solc");
const { inputFor } = require("./solc-input");

const CONTRACTS = ["MyToken", "MaharShwePoint"];

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

  const compiled = CONTRACTS.map((name) => {
    const input = inputFor(name);
    const out = JSON.parse(solc.compile(JSON.stringify(input)));
    return { name, input, code: "0x" + out.contracts[name + ".sol"][name].evm.bytecode.object };
  });
  const compilerVersion = "v" + solc.version().replace(/\.Emscripten.*$/, "");

  // The creation transaction comes from the explorer when we have an API key, otherwise
  // from Sourcify. Its data is the creation code followed by the constructor arguments,
  // which also tells us which contract this is.
  let txHash;
  if (apiKey) {
    const r = await api({ module: "contract", action: "getcontractcreation", contractaddresses: address });
    txHash = Array.isArray(r.result) && r.result[0]?.txHash;
    if (!txHash) fail(`Could not find the creation transaction: ${typeof r.result === "string" ? r.result : r.message}`);
  } else {
    const r = await fetch(`https://sourcify.dev/server/v2/contract/${chainId}/${address}?fields=deployment`).then((x) => x.json()).catch(() => null);
    txHash = r?.deployment?.transactionHash;
    if (!txHash) fail("Could not find the creation transaction without an API key (the contract is not on Sourcify). Set ETHERSCAN_API_KEY.");
  }
  const tx = await provider.getTransaction(txHash);
  const c = compiled.find((x) => tx.data.toLowerCase().startsWith(x.code.toLowerCase()));
  if (!c) fail(`The deployment bytecode matches none of ${CONTRACTS.map((n) => `contracts/${n}.sol`).join(", ")} with the current compiler settings.`);
  const creationCode = c.code, args = "0x" + tx.data.slice(creationCode.length);
  console.log(`Creation tx: ${txHash}\nContract: ${c.name}`);

  // Simulate the deployment and compare the resulting runtime code with what is on chain.
  const [onChain, simulated] = await Promise.all([provider.getCode(address), provider.call({ data: creationCode + args.slice(2) })]);
  if (onChain === "0x") fail("No contract at that address on this chain.");
  if (onChain.toLowerCase() !== simulated.toLowerCase()) fail(`On-chain code does not match contracts/${c.name}.sol.`);
  console.log(`✔ On-chain code matches contracts/${c.name}.sol (${compilerVersion})`);

  if (!apiKey) {
    console.log("\nSet ETHERSCAN_API_KEY to submit the verification.");
    return;
  }

  const submit = await api({
    module: "contract",
    action: "verifysourcecode",
    contractaddress: address,
    sourceCode: JSON.stringify(c.input),
    codeformat: "solidity-standard-json-input",
    contractname: `${c.name}.sol:${c.name}`,
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
