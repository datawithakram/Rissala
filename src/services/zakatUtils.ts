export const GOLD_PRICE_PER_GRAM_DEFAULT = 300; // Default placeholder for SAR/Local currency
export const SILVER_PRICE_PER_GRAM = 3.5;

export const NISAB_GOLD_GRAMS = 85;
export const NISAB_SILVER_GRAMS = 595;

export const calculateZakatMoney = (amount: number, goldPrice: number = GOLD_PRICE_PER_GRAM_DEFAULT) => {
  const nisab = NISAB_GOLD_GRAMS * goldPrice;
  if (amount >= nisab) {
    return {
      isEligible: true,
      zakatAmount: amount * 0.025,
      nisabValue: nisab
    };
  }
  return {
    isEligible: false,
    zakatAmount: 0,
    nisabValue: nisab
  };
};

export const calculateZakatGold = (weightGrams: number, purity: 24 | 21 | 18) => {
  const equivalent24k = weightGrams * (purity / 24);
  if (equivalent24k >= NISAB_GOLD_GRAMS) {
    return {
      isEligible: true,
      zakatAmountGoldGrams: equivalent24k * 0.025,
      nisabThreshold: NISAB_GOLD_GRAMS
    };
  }
  return {
    isEligible: false,
    zakatAmountGoldGrams: 0,
    nisabThreshold: NISAB_GOLD_GRAMS
  };
};

export const calculateZakatAssets = (stocks: number, realEstateIncome: number, goldPrice: number = GOLD_PRICE_PER_GRAM_DEFAULT) => {
  const totalWealth = stocks + realEstateIncome;
  const nisab = NISAB_GOLD_GRAMS * goldPrice;
  if (totalWealth >= nisab) {
    return {
      isEligible: true,
      zakatAmount: totalWealth * 0.025,
      nisabValue: nisab
    };
  }
  return {
    isEligible: false,
    zakatAmount: 0,
    nisabValue: nisab
  };
};

// --- Livestock (An'am) Zakat Logic ---

export const calculateZakatCamels = (count: number) => {
  if (count < 5) return { isEligible: false, due: { ar: "لا شيء", en: "None" } };
  if (count < 10) return { isEligible: true, due: { ar: "شاة جذعة", en: "1 Sheep (yearling)" } };
  if (count < 15) return { isEligible: true, due: { ar: "شاتان", en: "2 Sheep" } };
  if (count < 20) return { isEligible: true, due: { ar: "3 شياه", en: "3 Sheep" } };
  if (count < 25) return { isEligible: true, due: { ar: "4 شياه", en: "4 Sheep" } };
  if (count < 36) return { isEligible: true, due: { ar: "بنت مخاض (ناقة لها سنة)", en: "1 Bint Makhad (1-year female camel)" } };
  if (count < 46) return { isEligible: true, due: { ar: "بنت لبون (ناقة لها سنتان)", en: "1 Bint Labun (2-year female camel)" } };
  if (count < 61) return { isEligible: true, due: { ar: "حقة (ناقة لها 3 سنوات)", en: "1 Hiqqah (3-year female camel)" } };
  if (count < 76) return { isEligible: true, due: { ar: "جذعة (ناقة لها 4 سنوات)", en: "1 Jadh'ah (4-year female camel)" } };
  if (count < 91) return { isEligible: true, due: { ar: "بنت لبون (2)", en: "2 Bint Labun" } };
  if (count < 121) return { isEligible: true, due: { ar: "حقتان (2)", en: "2 Hiqqah" } };
  
  const num50s = Math.floor(count / 50);
  const num40s = Math.floor((count % (num50s * 50)) / 40);
  return { 
    isEligible: true, 
    due: { 
      ar: `${num50s} حقة + ${num40s} بنت لبون`, 
      en: `${num50s} Hiqqah + ${num40s} Bint Labun` 
    } 
  };
};

export const calculateZakatCattle = (count: number) => {
  if (count < 30) return { isEligible: false, due: { ar: "لا شيء", en: "None" } };
  if (count < 40) return { isEligible: true, due: { ar: "تبيع أو تبيعة (له سنة)", en: "1 Tabi' (1-year calf)" } };
  if (count < 60) return { isEligible: true, due: { ar: "مسنة (لها سنتان)", en: "1 Musinnah (2-year cow)" } };
  
  const num30s = Math.floor(count / 30);
  return { 
    isEligible: true, 
    due: { 
      ar: `${num30s} تبيع (لكل 30)`, 
      en: `${num30s} Tabi' (per 30)` 
    } 
  };
};

export const calculateZakatSheep = (count: number) => {
  if (count < 40) return { isEligible: false, due: { ar: "لا شيء", en: "None" } };
  if (count < 121) return { isEligible: true, due: { ar: "شاة واحدة", en: "1 Sheep" } };
  if (count < 201) return { isEligible: true, due: { ar: "شاتان", en: "2 Sheep" } };
  if (count < 400) return { isEligible: true, due: { ar: "3 شياه", en: "3 Sheep" } };
  return { 
    isEligible: true, 
    due: { 
      ar: `${Math.floor(count / 100)} شياه (لكل 100)`, 
      en: `${Math.floor(count / 100)} Sheep (per 100)` 
    } 
  };
};
