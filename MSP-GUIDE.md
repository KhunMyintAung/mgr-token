# Mahar Shwe Point (MSP) — စတင်အသုံးပြုနည်း

MSP သည် Mahar POS သုံးသော ဆိုင်များက ဝယ်သူများကို ပေးသော Loyalty Point ဖြစ်ပြီး BNB Chain ပေါ်တွင် ရှိသည်။

| | |
|---|---|
| Contract | `contracts/MaharShwePoint.sol` |
| Cap (စုစုပေါင်း ထုတ်နိုင်သမျှ) | 100,000,000 MSP — ပြင်၍မရ |
| တစ်ရက် ထုတ်ခွင့် | 100,000 MSP (Owner ပြင်နိုင်) |
| ထုတ်ခွင့်ရှိသူ | Minter (POS server wallet) တစ်ခုတည်း |
| Owner | Minter ပြောင်း၊ Daily limit ပြင်၊ ထုတ်ခြင်း ရပ်နိုင်သည် — ဘယ်သူ့ point ကိုမှ ပိတ်/ယူ မရ |
| ရနှုန်း | ဆိုင်တစ်ဆိုင်ချင်း Settings → Points မှာ သတ်မှတ် (default 1000 ကျပ် = 1 MSP) |
| **BNB Smart Chain contract** | `0x9286B899F846fD42e71aa11d5B0bBB9601260E50` |
| Owner | `0x2569b4dF18c44a67CD98d1a307aA1efE45d0621D` |
| Minter (POS server) | `0x2B11E09fE87BcACDCe52701D0Ad7056808DF7516` |
| Sourcify | https://repo.sourcify.dev/56/0x9286B899F846fD42e71aa11d5B0bBB9601260E50 (exact match) |

## အဆင့် ၁ — POS server မှာ Minter wallet ဖန်တီး

Server ပေါ်မှာ (key က server ပေါ်မှာပဲ ရှိပြီး ဘယ်မှ မပို့ပါ):

```bash
cd /var/www/maharpos/build/src && node scripts/msp-new-minter.mjs /var/www/maharpos/shared.env
```

ထွက်လာတဲ့ **Minter address** ကို မှတ်ထားပါ။ အဲဒီ address ထဲ gas ခ BNB ~0.003 (≈$2) ထည့်ပါ။

## အဆင့် ၂ — MSP Contract ထုတ်

1. https://token.maharpos.shop/wallet/ → Owner wallet နဲ့ ဝင် → Network: **BNB Smart Chain**
2. **Create** tab → **Mahar Shwe Point (MSP)**
3. Minter address ထည့် → Cap 100000000 / Daily limit 100000 → **Review** → **Confirm & deploy**
   (gas ≈ 0.0002–0.001 BNB)
4. ရလာတဲ့ **Contract address** ကို မှတ်ပါ။

## အဆင့် ၃ — POS ကို ချိတ်

`/var/www/maharpos/shared.env` ထဲ ထည့်ပြီး app ကို reload (`cd /var/www/maharpos && pm2 startOrReload ecosystem.config.cjs --update-env`):

```
MSP_CONTRACT=<Contract address>
```

## အဆင့် ၄ — BscScan Verify (အခမဲ့)

BscScan → Contract → **Verify and Publish** → Compiler Type: **Solidity (Standard-Json-Input)** →
Compiler **v0.8.26** → License **MIT** → `build/MaharShwePoint.standard-input.json` ကို upload →
Constructor arguments ကို BscScan က အလိုလို ရှာပေးပါမယ်။

## အဆင့် ၅ — ဆိုင်များ အသုံးပြုပုံ

1. **Settings → Points** → "Give MSP on sales" ဖွင့် → ရနှုန်း သတ်မှတ် → Save
2. **Customers** → ဝယ်သူ → **Customer's BNB Chain wallet** ထည့်
3. ဝယ်သူ ပါတဲ့ အရောင်းတိုင်း (ငွေချေထားသလောက်) point ရ → မိနစ်အနည်းငယ်အတွင်း wallet ထဲ ရောက်
   - Wallet မရှိသေးရင် point စုထား → wallet ထည့်တဲ့အခါ ပို့ပေး
   - အရောင်း Cancel လုပ်ရင် မပို့ရသေးတဲ့ point ပြန်ပယ်

## PancakeSwap (သင်ကိုယ်တိုင် ဆုံးဖြတ်ရန်)

MSP/BNB pool ဖွင့်ရင် ဝယ်/ရောင်းလို့ ရပါမယ်။ သတိ: ဆိုင်တွေက point အသစ် ထုတ်နေပြီး ဝယ်သူတွေ ရောင်းနိုင်လို့
**ဈေးကျနိုင်ပါတယ်** — "ဈေးအမြဲတက်မယ်" လို့ ကတိ မပေးပါနဲ့။ Pool သေးရင် MGR မှာလို bot အန္တရာယ် ရှိပါတယ်။
ဆိုင်တွေက MSP ကို လျှော့ဈေးအဖြစ် လက်ခံမှ ဝယ်လိုအား ရှိပါမယ်။
