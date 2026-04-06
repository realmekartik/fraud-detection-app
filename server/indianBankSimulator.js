const BANK_CODES = ['SBIN', 'HDFC', 'ICIC', 'PUNB', 'BARB', 'KKBK', 'CNRB', 'UBIN', 'BKID', 'IDIB'];
const BANK_NAMES = {
  'SBIN': 'State Bank of India',
  'HDFC': 'HDFC Bank',
  'ICIC': 'ICICI Bank',
  'PUNB': 'Punjab National Bank',
  'BARB': 'Bank of Baroda',
  'KKBK': 'Kotak Mahindra Bank',
  'CNRB': 'Canara Bank',
  'UBIN': 'Union Bank of India',
  'BKID': 'Bank of India',
  'IDIB': 'Indian Bank'
};

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur'];

const FIRST_NAMES = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Siddharth', 'Rohan', 'Vikram', 'Isha', 'Diya', 'Ananya', 'Riya', 'Aarohi', 'Neha', 'Pooja', 'Rahul', 'Amit', 'Sunil', 'Kavita', 'Sanjay', 'Geeta', 'Vijay', 'Meera', 'Ramesh', 'Suresh', 'Anita'];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Patil', 'Joshi', 'Singh', 'Kumar', 'Das', 'Reddy', 'Rao', 'Nair', 'Menon', 'Iyer', 'Chatterjee', 'Banerjee', 'Bose', 'Mishra', 'Pandey', 'Desai', 'Patel'];
const COMPANY_TYPES = ['Pvt Ltd', 'LLP', 'Enterprises', 'Traders', 'Corporation', 'Logistics', 'OverSeas'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(isCompany = false) {
  if (isCompany) {
    const prefixes = ['Apex', 'Global', 'Nexus', 'Crimson', 'Meridian', 'Starlight', 'Orion', 'Vanguard', 'Alpha', 'Quantum'];
    return `${getRandomItem(prefixes)} ${getRandomItem(COMPANY_TYPES)}`;
  }
  return `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;
}

function generateIFSC() {
  const bank = getRandomItem(BANK_CODES);
  const branchCode = getRandomInt(100000, 999999);
  return `${bank}0${branchCode}`;
}

function generateAccount() {
  return getRandomInt(10000000000, 99999999999).toString();
}

function generateUTR() {
  const prefix = getRandomItem(['CMS', 'HDF', 'SBI', 'UPI']);
  const nums = getRandomInt(100000000, 999999999);
  return `${prefix}${nums}`;
}

const LAYER_ACTIVITIES = [
  'Multi-jurisdictional Layering',
  'Evasion of Reporting Thresholds (Structuring)',
  'Rapid Funneling to Offshore Accounts',
  'High-Velocity Crypto Exchange Transfers',
  'Trade-Based Money Laundering Flags',
  'Unusual Bulk IMPS Transfers',
  'Inconsistent KYC / Ultimate Beneficial Owner Match',
  'Velocity Anomaly - Rapid Transfers',
  'Suspicious Peer-to-Peer Ring'
];

function generateTransaction() {
  const isHighRisk = Math.random() < 0.05; // 5% chance of being an anomaly

  const type = getRandomItem(['UPI', 'IMPS', 'NEFT', 'RTGS']);
  let amount;
  
  if (isHighRisk) {
    // Anomalous amounts
    amount = type === 'UPI' ? getRandomInt(90000, 99999) : getRandomInt(1000000, 9999999);
  } else {
    // Normal amounts
    amount = type === 'UPI' ? getRandomInt(10, 5000) : getRandomInt(5000, 100000);
  }

  const riskScore = isHighRisk ? getRandomInt(75, 99) : getRandomInt(5, 30);
  const isCompany = riskScore > 85 ? Math.random() > 0.3 : Math.random() > 0.8; // Fraudsters often use shell companies

  const srcBank = getRandomItem(BANK_CODES);
  const destBank = getRandomItem(BANK_CODES);
  
  return {
    id: `TXN-${generateUTR()}`,
    fromEntity: generateName(isCompany),
    toEntity: generateName(Math.random() > 0.7),
    fromAccount: generateAccount(),
    toAccount: generateAccount(),
    fromIFSC: generateIFSC().replace(/^[A-Z]{4}/, srcBank),
    toIFSC: generateIFSC().replace(/^[A-Z]{4}/, destBank),
    amount: amount,
    currency: 'INR',
    type: type,
    city: getRandomItem(CITIES),
    timestamp: new Date().toISOString(),
    riskScore: riskScore,
    isAnomaly: isHighRisk,
    activity: isHighRisk ? getRandomItem(LAYER_ACTIVITIES) : 'Normal Activity',
    status: riskScore > 90 ? 'Blocked' : riskScore > 75 ? 'Investigating' : 'Cleared'
  };
}

module.exports = {
  generateTransaction,
  BANK_NAMES
};
