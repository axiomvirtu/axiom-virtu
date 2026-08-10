import { DigitalAsset } from '../types';
import { roundUsdt, generate15CycleSimulation, calculateNextAssetTradeState, determineSmartMaxPriceAction } from '../utils/cycleSimulation';

export interface PromotionEligibility {
  isMaxPriceReached: boolean;
  currentPrice: number;
  maxPriceThreshold: number;
  maxPriceAction: 'SPLIT_SAME_TIER' | 'UPGRADE_NEXT_TIER';
  smartEvaluationReason?: string;
  nextTierTarget?: {
    id?: string;
    name: string;
    estimatedStartPrice: number;
  };
  recommendationMessage: string;
}

export interface AssetPromotionResult {
  updatedAsset: DigitalAsset;
  isPromoted: boolean;
  promotionType: 'TIER_UPGRADE' | 'STOCK_SPLIT' | 'NORMAL_STEP';
  previousPrice: number;
  newPrice: number;
  previousCycleStep: number;
  newCycleStep: number;
  targetTierName?: string;
  targetAssetId?: string;
  notificationTitle: string;
  notificationMessage: string;
}

export interface AssetTierGroup {
  tierLevel: number;
  tierName: string;
  minPriceRange: number;
  maxPriceRange: number;
  assets: DigitalAsset[];
}

/**
 * AssetManager Utility Service
 * Handles promotion of digital assets to higher price tiers or stock splits upon reaching max price threshold.
 */
export class AssetManager {
  /**
   * Resolves the target higher-tier asset for a given asset when UPGRADE_NEXT_TIER is triggered
   */
  static resolveNextTierAsset(asset: DigitalAsset, allAssets: DigitalAsset[] = []): DigitalAsset | undefined {
    // 1. Check explicit nextTierAssetId
    if (asset.nextTierAssetId) {
      const explicit = allAssets.find((a) => a.id === asset.nextTierAssetId);
      if (explicit) return explicit;
    }

    // 2. Automatic lookup: find asset with higher minimum price
    const currentMin = asset.minPriceUsdt || asset.priceUsdt;
    const candidates = allAssets
      .filter((a) => a.id !== asset.id && (a.minPriceUsdt || a.priceUsdt) > currentMin)
      .sort((a, b) => (a.minPriceUsdt || a.priceUsdt) - (b.minPriceUsdt || b.priceUsdt));

    return candidates[0];
  }

  /**
   * Checks whether an asset is eligible for tier promotion or stock split
   */
  static checkPromotionEligibility(asset: DigitalAsset, allAssets: DigitalAsset[] = []): PromotionEligibility {
    const minPrice = asset.minPriceUsdt || asset.priceUsdt;
    const profitPercent = asset.dailyProfitPercent || 5;

    const smartEval = determineSmartMaxPriceAction(asset, allAssets);
    const action =
      asset.maxPriceAction === 'SPLIT_SAME_TIER' || asset.maxPriceAction === 'UPGRADE_NEXT_TIER'
        ? asset.maxPriceAction
        : smartEval.effectiveAction;

    const sim = generate15CycleSimulation(minPrice, profitPercent, minPrice, asset.maxPriceUsdt, action);
    const maxPriceThreshold = asset.maxPriceUsdt || sim.maxPrice;

    const currentPrice = asset.priceUsdt;
    const rawProfit = currentPrice * (profitPercent / 100);
    const nextPrice = roundUsdt(currentPrice + rawProfit);
    const isMaxPriceReached = nextPrice >= maxPriceThreshold || (asset.currentCycleStep || 1) >= 15;

    const nextTier = this.resolveNextTierAsset(asset, allAssets);
    const targetTierName = nextTier ? nextTier.name : `${asset.name} [Tier II Sovereign]`;
    const estimatedStartPrice = nextTier ? (nextTier.minPriceUsdt || nextTier.priceUsdt) : nextPrice;

    let recommendationMessage = 'Aset beroperasi pada siklus normal.';
    if (isMaxPriceReached) {
      if (action === 'UPGRADE_NEXT_TIER') {
        recommendationMessage = `Aset mencapai max price ($${maxPriceThreshold.toFixed(2)} USDT). ${smartEval.reasonMessage}`;
      } else {
        recommendationMessage = `Aset mencapai max price ($${maxPriceThreshold.toFixed(2)} USDT). ${smartEval.reasonMessage}`;
      }
    }

    return {
      isMaxPriceReached,
      currentPrice,
      maxPriceThreshold,
      maxPriceAction: action,
      smartEvaluationReason: smartEval.reasonMessage,
      nextTierTarget: {
        id: nextTier?.id,
        name: targetTierName,
        estimatedStartPrice,
      },
      recommendationMessage,
    };
  }

  /**
   * Executes promotion or trade advancement for an asset when sold
   */
  static promoteAssetToNextTier(asset: DigitalAsset, allAssets: DigitalAsset[] = []): AssetPromotionResult {
    const tradeState = calculateNextAssetTradeState(asset, allAssets);
    const previousPrice = asset.priceUsdt;
    const previousStep = asset.currentCycleStep || 1;

    let promotionType: 'TIER_UPGRADE' | 'STOCK_SPLIT' | 'NORMAL_STEP' = 'NORMAL_STEP';
    let notificationTitle = '✓ Penjualan Aset Berhasil!';

    if (tradeState.isSplitTriggered) {
      if (tradeState.isTierUpgraded) {
        promotionType = 'TIER_UPGRADE';
        notificationTitle = '🚀 PROMOSI TIER ASET TERTINGGI!';
      } else {
        promotionType = 'STOCK_SPLIT';
        notificationTitle = '⚡ REPO RESET & SPLIT 2X STOK!';
      }
    }

    const updatedAsset: DigitalAsset = {
      ...asset,
      name: tradeState.isTierUpgraded && tradeState.upgradedToTierName ? tradeState.upgradedToTierName : asset.name,
      priceUsdt: tradeState.nextPriceUsdt,
      stockUnits: tradeState.nextStockUnits,
      currentCycleStep: tradeState.nextCycleStep,
      minPriceUsdt: tradeState.minPriceUsdt,
      maxPriceUsdt: tradeState.maxPriceUsdt,
    };

    return {
      updatedAsset,
      isPromoted: tradeState.isSplitTriggered,
      promotionType,
      previousPrice,
      newPrice: tradeState.nextPriceUsdt,
      previousCycleStep: previousStep,
      newCycleStep: tradeState.nextCycleStep,
      targetTierName: tradeState.upgradedToTierName,
      targetAssetId: tradeState.upgradedAssetId,
      notificationTitle,
      notificationMessage: tradeState.message,
    };
  }

  /**
   * Groups and structures assets into price tier levels
   */
  static getTierHierarchy(allAssets: DigitalAsset[]): AssetTierGroup[] {
    const tierDefs = [
      { tierLevel: 1, tierName: 'Micro / Starter Tier', minPriceRange: 0, maxPriceRange: 50 },
      { tierLevel: 2, tierName: 'Standard Trade Tier', minPriceRange: 50, maxPriceRange: 200 },
      { tierLevel: 3, tierName: 'Elite Sovereign Tier', minPriceRange: 200, maxPriceRange: 1000 },
      { tierLevel: 4, tierName: 'Diamond Crown Tier', minPriceRange: 1000, maxPriceRange: Infinity },
    ];

    return tierDefs.map((def) => {
      const matching = allAssets.filter((a) => {
        const p = a.minPriceUsdt || a.priceUsdt;
        return p >= def.minPriceRange && p < def.maxPriceRange;
      });
      return {
        ...def,
        assets: matching,
      };
    });
  }

  /**
   * Simulates multi-cycle asset progression across tier promotions
   */
  static simulateAssetProgression(
    asset: DigitalAsset,
    stepsCount: number = 20,
    allAssets: DigitalAsset[] = []
  ): {
    history: {
      step: number;
      priceUsdt: number;
      cycleStep: number;
      stockUnits: number;
      event: string;
    }[];
    finalPrice: number;
    totalPromotions: number;
  } {
    let current = { ...asset };
    const history: {
      step: number;
      priceUsdt: number;
      cycleStep: number;
      stockUnits: number;
      event: string;
    }[] = [];

    let totalPromotions = 0;

    for (let i = 1; i <= stepsCount; i++) {
      const result = this.promoteAssetToNextTier(current, allAssets);
      if (result.isPromoted) {
        totalPromotions++;
      }

      let event = 'Trade Normal (+Profit)';
      if (result.promotionType === 'TIER_UPGRADE') {
        event = `🚀 Promosi Tier: ${result.targetTierName}`;
      } else if (result.promotionType === 'STOCK_SPLIT') {
        event = '⚡ Split 2x Stok & Midpoint Reset';
      }

      history.push({
        step: i,
        priceUsdt: result.newPrice,
        cycleStep: result.newCycleStep,
        stockUnits: result.updatedAsset.stockUnits || 1,
        event,
      });

      current = result.updatedAsset;
    }

    return {
      history,
      finalPrice: current.priceUsdt,
      totalPromotions,
    };
  }

  /**
   * Processes an unsold session for an asset stock.
   * If stock is unsold for 2 consecutive sessions (unsoldCyclesCount >= 2),
   * it enters the Admin Buyback Queue (isInAdminBuybackQueue = true)
   * so system will NOT auto-buy, requiring manual Admin decision.
   */
  static processUnsoldSession(asset: DigitalAsset): DigitalAsset {
    const currentUnsold = asset.unsoldCyclesCount || 0;
    const newUnsoldCount = currentUnsold + 1;
    const isEnqueuedForAdminBuyback = newUnsoldCount >= 2;

    return {
      ...asset,
      unsoldCyclesCount: newUnsoldCount,
      isInAdminBuybackQueue: isEnqueuedForAdminBuyback,
      adminBuybackStatus: isEnqueuedForAdminBuyback ? 'PENDING_ADMIN_BUYBACK' : (asset.adminBuybackStatus || 'NONE'),
    };
  }

  /**
   * Admin executes manual buyback of an asset stock from the queue
   */
  static executeAdminBuyback(asset: DigitalAsset): DigitalAsset {
    return {
      ...asset,
      unsoldCyclesCount: 0,
      isInAdminBuybackQueue: false,
      adminBuybackStatus: 'PURCHASED_BY_ADMIN',
      status: 'ACTIVE_HOLDING',
    };
  }

  /**
   * Admin declines buyback for an asset stock from the queue (returns to market or resets)
   */
  static declineAdminBuyback(asset: DigitalAsset): DigitalAsset {
    return {
      ...asset,
      unsoldCyclesCount: 0,
      isInAdminBuybackQueue: false,
      adminBuybackStatus: 'REJECTED_BY_ADMIN',
    };
  }
}
