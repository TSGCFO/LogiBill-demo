import React, { useEffect, useState } from 'react';

const API = 'http://localhost:4000';

const OPERATORS = [
  { value: 'equals', label: 'is exactly' },
  { value: 'not_equals', label: 'is not' },
  { value: 'contains', label: 'contains' },
  { value: 'not_contains', label: 'does not contain' },
  { value: 'greater_than', label: '>' },
  { value: 'greater_or_equal', label: '>=' },
  { value: 'less_than', label: '<' },
  { value: 'less_or_equal', label: '<=' },
  { value: 'is_empty', label: 'is empty' },
  { value: 'is_not_empty', label: 'is not empty' }
];

const CHARGE_MODES = [
  { value: 'flat', label: 'Per order (flat)' },
  { value: 'per_sku', label: 'Per SKU (Line Items)' },
  { value: 'per_unit', label: 'Per Unit (Total Item Qty)' },
  { value: 'per_package', label: 'Per Package' }
];

export default function RuleBuilder() {
  const [fields, setFields] = useState([]);
  const [rules, setRules] = useState([]);
  const [rule, setRule] = useState({
    name: '',
    priority: 100,
    enabled: true,
    effect: 'charges',
    conditions: [],
    charges: []
  });

  // Fetch sample order to infer available columns
  useEffect(() => {
    fetch(`${API}/api/orders?limit=1`)
      .then(r => r.json())
      .then(data => {
        const first = data[0];
        if (first && first.fields) {
          setFields(Object.keys(first.fields));
        }
      });

    fetch(`${API}/api/rules`)
      .then(r => r.json())
      .then(setRules);
  }, []);

  const updateCondition = (idx, patch) => {
    const next = [...rule.conditions];
    next[idx] = { ...next[idx], ...patch };
    setRule({ ...rule, conditions: next });
  };

  const addCondition = () => {
    setRule({
      ...rule,
      conditions: [...rule.conditions, { field: '', operator: 'equals', value: '' }]
    });
  };

  const removeCondition = (idx) => {
    const next = rule.conditions.filter((_, i) => i !== idx);
    setRule({ ...rule, conditions: next });
  };

  const updateCharge = (idx, patch) => {
    const next = [...rule.charges];
    next[idx] = { ...next[idx], ...patch };
    setRule({ ...rule, charges: next });
  };

  const addCharge = () => {
    setRule({
      ...rule,
      charges: [
        ...rule.charges,
        { id: `ch_${Date.now()}_${Math.random()}`, label: '', code: '', mode: 'flat', rate: 0 }
      ]
    });
  };

  const removeCharge = (idx) => {
    const next = rule.charges.filter((_, i) => i !== idx);
    setRule({ ...rule, charges: next });
  };

  const saveRule = async () => {
    const res = await fetch(`${API}/api/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    const saved = await res.json();
    setRules([...rules, saved]);
    alert(`Rule saved: ${saved.name}`);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '12px' }}>
      <div>
        <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>New rule</h2>

        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', fontSize: '12px' }}>Rule name</label>
          <input
            style={input}
            value={rule.name}
            onChange={e => setRule({ ...rule, name: e.target.value })}
            placeholder="e.g. Vasanti outbound consumer orders"
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px' }}>Priority</label>
            <input
              type="number"
              style={{ ...input, width: '80px' }}
              value={rule.priority}
              onChange={e => setRule({ ...rule, priority: Number(e.target.value) })}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px' }}>Effect</label>
            <select
              style={input}
              value={rule.effect}
              onChange={e => setRule({ ...rule, effect: e.target.value })}
            >
              <option value="charges">Apply charges</option>
              <option value="skip">Skip billing for this order</option>
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={rule.enabled}
              onChange={e => setRule({ ...rule, enabled: e.target.checked })}
              style={{ marginRight: '4px' }}
            />
            Enabled
          </label>
        </div>

        <section style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '13px' }}>Conditions (when does this rule apply?)</h3>
            <button onClick={addCondition} style={smallBtn}>+ Add condition</button>
          </div>

          {rule.conditions.length === 0 && (
            <p style={{ fontSize: '11px', color: '#666' }}>
              No conditions: rule applies to every order.
            </p>
          )}

          {rule.conditions.map((c, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <select
                style={{ ...input, flex: '1' }}
                value={c.field}
                onChange={e => updateCondition(idx, { field: e.target.value })}
              >
                <option value="">Choose field…</option>
                {fields.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>

              <select
                style={{ ...input, flex: '1' }}
                value={c.operator}
                onChange={e => updateCondition(idx, { operator: e.target.value })}
              >
                {OPERATORS.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>

              {c.operator !== 'is_empty' && c.operator !== 'is_not_empty' && (
                <input
                  style={{ ...input, flex: '1' }}
                  value={c.value || ''}
                  onChange={e => updateCondition(idx, { value: e.target.value })}
                  placeholder="Value"
                />
              )}

              <button style={smallBtnDanger} onClick={() => removeCondition(idx)}>X</button>
            </div>
          ))}
        </section>

        {rule.effect === 'charges' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '13px' }}>Charges</h3>
              <button onClick={addCharge} style={smallBtn}>+ Add charge</button>
            </div>

            {rule.charges.length === 0 && (
              <p style={{ fontSize: '11px', color: '#666' }}>
                Add base order fee, per SKU fee, per pick fee, etc.
              </p>
            )}

            {rule.charges.map((ch, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto', gap: '4px', marginTop: '4px' }}>
                <input
                  style={input}
                  placeholder="Label (e.g. Base order fee)"
                  value={ch.label}
                  onChange={e => updateCharge(idx, { label: e.target.value })}
                />
                <input
                  style={input}
                  placeholder="Code (optional)"
                  value={ch.code}
                  onChange={e => updateCharge(idx, { code: e.target.value })}
                />
                <select
                  style={input}
                  value={ch.mode}
                  onChange={e => updateCharge(idx, { mode: e.target.value })}
                >
                  {CHARGE_MODES.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <input
                  style={input}
                  type="number"
                  step="0.01"
                  placeholder="Rate"
                  value={ch.rate}
                  onChange={e => updateCharge(idx, { rate: Number(e.target.value) })}
                />
                <button style={smallBtnDanger} onClick={() => removeCharge(idx)}>X</button>
              </div>
            ))}
          </section>
        )}

        <div style={{ marginTop: '12px' }}>
          <button style={primaryBtn} onClick={saveRule}>
            Save rule
          </button>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>Existing rules</h2>
        {rules.length === 0 && (
          <p style={{ fontSize: '12px', color: '#666' }}>
            No rules yet. Create one on the left.
          </p>
        )}
        {rules.map(r => (
          <div key={r.id} style={{ border: '1px solid #eee', padding: '6px', marginBottom: '6px', fontSize: '12px' }}>
            <div><strong>{r.name}</strong> (priority {r.priority}, {r.enabled ? 'enabled' : 'disabled'})</div>
            <div>Effect: {r.effect}</div>
            <div>Conditions: {r.conditions ? r.conditions.length : 0}</div>
            <div>Charges: {r.charges ? r.charges.length : 0}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const input = {
  border: '1px solid #ccc',
  borderRadius: '3px',
  padding: '4px',
  fontSize: '12px',
  width: '100%',
  boxSizing: 'border-box'
};

const smallBtn = {
  padding: '2px 6px',
  borderRadius: '3px',
  border: '1px solid #ccc',
  background: '#f5f5f5',
  fontSize: '11px',
  cursor: 'pointer'
};

const smallBtnDanger = {
  ...smallBtn,
  borderColor: '#e57373',
  color: '#c62828'
};

const primaryBtn = {
  padding: '6px 12px',
  borderRadius: '4px',
  border: '1px solid #000',
  background: '#000',
  color: '#fff',
  fontSize: '12px',
  cursor: 'pointer'
};
