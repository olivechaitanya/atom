export function calcProgress(uomType, target, actual, targetDate, completionStatus) {
  if (uomType === 'ZERO_BASED') return actual === 0 ? 100 : 0;
  if (uomType === 'TIMELINE') return completionStatus === 'COMPLETED' ? 100 : completionStatus === 'ON_TRACK' ? 50 : 0;
  if (!target || target === 0) return 0;
  if (actual === undefined || actual === null) return 0;
  return Math.min(Math.round((actual / target) * 100), 100);
}

export function calcWeightedScore(goals, quarter) {
  let total = 0;
  for (const g of goals) {
    const ach = g.achievements?.find(a => a.quarter === quarter);
    const p = calcProgress(g.uomType, g.targetValue, ach?.actualValue, g.targetDate, ach?.status);
    total += (p * g.weightage) / 100;
  }
  return Math.round(total);
}

export function validateWeightage(goals) {
  const total = goals.reduce((s, g) => s + (g.weightage || 0), 0);
  const errors = [];
  if (total !== 100) errors.push(`Total weightage is ${total}% — must equal exactly 100%`);
  if (goals.length > 8) errors.push('Maximum 8 goals per employee');
  goals.forEach(g => { if (g.weightage < 10) errors.push('Each goal must have at least 10% weightage'); });
  return { valid: errors.length === 0, total, errors };
}
