const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const Database = require('better-sqlite3');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
    customerId: "CUST001",
    name: "Rahul Sharma",
    accountNumber: "1234567890",
    status: "Frozen",
    actions: [
      {
        branch: "Delhi Main Branch",
        city: "New Delhi",
        bank: "SBI",
        action: "Marked Suspicious",
        timestamp: "2026-04-01 10:30 AM",
        reason: "Unusual transaction pattern"
      },
      {
        branch: "Mumbai Central",
        city: "Mumbai",
        bank: "SBI",
        action: "Freeze Initiated",
        timestamp: "2026-04-01 11:15 AM",
        reason: "High-risk transaction chain"
      },
      {
        branch: "Lucknow Branch",
        city: "Lucknow",
        bank: "SBI",
        action: "Block Confirmed",
        timestamp: "2026-04-01 12:00 PM",
        reason: "Linked to fraudulent entities"
      }
    ]
  },
  {
    customerId: "CUST002",
    name: "Anita Verma",
    accountNumber: "9876543210",
    status: "Active",
    actions: [
      {
        branch: "Connaught Place",
        city: "New Delhi",
        bank: "HDFC Bank",
        action: "KYC Verified",
        timestamp: "2026-02-15 09:00 AM",
        reason: "Account successfully onboarded"
      }
    ]
  },
  {
    customerId: "CUST003",
    name: "Vikram Singh",
    accountNumber: "5555444433",
    status: "Suspicious",
    actions: [
      {
        branch: "MG Road",
        city: "Bengaluru",
        bank: "Canara",
        action: "Marked Suspicious",
        timestamp: "2026-04-04 14:20 PM",
        reason: "Velocity Anomaly - Rapid Transfers"
      }
    ]
  },
  {
    customerId: "CUST004",
    name: "Priya Desai",
    accountNumber: "1111222233",
    status: "Blocked",
    actions: [
      {
        branch: "Dadar",
        city: "Mumbai",
        bank: "Bank of India",
        action: "Marked Suspicious",
        timestamp: "2026-03-25 10:45 AM",
        reason: "Login from irregular IP address"
      },
      {
        branch: "Nariman Point",
        city: "Mumbai",
        bank: "Union Bank",
        action: "Block Confirmed",
        timestamp: "2026-03-25 11:30 AM",
        reason: "Detected as compromised account"
      }
    ]
  },
  {
    customerId: "CUST005",
    name: "Suresh Patil",
    accountNumber: "9988776655",
    status: "Frozen",
    actions: [
      {
        branch: "Shivajinagar",
        city: "Pune",
        bank: "Maharashtra",
        action: "Freeze Initiated",
        timestamp: "2026-04-05 08:15 AM",
        reason: "Court order received"
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

wss.on('connection', (ws) => {
  console.log('Client connected for real-time telemetry.');
  
  // Send data periodically
  const interval = setInterval(() => {
    // Generate some random fluctuation
    baseTransactions += Math.floor(Math.random() * 200) - 90;
    baseFlagged += Math.floor(Math.random() * 15) - 6;
    
    ws.send(JSON.stringify({
      type: 'telemetry_update',
      data: {
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
        transactions: baseTransactions,
        flagged: baseFlagged,
        blocked: Math.floor(baseFlagged * 0.7) // Roughly 70% of flagged get blocked
      }
    }));
  }, 3000); // Send updates every 3 seconds

  ws.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected.');
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Backend Server running on port ${PORT}`);
});
