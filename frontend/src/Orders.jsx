import React, { useEffect, useState } from 'react';

const API = 'http://localhost:4000';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [simulation, setSimulation] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/orders?limit=50`)
      .then(r => r.json())
      .then(setOrders)
      .catch(console.error);
  }, []);

  const viewOrder = (o) => {
    setSelected(o);
    setSimulation(null);
  };

  const simulate = async (transactionId) => {
    const res = await fetch(`${API}/api/simulate/${transactionId}`);
    const data = await res.json();
    setSimulation(data);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr', gap: '12px' }}>
      <div>
        <h2 style={{ fontSize: '16px', marginBottom: '8px' }}>Orders (sample)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr>
              <th style={th}>Transaction ID</th>
              <th style={th}>Reference Number</th>
              <th style={th}>Billing Type</th>
              <th style={th}>Status</th>
              <th style={th}>Total Item Qty</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.transactionId}>
                <td style={td}>{o.transactionId}</td>
                <td style={td}>{o.fields['Reference Number']}</td>
                <td style={td}>{o.fields['Billing Type']}</td>
                <td style={td}>{o.fields['Status']}</td>
                <td style={td}>{o.metrics.totalItemQty}</td>
                <td style={td}>
                  <button style={btn} onClick={() => viewOrder(o)}>View</button>
                  <button style={btn} onClick={() => simulate(o.transactionId)}>Simulate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        {selected && (
          <div style={{ marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '4px' }}>
              Order details: {selected.transactionId}
            </h3>
            <pre style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto', background: '#fafafa', padding: '8px' }}>
{JSON.stringify(selected.fields, null, 2)}
            </pre>
          </div>
        )}

        {simulation && (
          <div>
            <h3 style={{ fontSize: '14px', marginBottom: '4px' }}>
              Simulation result: {simulation.result.transactionId}
            </h3>
            <pre style={{ fontSize: '11px', maxHeight: '200px', overflow: 'auto', background: '#f0f0f0', padding: '8px' }}>
{JSON.stringify(simulation.result, null, 2)}
            </pre>
          </div>
        )}
      </div>
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

const btn = {
  padding: '2px 6px',
  marginRight: '4px',
  fontSize: '11px',
  cursor: 'pointer'
};
