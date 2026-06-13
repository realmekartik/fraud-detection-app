const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const Database = require('better-sqlite3');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve built frontend in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Initialize SQLite Database
const db = new Database(':memory:'); // Using memory for rapid prototyping
db.exec(`
  CREATE TABLE anomalies (
    id TEXT PRIMARY KEY,
    entity TEXT,
    type TEXT,
    risk INTEGER,
    status TEXT
  );

  CREATE TABLE kyc_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    account_number TEXT,
    bank_name TEXT,
    ifsc_code TEXT,
    aadhaar_number TEXT,
    mobile_number TEXT,
    address TEXT,
    capture_time TEXT
  );

  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    bank_id TEXT,
    branch_name TEXT,
    city TEXT
  );

  CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_username TEXT,
    search_input TEXT,
    timestamp TEXT
  );
  
  INSERT INTO anomalies (id, entity, type, risk, status) VALUES 
  ('TXN-8942', 'Unusual Patterns', 'Transaction Pattern Analysis', 98, 'Blocked'),
  ('TXN-8941', 'Untrusted Origin', 'Location & Device Changes', 92, 'Investigating'),
  ('TXN-8938', 'Smurfing Network', 'Unusual Money Flow', 85, 'Investigating'),
  ('TXN-8935', 'Hidden Fraud Link', 'Machine Learning Models', 71, 'Flagged'),
  ('TXN-8934', 'Limit Breachers', 'Rule-Based Triggers', 65, 'Investigating'),
  ('TXN-8933', 'Student Wealth Acct', 'KYC & Profile Mismatch', 60, 'Flagged'),
  ('TXN-8932', 'Suspicious Sub-node', 'Network Analysis', 55, 'Blocked'),
  ('TXN-8931', 'Rapid Funnel Pvt', 'Velocity Checks', 50, 'Investigating'),
  ('TXN-8930', 'AML Non-Compliant', 'Regulatory Compliance', 45, 'Flagged');

  INSERT INTO users (username, password, bank_id, branch_name, city) VALUES 
  ('admin@sbi.co.in', 'password', 'sbi', 'Connaught Place', 'New Delhi'),
  ('admin@hdfc.co.in', 'password', 'hdfc', 'Bandra West', 'Mumbai'),
  ('admin@pnb.co.in', 'password', 'pnb', 'Sector 17', 'Chandigarh'),
  ('admin@bob.co.in', 'password', 'bob', 'Alkapuri', 'Vadodara'),
  ('admin@canara.co.in', 'password', 'canara', 'MG Road', 'Bengaluru'),
  ('admin@union.co.in', 'password', 'union', 'Nariman Point', 'Mumbai'),
  ('admin@boi.co.in', 'password', 'boi', 'Dadar', 'Mumbai'),
  ('admin@indian.co.in', 'password', 'indian', 'Royapettah', 'Chennai'),
  ('admin@central.co.in', 'password', 'central', 'CBD Belapur', 'Navi Mumbai'),
  ('admin@iob.co.in', 'password', 'iob', 'Anna Salai', 'Chennai'),
  ('admin@uco.co.in', 'password', 'uco', 'BBD Bagh', 'Kolkata'),
  ('admin@bom.co.in', 'password', 'bom', 'Shivajinagar', 'Pune'),
  ('admin@psb.co.in', 'password', 'psb', 'Rajendra Place', 'New Delhi');
`);

// REST Endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  try {
    const stmt = db.prepare('SELECT username, bank_id, branch_name, city FROM users WHERE username = ? AND password = ?');
    const user = stmt.get(username, password);
    
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Mock Freeze Tracker Dataset
const freezeTrackingData = [
  {
    customerId: "IB-CUST-892100",
    name: "Ramesh Narayan",
    accountNumber: "6543219876",
    status: "Frozen",
    actions: [
      {
        branch: "Royapettah",
        city: "Chennai",
        bank: "Indian Bank",
        action: "Marked Suspicious",
        timestamp: "2026-04-05 09:15 AM",
        reason: "Velocity Anomaly - Multiple transfers > ₹50,000 from unknown IP"
      },
      {
        branch: "Head Office - AML Central",
        city: "Chennai",
        bank: "Indian Bank",
        action: "Freeze Initiated",
        timestamp: "2026-04-05 11:30 AM",
        reason: "Section 51A UAPA Compliance - RBI Watchlist Match"
      },
      {
        branch: "Head Office - Compliance",
        city: "Chennai",
        bank: "Indian Bank",
        action: "Block Confirmed",
        timestamp: "2026-04-05 02:45 PM",
        reason: "Directive from FIU-IND (Financial Intelligence Unit India)"
      }
    ]
  },
  {
    customerId: "SBI-CUST-10492",
    name: "Aarti Desai",
    accountNumber: "3214567890",
    status: "Active",
    actions: [
      {
        branch: "Nariman Point",
        city: "Mumbai",
        bank: "SBI",
        action: "KYC Verified",
        timestamp: "2026-03-21 10:00 AM",
        reason: "Re-KYC via Aadhaar Biometric Liveness Cleared (FIPS Level 3)"
      }
    ]
  },
  {
    customerId: "IB-CUST-773412",
    name: "Srikanth Ventures Pvt Ltd",
    accountNumber: "6543999123",
    status: "Suspicious",
    actions: [
      {
        branch: "Anna Salai Corporate",
        city: "Chennai",
        bank: "Indian Bank",
        action: "Marked Suspicious",
        timestamp: "2026-04-06 13:20 PM",
        reason: "Structuring Detected - 15 cash deposits just below PAN limit threshold"
      }
    ]
  },
  {
    customerId: "HDFC-CUST-9921",
    name: "Priya Menon",
    accountNumber: "5010023414",
    status: "Blocked",
    actions: [
      {
        branch: "Koramangala 4th Block",
        city: "Bengaluru",
        bank: "HDFC Bank",
        action: "Marked Suspicious",
        timestamp: "2026-04-02 10:45 AM",
        reason: "Login from irregular IP (Location: Russia) followed by beneficiary addition"
      },
      {
        branch: "Cyber Fraud Dept",
        city: "Mumbai",
        bank: "HDFC Bank",
        action: "Block Confirmed",
        timestamp: "2026-04-02 11:30 AM",
        reason: "Confirmed account takeover - 1930 Helpline report filed via NCSRP"
      }
    ]
  }
];

app.post('/api/freeze-tracker/search', (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  const result = freezeTrackingData.find(d => 
    d.customerId === query || 
    d.accountNumber === query || 
    d.name.toLowerCase() === query.toLowerCase()
  );

  if (result) {
    res.json({ success: true, data: result });
  } else {
    res.json({ success: false, data: null });
  }
});

app.post('/api/freeze-tracker/log', (req, res) => {
  const { username, query } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO audit_logs (employee_username, search_input, timestamp) VALUES (?, ?, ?)');
    stmt.run(username || 'UNKNOWN', query, new Date().toISOString());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Logging failed' });
  }
});

app.get('/api/anomalies', (req, res) => {
  const stmt = db.prepare('SELECT * FROM anomalies ORDER BY risk DESC');
  res.json(stmt.all());
});

app.get('/api/credit/:id', async (req, res) => {
  try {
    // Attempt to fetch from the true Python ML Microservice
    const mlResponse = await fetch('http://localhost:8000/predict_credit_risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customer_id: req.params.id,
            Payment_History: 85,
            Credit_Utilization: 90,
            Credit_Age: 65,
            Account_Mix: 75,
            Recent_Inquiries: 95
        })
    });
    
    if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        // Respond using real ML Data mapping
        return res.json({
            id: mlData.id,
            name: 'John Doe', // Keep name synced for UX
            score: mlData.score,
            factors: mlData.factors,
            recommendation: mlData.recommendation,
            limit: mlData.limit,
            tier: mlData.tier
        });
    }
  } catch (error) {
     console.log("Python ML Engine unreachable, using mock data fallback.");
  }

  // Fallback if the Python Server isn't running
  res.json({
    id: req.params.id,
    name: 'John Doe',
    score: 742,
    factors: [
      { factor: 'Payment History', score: 85, avg: 65 },
      { factor: 'Credit Utilization', score: 90, avg: 70 },
      { factor: 'Credit Age', score: 65, avg: 60 },
      { factor: 'Account Mix', score: 75, avg: 50 },
      { factor: 'Recent Inquiries', score: 95, avg: 80 }
    ],
    recommendation: 'Approve Credit Line',
    limit: 15000,
    tier: 'Premium (14.9%)'
  });
});

// Case Management Actions
app.post('/api/investigation/freeze', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing ID' });
  const stmt = db.prepare("UPDATE anomalies SET status = 'FROZEN' WHERE id = ?");
  stmt.run(id);
  res.json({ success: true, message: `Assets for ${id} have been frozen successfully.` });
});

app.post('/api/investigation/false-positive', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing ID' });
  const stmt = db.prepare("UPDATE anomalies SET status = 'FALSE POSITIVE', risk = 10 WHERE id = ?");
  stmt.run(id);
  res.json({ success: true, message: `Investigation ${id} marked as a False Positive.` });
});

app.post('/api/investigation/sar', (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Missing ID' });
  const stmt = db.prepare("UPDATE anomalies SET status = 'SAR FILED' WHERE id = ?");
  stmt.run(id);
  res.json({ success: true, message: `Suspicious Activity Report filed to authorities for ${id}.` });
});

// KYC Actions
app.post('/api/kyc/submit', (req, res) => {
  try {
    const data = req.body;
    const stmt = db.prepare(`
      INSERT INTO kyc_records (
        customer_name, account_number, bank_name, ifsc_code,
        aadhaar_number, mobile_number, address, capture_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Base64 image isn't saved to SQL in this bare-bones prototype to save memory, 
    // we just store the text data to mimic backend processing.
    const result = stmt.run(
      data.customerName || 'N/A',
      data.accountNumber || 'N/A',
      data.bankName || 'N/A',
      data.ifscCode || 'N/A',
      data.aadhaarNumber || 'N/A',
      data.mobileNumber || 'N/A',
      data.address || 'N/A',
      new Date().toISOString()
    );
    
    res.json({ 
      success: true, 
      message: 'KYC Record successfully processed and saved!',
      recordId: result.lastInsertRowid 
    });
  } catch (err) {
    console.error('KYC Server Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error while processing KYC' });
  }
});

// Real-Time Telemetry over WebSockets
let baseTransactions = 25000;
let baseFlagged = 1300;

// ─── RED TEAM SIMULATION DATA GENERATORS ───────────────────────
const RT_INDIAN_NAMES = [
  'Rajesh Sharma', 'Priya Patel', 'Amit Kumar', 'Sunita Devi', 'Vikram Singh',
  'Anita Reddy', 'Manoj Tiwari', 'Kavita Nair', 'Deepak Verma', 'Neha Gupta',
  'Suresh Menon', 'Pooja Joshi', 'Rakesh Yadav', 'Meena Iyer', 'Arun Mishra',
  'Divya Saxena', 'Sanjay Pillai', 'Ritu Agarwal', 'Kiran Bhat', 'Geeta Deshmukh',
  'Harish Chauhan', 'Swati Kulkarni', 'Nitin Sinha', 'Lata Pawar', 'Ashok Hegde',
  'Rekha Rao', 'Vijay Choudhary', 'Usha Pandey', 'Ramesh Naik', 'Anjali Kapoor',
  'Mohan Das', 'Sarita Bhatt', 'Pramod Jha', 'Shweta Banerjee', 'Gopal Krishnan',
  'Nirmala Shukla', 'Tushar Patil', 'Sangita Mane', 'Dinesh Thakur', 'Asha Nambiar',
  'Sunil Gowda', 'Padma Rajan', 'Rohit Malhotra', 'Kamla Tripathi', 'Ajay Deshpande',
  'Bhavna Mehta', 'Satish Kamath'
];

const RT_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune',
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi', 'Bhopal', 'Nagpur',
  'Vadodara', 'Surat', 'Indore', 'Coimbatore', 'Visakhapatnam', 'Thiruvananthapuram'
];

const RT_BANKS = [
  { code: 'SBI',  ifsc: 'SBIN', name: 'State Bank of India' },
  { code: 'PNB',  ifsc: 'PUNB', name: 'Punjab National Bank' },
  { code: 'HDFC', ifsc: 'HDFC', name: 'HDFC Bank' },
  { code: 'BOB',  ifsc: 'BARB', name: 'Bank of Baroda' },
  { code: 'CNRB', ifsc: 'CNRB', name: 'Canara Bank' },
  { code: 'UBIN', ifsc: 'UBIN', name: 'Union Bank of India' },
  { code: 'IOB',  ifsc: 'IOBA', name: 'Indian Overseas Bank' },
  { code: 'BOI',  ifsc: 'BKID', name: 'Bank of India' },
];

const RT_LABELS_SUSPICIOUS = [
  'Micro-Structuring below PAN threshold',
  'Cash deposit just under ₹50K limit',
  'Split transfer — same beneficiary',
  'Round-trip fund bounce via NEFT',
  'Dormant A/C sudden high-value credit',
  'Multiple RTGS within 30 mins',
  'UPI collect request chain detected',
  'Salary A/C — atypical outflow pattern',
  'Irregular IMPS burst (5+ in 2 min)',
  'Cross-bank micro-layering detected',
  'Cash withdrawal — just-below CTR limit',
  'Third-party UPI ID — name mismatch',
  'Rapid beneficiary addition + transfer',
  'Repeated ₹49,900 deposits flagged',
  'Night-time large RTGS — unusual hours',
];

const RT_LABELS_FLAGGED = [
  'CONFIRMED: Rapid Layering via shell UPI',
  'CONFIRMED: Threshold Split — evading STR',
  'CONFIRMED: Shell A/C Transfer — mule chain',
  'CONFIRMED: Circular fund flow — SBI→PNB→HDFC',
  'CONFIRMED: Smurfing network — 7 accounts',
  'CONFIRMED: Velocity spike — ₹4.8L in 90s',
  'CONFIRMED: Mule cascade — 3-hop structure',
];

const RT_ALERT_MESSAGES = [
  { level: 'warning', msg: 'Velocity anomaly detected — 12 transactions from same IP in 45 seconds' },
  { level: 'warning', msg: 'Structuring signature match: repeated ₹49,900 deposits across 3 branches' },
  { level: 'critical', msg: 'UAPA watchlist proximity match — beneficiary "Apex Global Trading LLC"' },
  { level: 'warning', msg: 'UPI collect-request chain: 5 linked UPI IDs to same beneficiary in 2 min' },
  { level: 'info', msg: 'CTR threshold monitor active — cumulative cash deposits approaching ₹10L mark' },
  { level: 'critical', msg: 'Cross-bank micro-layering: SBI → PNB → HDFC in under 3 minutes' },
  { level: 'warning', msg: 'Dormant account (14 months) received ₹2.4L RTGS — flagged for review' },
  { level: 'info', msg: 'Geo-anomaly: login from Jaipur, transaction from Kolkata — 8 sec apart' },
  { level: 'critical', msg: 'Mule account pattern: 3rd-hop beneficiary matches known fraud ring' },
  { level: 'warning', msg: 'Night-time RTGS burst: ₹8.2L moved between 01:15–01:22 AM IST' },
  { level: 'info', msg: 'PAN-Aadhaar mismatch detected on beneficiary KYC record' },
  { level: 'critical', msg: 'FIU-IND alert: Entity linked to ongoing ED investigation — auto-freeze recommended' },
];

function generateRedTeamTransaction(index, total) {
  const isFlagged = index >= (total - 7);
  const name = RT_INDIAN_NAMES[index % RT_INDIAN_NAMES.length];
  const city = RT_CITIES[Math.floor(Math.random() * RT_CITIES.length)];
  const bank = RT_BANKS[Math.floor(Math.random() * RT_BANKS.length)];
  const branchCode = String(Math.floor(Math.random() * 90000) + 10000);
  const accLast4 = String(Math.floor(1000 + Math.random() * 9000));
  const upiId = name.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 99) + '@' +
    ['oksbi', 'okhdfcbank', 'ybl', 'paytm', 'ibl', 'axl'][Math.floor(Math.random() * 6)];

  const amt = isFlagged
    ? Math.floor(Math.random() * 8000 + 45000)   // ₹45K–₹53K (high value)
    : Math.floor(Math.random() * 15000 + 9800);   // ₹9.8K–₹24.8K (structuring range)

  const now = new Date();
  now.setMinutes(now.getMinutes() - (total - index) * 2); // stagger timestamps backwards

  return {
    id: `TXN-RT-${String(index + 1).padStart(3, '0')}`,
    amount: amt,
    time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
    timestamp: now.toISOString(),
    account: `XXXX${accLast4}`,
    sender: name,
    city: city,
    bank: bank.code,
    bankName: bank.name,
    ifsc: `${bank.ifsc}0${branchCode}`,
    upi: upiId,
    type: isFlagged ? 'flagged' : 'suspicious',
    label: isFlagged
      ? RT_LABELS_FLAGGED[index - (total - 7)]
      : RT_LABELS_SUSPICIOUS[index % RT_LABELS_SUSPICIOUS.length],
    riskScore: isFlagged
      ? Math.floor(Math.random() * 10 + 90)
      : Math.floor(Math.random() * 25 + 55),
  };
}

// ─── WEBSOCKET ─────────────────────────────────────────────────
wss.on('connection', (ws) => {
  console.log('Client connected for real-time telemetry.');
  let redTeamTimer = null;

  // Send data periodically
  const interval = setInterval(() => {
    baseTransactions += Math.floor(Math.random() * 200) - 90;
    baseFlagged += Math.floor(Math.random() * 15) - 6;

    ws.send(JSON.stringify({
      type: 'telemetry_update',
      data: {
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
        transactions: baseTransactions,
        flagged: baseFlagged,
        blocked: Math.floor(baseFlagged * 0.7)
      }
    }));

    // Broadcast real-time AI Simulator anomalies
    if (Math.random() > 0.4) {
      const types = ['Corporate Shell', 'Individual', 'High-Risk Corporate', 'Trade Business', 'Financial Services'];
      const names = ['Apex Global Trading', 'Victor Reznov', 'Crimson Tech', 'Nexus Import/Export', 'Evelyn Shaw', 'Quantum Mechanics', 'Blue Ocean LLC', 'Red Shield Co', 'Ramesh Narayan', 'Priya Menon', 'Aarti Desai'];
      const activities = ['Structuring', 'Velocity Anomaly', 'Layering Activity', 'Unusual Geo Activity', 'Multi-jurisdictional Layering ($2.4M)'];
      const name = names[Math.floor(Math.random() * names.length)];
      ws.send(JSON.stringify({
        type: 'anomaly_stream',
        data: {
          id: `TXN-SYS-${Math.floor(Math.random() * 9000) + 1000}X`,
          entity: name,
          type: types[Math.floor(Math.random() * types.length)],
          risk: Math.floor(Math.random() * 40) + 60,
          activity: activities[Math.floor(Math.random() * activities.length)],
          avatar: name.substring(0, 2).toUpperCase()
        }
      }));
    }
  }, 3000);

  // ─── RED TEAM SIMULATION HANDLER ───────────────────
  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.type === 'start_redteam') {
      console.log('🔴 Red Team Simulation started.');
      const TOTAL = 47;
      let idx = 0;
      let alertIdx = 0;

      // Clear any previous simulation
      if (redTeamTimer) clearInterval(redTeamTimer);

      // Send initial ack
      ws.send(JSON.stringify({ type: 'rt_started', data: { total: TOTAL } }));

      redTeamTimer = setInterval(() => {
        if (idx >= TOTAL) {
          clearInterval(redTeamTimer);
          redTeamTimer = null;

          // Send detection event
          ws.send(JSON.stringify({
            type: 'rt_detected',
            data: {
              message: 'STRUCTURING PATTERN DETECTED',
              pattern: 'Micro-splits below ₹50,000 reporting threshold',
              confidence: 98.7,
              model: 'CFI-GNN-v3.2',
              txCount: TOTAL,
            }
          }));

          // Send cascade event after short delay
          setTimeout(() => {
            ws.send(JSON.stringify({
              type: 'rt_cascade',
              data: {
                banks: [
                  { name: 'SBI', status: 'Node Frozen', frozenAt: new Date().toISOString(), accountsFrozen: 3 },
                  { name: 'PNB', status: 'Freeze Propagated', frozenAt: new Date(Date.now() + 600).toISOString(), accountsFrozen: 2 },
                  { name: 'HDFC', status: 'Network Locked', frozenAt: new Date(Date.now() + 1200).toISOString(), accountsFrozen: 4 },
                ]
              }
            }));
          }, 1500);

          return;
        }

        const tx = generateRedTeamTransaction(idx, TOTAL);
        ws.send(JSON.stringify({ type: 'rt_transaction', data: tx }));

        // Send periodic live alerts (roughly every 4-6 transactions)
        if (idx > 0 && idx % (3 + Math.floor(Math.random() * 3)) === 0 && alertIdx < RT_ALERT_MESSAGES.length) {
          const alert = RT_ALERT_MESSAGES[alertIdx];
          ws.send(JSON.stringify({
            type: 'rt_alert',
            data: {
              id: `ALERT-${Date.now()}-${alertIdx}`,
              level: alert.level,
              message: alert.msg,
              timestamp: new Date().toISOString(),
              source: ['CFI-GNN Engine', 'RBI STR Monitor', 'FIU-IND Watchlist', 'Velocity Analyzer', 'UPI Fraud Net'][Math.floor(Math.random() * 5)],
            }
          }));
          alertIdx++;
        }

        idx++;
      }, idx >= 40 ? 350 : 80); // dynamic — but setInterval is fixed, so we handle in frontend
    }

    if (msg.type === 'stop_redteam') {
      console.log('🔴 Red Team Simulation stopped.');
      if (redTeamTimer) {
        clearInterval(redTeamTimer);
        redTeamTimer = null;
      }
    }
  });

  ws.on('close', () => {
    clearInterval(interval);
    if (redTeamTimer) clearInterval(redTeamTimer);
    console.log('Client disconnected.');
  });
});

// SPA catch-all: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
