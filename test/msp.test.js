// Exercises contracts/MaharShwePoint.sol against a local chain.
// Usage: start ganache on :8546 (npx ganache@7.9.2 --chain.chainId 1337 --wallet.deterministic --server.port 8546)
//        then: node test/msp.test.js
const assert = require("assert");
const { ethers } = require("ethers");
const art = require("../build/MaharShwePoint.json");

const RPC = process.env.RPC || "http://127.0.0.1:8546";
const E = (n) => ethers.parseEther(String(n));

async function reverts(p, reason) {
  try { await (await p).wait(); } catch (e) {
    const m = e.shortMessage + " " + (e.reason || "") + " " + JSON.stringify(e.info || e.error || "");
    assert(m.includes(reason), `expected "${reason}", got: ${m.slice(0, 300)}`);
    return;
  }
  assert.fail(`expected revert "${reason}"`);
}

(async () => {
  const provider = new ethers.JsonRpcProvider(RPC, undefined, { batchMaxCount: 1 });
  const [owner, minter, alice, bob, stranger] = await Promise.all([0, 1, 2, 3, 4].map((i) => provider.getSigner(i)));
  const [O, M, A, B] = await Promise.all([owner, minter, alice, bob].map((s) => s.getAddress()));
  const f = new ethers.ContractFactory(art.abi, art.bytecode, owner);
  const msp = await f.deploy(O, M, E(1000), E(100));
  await msp.waitForDeployment();
  const as = (s) => msp.connect(s);

  assert.equal(await msp.name(), "Mahar Shwe Point");
  assert.equal(await msp.symbol(), "MSP");
  assert.equal(await msp.owner(), O);
  assert.equal(await msp.minter(), M);
  assert.equal(await msp.mintableNow(), E(100));

  // Only the minter mints; a batch id works once.
  await reverts(as(stranger).mintBatch(1, [A], [E(1)]), "not minter");
  await (await as(minter).mintBatch(1, [A, B], [E(10), E(5)])).wait();
  assert.equal(await msp.balanceOf(A), E(10));
  assert.equal(await msp.totalSupply(), E(15));
  await reverts(as(minter).mintBatch(1, [A], [E(1)]), "batch already minted");
  await reverts(as(minter).mintBatch(2, [A], []), "bad batch");
  await reverts(as(minter).mintBatch(2, [ethers.ZeroAddress], [E(1)]), "mint to zero");

  // Daily limit: 100 per UTC day; a failed batch leaves its id unused.
  await reverts(as(minter).mintBatch(2, [A], [E(86)]), "daily limit reached");
  assert.equal(await msp.batchUsed(2), false);
  await (await as(minter).mintBatch(2, [A], [E(85)])).wait();
  assert.equal(await msp.mintableNow(), 0n);
  await provider.send("evm_increaseTime", [86400]); await provider.send("evm_mine", []);
  assert.equal(await msp.mintableNow(), E(100));

  // Pause and minter change are owner-only.
  await reverts(as(minter).setMintingPaused(true), "not owner");
  await (await as(owner).setMintingPaused(true)).wait();
  await reverts(as(minter).mintBatch(3, [A], [E(1)]), "minting paused");
  assert.equal(await msp.mintableNow(), 0n);
  await (await as(owner).setMintingPaused(false)).wait();
  await (await as(owner).setMinter(B)).wait();
  await reverts(as(minter).mintBatch(3, [A], [E(1)]), "not minter");
  await (await as(owner).setMinter(M)).wait();

  // Holders can always move and burn; burning does not free cap room.
  await (await as(alice).transfer(B, E(20))).wait();
  await (await as(bob).burn(E(25))).wait();
  assert.equal(await msp.totalSupply(), E(75));
  assert.equal(await msp.totalMinted(), E(100));
  await reverts(as(alice).transfer(ethers.ZeroAddress, 1n), "transfer to zero");
  await (await as(alice).approve(B, E(5))).wait();
  await (await as(bob).transferFrom(A, B, E(5))).wait();
  await reverts(as(bob).transferFrom(A, B, 1n), "insufficient allowance");

  // Cap counts everything ever minted.
  await (await as(owner).setDailyLimit(E(1000))).wait();
  await reverts(as(owner).setDailyLimit(E(1001)), "above cap");
  await reverts(as(minter).mintBatch(4, [A], [E(901)]), "cap reached");
  await (await as(minter).mintBatch(4, [A], [E(900)])).wait();
  assert.equal(await msp.mintableNow(), 0n);
  await reverts(as(minter).mintBatch(5, [A], [1n]), "cap reached");

  // Two-step ownership.
  await (await as(owner).transferOwnership(A)).wait();
  assert.equal(await msp.owner(), O);
  await reverts(as(bob).acceptOwnership(), "not pending owner");
  await (await as(alice).acceptOwnership()).wait();
  assert.equal(await msp.owner(), A);
  await reverts(as(owner).setMintingPaused(true), "not owner");

  console.log("✔ MaharShwePoint: all checks passed");
})().catch((e) => { console.error("✖", e.message); process.exit(1); });
