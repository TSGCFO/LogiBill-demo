import React, { useEffect, useState } from 'react';

const API = 'http://localhost:4000';

export default function Simulator() {
  const [transactionId, setTransactionId] = useState('');
  const [singleResult, setSingleResult] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [loadingBatch, setLoadingBatch] = useState(false);

  const simulateSingle = async () => {
    if (!transactionId) return;
    const res = await fetch(`${API}/api/simulate/${transactionId}`);
    if (!res.ok) {
      alert('Order not found or error');
      return;
    }
    const data = await res.json();
    setSingleResult(data.result);
  };

  const simulateAll = async () => {
    setLoadingBatch(true);
    setBatchResults(null);
    const res = await fetch(`${API}/api/simulate`);
    const data = await res.json();
    setBatchResults(data);
    setLoadingBatch(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>Run simulation</h2>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '12px' }}>
          Transaction ID:
          <input
            style={{ border: '1px solid #ccc', borderRadius: '3px', padding: '4px', marginLeft: '4px', fontSize: '12px' }}
            value={transactionId}
            onChange={e => setTransactionId(e.target.value)}
            placeholder="e.g. 208155"
          />
        </label>
        <button
          style={{ marginLeft: '8px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
          onClick={simulateSingle}
        >
          Simulate single order
        </button>
      </div>

      {singleResult && (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '4px' }}>Single order result</h3>
          <pre style={{ fontSize: '11px', background: '#f0f0f0', padding: '8px', maxHeight: '200px', overflow: 'auto' }}>
{JSON.stringify(singleResult, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginBottom: '12px' }}>
        <button
          style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
          onClick={simulateAll}
        >
          {loadingBatch ? 'Running…' : 'Simulate all orders'}
        </button>
      </div>

      {batchResults && (
        <div>
          <h3 style={{ fontSize: '14px', marginBottom: '4px' }}>All orders summary</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr>
                <th style={th}>Transaction ID</th>
                <th style={th}>Total</th>
                <th style={th}>Skipped?</th>
                <th style={th}>Rule</th>
              </tr>
            </thead>
            <tbody>
              {batchResults.map(r => (
                <tr key={r.transactionId}>
                  <td style={td}>{r.transactionId}</td>
                  <td style={td}>{r.result.total}</td>
                  <td style={td}>{r.result.skipped ? 'Yes' : 'No'}</td>
                  <td style={td}>{r.result.ruleName || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = {
  borderBottom: '1px solid #ddd',
  padding: '4px',
  textAlign: 'left'
};

const td = {
  borderBottom: '1px solid #f2f2f2',
  padding: '4px'
};
