import { DigitalAsset } from '../types';

export interface CycleSimulationRow {
  cycle: number;
  startPriceUsdt: number;
  profitPercent: number;
  profitUsdt: number;
  rawResalePrice: number;
  roundedResalePrice: number; // Rounded to 0.01 USDT
  isMaxPriceSplitTrigger: boolean;
  stockCount: number;
  notes: string;
}

/**
 * Rounds USDT values strictly to 2 decimal places (0.01 USDT)
 * Example: 5.876 USDT -> 5.88 USDT
 */
export const roundUsdt = (val: number): number => {
  return Math.round((val + Number.EPSILON) * 100) / 100;
};

/**
 * Evaluates whether an asset has a stock deficit (kekurangan stok).
 * An asset lacks stock if:
 * 1) Current stock is low (stockUnits < 5 or stockUnits < ceil(maxStockCapacity / 2))
 * 2) Demand is high (bookedUsers.length >= stockUnits)
 */
export const checkAssetStockDeficit = (asset: DigitalAsset): boolean => {
  const stock = asset.stockUnits ?? 1;
  const maxCap = asset.maxStockCapacity ?? 10;
  const demand = asset.bookedUsers?.length || 0;

  const isBelowCapacityThreshold = stock < Math.max(5, Math.ceil(maxCap / 2));
  const isHighBookingDemand = demand >= stock;

  return isBelowCapacityThreshold || isHighBookingDemand;
};

/**
 * Automatically determines the optimal action when Max Price is reached based on stock deficit priority:
 * 1. If current tier is in stock deficit -> SPLIT_SAME_TIER (split 2x stock immediately).
 * 2. If current tier is NOT in stock deficit, check Next Tier:
 *    - If Next Tier is in stock deficit -> UPGRADE_NEXT_TIER (upgrade to next tier immediately).
 *    - If Next Tier is ALSO NOT in stock deficit -> SPLIT_SAME_TIER (fallback to split 2x stock).
 */
export const determineSmartMaxPriceAction = (
  asset: DigitalAsset,
  allAssets: DigitalAsset[] = []
): {
  effectiveAction: 'SPLIT_SAME_TIER' | 'UPGRADE_NEXT_TIER';
  isCurrentDeficit: boolean;
  isNextDeficit: boolean;
  nextTierAsset?: DigitalAsset;
  reasonMessage: string;
} => {
  const minPrice = asset.minPriceUsdt || asset.priceUsdt;

  // 1. Resolve next tier target asset
  let nextTierAsset: DigitalAsset | undefined = undefined;
  if (asset.nextTierAssetId) {
    nextTierAsset = allAssets.find((a) => a.id === asset.nextTierAssetId);
  }
  if (!nextTierAsset && allAssets.length > 0) {
    const higherTierAssets = allAssets
      .filter((a) => (a.minPriceUsdt || a.priceUsdt) > minPrice && a.id !== asset.id)
      .sort((a, b) => (a.minPriceUsdt || a.priceUsdt) - (b.minPriceUsdt || b.priceUsdt));
    if (higherTierAssets.length > 0) {
      nextTierAsset = higherTierAssets[0];
    }
  }

  // 2. Evaluate current tier deficit
  const isCurrentDeficit = checkAssetStockDeficit(asset);

  if (isCurrentDeficit) {
    return {
      effectiveAction: 'SPLIT_SAME_TIER',
      isCurrentDeficit: true,
      isNextDeficit: false,
      nextTierAsset,
      reasonMessage: `Aset ini sedang KEKURANGAN STOK (${asset.stockUnits ?? 1}/${asset.maxStockCapacity ?? 10} unit). Sistem langsung SPLIT 2X STOK di tier yang sama.`,
    };
  }

  // 3. Current tier is NOT in stock deficit -> Check Next Tier
  if (nextTierAsset) {
    const isNextDeficit = checkAssetStockDeficit(nextTierAsset);

    if (isNextDeficit) {
      return {
        effectiveAction: 'UPGRADE_NEXT_TIER',
        isCurrentDeficit: false,
        isNextDeficit: true,
        nextTierAsset,
        reasonMessage: `Aset ini stok cukup, namun Tier Selanjutnya (${nextTierAsset.name}) KEKURANGAN STOK (${nextTierAsset.stockUnits ?? 1}/${nextTierAsset.maxStockCapacity ?? 10} unit). Sistem langsung NAIK TIER ke ${nextTierAsset.name}.`,
      };
    } else {
      return {
        effectiveAction: 'SPLIT_SAME_TIER',
        isCurrentDeficit: false,
        isNextDeficit: false,
        nextTierAsset,
        reasonMessage: `Aset ini & Tier Selanjutnya (${nextTierAsset.name}) sama-sama memadai. Sistem tetap SPLIT 2X STOK di tier saat ini.`,
      };
    }
  }

  return {
    effectiveAction: 'SPLIT_SAME_TIER',
    isCurrentDeficit: false,
    isNextDeficit: false,
    nextTierAsset: undefined,
    reasonMessage: `Aset berada di tier tertinggi. Sistem otomatis SPLIT 2X STOK.`,
  };
};

/**
 * Generates the full 15-cycle price progression & stock split simulation table
 */
export const generate15CycleSimulation = (
  startPrice: number,
  profitPercent: number,
  customMinPrice?: number,
  customMaxPrice?: number,
  maxPriceAction: 'AUTO_SMART_ROUTE' | 'SPLIT_SAME_TIER' | 'UPGRADE_NEXT_TIER' = 'AUTO_SMART_ROUTE',
  nextTierName?: string
): {
  minPrice: number;
  maxPrice: number;
  midpointPrice: number;
  rows: CycleSimulationRow[];
} => {
  const validStart = Math.max(0.01, startPrice || 10);
  const validProfit = Math.max(0.1, profitPercent || 5);
  const minPrice = customMinPrice && customMinPrice > 0 ? customMinPrice : validStart;

  const rows: CycleSimulationRow[] = [];
  let currentPrice = minPrice;
  let currentStock = 1;

  // First pass: calculate 15 cycles to determine auto maxPrice if not provided
  let calculatedMaxPrice = customMaxPrice || 0;

  for (let cycle = 1; cycle <= 15; cycle++) {
    const profitUsdt = currentPrice * (validProfit / 100);
    const rawResale = currentPrice + profitUsdt;
    const roundedResale = roundUsdt(rawResale);

    if (cycle === 15 && (!customMaxPrice || customMaxPrice <= 0)) {
      calculatedMaxPrice = roundedResale;
    }

    const isLastCycle = cycle === 15;
    const isSplitTrigger = isLastCycle || (customMaxPrice && customMaxPrice > 0 && roundedResale >= customMaxPrice);

    let cycleNote = `Dapat Dijual Kembali (+${validProfit}% Profit)`;
    if (isSplitTrigger) {
      if (maxPriceAction === 'UPGRADE_NEXT_TIER') {
        cycleNote = `🚀 HARGA TERTINGGI REPO / MAX PRICE! Naik ke Tier Selanjutnya (${nextTierName || 'Next Tier Asset'})`;
      } else if (maxPriceAction === 'AUTO_SMART_ROUTE') {
        cycleNote = `🤖 HARGA TERTINGGI REPO! Auto Routing (Evaluasi Defisit Stok)`;
      } else {
        cycleNote = `⚡ HARGA TERTINGGI REPO / MAX PRICE! Stok Split 2x Unit & Reset ke Harga Tengah`;
      }
    }

    rows.push({
      cycle,
      startPriceUsdt: roundUsdt(currentPrice),
      profitPercent: validProfit,
      profitUsdt: roundUsdt(profitUsdt),
      rawResalePrice: rawResale,
      roundedResalePrice: roundedResale,
      isMaxPriceSplitTrigger: !!isSplitTrigger,
      stockCount: currentStock,
      notes: cycleNote,
    });

    if (isSplitTrigger) {
      if (maxPriceAction === 'SPLIT_SAME_TIER' || maxPriceAction === 'AUTO_SMART_ROUTE') {
        currentStock = currentStock * 2;
        const targetMax = customMaxPrice || calculatedMaxPrice;
        const mid = roundUsdt((minPrice + targetMax) / 2);
        currentPrice = mid;
      } else {
        // Upgrade next tier - price moves up to next tier range
        currentPrice = roundedResale;
      }
    } else {
      currentPrice = roundedResale;
    }
  }

  const finalMaxPrice = customMaxPrice && customMaxPrice > 0 ? customMaxPrice : calculatedMaxPrice || rows[14].roundedResalePrice;
  const midpointPrice = roundUsdt((minPrice + finalMaxPrice) / 2);

  return {
    minPrice,
    maxPrice: finalMaxPrice,
    midpointPrice,
    rows,
  };
};

/**
 * Calculates next trade step for an asset upon sale completion
 */
export const calculateNextAssetTradeState = (asset: DigitalAsset, allAssets: DigitalAsset[] = []) => {
  const currentPrice = asset.priceUsdt;
  const profitPercent = asset.dailyProfitPercent || 5;
  const minPrice = asset.minPriceUsdt || currentPrice;

  // Evaluate smart max price action based on stock deficit demand
  const smartEval = determineSmartMaxPriceAction(asset, allAssets);
  const action =
    asset.maxPriceAction === 'SPLIT_SAME_TIER' || asset.maxPriceAction === 'UPGRADE_NEXT_TIER'
      ? asset.maxPriceAction
      : smartEval.effectiveAction;

  const nextTierAsset = smartEval.nextTierAsset;
  const nextTierName = nextTierAsset?.name || `${asset.name} [Tier II / Sovereign]`;

  // Calculate maxPrice if not set
  const sim = generate15CycleSimulation(
    minPrice,
    profitPercent,
    minPrice,
    asset.maxPriceUsdt,
    action,
    nextTierName
  );
  const maxPrice = asset.maxPriceUsdt || sim.maxPrice;
  const midpointPrice = sim.midpointPrice;

  const rawProfit = currentPrice * (profitPercent / 100);
  const rawNextPrice = currentPrice + rawProfit;
  const roundedNextPrice = roundUsdt(rawNextPrice);

  const currentStep = asset.currentCycleStep || 1;
  const nextStep = currentStep + 1;

  const isTriggerSplit = roundedNextPrice >= maxPrice || nextStep > 15;

  if (isTriggerSplit) {
    if (action === 'UPGRADE_NEXT_TIER') {
      // PROMOTED / UPGRADED TO NEXT TIER
      const targetNextPrice = nextTierAsset ? (nextTierAsset.minPriceUsdt || nextTierAsset.priceUsdt) : roundedNextPrice;
      const targetName = nextTierAsset ? nextTierAsset.name : `${asset.name} [Tier II / Sovereign]`;

      return {
        nextPriceUsdt: targetNextPrice,
        nextStockUnits: asset.stockUnits ?? 1,
        nextCycleStep: 1, // Reset to cycle 1 of the new tier
        isSplitTriggered: true,
        isTierUpgraded: true,
        upgradedToTierName: targetName,
        upgradedAssetId: nextTierAsset?.id,
        minPriceUsdt: targetNextPrice,
        maxPriceUsdt: nextTierAsset?.maxPriceUsdt || roundUsdt(targetNextPrice * 2.5),
        midpointPrice: roundUsdt(targetNextPrice * 1.5),
        message: `🚀 ASSET NAIK TIER! Aset ${asset.name} menyentuh Harga Maksimum ($${maxPrice.toFixed(2)} USDT) dan BERHASIL NAIK KE TIER SELANJUTNYA: ${targetName} pada harga $${targetNextPrice.toFixed(2)} USDT!`,
      };
    } else {
      // SPLIT INTO 2 STOCKS & RESET TO MIDPOINT PRICE (SAME TIER)
      const newStockUnits = Math.max(1, asset.stockUnits ?? 1) * 2;
      return {
        nextPriceUsdt: midpointPrice,
        nextStockUnits: newStockUnits,
        nextCycleStep: 8, // Reset to middle cycle step
        isSplitTriggered: true,
        isTierUpgraded: false,
        minPriceUsdt: minPrice,
        maxPriceUsdt: maxPrice,
        midpointPrice,
        message: `⚡ ASSET SPLIT & REPO RESET! Harga Aset ${asset.name} menyentuh Harga Maksimum ($${maxPrice.toFixed(2)} USDT). Stok berhasil terbagi 2 unit untuk penjual (${asset.sellerName}) dengan Alamat Wallet tetap, & harga reset ke Harga Tengah ($${midpointPrice.toFixed(2)} USDT).`,
      };
    }
  }

  return {
    nextPriceUsdt: roundedNextPrice,
    nextStockUnits: asset.stockUnits ?? 1,
    nextCycleStep: nextStep,
    isSplitTriggered: false,
    isTierUpgraded: false,
    minPriceUsdt: minPrice,
    maxPriceUsdt: maxPrice,
    midpointPrice,
    message: `Aset ${asset.name} berhasil terjual! Harga naik dari $${currentPrice.toFixed(2)} USDT menjadi $${roundedNextPrice.toFixed(2)} USDT (+${profitPercent}% Profit).`,
  };
};
