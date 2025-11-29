// backend/rulesEngine.js

function evaluateCondition(order, cond) {
  const raw = order.fields[cond.field];
  const v = raw !== undefined && raw !== null ? String(raw) : '';
  const target = cond.value !== undefined && cond.value !== null ? String(cond.value) : '';

  switch (cond.operator) {
    case 'equals':
      return v === target;
    case 'not_equals':
      return v !== target;
    case 'contains':
      return v.includes(target);
    case 'not_contains':
      return !v.includes(target);
    case 'greater_than':
      return Number(v) > Number(target);
    case 'greater_or_equal':
      return Number(v) >= Number(target);
    case 'less_than':
      return Number(v) < Number(target);
    case 'less_or_equal':
      return Number(v) <= Number(target);
    case 'is_empty':
      return v.trim() === '' || v === 'null' || v === 'None' || v === 'NaN';
    case 'is_not_empty':
      return !(v.trim() === '' || v === 'null' || v === 'None' || v === 'NaN');
    default:
      return false;
  }
}

function ruleMatches(order, rule) {
  if (!rule.enabled) return false;
  if (!rule.conditions || rule.conditions.length === 0) return true; // no conditions = match all
  return rule.conditions.every(c => evaluateCondition(order, c));
}

function computeCharge(order, charge) {
  const rate = Number(charge.rate || 0);
  const mode = charge.mode;

  if (mode === 'flat') {
    return rate;
  }
  if (mode === 'per_sku') {
    return rate * Number(order.metrics.lineItems || 0);
  }
  if (mode === 'per_unit') {
    return rate * Number(order.metrics.totalItemQty || 0);
  }
  if (mode === 'per_package') {
    return rate * Number(order.metrics.packages || 0);
  }
  return 0;
}

function evaluateOrder(order, rules) {
  const activeRules = (rules || [])
    .filter(r => r.enabled)
    .sort((a, b) => (a.priority || 0) - (b.priority || 0));

  for (const rule of activeRules) {
    if (!ruleMatches(order, rule)) continue;

    if (rule.effect === 'skip') {
      return {
        transactionId: order.transactionId,
        total: 0,
        skipped: true,
        ruleId: rule.id,
        ruleName: rule.name,
        breakdown: []
      };
    }

    if (rule.effect === 'charges') {
      const breakdown = (rule.charges || []).map(ch => ({
        id: ch.id,
        label: ch.label,
        mode: ch.mode,
        rate: Number(ch.rate || 0),
        amount: computeCharge(order, ch)
      }));

      const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

      return {
        transactionId: order.transactionId,
        total,
        skipped: false,
        ruleId: rule.id,
        ruleName: rule.name,
        breakdown
      };
    }
  }

  return {
    transactionId: order.transactionId,
    total: 0,
    skipped: false,
    ruleId: null,
    ruleName: null,
    breakdown: [],
    note: 'No matching rule'
  };
}

module.exports = {
  evaluateOrder
};
