// --- CONSTANTS & HELPERS --- //

export const MMK_PER_CREDIT = 100;

export const calculateCreditCost = (price_mmk: number) => price_mmk / MMK_PER_CREDIT;
