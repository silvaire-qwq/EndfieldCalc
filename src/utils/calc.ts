export function mainCalc(
  alreadyPass: number,
  readyStone: number,
  readyPass: number,
  clockStone: number,
  clockPass: number,
  readyTen: boolean,
  signEveryDay: boolean,
  taskEveryDay: boolean,
) {
  // 已垫的抽数 alreadyPass 不计入武器寻访相关计算（保底/武库/配额/武器点数）
  // 初始化变量
  let readyPre = 0;
  let signPass = 0;
  let signStone = 0;

  // 10抽前置奖励
  readyPre = readyTen ? 10 : 0;
  // 每日签到抽数
  signPass = signEveryDay ? 5 : 0;
  // 每日任务原石
  signStone = taskEveryDay ? 3400 : 0; // 200*17

  let errorVar = false;
  alreadyPass >= 80 ? errorVar = true : null; 

  // 现有总抽数（原石换算：500原石=1抽）
  const nowTotalPass =
    Math.trunc((readyStone + clockStone + signStone) / 500) +
    readyPre +
    signPass +
    readyPass +
    clockPass;

  // 所有抽数都可以用于材料兑换
  const convertibleForMaterial = nowTotalPass;

  // 新的总点数（30抽以上额外+10点）——以可兑换次数为准
  let newTotalBrc =
    convertibleForMaterial >= 30 ? convertibleForMaterial + 10 : convertibleForMaterial;

  // 红色材料兑换抽数（基于 newTotalBrc 计算）
  const redPass = Math.trunc((Math.trunc(newTotalBrc / 10) * 10) / 25);

  // 修正蓝色材料兑换抽数逻辑（基于 newTotalBrc）
  const blueMaterial =
    Math.trunc(newTotalBrc / 10) * 20 +
    (newTotalBrc - Math.trunc(newTotalBrc / 10)) * 5;
  let bluePass = Math.trunc(blueMaterial / 75);
  bluePass = Math.min(bluePass, 5);

  // 兑换后计入抽数的总计（用于保底判断） —— 不包含 alreadyPass（用于武器寻访相关计算）
  const afterCalcBiggest = nowTotalPass + redPass + bluePass;

  // 为小保底单独计算：小保底要包含 alreadyPass
  const afterCalcIncludingAlready = afterCalcBiggest + alreadyPass;

  // 小/大保底差值（用于界面显示）
  // littleTotal（到下次小保底）需要包含 alreadyPass
  const littleTotal = 80 - afterCalcIncludingAlready;
  // grandTotal（到下次大保底）保持不包含 alreadyPass（如你要求）
  const grandTotal = 120 - afterCalcBiggest;

  // ======================
  // 只修改这里：小保底逻辑
  // ======================
  const totalDrawsForSmall = afterCalcIncludingAlready;
  const smallPityCount = Math.floor(totalDrawsForSmall / 80);
  let drawsToNextSmall: number;

  if (smallPityCount === 0) {
    // 第一次小保底：80
    drawsToNextSmall = 80 - (totalDrawsForSmall % 80);
  } else if (smallPityCount === 1) {
    // 第二次小保底：120
    const used = totalDrawsForSmall - 80;
    drawsToNextSmall = 120 - used;
  } else {
    // 第三次及以后：回到80循环
    const used = totalDrawsForSmall - (80 + 120);
    drawsToNextSmall = 80 - (used % 80);
  }

  // --- 计算大保底（序列：120, 240, 之后每240） ---
  // 仍基于不包含 alreadyPass 的 totalDraws（用于武器寻访相关的保底统计）
  const totalDrawsForBig = afterCalcBiggest;
  let bigPityCount = 0;
  if (totalDrawsForBig >= 120) bigPityCount++;
  if (totalDrawsForBig >= 240) bigPityCount++;
  if (totalDrawsForBig > 240) {
    bigPityCount += Math.floor((totalDrawsForBig - 240) / 240);
  }

  let nextBigThreshold = 120;
  if (totalDrawsForBig < 120) {
    nextBigThreshold = 120;
  } else if (totalDrawsForBig < 240) {
    nextBigThreshold = 240;
  } else {
    nextBigThreshold = 240;
    while (nextBigThreshold <= totalDrawsForBig) {
      nextBigThreshold += 240;
    }
  }
  const drawsToNextBig = nextBigThreshold - totalDrawsForBig;

  // --- 武库配额计算 ---
  // 要求：第2次及以后大保底不再给武库配额（但仍计入兑换票据/抽数统计）
  const bigPityExcluded = Math.max(0, bigPityCount - 1);

  // 现在所有抽数都计入配额：使用 afterCalcBiggest（不包含 alreadyPass），但排除第2次及以后大保底的贡献
  const weaponEligibleBrc = Math.max(0, afterCalcBiggest - bigPityExcluded);

  // 配额点数规则：非10的倍数每抽20点，10的倍数额外 +200（等价：20*N + 180*floor(N/10)）
  const weaponPoints =
    20 * weaponEligibleBrc + 180 * Math.floor(weaponEligibleBrc / 10);

  // 每一次小保底 +1800，且第一次大保底 +1800（如需改为2000可再调整）
  // 这里的 pity 也基于不包含 alreadyPass 的计数（保持武器寻访不计 alreadyPass）
  const extraFromPity = Math.floor(totalDrawsForBig / 80) * 1800 + (bigPityCount >= 1 ? 1800 : 0);

  const weaponPointsWithPity = weaponPoints + extraFromPity;

  // 1980 点 = 1 次武器寻访
  const newWeaponNum = Math.floor(weaponPointsWithPity / 1980);

  return {
    afterCalcBiggest,
    afterCalcIncludingAlready,
    littleTotal,
    grandTotal,
    newWeaponNum,
    // 新增返回字段用于 UI 显示
    smallPityCount,
    drawsToNextSmall,
    bigPityCount,
    drawsToNextBig,
    // 辅助输出（可选）
    weaponEligibleBrc,
    weaponPoints,
    extraFromPity,
    weaponPointsWithPity,
    bluePass,
    redPass,
    nowTotalPass,
    errorVar
  };
}
