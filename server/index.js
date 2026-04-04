const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const Database = require('better-sqlite3');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

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
  
  INSERT INTO anomalies (id, entity, type, risk, status) VALUES 
  ('TXN-8942', 'CryptoBridge Ltd', 'Layering', 98, 'Blocked'),
  ('TXN-8941', 'Unknown Entity A', 'Structuring', 92, 'Investigating'),
  ('TXN-8938', 'Global Trade Hub', 'Velocity Anomaly', 85, 'Investigating'),
  ('TXN-8935', 'John Doe Account', 'Unusual Geo', 71, 'Flagged');
`);

// REST Endpoints
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
