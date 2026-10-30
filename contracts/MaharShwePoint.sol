// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// Mahar Shwe Point (MSP): the loyalty point shops on Mahar POS give their customers.
///
/// - Points are minted only by the POS server's wallet (the minter), never more than
///   `dailyLimit` per UTC day and never more than `cap` in total, even after burns,
///   so a stolen server key cannot flood the supply.
/// - Every mint batch carries an id that can be used once; if the POS resends a batch
///   after a crash, the second copy reverts instead of paying the customers twice.
/// - The owner can change the minter, lower or raise the daily limit and pause minting.
///   Nobody, the owner included, can freeze, block or take anyone's balance:
///   holders can always transfer and burn their own points.
contract MaharShwePoint {
    string public constant name = "Mahar Shwe Point";
    string public constant symbol = "MSP";
    uint8 public constant decimals = 18;

    uint256 public immutable cap;
    uint256 public totalSupply;
    uint256 public totalMinted;

    address public owner;
    address public pendingOwner;
    address public minter;
    bool public mintingPaused;
    uint256 public dailyLimit;
    uint256 public mintedDay;
    uint256 public mintedToday;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(uint256 => bool) public batchUsed;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event BatchMinted(uint256 indexed batchId, uint256 total);
    event MinterChanged(address indexed minter);
    event DailyLimitChanged(uint256 dailyLimit);
    event MintingPaused(bool paused);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address owner_, address minter_, uint256 cap_, uint256 dailyLimit_) {
        require(owner_ != address(0), "owner is zero");
        require(cap_ > 0 && dailyLimit_ <= cap_, "bad limits");
        owner = owner_;
        minter = minter_;
        cap = cap_;
        dailyLimit = dailyLimit_;
        emit OwnershipTransferred(address(0), owner_);
        emit MinterChanged(minter_);
        emit DailyLimitChanged(dailyLimit_);
    }

    // ---------- ERC-20 ----------

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        require(spender != address(0), "approve to zero");
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            require(allowed >= value, "insufficient allowance");
            allowance[from][msg.sender] = allowed - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function burn(uint256 value) external {
        require(balanceOf[msg.sender] >= value, "insufficient balance");
        balanceOf[msg.sender] -= value;
        totalSupply -= value;
        emit Transfer(msg.sender, address(0), value);
    }

    // ---------- Minting (POS server) ----------

    function mintBatch(uint256 batchId, address[] calldata to, uint256[] calldata amounts) external {
        require(msg.sender == minter, "not minter");
        require(!mintingPaused, "minting paused");
        require(to.length == amounts.length && to.length > 0, "bad batch");
        require(!batchUsed[batchId], "batch already minted");
        batchUsed[batchId] = true;

        uint256 total;
        for (uint256 i = 0; i < to.length; i++) {
            require(to[i] != address(0), "mint to zero");
            balanceOf[to[i]] += amounts[i];
            total += amounts[i];
            emit Transfer(address(0), to[i], amounts[i]);
        }

        uint256 day = block.timestamp / 1 days;
        if (day != mintedDay) {
            mintedDay = day;
            mintedToday = 0;
        }
        mintedToday += total;
        require(mintedToday <= dailyLimit, "daily limit reached");
        totalMinted += total;
        require(totalMinted <= cap, "cap reached");
        totalSupply += total;
        emit BatchMinted(batchId, total);
    }

    /// What the minter may still mint right now, after today's mints and the cap.
    function mintableNow() external view returns (uint256) {
        uint256 today = block.timestamp / 1 days == mintedDay ? mintedToday : 0;
        uint256 byDay = dailyLimit > today ? dailyLimit - today : 0;
        uint256 byCap = cap - totalMinted;
        return mintingPaused ? 0 : (byDay < byCap ? byDay : byCap);
    }

    // ---------- Owner ----------

    function setMinter(address minter_) external onlyOwner {
        minter = minter_;
        emit MinterChanged(minter_);
    }

    function setDailyLimit(uint256 dailyLimit_) external onlyOwner {
        require(dailyLimit_ <= cap, "above cap");
        dailyLimit = dailyLimit_;
        emit DailyLimitChanged(dailyLimit_);
    }

    function setMintingPaused(bool paused) external onlyOwner {
        mintingPaused = paused;
        emit MintingPaused(paused);
    }

    /// Two steps, so a typo in the new address cannot lose the owner role.
    function transferOwnership(address newOwner) external onlyOwner {
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "not pending owner");
        emit OwnershipTransferred(owner, msg.sender);
        owner = msg.sender;
        pendingOwner = address(0);
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(to != address(0), "transfer to zero");
        require(balanceOf[from] >= value, "insufficient balance");
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }
}
