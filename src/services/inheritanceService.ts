/**
 * Islamic Inheritance Service
 * Calculates shares based on Quran and Sunnah rules.
 * Handles Asaba (العصبة), Fardh (الفرض), Hajb (الحجب), Awl (العول), and Radd (الرد).
 */

export type HeirType =
  | "husband" | "wife"
  | "father" | "mother"
  | "grandfather" | "grandmother"
  | "son" | "daughter"
  | "grandson" | "granddaughter"
  | "brother" | "sister"
  | "brother_paternal" | "sister_paternal"
  | "brother_maternal" | "sister_maternal"
  | "uncle";

export interface HeirInput {
  type: HeirType;
  count: number;
}

export interface ShareResult {
  type: HeirType;
  label: string;
  share: number; // The actual monetary value
  percentage: number; // 0-100%
  explanation: string; // The reason for this share
}

export interface CalculationResult {
  shares: ShareResult[];
  calculations: { step: string; details: string }[];
}

export function calculateInheritance(totalAmount: number, heirsInput: HeirInput[], lang: "ar" | "en", currSymbol: string): CalculationResult {
  const calculations: { step: string; details: string }[] = [];
  let remaining = totalAmount;

  if (totalAmount <= 0 || heirsInput.length === 0) {
    return { shares: [], calculations: [] };
  }

  // Helper to count heirs easily
  const getCount = (type: HeirType) => heirsInput.find((h) => h.type === type)?.count || 0;
  
  const hasType = (type: HeirType) => getCount(type) > 0;
  
  const labels: Record<HeirType, {ar: string, en: string}> = {
    husband: { ar: "زوج", en: "Husband" },
    wife: { ar: "زوجة", en: "Wife" },
    father: { ar: "أب", en: "Father" },
    mother: { ar: "أم", en: "Mother" },
    grandfather: { ar: "جد", en: "Grandfather" },
    grandmother: { ar: "جدة", en: "Grandmother" },
    son: { ar: "ابن", en: "Son" },
    daughter: { ar: "بنت", en: "Daughter" },
    grandson: { ar: "ابن ابن", en: "Grandson" },
    granddaughter: { ar: "بنت ابن", en: "Granddaughter" },
    brother: { ar: "أخ شقيق", en: "Full Brother" },
    sister: { ar: "أخت شقيقة", en: "Full Sister" },
    brother_paternal: { ar: "أخ لأب", en: "Paternal Brother" },
    sister_paternal: { ar: "أخت لأب", en: "Paternal Sister" },
    brother_maternal: { ar: "أخ لأم", en: "Maternal Brother" },
    sister_maternal: { ar: "أخت لأم", en: "Maternal Sister" },
    uncle: { ar: "عم شقيق", en: "Paternal Uncle" }
  };

  // 1. Identify active heirs after Hajb (blocking)
  const activeCounts: Record<string, number> = {};
  
  // Basic Blocking Rules (Hajb)
  for (const h of heirsInput) {
    if (h.count === 0) continue;
    let isBlocked = false;
    let blockedBy = "";

    switch (h.type) {
      case "grandfather":
        if (hasType("father")) { isBlocked = true; blockedBy = labels.father[lang]; }
        break;
      case "grandmother":
        if (hasType("mother")) { isBlocked = true; blockedBy = labels.mother[lang]; }
        break;
      case "grandson":
        if (hasType("son")) { isBlocked = true; blockedBy = labels.son[lang]; }
        break;
      case "granddaughter":
        if (hasType("son") || getCount("daughter") >= 2) { 
          // Granddaughter is blocked by son, OR by 2+ daughters (unless there's a grandson to 'asab' her, but keeping it simple based on strict rules)
          if (!hasType("grandson")) {
            isBlocked = true;
            blockedBy = hasType("son") ? labels.son[lang] : labels.daughter[lang];
          }
        }
        break;
      case "brother":
      case "sister":
        if (hasType("son") || hasType("grandson") || hasType("father")) {
          isBlocked = true;
          blockedBy = hasType("son") ? labels.son[lang] : (hasType("father") ? labels.father[lang] : labels.grandson[lang]);
        }
        break;
      case "brother_paternal":
      case "sister_paternal":
        if (hasType("son") || hasType("grandson") || hasType("father") || hasType("brother")) {
          isBlocked = true;
          blockedBy = hasType("son") ? labels.son[lang] : (hasType("father") ? labels.father[lang] : (hasType("brother") ? labels.brother[lang] : labels.grandson[lang]));
        } else if (getCount("sister") >= 2 && !hasType("brother_paternal")) {
          isBlocked = true;
          blockedBy = labels.sister[lang];
        }
        break;
      case "brother_maternal":
      case "sister_maternal":
        if (hasType("son") || hasType("daughter") || hasType("grandson") || hasType("granddaughter") || hasType("father") || hasType("grandfather")) {
          isBlocked = true;
          blockedBy = lang === "ar" ? "الفرع الوارث أو الأصل الوارث الذكر" : "Direct descendants or male ascendants";
        }
        break;
      case "uncle":
        if (hasType("son") || hasType("grandson") || hasType("father") || hasType("grandfather") || hasType("brother") || hasType("brother_paternal")) {
          isBlocked = true;
          blockedBy = lang === "ar" ? "عصبة أقرب" : "Closer male relatives";
        }
        break;
    }

    if (isBlocked) {
      calculations.push({
        step: lang === "ar" ? "حجب (منع)" : "Hajb (Blocking)",
        details: lang === "ar" ? `${labels[h.type].ar} محجوب لوجود ${blockedBy}` : `${labels[h.type].en} is blocked by ${blockedBy}`
      });
    } else {
      activeCounts[h.type] = h.count;
    }
  }

  // Basic flags
  const hasMaleDescendant = !!activeCounts.son || !!activeCounts.grandson;
  const hasFemaleDescendant = !!activeCounts.daughter || !!activeCounts.granddaughter;
  const hasAnyDescendant = hasMaleDescendant || hasFemaleDescendant;
  const siblingCount = (activeCounts.brother||0) + (activeCounts.sister||0) + 
                       (activeCounts.brother_paternal||0) + (activeCounts.sister_paternal||0) + 
                       (activeCounts.brother_maternal||0) + (activeCounts.sister_maternal||0);
  const hasMultipleSiblings = siblingCount >= 2;

  // We will calculate fractional shares first
  const sharesMap: Record<string, { fraction: number, reason: string }> = {};

  // 1. Spouses
  if (activeCounts.husband) {
    const frac = hasAnyDescendant ? 1/4 : 1/2;
    sharesMap.husband = { fraction: frac, reason: hasAnyDescendant ? (lang === "ar" ? "الربع لوجود فرع وارث" : "1/4 due to descendants") : (lang === "ar" ? "النصف لعدم وجود فرع وارث" : "1/2 due to no descendants") };
  }
  if (activeCounts.wife) {
    const frac = hasAnyDescendant ? 1/8 : 1/4;
    sharesMap.wife = { fraction: frac, reason: hasAnyDescendant ? (lang === "ar" ? "الثمن لوجود فرع وارث" : "1/8 due to descendants") : (lang === "ar" ? "الربع لعدم وجود فرع وارث" : "1/4 due to no descendants") };
  }

  // 2. Parents & Grandparents
  if (activeCounts.father) {
    if (hasMaleDescendant) {
      sharesMap.father = { fraction: 1/6, reason: lang === "ar" ? "السدس لوجود فرع وارث ذكر" : "1/6 due to male descendants" };
    } else if (hasFemaleDescendant) {
      sharesMap.father = { fraction: 1/6, reason: lang === "ar" ? "السدس (والباقي تعصيباً)" : "1/6 (and remainder by Asaba)" };
    }
    // If no descendants, father is pure Asaba (calculated later)
  } else if (activeCounts.grandfather) {
     if (hasMaleDescendant) {
      sharesMap.grandfather = { fraction: 1/6, reason: lang === "ar" ? "السدس" : "1/6" };
    } else if (hasFemaleDescendant) {
      sharesMap.grandfather = { fraction: 1/6, reason: lang === "ar" ? "السدس (والباقي تعصيباً)" : "1/6 (and remainder)" };
    }
  }

  if (activeCounts.mother) {
    const frac = (hasAnyDescendant || hasMultipleSiblings) ? 1/6 : 1/3;
    sharesMap.mother = { fraction: frac, reason: (hasAnyDescendant || hasMultipleSiblings) ? (lang === "ar" ? "السدس لوجود فرع وارث أو إخوة" : "1/6 due to descendants or siblings") : (lang === "ar" ? "الثلث" : "1/3") };
  } else if (activeCounts.grandmother) {
    sharesMap.grandmother = { fraction: 1/6, reason: lang === "ar" ? "السدس" : "1/6" };
  }

  // 3. Daughters / Granddaughters (if no male counterpart to make them Asaba)
  if (activeCounts.daughter && !activeCounts.son) {
    const frac = activeCounts.daughter === 1 ? 1/2 : 2/3;
    sharesMap.daughter = { fraction: frac, reason: activeCounts.daughter === 1 ? (lang === "ar" ? "النصف" : "1/2") : (lang === "ar" ? "الثلثان" : "2/3") };
  } else if (activeCounts.granddaughter && !activeCounts.grandson && !activeCounts.son) {
    if (activeCounts.daughter === 1) { // Daughter took 1/2, granddaughter gets 1/6 to complete 2/3
      sharesMap.granddaughter = { fraction: 1/6, reason: lang === "ar" ? "السدس تكملة الثلثين" : "1/6 to complete 2/3" };
    } else if (!activeCounts.daughter) {
      const frac = activeCounts.granddaughter === 1 ? 1/2 : 2/3;
      sharesMap.granddaughter = { fraction: frac, reason: activeCounts.granddaughter === 1 ? (lang === "ar" ? "النصف" : "1/2") : (lang === "ar" ? "الثلثان" : "2/3") };
    }
  }

  // 4. Sisters (if no brothers to make them Asaba, and no descendants/ascendants blocking them)
  if (activeCounts.sister && !activeCounts.brother && !hasAnyDescendant && !activeCounts.father && !activeCounts.grandfather) {
     const frac = activeCounts.sister === 1 ? 1/2 : 2/3;
     sharesMap.sister = { fraction: frac, reason: activeCounts.sister === 1 ? (lang === "ar" ? "النصف" : "1/2") : (lang === "ar" ? "الثلثان" : "2/3") };
  } else if (activeCounts.sister_paternal && !activeCounts.brother_paternal && !activeCounts.brother && !hasAnyDescendant && !activeCounts.father) {
     if (activeCounts.sister === 1) {
       sharesMap.sister_paternal = { fraction: 1/6, reason: lang === "ar" ? "السدس تكملة الثلثين" : "1/6 to complete 2/3" };
     } else if (!activeCounts.sister) {
       const frac = activeCounts.sister_paternal === 1 ? 1/2 : 2/3;
       sharesMap.sister_paternal = { fraction: frac, reason: activeCounts.sister_paternal === 1 ? (lang === "ar" ? "النصف" : "1/2") : (lang === "ar" ? "الثلثان" : "2/3") };
     }
  }

  // 5. Maternal Siblings
  const maternalCount = (activeCounts.brother_maternal || 0) + (activeCounts.sister_maternal || 0);
  if (maternalCount > 0) { // already filtered from descendants/ascendants
    const frac = maternalCount === 1 ? 1/6 : 1/3; // They share it equally regardless of gender
    if (activeCounts.brother_maternal) sharesMap.brother_maternal = { fraction: frac * (activeCounts.brother_maternal / maternalCount), reason: lang === "ar" ? "مشاركة في فرض الإخوة لأم" : "Share of maternal siblings" };
    if (activeCounts.sister_maternal) sharesMap.sister_maternal = { fraction: frac * (activeCounts.sister_maternal / maternalCount), reason: lang === "ar" ? "مشاركة في فرض الإخوة لأم" : "Share of maternal siblings" };
  }


  // Calculate total fractions to handle Awl (العول)
  let totalFractions = 0;
  for (const key in sharesMap) {
    totalFractions += sharesMap[key].fraction;
  }

  let baseMultiplier = 1;
  if (totalFractions > 1) {
    // Awl (العول) - the shares exceed 1 (total estate), so we proportionally reduce everyone
    baseMultiplier = 1 / totalFractions;
    calculations.push({
      step: lang === "ar" ? "العول" : "Awl (Proportional Reduction)",
      details: lang === "ar" ? `مجموع السهام تجاوز 1، تم تطبيق العول بتصغير الأنصبة نسبياً (المجموع: ${totalFractions.toFixed(2)})` : `Total fractions exceeded 1. Applied Awl to reduce shares proportionally.`
    });
  }

  // Apply fixed shares
  const results: ShareResult[] = [];
  let givenFractions = 0;

  for (const [key, data] of Object.entries(sharesMap)) {
    const type = key as HeirType;
    const count = activeCounts[type];
    const finalFrac = data.fraction * baseMultiplier;
    givenFractions += finalFrac;
    
    const moneyShare = totalAmount * finalFrac;
    remaining -= moneyShare;

    results.push({
      type,
      label: `${labels[type][lang]} (${count})`,
      share: moneyShare,
      percentage: finalFrac * 100,
      explanation: data.reason
    });

    calculations.push({
      step: lang === "ar" ? `فرض ${labels[type].ar}` : `${labels[type].en} Share`,
      details: `${data.reason}: ${moneyShare.toFixed(2)} ${currSymbol}`
    });
  }

  // Asaba (العصبة) - the remainder
  // Determine who gets the Asaba. Order of priority:
  // 1. Son(s) & Daughter(s)
  // 2. Grandson(s) & Granddaughter(s)
  // 3. Father
  // 4. Grandfather
  // 5. Brother(s) & Sister(s)
  // 6. Paternal Brother(s) & Sister(s)
  // 7. Uncle(s)

  let remainderFrac = 1 - givenFractions;

  // Due to Awl or floating point, remainder might be tiny or 0
  if (remainderFrac > 0.0001) {
    let asabaReceivers: { type: HeirType, weight: number }[] = [];
    let asabaReason = "";

    if (activeCounts.son) {
      asabaReceivers.push({ type: "son", weight: 2 * activeCounts.son });
      if (activeCounts.daughter) {
        asabaReceivers.push({ type: "daughter", weight: 1 * activeCounts.daughter });
      }
      asabaReason = lang === "ar" ? "تعصيباً بالغير (للذكر مثل حظ الأنثيين)" : "Asaba: 2:1 ratio for male:female";
    } else if (activeCounts.grandson) {
      asabaReceivers.push({ type: "grandson", weight: 2 * activeCounts.grandson });
      if (activeCounts.granddaughter) {
        asabaReceivers.push({ type: "granddaughter", weight: 1 * activeCounts.granddaughter });
      }
      asabaReason = lang === "ar" ? "تعصيباً بالغير" : "Asaba: 2:1 ratio";
    } else if (activeCounts.father) {
      asabaReceivers.push({ type: "father", weight: 1 }); // Father takes the rest
      asabaReason = lang === "ar" ? "تعصيباً بالنفس" : "Asaba: Father takes remainder";
    } else if (activeCounts.grandfather) {
      asabaReceivers.push({ type: "grandfather", weight: 1 });
      asabaReason = lang === "ar" ? "تعصيباً بالنفس" : "Asaba: Grandfather takes remainder";
    } else if (activeCounts.brother) {
      asabaReceivers.push({ type: "brother", weight: 2 * activeCounts.brother });
      if (activeCounts.sister) {
        asabaReceivers.push({ type: "sister", weight: 1 * activeCounts.sister });
      }
      asabaReason = lang === "ar" ? "تعصيباً بالغير (للذكر مثل حظ الأنثيين)" : "Asaba: 2:1 ratio";
    } else if (activeCounts.brother_paternal) {
      asabaReceivers.push({ type: "brother_paternal", weight: 2 * activeCounts.brother_paternal });
      if (activeCounts.sister_paternal) {
        asabaReceivers.push({ type: "sister_paternal", weight: 1 * activeCounts.sister_paternal });
      }
      asabaReason = lang === "ar" ? "تعصيباً بالغير" : "Asaba: 2:1 ratio";
    } else if (activeCounts.uncle) {
      asabaReceivers.push({ type: "uncle", weight: activeCounts.uncle });
      asabaReason = lang === "ar" ? "تعصيباً بالنفس" : "Asaba: Uncle takes remainder";
    } else if (activeCounts.daughter || activeCounts.granddaughter || activeCounts.sister || activeCounts.sister_paternal) {
       // Sister with Daughter becomes Asaba (الأخوات مع البنات عصبات)
       if (activeCounts.daughter && activeCounts.sister) {
          asabaReceivers.push({ type: "sister", weight: activeCounts.sister });
          asabaReason = lang === "ar" ? "عصبة مع الغير (الأخوات مع البنات)" : "Asaba with others (Sisters with Daughters)";
       } else if (activeCounts.daughter && activeCounts.sister_paternal) {
         asabaReceivers.push({ type: "sister_paternal", weight: activeCounts.sister_paternal });
         asabaReason = lang === "ar" ? "عصبة مع الغير" : "Asaba with others";
       }
    }

    if (asabaReceivers.length > 0) {
      const totalWeight = asabaReceivers.reduce((sum, r) => sum + r.weight, 0);
      calculations.push({
        step: lang === "ar" ? "التعصيب" : "Asaba (Remainder)",
        details: `${asabaReason}. الباقي: ${(totalAmount * remainderFrac).toFixed(2)} ${currSymbol}`
      });

      for (const receiver of asabaReceivers) {
        const type = receiver.type;
        const count = activeCounts[type];
        const fractionOfRemainder = receiver.weight / totalWeight;
        const finalFrac = remainderFrac * fractionOfRemainder;
        const moneyShare = totalAmount * finalFrac;

        // check if this heir already has a share (like father taking 1/6 AND remainder)
        const existing = results.find(r => r.type === type);
        if (existing) {
          existing.share += moneyShare;
          existing.percentage += finalFrac * 100;
          existing.explanation += ` + ${asabaReason}`;
        } else {
          results.push({
            type,
            label: `${labels[type][lang]} (${count})`,
            share: moneyShare,
            percentage: finalFrac * 100,
            explanation: asabaReason
          });
        }
      }
      remainderFrac = 0; // Remainder distributed
    } else {
      // Radd (الرد) - If there's a remainder and no Asaba, it's given back to Fardh owners (except spouses)
      const raddEligible = results.filter(r => r.type !== "husband" && r.type !== "wife");
      if (raddEligible.length > 0) {
        const eligibleTotalFrac = raddEligible.reduce((sum, r) => sum + (r.percentage / 100), 0);
        calculations.push({
          step: lang === "ar" ? "الرد" : "Radd (Return)",
          details: lang === "ar" ? `يوجد فائض ولا توجد عصبة. يعاد الباقي لأصحاب الفروض (ما عدا الزوجين)` : `Remainder exists with no Asaba. Returned to Fardh owners.`
        });

        for (const eligible of raddEligible) {
           const relativeFrac = (eligible.percentage / 100) / eligibleTotalFrac;
           const extraFrac = remainderFrac * relativeFrac;
           eligible.share += totalAmount * extraFrac;
           eligible.percentage += extraFrac * 100;
           eligible.explanation += lang === "ar" ? " (زائداً بالرد)" : " (+ Radd)";
        }
      } else {
         // Only spouses exist, remainder goes to Bayt al-Mal (Treasury) in classical Fiqh
         calculations.push({
          step: lang === "ar" ? "بيت المال" : "Bayt al-Mal",
          details: lang === "ar" ? `الباقي (${(totalAmount * remainderFrac).toFixed(2)}) يذهب لبيت المال لعدم وجود عصبة أو من يُرد عليه` : `Remainder goes to public treasury as no Asaba exists.`
        });
      }
    }
  }

  // Sort by share size (largest first)
  results.sort((a, b) => b.share - a.share);

  return { shares: results, calculations };
}
