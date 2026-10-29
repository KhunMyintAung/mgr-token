# MGR — အခမဲ့ လုပ်လို့ရတာများ

Contract: `0xc117986212033937fa52F0609843754C8f7DBacD` (BNB Smart Chain)

## ✅ ပြီးပြီးသား

| | |
|---|---|
| BscScan source code verify | ✅ |
| Sourcify verify (exact match) | ✅ https://repo.sourcify.dev/56/0xc117986212033937fa52F0609843754C8f7DBacD |
| Logo | `site/logo.svg`, `site/logo-512.png`, `site/logo-256.png`, `site/logo-32.png` |
| Website | `site/index.html` (Add to MetaMask ခလုတ် ပါ) |

## 1. Website ✅ Live

- Token page: https://token.maharpos.shop/
- Web wallet: https://token.maharpos.shop/wallet/
- ပြင်ပြီး update လုပ်ရန်: `npm run deploy`

## 2. BscScan မှာ Logo / Website / Social links ထည့်ခြင်း

1. https://bscscan.com မှာ အကောင့်ဖွင့်ပြီး Login ဝင်ပါ။
2. **Verify Address Ownership** — https://bscscan.com/verifyAddress မှာ contract address
   `0xc117986212033937fa52F0609843754C8f7DBacD` ကို ထည့်ပါ။ Contract ထုတ်ခဲ့တဲ့ address
   `0x2569b4dF18c44a67CD98d1a307aA1efE45d0621D` နဲ့ sign လုပ်ခိုင်းပါမယ်။ **Sign Message Manually** ကို ရွေးပြီး
   BscScan ပြတဲ့ message ကို copy ကူးပါ → Wallet app → **Settings → Sign message** မှာ ထည့် → **Sign** →
   ထွက်လာတဲ့ signature ကို BscScan မှာ ပြန်ထည့်ပါ။
3. Token page → **More → Update Token Info** ကိုနှိပ်ပါ။
4. ဖြည့်ရမှာ:
   - Website: https://token.maharpos.shop
   - Email: သင့် email
   - Logo: `site/logo-256.png` (တောင်းတဲ့ size အတိုင်း `logo-32.png` / `logo.svg` သုံးပါ)
   - Description: website ရဲ့ About စာပိုဒ်
   - Social links: Facebook / Telegram ရှိရင်
5. Submit — စစ်ဆေးပြီး ရက်အနည်းငယ်အတွင်း ပေါ်လာပါမယ်။ BscScan က ပြည့်စုံပြီး ယုံကြည်ရတဲ့ project ကိုသာ လက်ခံလေ့ရှိပြီး ငြင်းပယ်နိုင်ပါတယ်။

## 3. Wallet တွေထဲ MGR ပြအောင် (အခမဲ့)

- **MetaMask (computer):** website ပေါ်က **Add MGR to wallet** ကိုနှိပ်ပါ — logo ပါ ပါလာပါမယ်။
- **Trust Wallet / တခြား:** Network = BNB Smart Chain → **Add custom token** → contract address ထည့်ပါ။
- MGR ပေးမယ့်သူတွေကို website link ပေးလိုက်ရင် သူတို့ကိုယ်တိုင် ထည့်နိုင်ပါတယ်။

## 4. $10 အောက် — PancakeSwap မှာ MGR ရောင်းဝယ်လို့ရအောင် (Liquidity Pool)

> ⚠️ ကျွန်တော် (Claude) က ငွေကြေးအကြံပေး မဟုတ်ပါ။ Liquidity ထည့်တာက ငွေအစစ်ဖြစ်ပြီး ဆုံးရှုံးနိုင်ပါတယ်။
> ဒီအဆင့်တွေကို သင်ကိုယ်တိုင် လုပ်ရပါမယ်။ (BNB ဈေး ~$750 — 29 Oct 2026)

**ကုန်ကျစရိတ် (BNB Chain gas ~0.05 gwei)**

| အဆင့် | Gas | ခန့်မှန်း |
|---|---|---|
| MGR ကို PancakeSwap သုံးခွင့် (Approve) | ~46,000 | < $0.01 |
| Pool အသစ်ဖန်တီး + Liquidity ထည့် | ~3,450,000 (စစ်ပြီး) | ~0.00017 BNB ≈ $0.13 |
| **Pool ထဲ ထည့်မယ့် BNB** | — | သင်ဆုံးဖြတ် (ဥပမာ 0.008 BNB ≈ $6) |

လက်ရှိ wallet ထဲမှာ ~0.00496 BNB (~$3.7) ရှိပါတယ်။ $10 budget ဆိုရင် BNB ~0.008 ထပ်ထည့်ရပါမယ်။

**ဈေးနှုန်း ဘယ်လိုသတ်မှတ်လဲ** — Pool ထဲ ထည့်တဲ့ အချိုးက စဈေးဖြစ်ပါတယ်။
ဥပမာ `0.01 BNB + 100,000 MGR` ထည့်ရင် → 1 MGR = 0.0000001 BNB (~$0.000075)။
MGR နည်းနည်းထည့်လေ ဈေးမြင့်လေ၊ ဒါပေမဲ့ Pool သေးရင် တစ်ယောက်ယောက် BNB နည်းနည်းနဲ့ MGR အများကြီး ဝယ်သွားနိုင်ပြီး ဈေးအရမ်းလှုပ်ပါတယ်။

**အဆင့်များ**

1. MetaMask (ဖုန်း/Chrome) ဒါမှမဟုတ် Trust Wallet ထဲကို wallet ရဲ့ Seed phrase ကို **Import** လုပ်ပါ
   (address `0x2569…0621D` ထွက်လာရမယ်)။ Network = **BNB Smart Chain**။
2. BNB ~0.013 ရှိအောင် Binance ကနေ ထပ်ပို့ပါ (BEP20 network)။
3. https://pancakeswap.finance/v2/add/BNB/0xc117986212033937fa52F0609843754C8f7DBacD ကိုဖွင့်ပါ
   (**V2** ကိုသုံးပါ — ရိုးရှင်းပြီး DexScreener/GeckoTerminal က ချက်ချင်းမြင်ပါတယ်)။
4. **Connect Wallet** → BNB ပမာဏ နဲ့ MGR ပမာဏ ထည့်ပါ → "You are the first liquidity provider" ပြပါမယ် → အချိုးကို စစ်ပါ။
5. **Enable MGR** (Approve) → **Supply** → wallet မှာ Confirm။ Gas အတွက် BNB ~0.0005 ချန်ထားပါ။
6. ပြီးရင် **LP token** (Cake-LP) ရပါမယ် — Pool ထဲက သင့်ဝေစုပါ။ နောက်မှ **Remove Liquidity** နဲ့ ပြန်ထုတ်လို့ရပါတယ်
   (ဒါပေမဲ့ လူတွေ ဝယ်/ရောင်းထားရင် BNB/MGR အချိုး ပြောင်းပြီး ပြန်ရပါမယ်)။

**ပြီးရင် အခမဲ့ အလိုလို ပေါ်လာမှာ**

- DexScreener / GeckoTerminal — `dexscreener.com/bsc/<pool address>` (ငွေမပေးဘဲ chart ပေါ်ပါတယ်)
- Website မှာ "Buy on PancakeSwap" ခလုတ် ထည့်လို့ရပါပြီ
- CoinGecko listing ကို အခမဲ့ လျှောက်လို့ရပါတယ် (ရောင်းဝယ်မှု နည်းရင် ငြင်းနိုင်)

**သတိ**
- Pool ရှိလာတာနဲ့ ဘယ်သူမဆို MGR ဝယ်/ရောင်းနိုင်ပါပြီ။ လူတွေကို ပိုက်ဆံရမယ်လို့ ကတိမပေးပါနဲ့။
- MGR နာမည်တူ Token အတုတွေ ပေါ်လာနိုင်ပါတယ် — Contract address ကိုပဲ ညွှန်းပါ။
- လူအများဆီ ရောင်းချမယ်ဆိုရင် မြန်မာနိုင်ငံရဲ့ ဥပဒေ/စည်းမျဉ်းကို စစ်ပါ။

## 💰 $10 ထက် ပိုကုန်တာများ (သိထားဖို့)

| | ဘာလိုလဲ |
|---|---|
| Trust Wallet မှာ logo အလိုလိုပေါ်ဖို့ | Trust Wallet assets တင်ခ (များသောအားဖြင့် $10 ထက်များ) |
| DexScreener "Enhanced Token Info" | ~$299 (logo/social ပြဖို့ — မလိုပါ) |
| CoinMarketCap fast-track | ရာချီ/ထောင်ချီ ဒေါ်လာ |

**အရမ်းသက်တာ:** MGR ကို Community ဝင်တွေဆီ ဝေရင် တစ်ကြိမ်လျှင် gas ~0.0000025 BNB (~$0.002)၊ ၁၀၀ ယောက် ≈ $0.20။
