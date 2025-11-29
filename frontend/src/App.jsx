import React, { useState } from 'react';
import Orders from './Orders.jsx';
import RuleBuilder from './RuleBuilder.jsx';
import Simulator from './Simulator.jsx';

const TABS = [
  { id: 'orders', label: 'Orders' },
  { id: 'rules', label: 'Rule Builder' },
  { id: 'sim', label: 'Simulator' }
];

export default function App() {
  const [tab, setTab] = useState('orders');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '16px' }}>
      <h1 style={{ fontSize: '20px', marginBottom: '16px' }}>
        Vasanti Outbound Billing Demo
      </h1>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              background: tab === t.id ? '#000' : '#f5f5f5',
              color: tab === t.id ? '#fff' : '#000',
              cursor: 'pointer'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ border: '1px solid #eee', borderRadius: '4px', padding: '12px' }}>
        {tab === 'orders' && <Orders />}
        {tab === 'rules' && <RuleBuilder />}
        {tab === 'sim' && <Simulator />}
      </div>
    </div>
  );
}
