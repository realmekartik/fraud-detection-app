import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  ShieldAlert,
  Network,
  BarChart3,
  Users,
  FileKey,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Search,
  Bell,
  ScanFace,
  CheckCircle,
  X,
  Lock,
  AlertOctagon,
  ExternalLink,
  Download,
  MessageCircle,
  Check,
  RefreshCw,
  Map
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as faceapi from 'face-api.js';
import ParticleBackground from './ParticleBackground';
import EntityInvestigation from './EntityInvestigation';
import RedTeamSimulator from './RedTeamSimulator';
import CounterfactualExplainer from './CounterfactualExplainer';
import IndiaFraudHeatmap from './IndiaFraudHeatmap';



const API_URL = '/api';
const WS_URL = window.location.protocol === 'https:' ? `wss://${window.location.host}/ws` : `ws://${window.location.host}/ws`;

export const supportedBanks = [
  { id: 'sbi', name: 'SBI', color: '#005596', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg' },
  { id: 'hdfc', name: 'HDFC Bank', color: '#004C8F', logo: 'https://logodix.com/logo/840225.jpg' },
  { id: 'pnb', name: 'PNB', color: '#A32020', logo: 'https://static.vecteezy.com/system/resources/previews/020/336/282/original/punjab-national-bank-pnb-bank-logo-free-free-vector.jpg' },
  { id: 'bob', name: 'Bank of Baroda', color: '#F15A22', logo: 'https://1000logos.net/wp-content/uploads/2021/06/Bank-of-Baroda-logo.png' },
  { id: 'canara', name: 'Canara', color: '#005EB8', logo: 'https://www.liblogo.com/img-logo/ca8792c86d-canara-bank-logo-canara-bank-launches-qualified-institutional-placement.png' },
  { id: 'union', name: 'Union Bank', color: '#D52B1E', logo: 'https://www.bankingfinance.in/wp-content/uploads/2017/12/Union-Bank-of-India.jpg' },
  { id: 'boi', name: 'Bank of India', color: '#005A9C', logo: 'https://logos-world.net/wp-content/uploads/2020/01/Bank-of-India-Logo-before-2011.png' },
  { id: 'indian', name: 'Indian Bank', color: '#005EB8', logo: 'https://companieslogo.com/img/orig/INDIANB.NS_BIG-f675f730.png?t=1615846835' },
  { id: 'central', name: 'Central Bank', color: '#005EB8', logo: '/central_bank_logo.png' },
  { id: 'iob', name: 'Indian Overseas', color: '#005A9C', logo: 'https://companieslogo.com/img/orig/IOB.NS_BIG-09a26177.png?t=1613454098' },
  { id: 'uco', name: 'UCO Bank', color: '#FFD700', logo: 'https://www.thebusinessquiz.com/wp-content/uploads/2014/11/UCO-Bank-Logo.jpg' },
  { id: 'bom', name: 'Maharashtra', color: '#005A9C', logo: 'https://cdn.brandfetch.io/bankofmaharashtra.in/fallback/lettermark/theme/dark/h/256/w/256/icon?c=1bfwsmEH20zzEfSNTed' }
];

const generateHighRiskEntities = (bankId) => {
  const prefix = bankId ? bankId.toUpperCase() : 'SYS';
  return [
    { id: `TXN-${prefix}-901A`, entity: 'Apex Global Trading LLC', type: 'Corporate Shell', risk: 99, activity: 'Multi-jurisdictional Layering ($2.4M)', avatar: 'AG' },
    { id: `TXN-${prefix}-802B`, entity: 'Victor Reznov', type: 'Individual', risk: 95, activity: 'Evasion of Reporting Thresholds (Structuring)', avatar: 'VR' },
    { id: `TXN-${prefix}-703C`, entity: 'Starlight Logistics Inc', type: 'Business', risk: 92, activity: 'Rapid Funneling to Offshore Accounts', avatar: 'SL' },
    { id: `TXN-${prefix}-604D`, entity: 'Crimson Tech Pvt Ltd', type: 'High-Risk Corporate', risk: 89, activity: 'Inconsistent KYC / Ultimate Beneficial Owner Match', avatar: 'CT' },
    { id: `TXN-${prefix}-505E`, entity: 'Evelyn Shaw', type: 'Individual', risk: 85, activity: 'High-Velocity Crypto Exchange Transfers', avatar: 'ES' },
    { id: `TXN-${prefix}-406F`, entity: 'Orion Brokerage Partners', type: 'Financial Services', risk: 81, activity: 'Spike in Unverified Wire Transfers', avatar: 'OB' },
    { id: `TXN-${prefix}-307G`, entity: 'Nexus Import/Export', type: 'Trade Business', risk: 78, activity: 'Trade-Based Money Laundering Flags', avatar: 'NX' },
    { id: `TXN-${prefix}-208H`, entity: 'Elias Vance', type: 'Individual', risk: 74, activity: 'Account Takeover / Impossible Travel Geolocation', avatar: 'EV' },
    { id: `TXN-${prefix}-109I`, entity: 'Meridian Group Holdings', type: 'Holding Company', risk: 71, activity: 'Sanctions List Proximity Match (OFAC)', avatar: 'MG' }
  ];
};

const hiTranslations = {
  "Central Fraud Intelligence": "केंद्रीय धोखाधड़ी खुफिया",
  "Inter-Banking Security Authentication Portal": "अंतर-बैंकिंग सुरक्षा प्रमाणीकरण पोर्टल",
  "Select your Financial Institution": "अपने वित्तीय संस्थान का चयन करें",
  "Secure Login to Network": "सुरक्षित लॉगिन नेटवर्क",

  "CFI Network": "CFI नेटवर्क",
  "Graph Fraud Detection": "ग्राफ धोखाधड़ी का पता लगाना",
  "Credit Risk Modeling": "क्रेडिट जोखिम मॉडलिंग",
  "Entity Investigation": "इकाई जांच",
  "Freeze Source Tracker": "स्रोत ट्रैकर फ्रीज करें",
  "e-KYC Processing": "ई-केवाईसी प्रसंस्करण",
  "Compliance Reports": "अनुपालन रिपोर्ट",
  "File a Complaint": "शिकायत दर्ज करें",
  "System Online & Active": "सिस्टम ऑनलाइन और सक्रिय",

  "Real-Time Network Intelligence": "रियल-टाइम नेटवर्क इंटेलिजेंस",
  "Graph-based anomaly detection across multi-layer transaction networks. Live Telemetry enabled.": "मल्टी-लेयर लेनदेन नेटवर्क पर ग्राफ-आधारित विसंगति का पता लगाना। लाइव टेलीमेट्री सक्षम।",
  "Explainable AI Assessment": "व्याख्यात्मक एआई मूल्यांकन",
  "Interpretable risk scoring framework combining behavioral and financial features.": "व्यवहार और वित्तीय सुविधाओं का संयोजन करने वाला व्याख्या योग्य जोखिम स्कोरिंग ढांचा।",
  "File a Cyber Complaint": "साइबर शिकायत दर्ज करें",
  "Official gateway to register a federal cybercrime incident report immediately.": "संघीय साइबर अपराध घटना रिपोर्ट तुरंत दर्ज करने का आधिकारिक प्रवेश द्वार।",

  "LIVE TRANSACTIONS": "लाइव लेनदेन",
  "Streaming": "स्ट्रीमिंग",
  "ONGOING ANOMALIES (FLAGGED)": "चल रही विसंगतियां (फ़्लैग्ड)",
  "Review Required": "समीक्षा आवश्यक",
  "INSTANTLY BLOCKED": "तुरंत ब्लॉक किया गया",
  "Auto-Interception active": "स्वचालित अवरोधन सक्रिय",
  "FALSE POSITIVE RATE": "गलत सकारात्मक दर",
  "-0.05% optimization": "-0.05% अनुकूलन",

  "Transaction Volume vs Anomalies (Live Flow)": "लेनदेन की मात्रा बनाम विसंगतियां (लाइव फ्लो)",
  "High-Risk Entities (DB Synced)": "उच्च जोखिम वाली संस्थाएं (डेटाबेस समन्वयित)",
  "View All": "सभी देखें",

  "Regulatory Filing & Compliance Vault": "नियामक फाइलिंग और अनुपालन वॉल्ट",
  "FIPS 140-2 Audited Logs • Retained for 7 Years": "FIPS 140-2 ऑडिटेड लॉग • 7 वर्षों के लिए बनाए रखा",
  "Query Archives": "पुरालेख खोजना",
  "Export to CSV": "CSV निर्यात करें",

  "UIDAI e-KYC Verification & Onboarding": "यूआईडीएआई ई-केवाईसी सत्यापन और ऑनबोर्डिंग",
  "Aadhaar OTP + Liveness Real-time Image Capture Verification": "आधार ओटीपी + आजीविका वास्तविक समय छवि कैप्चर सत्यापन",
  "Customer Identification Data": "ग्राहक पहचान डेटा",
  "Customer Full Name": "ग्राहक का पूरा नाम",
  "Account Number": "खाता संख्या",
  "Bank Name": "बैंक का नाम",
  "IFSC Code": "आईएफएससी कोड",
  "Aadhaar Number": "आधार संख्या",
  "Linked Mobile Number": "लिंक किया गया मोबाइल नंबर",
  "Request Aadhaar OTP": "आधार ओटीपी का अनुरोध करें",
  "Submit": "जमा करें",
  "Residential Address": "आवासीय पता",

  "Liveness Image Capture": "आजीविका छवि कैप्चर",
  "Enable Camera": "कैमरा चालु करें",
  "Capture Photo": "फोटो खींचे",
  "Verify Liveness & Submit": "आजीविका सत्यापित करें और जमा करें",

  "FINANCIAL FRAUD": "वित्तीय धोखाधड़ी",
  "If you suspect unauthorized access or have detected suspicious activity, file an immediate federal report.": "यदि आपको अनधिकृत पहुंच का संदेह है या संदिग्ध गतिविधि का पता चला है, तो तत्काल संघीय शिकायत दर्ज करें।",
  "Register Complaint": "शिकायत दर्ज करें",
  "Language:": "भाषा:"
};

const App = () => {
  const [appLang, setAppLang] = useState('en');

  const t = (text) => {
    if (appLang === 'hi' && hiTranslations[text]) return hiTranslations[text];
    return text;
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [activeTab, setActiveTab] = useState('fraud');
  const [networkAnomalies, setNetworkAnomalies] = useState([]);
  const [creditProfile, setCreditProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // ── Biometric state ──────────────────────────────────────────────────────────
  const [bioScore, setBioScore] = useState(0);
  const [bioMetrics, setBioMetrics] = useState({
    avgKeystrokeLatency: 0, typingSpeed: 0, backspaceCount: 0,
    pauseCount: 0, mouseVelocityVariance: 0, directionReversals: 0,
    pasteDetected: false,
  });
  const [bioStatus, setBioStatus] = useState('idle'); // idle | normal | unusual | anomalous
  const [supervisorOtp, setSupervisorOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [loginBlocked, setLoginBlocked] = useState(false);
  const [loginWarning, setLoginWarning] = useState(false);
  const [bioClearance, setBioClearance] = useState(null); // null | 'granted' | 'enhanced' | 'blocked'
  const bioRef = useRef({
    lastKeyTime: 0, keyLatencies: [], holdTimes: {}, backspaces: 0,
    pauses: 0, charCount: 0, startTime: Date.now(),
    mouseTimes: [], mouseVels: [], lastMouseX: 0, lastMouseY: 0,
    lastMouseTime: 0, directions: [], lastDx: 0, lastDy: 0,
    reversals: 0, pasteFlag: false,
    pwHoverStart: 0, pwHoverTotal: 0,
  });

  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  // Freeze Tracker State
  const [freezeSearchInput, setFreezeSearchInput] = useState('');
  const [freezeSearchResults, setFreezeSearchResults] = useState(null);
  const [isFreezeSearching, setIsFreezeSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Added auto-load function to simulate pulling bank real-time data into KYC form
  const handleAutoLoadKYCData = () => {
    // We simulate pulling the first "Active" or clean profile from the bank server DB 
    // to show how automated internal transfers work.
    try {
      fetch(`${API_URL}/freeze-tracker/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'SBI-CUST-10492' }) // hardcode one of our realistic simulator users
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setKycData({
            customerName: data.data.name,
            accountNumber: data.data.accountNumber,
            bankName: "State Bank of India",
            ifscCode: "SBIN0000691", // Mumbai Nariman point
            aadhaarNumber: "8921-XXXX-4512",
            mobileNumber: "+91 98XXXXXX21",
            address: "Nariman Point, Mumbai, Maharashtra"
          });
          addToast("Successfully imported live bank profile data from remote database.", "success");
        }
      });
    } catch(e) {}
  };

  const handleFreezeSearch = async (e) => {
    e.preventDefault();
    if (!freezeSearchInput.trim()) return;

    setIsFreezeSearching(true);
    setHasSearched(true);
    setFreezeSearchResults(null);

    // Log audit action
    if (currentUser) {
      fetch(`${API_URL}/freeze-tracker/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: currentUser.username, query: freezeSearchInput })
      }).catch(err => console.error("Could not log search", err));
    }

    try {
      const res = await fetch(`${API_URL}/freeze-tracker/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: freezeSearchInput.trim() })
      });
      const data = await res.json();

      // Add fake delay for loading animation UX
      setTimeout(() => {
        if (data.success && data.data) {
          setFreezeSearchResults(data.data);
        } else {
          setFreezeSearchResults(null);
        }
        setIsFreezeSearching(false);
      }, 800);
    } catch (err) {
      console.error(err);
      setIsFreezeSearching(false);
    }
  };

  // Camera State for e-KYC
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // AI Liveness State
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isFaceAligned, setIsFaceAligned] = useState(false);
  const [faceMessage, setFaceMessage] = useState('Initializing AI...');
  const detectionInterval = useRef(null);

  // Toast State
  const [toasts, setToasts] = useState([]);

  // Compliance Logs State
  const defaultLogs = [
    { id: 'SAR-9901', type: 'Federal SAR Filing', entity: 'CryptoBridge Ltd', author: 'System API', time: 'Just Now', status: 'SUBMITTED', statusColor: 'high' },
    { id: 'CR-FBD-22', type: 'Credit Assessment (SHAP)', entity: 'CUST-88219', author: 'Automated Model', time: '2 Hrs Ago', status: 'ARCHIVED', statusColor: 'low' },
    { id: 'FR-AL-011', type: 'False Positive Log', entity: 'TXN-3910', author: 'johndoe@bank.internal', time: '4 Hrs Ago', status: 'TRAINING SET', statusColor: 'medium' }
  ];
  const [complianceLogs, setComplianceLogs] = useState(() => {
    const saved = localStorage.getItem('fraudApp_complianceLogs');
    try { return saved ? JSON.parse(saved) : defaultLogs; }
    catch { return defaultLogs; }
  });

  useEffect(() => {
    localStorage.setItem('fraudApp_complianceLogs', JSON.stringify(complianceLogs));
  }, [complianceLogs]);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleUpdateLogStatus = (id, status, statusColor) => {
    setComplianceLogs(prev => prev.map(log => log.id === id ? { ...log, status, statusColor } : log));
    setOpenMenuId(null);
  };

  const handleDeleteSingleLog = (id) => {
    setComplianceLogs(prev => prev.filter(log => log.id !== id));
    setOpenMenuId(null);
  };

  const handleSelectAllLogs = (e) => {
    if (e.target.checked) {
      setSelectedLogs(complianceLogs.map(log => log.id));
    } else {
      setSelectedLogs([]);
    }
  };

  const handleSelectLog = (id) => {
    setSelectedLogs(prev =>
      prev.includes(id) ? prev.filter(logId => logId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelectedLogs = () => {
    setComplianceLogs(prev => prev.filter(log => !selectedLogs.includes(log.id)));
    setSelectedLogs([]);
    addToast(`${selectedLogs.length} record(s) deleted successfully.`);
  };

  const handleExportCSV = () => {
    if (complianceLogs.length === 0) {
      addToast("No data to export.", 'warning');
      return;
    }

    const headers = ['Report ID', 'Type', 'Target Entity', 'Generated By', 'Timestamp', 'Status'];
    const csvRows = complianceLogs.map(log =>
      [log.id, log.type, log.entity, log.author, log.time, log.status].map(val => `"${val}"`).join(',')
    );
    const csvContent = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Compliance_Master_Log.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast("Exported to CSV! Your browser will open/save the file for Excel.", 'success');
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const [kycData, setKycData] = useState({
    customerName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    aadhaarNumber: '',
    mobileNumber: '',
    address: ''
  });

  // Real-time telemetry state
  const [fraudTimelineData, setFraudTimelineData] = useState(
    Array.from({ length: 15 }, (_, i) => ({
      time: '-',
      transactions: 0,
      flagged: 0,
      blocked: 0
    }))
  );

  const [currentTelemetry, setCurrentTelemetry] = useState({
    transactions: 25000,
    flagged: 1300,
    blocked: 910
  });

  const loadCreditProfile = (entity, navigate = false) => {
    let baseScore, recommendation, tier, limit;
    if (entity.risk > 90) {
      baseScore = Math.floor(Math.random() * 150) + 500;
      recommendation = "Reject Application / High Risk";
      tier = "Tier 4 (Uninsurable)";
      limit = Math.floor(Math.random() * 500) * 83;
    } else if (entity.risk > 80) {
      baseScore = Math.floor(Math.random() * 100) + 650;
      recommendation = "Manual Review / Requires Guarantor";
      tier = "Tier 3 (Subprime)";
      limit = (Math.floor(Math.random() * 5000) + 1000) * 83;
    } else {
      baseScore = Math.floor(Math.random() * 100) + 750;
      recommendation = "Auto-Approve";
      tier = "Tier 1 (Prime)";
      limit = (Math.floor(Math.random() * 20000) + 10000) * 83;
    }

    const isLayering = entity.activity === 'Layering Activity';
    const isStructuring = entity.activity === 'Structuring';
    const isVelocity = entity.activity === 'Velocity Anomaly';

    setCreditProfile({
      id: entity.id,
      name: entity.entity,
      avatar: entity.avatar,
      riskLevel: entity.risk,
      score: baseScore,
      recommendation,
      limit,
      tier,
      factors: [
        { factor: 'History', score: baseScore > 700 ? 80 : 40, avg: 65, fullMark: 100 },
        { factor: 'Velocity', score: isVelocity ? 15 : (baseScore > 700 ? 85 : 50), avg: 55, fullMark: 100 },
        { factor: 'Layering', score: isLayering ? 10 : (baseScore > 700 ? 95 : 60), avg: 70, fullMark: 100 },
        { factor: 'Structuring', score: isStructuring ? 20 : (baseScore > 700 ? 90 : 55), avg: 60, fullMark: 100 },
        { factor: 'Geo Anomaly', score: entity.activity === 'Unusual Geo Activity' ? 10 : 80, avg: 85, fullMark: 100 },
        { factor: 'Stability', score: Math.floor(baseScore / 10), avg: 50, fullMark: 100 }
      ],
      impacts: [
        { label: 'Layering Pattern', value: isLayering ? 'High Negative Impact (-45)' : 'No Impact', percent: isLayering ? '90%' : '10%', color: isLayering ? 'var(--danger)' : 'var(--success)' },
        { label: 'Structuring Flags', value: isStructuring ? 'High Negative Impact (-35)' : 'No Impact', percent: isStructuring ? '85%' : '15%', color: isStructuring ? 'var(--warning)' : 'var(--success)' },
        { label: 'Velocity Triggers', value: isVelocity ? 'Moderate Negative (-25)' : 'Normal Flow', percent: isVelocity ? '60%' : '20%', color: isVelocity ? 'var(--warning)' : 'var(--success)' }
      ]
    });

    if (navigate) {
      setActiveTab('credit');
    }
  };

  // Fetch initial data & preload logos
  useEffect(() => {
    // Fetch anomalies from real bank server database
    fetch(`${API_URL}/anomalies`)
      .then(res => res.json())
      .then(data => {
        const mappedAnomalies = data.map(item => ({
          id: item.id,
          entity: item.entity,
          type: item.type,
          risk: item.risk,
          activity: 'Pattern Analysis: ' + item.status,
          avatar: item.entity.substring(0, 2).toUpperCase()
        }));
        setNetworkAnomalies(mappedAnomalies);
        if (mappedAnomalies.length > 0) {
          loadCreditProfile(mappedAnomalies[0], false);
        }
      })
      .catch(e => {
        const freshAnomalies = generateHighRiskEntities(selectedBank ? selectedBank.id : 'default');
        setNetworkAnomalies(freshAnomalies);
        if (freshAnomalies.length > 0) {
          loadCreditProfile(freshAnomalies[0], false);
        }
      });

    // Preload logos
    supportedBanks.forEach(bank => {
      const img = new Image();
      img.src = bank.logo;
    });
  }, [selectedBank]);

  // Set up WebSocket
  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'telemetry_update') {
        const { time, transactions, flagged, blocked } = message.data;

        setCurrentTelemetry({ transactions, flagged, blocked });

        setFraudTimelineData(prev => {
          const newData = [...prev.slice(1), { time, transactions, flagged, blocked }];
          return newData;
        });
      } else if (message.type === 'anomaly_stream') {
        setNetworkAnomalies(prev => {
          const updated = [message.data, ...prev].slice(0, 9);
          // Auto-load credit profile to simulate the AI simulator running
          loadCreditProfile(message.data, false);
          return updated;
        });
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const generateComplianceReport = () => {
    if (!creditProfile) return;

    const doc = new jsPDF();

    // Header Styled for Fintech Dark / Corporate
    doc.setFillColor(6, 8, 15);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
    doc.setFontSize(22);
    doc.setTextColor(0, 240, 255);
    doc.text('CFI Network - Credit Risk Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 130, 20);

    // Customer Info Section
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Customer Assessment Summary', 14, 45);

    // Dynamic Risk Evaluation Strings
    const riskLabel = creditProfile.riskLevel > 90 ? 'High Risk' : creditProfile.riskLevel > 80 ? 'Medium Risk' : 'Low Risk';
    const profileSummary = creditProfile.riskLevel > 80 ? 'Anomalous velocity and suspected layering flagged' : 'Consistent transactional history with standard behavior';

    // Autotable for profile info
    autoTable(doc, {
      startY: 50,
      head: [['Attribute', 'Value']],
      body: [
        ['Customer Name', creditProfile.name],
        ['Customer ID', creditProfile.id],
        ['Risk Level', riskLabel],
        ['AI Credit Score', creditProfile.score.toString()],
        ['Model Recommendation', creditProfile.recommendation],
        ['Behavioral Profile', profileSummary]
      ],
      theme: 'grid',
      headStyles: { fillColor: [6, 8, 15], textColor: 255 },
      styles: { fontSize: 11, cellPadding: 5 }
    });

    const finalY = doc.lastAutoTable.finalY + 14;

    // SHAP Explainability Section
    doc.setFontSize(14);
    doc.text('SHAP Behavior Factor Impact', 14, finalY);

    const factorsData = creditProfile.factors.map(f => [
      f.factor,
      f.score.toString(),
      f.avg.toString(),
      (f.score - f.avg) > 0 ? `+${(f.score - f.avg)}` : (f.score - f.avg).toString()
    ]);

    autoTable(doc, {
      startY: finalY + 4,
      head: [['Behavioral Factor', 'Customer Score', 'Population Avg', 'Delta Impact']],
      body: factorsData,
      theme: 'striped',
      headStyles: { fillColor: [157, 78, 221] },
      styles: { fontSize: 10 }
    });

    // Final statement
    const textY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    let explanationBase = "Regulatory Rationale: This output verifies the AI decision boundary. Specifically prioritizing Behavioral factors, the model mapped this entity according to volume and structural patterns across bank hops. ";
    explanationBase += creditProfile.riskLevel > 80 ? `Critical: The applicant's deviation from population averages significantly penalized the verification score, mandating a ${creditProfile.recommendation}.` : `The applicant's consistency aligned with trusted entities driving the approval criteria.`;

    const rationaleText = doc.splitTextToSize(explanationBase, 180);
    doc.text(rationaleText, 14, textY);

    // Add corporate footer
    const footY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('CFI Network - Secured by Explainable AI • Confidential & Proprietary', 14, footY);

    // KYC Status Section
    const kycY = textY + 25;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Latest KYC Verification Profile', 14, kycY);

    autoTable(doc, {
      startY: kycY + 4,
      head: [['Identity Attribute', 'Verified Content']],
      body: [
        ['Customer Full Name', kycData.customerName || creditProfile.name],
        ['Linked Bank Account', kycData.accountNumber || 'ACC-9923-1120'],
        ['Aadhaar Number', kycData.aadhaarNumber || 'XXXX-XXXX-8921'],
        ['Mobile Number', kycData.mobileNumber || '+91 99XXXXXX01'],
        ['Biometric Liveness', capturedImage ? 'Verified (Local Match)' : 'Verified (Demo Registry)'],
        ['KYC Check Status', 'CLEARED - FIPS Level 3']
      ],
      theme: 'grid',
      headStyles: { fillColor: [52, 199, 89], textColor: 20 },
      styles: { fontSize: 10 }
    });

    if (capturedImage) {
      const finalImgY = doc.lastAutoTable.finalY + 10;
      doc.text('Biometric Match Snapshot', 14, finalImgY);
      doc.addImage(capturedImage, 'PNG', 14, finalImgY + 5, 40, 30);
    }

    // Save PDF
    doc.save(`Compliance_Report_${creditProfile.id}.pdf`);
  };

  const startCamera = async () => {
    try {
      if (!modelsLoaded) {
        setFaceMessage("Initializing AI Core...");
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setModelsLoaded(true);
        setFaceMessage("AI Core Initialized. Awaiting Face Data...");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setCapturedImage(null);
      setIsFaceAligned(false);
    } catch (err) {
      console.error("Error accessing camera:", err);
      addToast("Please allow camera permissions to proceed with Liveness Capture.", 'error');
    }
  };

  const handleVideoPlay = () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Clear any previous interval
    if (detectionInterval.current) clearInterval(detectionInterval.current);
    
    // Slight delay to ensure video dimensions are resolved
    setTimeout(() => {
      const displaySize = { width: video.videoWidth || 300, height: video.videoHeight || 300 };
      faceapi.matchDimensions(canvas, displaySize);
      
      detectionInterval.current = setInterval(async () => {
        if (!cameraActive || video.paused || video.ended) {
          clearInterval(detectionInterval.current);
          return;
        }
        
        try {
          const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          if (detections.length === 0) {
            setIsFaceAligned(false);
            setFaceMessage('No Face Detected (Invalid Object / Hand)');
            
            // Draw Full red border to indicate invalid frame
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.lineWidth = 6;
            ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
            
            ctx.font = "16px Inter";
            ctx.fillStyle = "rgba(255, 0, 0, 1)";
            ctx.fillText("Hand/Invalid Object Detected", 20, 30);
          } else if (detections.length > 1) {
            setIsFaceAligned(false);
            setFaceMessage('Multiple faces detected! Only one allowed.');
            faceapi.draw.drawDetections(canvas, resizedDetections, { withScore: false, boxColor: 'rgba(255, 0, 0, 0.8)' });
          } else {
            const box = resizedDetections[0].box;
            const faceArea = box.width * box.height;
            const screenArea = canvas.width * canvas.height;
            const ratio = faceArea / screenArea;
            
            if (ratio < 0.05) {
              setIsFaceAligned(false);
              setFaceMessage('Move closer to the camera');
              faceapi.draw.drawDetections(canvas, resizedDetections, { withScore: false, boxColor: 'rgba(255, 0, 0, 0.8)' }); // Red for too far
            } else {
              setIsFaceAligned(true);
              setFaceMessage('Face Tracking Locked ✓');
              faceapi.draw.drawDetections(canvas, resizedDetections, { withScore: false, boxColor: 'rgba(0, 255, 0, 0.8)' }); // Green!
            }
          }
        } catch (error) {
          // Ignore async errors if video gets unmounted rapidly
        }
      }, 150);
    }, 500);
  };

  const captureImage = () => {
    if (!isFaceAligned) {
      addToast("AI must verify exactly one face to capture.", "error");
      return;
    }

    if (videoRef.current && canvasRef.current) {
      // Draw actual camera frame onto a temporary canvas for the snapshot
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = videoRef.current.videoWidth;
      tempCanvas.height = videoRef.current.videoHeight;
      const context = tempCanvas.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, tempCanvas.width, tempCanvas.height);
      
      const imgDataUrl = tempCanvas.toDataURL('image/png');
      setCapturedImage(imgDataUrl);
      
      // Stop tracking
      if (detectionInterval.current) clearInterval(detectionInterval.current);
      addToast("Image Captured safely under AI supervision!");
    }
  };

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
    };
  }, []);

  const handleResetKYC = () => {
    setKycData({
      customerName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      aadhaarNumber: '',
      mobileNumber: '',
      address: ''
    });
    setCapturedImage(null);
    setCameraActive(false);
    setIsFaceAligned(false);
    setFaceMessage('Initializing AI...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
    addToast("KYC Form Cleared & Initialized.", "success");
  };

  const handleKYCSubmit = async () => {
    if (!capturedImage) {
      addToast("Please capture liveness photo first.", 'warning');
      return;
    }

    try {
      const payload = {
        ...kycData,
        image: capturedImage
      };

      const res = await fetch(`${API_URL}/kyc/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        addToast("KYC Processed Successfully! Report added to Compliance.", "success");
        generateKYCReport();

        // Log to compliance
        const reportId = `KYC-${Math.floor(1000 + Math.random() * 9000)}`;
        setComplianceLogs(prev => [{
          id: reportId,
          type: 'e-KYC Onboarding',
          entity: kycData.customerName || 'Unknown Customer',
          author: `admin@${selectedBank?.id || 'finguard'}.co.in`,
          time: 'Just Now',
          status: 'VERIFIED',
          statusColor: 'success'
        }, ...prev]);

        // Removed auto-redirect so the user can use the "Start New Entry" button right away
      } else {
        addToast("Failed to process KYC.", 'error');
      }
    } catch (err) {
      console.error(err);

      // MOCK SUCCESS FOR OFFLINE DEMO
      const reportId = `KYC-${Math.floor(1000 + Math.random() * 9000)}`;
      setComplianceLogs(prev => [{
        id: reportId,
        type: 'e-KYC Onboarding',
        entity: kycData.customerName || 'Unknown Customer',
        author: `admin@${selectedBank?.id || 'finguard'}.co.in`,
        time: 'Just Now',
        status: 'VERIFIED',
        statusColor: 'success'
      }, ...prev]);

      addToast("KYC Processed Successfully! Report added.", 'success');
      // Removed auto-redirect
    }
  };

  const generateKYCReport = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('e-KYC Submission Report', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Customer Info Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Customer Details', 14, 48);

    autoTable(doc, {
      startY: 52,
      head: [['Field', 'Details']],
      body: [
        ['Customer Name', kycData.customerName],
        ['Account Number', kycData.accountNumber],
        ['Bank Name', kycData.bankName],
        ['IFSC Code', kycData.ifscCode],
        ['Aadhaar Number', kycData.aadhaarNumber],
        ['Mobile Number', kycData.mobileNumber],
        ['Address', kycData.address],
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 240, 255], textColor: 20 },
      styles: { fontSize: 11, cellPadding: 4 }
    });

    const finalY = doc.lastAutoTable.finalY + 14;

    doc.setFontSize(14);
    doc.text('Liveness Capture', 14, finalY);
    if (capturedImage) {
      doc.addImage(capturedImage, 'PNG', 14, finalY + 5, 80, 60);
    }

    const safeName = kycData.customerName ? kycData.customerName.replace(/\s+/g, '_') : 'Customer';
    doc.save(`KYC_Report_${safeName}.pdf`);
  };

  // ── Biometric helpers ────────────────────────────────────────────────────────
  const calcBioScore = () => {
    const b = bioRef.current;
    if (b.keyLatencies.length === 0) return 0;
    const avg = b.keyLatencies.reduce((a, v) => a + v, 0) / b.keyLatencies.length;
    const charCount = b.charCount || 1;
    const elapsed = (Date.now() - b.startTime) / 1000 || 1;
    const typingSpeed = charCount / elapsed;
    const vels = b.mouseVels;
    const meanV = vels.length ? vels.reduce((a, v) => a + v, 0) / vels.length : 0;
    const varV = vels.length > 1
      ? vels.reduce((a, v) => a + (v - meanV) ** 2, 0) / vels.length : 999;

    let score = 0;
    if (avg < 50) score += 25;
    if (avg > 800) score += 15;
    if (b.backspaces === 0 && charCount > 8) score += 20;
    if (b.pauses > 5) score += 10;
    if (varV < 10) score += 20;
    if (b.reversals < 2) score += 15;
    if (b.pasteFlag) score += 35;
    score = Math.min(100, score);

    const metrics = {
      avgKeystrokeLatency: Math.round(avg),
      typingSpeed: Math.round(typingSpeed * 10) / 10,
      backspaceCount: b.backspaces,
      pauseCount: b.pauses,
      mouseVelocityVariance: Math.round(varV * 10) / 10,
      directionReversals: b.reversals,
      pasteDetected: b.pasteFlag,
    };
    setBioMetrics(metrics);
    setBioScore(score);
    if (score <= 30) setBioStatus('normal');
    else if (score <= 60) setBioStatus('unusual');
    else setBioStatus('anomalous');
    return { score, metrics };
  };

  const handleBioKeyDown = (e) => {
    const b = bioRef.current;
    const now = Date.now();
    if (b.lastKeyTime) {
      const lat = now - b.lastKeyTime;
      if (lat > 500) b.pauses++;
      b.keyLatencies.push(lat);
    }
    b.lastKeyTime = now;
    b.holdTimes[e.key] = now;
    if (e.key === 'Backspace') b.backspaces++;
    else b.charCount++;
  };

  const handleBioKeyUp = (e) => {
    // hold duration tracked if needed
    calcBioScore();
  };

  const handleBioPaste = () => {
    bioRef.current.pasteFlag = true;
    calcBioScore();
  };

  const handleBioMouseMove = (e) => {
    const b = bioRef.current;
    const now = Date.now();
    if (b.lastMouseTime) {
      const dt = (now - b.lastMouseTime) / 1000 || 0.001;
      const dx = e.clientX - b.lastMouseX;
      const dy = e.clientY - b.lastMouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const vel = dist / dt;
      b.mouseVels.push(vel);
      if (b.mouseVels.length > 50) b.mouseVels.shift();
      // direction reversals
      if (b.lastDx !== 0 && Math.sign(dx) !== Math.sign(b.lastDx)) b.reversals++;
      b.lastDx = dx; b.lastDy = dy;
    }
    b.lastMouseX = e.clientX; b.lastMouseY = e.clientY;
    b.lastMouseTime = now;
  };

  const resetBiometrics = () => {
    bioRef.current = {
      lastKeyTime: 0, keyLatencies: [], holdTimes: {}, backspaces: 0,
      pauses: 0, charCount: 0, startTime: Date.now(),
      mouseTimes: [], mouseVels: [], lastMouseX: 0, lastMouseY: 0,
      lastMouseTime: 0, directions: [], lastDx: 0, lastDy: 0,
      reversals: 0, pasteFlag: false,
      pwHoverStart: 0, pwHoverTotal: 0,
    };
    setBioScore(0); setBioMetrics({ avgKeystrokeLatency: 0, typingSpeed: 0, backspaceCount: 0, pauseCount: 0, mouseVelocityVariance: 0, directionReversals: 0, pasteDetected: false });
    setBioStatus('idle'); setLoginBlocked(false); setLoginWarning(false); setBioClearance(null);
    setSupervisorOtp(''); setOtpError(false);
  };

  // ── Demo simulators ──────────────────────────────────────────────────────────
  const simulateNormalUser = (usernameRef, passwordRef) => {
    resetBiometrics();
    const text = 'admin@sbi.co.in';
    const pass = 'SecurePass123';
    let ui = 0, pi = 0;
    const b = bioRef.current;
    b.startTime = Date.now();
    const iv = setInterval(() => {
      const now = Date.now();
      if (ui < text.length) {
        if (b.lastKeyTime) b.keyLatencies.push(now - b.lastKeyTime + Math.random() * 30);
        b.lastKeyTime = now;
        b.charCount++;
        b.reversals = 4;
        if (usernameRef.current) usernameRef.current.value = text.slice(0, ++ui);
      } else if (pi < pass.length) {
        const lat = 80 + Math.random() * 60;
        b.keyLatencies.push(lat);
        b.lastKeyTime = now;
        b.charCount++;
        b.reversals = 5;
        b.mouseVels = Array.from({ length: 20 }, () => 50 + Math.random() * 200);
        if (passwordRef.current) passwordRef.current.value = pass.slice(0, ++pi);
        calcBioScore();
      } else {
        clearInterval(iv);
        calcBioScore();
      }
    }, 90);
  };

  const simulateBotAttack = (usernameRef, passwordRef) => {
    resetBiometrics();
    if (usernameRef.current) usernameRef.current.value = 'admin@sbi.co.in';
    if (passwordRef.current) passwordRef.current.value = 'password';
    const b = bioRef.current;
    b.keyLatencies = [10, 12, 11, 10, 9, 13, 10];
    b.backspaces = 0; b.charCount = 22; b.pauses = 0;
    b.mouseVels = Array.from({ length: 20 }, () => 0.5);
    b.reversals = 0; b.pasteFlag = false;
    calcBioScore();
  };

  const simulateCredentialStuffing = (usernameRef, passwordRef) => {
    resetBiometrics();
    if (usernameRef.current) usernameRef.current.value = 'stolen@victim.com';
    if (passwordRef.current) passwordRef.current.value = 'leaked_password';
    bioRef.current.pasteFlag = true;
    bioRef.current.charCount = 20;
    bioRef.current.keyLatencies = [8, 9];
    bioRef.current.reversals = 0;
    bioRef.current.mouseVels = [0.2, 0.3];
    calcBioScore();
  };

  // ── Login handler (biometric-gated) ─────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selectedBank) return;

    const { score, metrics } = calcBioScore();

    // Compliance log
    const logEntry = {
      event: 'LOGIN_ATTEMPT',
      timestamp: new Date().toISOString(),
      bank: selectedBank?.name,
      biometric_score: score,
      risk_level: score <= 30 ? 'LOW' : score <= 60 ? 'MEDIUM' : 'HIGH',
      paste_detected: metrics?.pasteDetected,
      avg_keystroke_latency: `${metrics?.avgKeystrokeLatency}ms`,
      action_taken: score <= 30 ? 'GRANTED' : score <= 60 ? 'ENHANCED_LOG' : 'BLOCKED',
    };
    console.log('%c[CFI Biometric Log]', 'color:#00f0ff;font-weight:bold', logEntry);

    if (score > 60) {
      setLoginBlocked(true); setLoginWarning(false);
      setBioClearance('blocked');
      return;
    }
    if (score > 30) {
      setLoginWarning(true); setBioClearance('enhanced');
    }

    const doLogin = async () => {
      const username = e.target[0].value;
      const password = e.target[1].value;
      try {
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
          if (score <= 30) setBioClearance('granted');
          addToast(`Secure Connect: Verified ${data.user.branch_name} Branch node.`);
        } else {
          addToast('Invalid credentials, please try again.', 'error');
        }
      } catch (err) {
        console.error(err);
        addToast('Server connection error for login.', 'error');
        setIsAuthenticated(true);
      }
    };

    if (score > 30 && score <= 60) {
      setTimeout(doLogin, 1500);
    } else {
      doLogin();
    }
  };

  const handleCaseAction = async (action, id) => {
    try {
      const res = await fetch(`${API_URL}/investigation/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        addToast(data.message);
        // Refresh anomalies if it's the fraud tab, but we're mocking it so just an alert is fine
      } else {
        addToast("Action failed.", 'error');
      }
    } catch (err) {
      console.error(err);
      addToast("Action locally recorded.", 'success');
    }
  };

  const supportedBanks = [
    { id: 'sbi', name: 'SBI', color: '#005596', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/SBI-logo.svg' },
    { id: 'hdfc', name: 'HDFC Bank', color: '#004C8F', logo: '/hdfc_bank_logo.png?v=2' },
    { id: 'pnb', name: 'PNB', color: '#A32020', logo: 'https://static.vecteezy.com/system/resources/previews/020/336/282/original/punjab-national-bank-pnb-bank-logo-free-free-vector.jpg' },
    { id: 'bob', name: 'Bank of Baroda', color: '#F15A22', logo: 'https://1000logos.net/wp-content/uploads/2021/06/Bank-of-Baroda-logo.png' },
    { id: 'canara', name: 'Canara', color: '#005EB8', logo: 'https://www.liblogo.com/img-logo/ca8792c86d-canara-bank-logo-canara-bank-launches-qualified-institutional-placement.png' },
    { id: 'union', name: 'Union Bank', color: '#D52B1E', logo: 'https://www.bankingfinance.in/wp-content/uploads/2017/12/Union-Bank-of-India.jpg' },
    { id: 'boi', name: 'Bank of India', color: '#005A9C', logo: 'https://logos-world.net/wp-content/uploads/2020/01/Bank-of-India-Logo-before-2011.png' },
    { id: 'indian', name: 'Indian Bank', color: '#005EB8', logo: 'https://companieslogo.com/img/orig/INDIANB.NS_BIG-f675f730.png?t=1615846835' },
    { id: 'central', name: 'Central Bank', color: '#005EB8', logo: '/central_bank_logo.png' },
    { id: 'iob', name: 'Indian Overseas', color: '#005A9C', logo: 'https://companieslogo.com/img/orig/IOB.NS_BIG-09a26177.png?t=1613454098' },
    { id: 'uco', name: 'UCO Bank', color: '#FFD700', logo: 'https://www.thebusinessquiz.com/wp-content/uploads/2014/11/UCO-Bank-Logo.jpg' },
    { id: 'bom', name: 'Maharashtra', color: '#005A9C', logo: 'https://cdn.brandfetch.io/bankofmaharashtra.in/fallback/lettermark/theme/dark/h/256/w/256/icon?c=1bfwsmEH20zzEfSNTed' },
    { id: 'psb', name: 'Punjab & Sind', color: '#00703C', logo: 'https://logo.clearbit.com/punjabandsindbank.co.in' }
  ];

  if (!isAuthenticated) {
    // Refs for demo simulator access to input DOM nodes
    const usernameInputRef = React.createRef();
    const passwordInputRef = React.createRef();

    // Biometric visual helpers
    const scoreColor = bioScore <= 30 ? '#34d399' : bioScore <= 60 ? '#fbbf24' : '#ef4444';
    const statusText = bioStatus === 'idle' ? 'Awaiting input…'
      : bioStatus === 'normal' ? 'Behavioral Pattern: Normal'
      : bioStatus === 'unusual' ? 'Behavioral Pattern: Unusual'
      : 'Behavioral Pattern: Anomalous';
    const circumference = 2 * Math.PI * 42; // r=42
    const dashOffset = circumference - (bioScore / 100) * circumference;

    const rhythmLabel = () => {
      if (bioStatus === 'idle') return '—';
      if (bioMetrics.avgKeystrokeLatency < 50) return 'Scripted';
      if (bioMetrics.avgKeystrokeLatency > 800) return 'Irregular';
      return 'Normal';
    };
    const mouseConfidence = () => {
      if (bioStatus === 'idle') return '—';
      const v = bioMetrics.mouseVelocityVariance;
      if (v < 10) return 'Low';
      if (v < 100) return 'Medium';
      return 'High';
    };

    return (
      <>
        <ParticleBackground />
        <style>{`
          @keyframes brainwave {
            0%   { d: path('M0,15 C10,5 20,25 30,15 C40,5 50,25 60,15 C70,5 80,25 90,15 C100,5 110,25 120,15'); }
            50%  { d: path('M0,15 C10,25 20,5 30,15 C40,25 50,5 60,15 C70,25 80,5 90,15 C100,25 110,5 120,15'); }
            100% { d: path('M0,15 C10,5 20,25 30,15 C40,5 50,25 60,15 C70,5 80,25 90,15 C100,5 110,25 120,15'); }
          }
          @keyframes bioGaugeFill {
            from { stroke-dashoffset: ${circumference}; }
            to   { stroke-dashoffset: ${dashOffset}; }
          }
          @keyframes stroke-dashoffset { to { stroke-dashoffset: 0; } }
          @keyframes blink-badge { 0%,100%{opacity:1} 50%{opacity:0.4} }
          @keyframes spin { 100% { transform: rotate(360deg); } }
          .bio-wave-path { animation: brainwave 2.5s ease-in-out infinite; }
        `}</style>

        <div
          onMouseMove={handleBioMouseMove}
          style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', gap: '24px', padding: '20px', flexWrap: 'wrap' }}
        >
          {/* ── Login card ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: '480px', padding: '40px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}
          >
            {/* Ambient inner glow */}
            <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.05) 0%, transparent 50%)', animation: 'spin 20s linear infinite', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ textAlign: 'center', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
              <ShieldAlert color="var(--accent-cyan)" size={48} style={{ margin: '0 auto 16px' }} />
              <h1 className="text-gradient" style={{ fontSize: '28px', marginBottom: '8px' }}>Central Fraud Intelligence</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Inter-Banking Security Authentication Portal</p>
            </div>

            {!selectedBank ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '14px', marginBottom: '8px', textAlign: 'center' }}>Select your Financial Institution</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                  {supportedBanks.map(bank => (
                    <button
                      key={bank.id}
                      onClick={() => { setSelectedBank(bank); resetBiometrics(); }}
                      style={{ padding: '12px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = bank.color; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    >
                      <div style={{ width: '76px', height: '76px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
                        <img src={bank.logo} alt={bank.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                        <span style={{ display: 'none', color: '#333', fontWeight: 'bold', fontSize: '20px', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>{bank.name.substring(0, 2)}</span>
                      </div>
                      <span style={{ fontWeight: 500, fontSize: '11px', textAlign: 'center', color: 'white' }}>{bank.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '16px', fontWeight: '500', color: selectedBank.color, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: '#fff', borderRadius: '6px', padding: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '36px', width: '36px' }}>
                      <img src={selectedBank.logo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
                    </div>
                    {selectedBank.name} Portal
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => { setSelectedBank(null); resetBiometrics(); }}>Change Bank</span>
                </div>

                {/* Unusual warning banner */}
                {loginWarning && !loginBlocked && (
                  <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: '8px', fontSize: '12px', color: '#fbbf24', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '16px' }}>⚠️</span>
                    <span>Unusual input pattern detected. Proceeding with enhanced logging.</span>
                  </div>
                )}

                {/* Blocked alert + supervisor OTP */}
                {loginBlocked && (
                  <div style={{ marginBottom: '16px', padding: '14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '600', marginBottom: '6px' }}>🚫 Anomalous operator behavior detected</div>
                    <div style={{ fontSize: '12px', color: '#fca5a5', marginBottom: '14px' }}>Access requires supervisor authorization. Enter 6-digit OTP.</div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Supervisor OTP"
                      value={supervisorOtp}
                      onChange={(e) => { setSupervisorOtp(e.target.value); setOtpError(false); }}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${otpError ? '#ef4444' : 'rgba(239,68,68,0.4)'}`, color: 'white', outline: 'none', letterSpacing: '6px', textAlign: 'center', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}
                    />
                    {otpError && <div style={{ color: '#ef4444', fontSize: '11px', textAlign: 'center' }}>Incorrect OTP. Try again.</div>}
                    <button
                      onClick={() => {
                        if (supervisorOtp === '221133') { setLoginBlocked(false); setBioClearance('enhanced'); setLoginWarning(true);}
                        else setOtpError(true);
                      }}
                      style={{ marginTop: '8px', width: '100%', padding: '10px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                    >Verify Supervisor OTP</button>
                  </div>
                )}

                {/* Biometric clearance flash */}
                {bioClearance === 'granted' && (
                  <div style={{ marginBottom: '10px', padding: '8px 14px', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.4)', borderRadius: '8px', fontSize: '12px', color: '#34d399', textAlign: 'center' }}>✅ Biometric clearance granted</div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>Bank Official Username</label>
                    <input
                      ref={usernameInputRef}
                      type="text"
                      placeholder={`e.g. employee@${selectedBank.id}.co.in`}
                      defaultValue={`admin@${selectedBank.id}.co.in`}
                      onKeyDown={handleBioKeyDown}
                      onKeyUp={handleBioKeyUp}
                      onPaste={handleBioPaste}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>Security Phase Key</label>
                    <input
                      ref={passwordInputRef}
                      type="password"
                      placeholder="••••••••"
                      defaultValue="password"
                      onKeyDown={handleBioKeyDown}
                      onKeyUp={handleBioKeyUp}
                      onPaste={handleBioPaste}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }}
                      required
                    />
                  </div>

                  {!loginBlocked && (
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '16px', background: loginWarning ? 'rgba(251,191,36,0.2)' : undefined, borderColor: loginWarning ? 'rgba(251,191,36,0.5)' : undefined, color: loginWarning ? '#fbbf24' : undefined, fontSize: '15px', fontWeight: '600' }}>
                      {loginWarning ? '⏳ ENHANCED VERIFICATION…' : 'SECURE LOGIN TO NETWORK'}
                    </button>
                  )}
                </form>

                {/* ── Demo buttons ── */}
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ padding: '1px 6px', background: 'rgba(168,85,247,0.2)', color: '#a855f7', borderRadius: '4px', fontWeight: '700', fontSize: '9px' }}>DEMO</span>
                    Biometric Simulation
                  </div>
                  {[
                    { label: '✅  Simulate Normal User', fn: () => simulateNormalUser(usernameInputRef, passwordInputRef), color: '#34d399' },
                    { label: '🤖  Simulate Bot Attack', fn: () => simulateBotAttack(usernameInputRef, passwordInputRef), color: '#f87171' },
                    { label: '📋  Simulate Credential Stuffing', fn: () => simulateCredentialStuffing(usernameInputRef, passwordInputRef), color: '#fb923c' },
                  ].map(({ label, fn, color }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={fn}
                      style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}30`, color, borderRadius: '8px', fontSize: '12px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s', fontFamily: 'Inter, sans-serif' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                    >{label}</button>
                  ))}
                </div>
              </motion.div>
            )}

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <FileKey size={14} /> FIPS 140-2 Compliant Node
            </div>
          </motion.div>

          {/* ── Biometric panel (hidden when no bank selected) ── */}
          {selectedBank && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="hidden md:flex flex-col"
              style={{
                width: '240px', flexShrink: 0,
                background: 'rgba(15,23,42,0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(0,240,255,0.2)',
                borderRadius: '20px',
                padding: '22px 18px',
                gap: '16px',
              }}
            >
              {/* Header */}
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#00f0ff', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🧠 Operator Biometric Verification
              </div>

              {/* SVG gauge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <svg width="110" height="110" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle
                    cx="55" cy="55" r="42"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 55 55)"
                    style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
                  />
                  <text x="55" y="51" textAnchor="middle" fill={scoreColor} fontSize="22" fontWeight="800" fontFamily="Inter,sans-serif">{bioScore}</text>
                  <text x="55" y="66" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="Inter,sans-serif">RISK SCORE</text>
                </svg>
                <div style={{ fontSize: '11px', fontWeight: '600', color: scoreColor, textAlign: 'center', minHeight: '28px', transition: 'color 0.3s' }}>
                  {statusText}
                </div>
              </div>

              {/* Metrics rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {[
                  { label: 'Typing Rhythm', value: rhythmLabel() },
                  { label: 'Input Velocity', value: bioStatus === 'idle' ? '—' : `${bioMetrics.typingSpeed} ch/s` },
                  { label: 'Mouse Confidence', value: mouseConfidence() },
                  { label: 'Paste Detection', value: bioMetrics.pasteDetected ? 'FLAGGED ⚠️' : 'Clean', flagged: bioMetrics.pasteDetected },
                ].map(({ label, value, flagged }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                    <span style={{ color: '#64748b' }}>{label}</span>
                    <span style={{ fontWeight: '700', color: flagged ? '#ef4444' : '#e2e8f0', animation: flagged ? 'blink-badge 1s ease infinite' : 'none' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Brainwave animation */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <div style={{ fontSize: '9px', color: '#334155', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Neural Pattern Feed</div>
                <svg width="204" height="32" viewBox="0 0 120 32" style={{ overflow: 'visible' }}>
                  <path
                    className="bio-wave-path"
                    d="M0,16 C10,6 20,26 30,16 C40,6 50,26 60,16 C70,6 80,26 90,16 C100,6 110,26 120,16"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="1.5"
                    strokeOpacity="0.7"
                  />
                </svg>
              </div>

              {/* Live key-latency bar */}
              <div style={{ fontSize: '9px', color: '#334155', textTransform: 'uppercase', letterSpacing: '1px' }}>Keystroke Latency</div>
              <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${Math.min(100, (bioMetrics.avgKeystrokeLatency / 10))}%`,
                  background: `linear-gradient(90deg, #34d399, ${scoreColor})`,
                  transition: 'width 0.5s ease',
                }} />
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'right', marginTop: '-8px' }}>{bioMetrics.avgKeystrokeLatency ? `${bioMetrics.avgKeystrokeLatency}ms avg` : '—'}</div>
            </motion.div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <ParticleBackground />
      <div className="app-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="logo" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldAlert color="var(--accent-cyan)" size={24} />
              <span className="text-gradient">CFI Network</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '36px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                Connected to
                <div style={{ background: '#fff', borderRadius: '6px', padding: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '40px', width: '40px' }}>
                  <img src={selectedBank.logo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
                </div>
                <strong style={{ fontSize: '16px', color: 'white' }}>{selectedBank.name}</strong>
              </div>
              {currentUser && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '4px', width: '100%', maxWidth: '180px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>🏦</span> <span style={{ color: 'white', fontWeight: 500 }}>{currentUser.branch_name} Branch</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px' }}>📍</span> <span>{currentUser.city}</span>
                  </div>
                  <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <CheckCircle size={12} /> Secure Node Verified
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="nav-menu">
            <div className={`nav-item ${activeTab === 'fraud' ? 'active' : ''}`} onClick={() => setActiveTab('fraud')}>
              <Network size={20} />
              {t('Graph Fraud Detection')}
            </div>
            <div className={`nav-item ${activeTab === 'heatmap' ? 'active' : ''}`} onClick={() => setActiveTab('heatmap')}>
              <Map size={20} />
              Fraud Heatmap
            </div>
            <div className={`nav-item ${activeTab === 'credit' ? 'active' : ''}`} onClick={() => setActiveTab('credit')}>
              <BarChart3 size={20} />
              {t('Credit Risk Modeling')}
            </div>
            <div className={`nav-item ${activeTab === 'investigation' ? 'active' : ''}`} onClick={() => setActiveTab('investigation')}>
              <Users size={20} />
              {t('Entity Investigation')}
            </div>
            <div className={`nav-item ${activeTab === 'freeze_tracker' ? 'active' : ''}`} onClick={() => setActiveTab('freeze_tracker')}>
              <Lock size={20} />
              {t('Freeze Source Tracker')}
            </div>
            <div className={`nav-item ${activeTab === 'kyc' ? 'active' : ''}`} onClick={() => setActiveTab('kyc')}>
              <ScanFace size={20} />
              {t('e-KYC Processing')}
            </div>
            <div className={`nav-item ${activeTab === 'compliance' ? 'active' : ''}`} onClick={() => setActiveTab('compliance')}>
              <FileKey size={20} />
              {t('Compliance Reports')}
            </div>
            <div className={`nav-item ${activeTab === 'redteam' ? 'active' : ''}`} onClick={() => setActiveTab('redteam')}>
              <AlertOctagon size={20} />
              Red Team Simulator
            </div>
          </div>

          <div style={{ marginTop: 'auto', padding: '20px 0', borderTop: '1px solid var(--panel-border)' }}>
            <div className="live-indicator mb-4">
              <div className="pulse"></div>
              {t('System Online & Active')}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="header">
            <div className="header-title">
              <h1 className="text-gradient">
                {activeTab === 'fraud' ? t('Real-Time Network Intelligence') : t('Explainable AI Assessment')}
              </h1>
              <p>
                {activeTab === 'fraud'
                  ? t('Graph-based anomaly detection across multi-layer transaction networks. Live Telemetry enabled.')
                  : t('Interpretable risk scoring framework combining behavioral and financial features.')}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="glass-panel" style={{ padding: '6px 16px', borderRadius: '20px', display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: '600', fontSize: '14px' }}>{t('Language:')}</span>
                  <select value={appLang} onChange={(e) => setAppLang(e.target.value)} style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '6px', padding: '4px 8px', outline: 'none', fontSize: '13px', cursor: 'pointer' }}>
                    <option value="en" style={{ color: '#000' }}>English</option>
                    <option value="hi" style={{ color: '#000' }}>हिन्दी (Hindi)</option>
                  </select>
                </div>
              </div>
              <button className="btn" style={{ background: 'transparent', padding: '8px' }}>
                <Bell size={20} />
              </button>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedBank?.id || 'default'}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: selectedBank ? '#fff' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    border: selectedBank ? `1px solid ${selectedBank.color}` : 'none',
                    boxShadow: selectedBank ? `0 0 12px ${selectedBank.color}60` : 'none',
                    flexShrink: 0
                  }}
                >
                  {selectedBank ? (
                    <>
                      <img
                        src={selectedBank.logo}
                        alt={selectedBank.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <span style={{ display: 'none', color: selectedBank.color, fontSize: '13px' }}>
                        {selectedBank.name.substring(0, 3).toUpperCase()}
                      </span>
                    </>
                  ) : (
                    "AD"
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'fraud' ? (
              <motion.div
                key="fraud"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="dashboard-grid"
              >
                {/* Stats */}
                <div className="glass-panel stat-card">
                  <div className="stat-card-title">{t('LIVE TRANSACTIONS')}</div>
                  <div className="stat-card-value">
                    {currentTelemetry.transactions.toLocaleString()}
                    <Activity size={20} color="var(--accent-cyan)" />
                  </div>
                  <div className="stat-card-change change-positive">{t('Streaming')}</div>
                </div>
                <div className="glass-panel stat-card" data-suspicious="true">
                  <div className="stat-card-title">{t('ONGOING ANOMALIES (FLAGGED)')}</div>
                  <div className="stat-card-value">
                    {currentTelemetry.flagged.toLocaleString()}
                    <AlertTriangle size={20} color="var(--warning)" />
                  </div>
                  <div className="stat-card-change change-warning">{t('Review Required')}</div>
                </div>
                <div className="glass-panel stat-card">
                  <div className="stat-card-title">Instantly Blocked</div>
                  <div className="stat-card-value">
                    {currentTelemetry.blocked.toLocaleString()}
                    <ShieldAlert size={20} color="var(--success)" />
                  </div>
                  <div className="stat-card-change change-positive">Auto-Interception active</div>
                </div>
                <div className="glass-panel stat-card">
                  <div className="stat-card-title">False Positive Rate</div>
                  <div className="stat-card-value text-gradient">
                    0.12%
                  </div>
                  <div className="stat-card-change change-positive">-0.05% optimization</div>
                </div>

                {/* Main Graph */}
                <div className="glass-panel graph-panel">
                  <div className="panel-header">
                    <div className="panel-title">
                      <Activity size={18} color="var(--accent-cyan)" />
                      Transaction Volume vs Anomalies (Live Flow)
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={fraudTimelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTxns" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="transactions" stroke="var(--accent-cyan)" fillOpacity={1} fill="url(#colorTxns)" isAnimationActive={false} />
                      <Area type="monotone" dataKey="flagged" stroke="var(--danger)" fillOpacity={1} fill="url(#colorFlagged)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Alerts List */}
                <div className="glass-panel side-panel" data-suspicious="true">
                  <div className="panel-header">
                    <div className="panel-title">
                      <AlertTriangle size={18} color="var(--warning)" />
                      High-Risk Entities (DB Synced)
                    </div>
                    <button className="btn" style={{ fontSize: '12px' }}>View All <ArrowUpRight size={14} /></button>
                  </div>
                  <div className="entity-list">
                    {networkAnomalies.length > 0 ? networkAnomalies.map((entity, i) => (
                      <div key={i} className="entity-item" onClick={() => loadCreditProfile(entity, true)} style={{ 
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: entity.risk > 90 ? 'rgba(255, 59, 48, 0.05)' : 'transparent', borderRadius: '8px', cursor: 'pointer', boxShadow: entity.risk > 90 ? '0 0 12px rgba(255, 59, 48, 0.15)' : 'none', transition: 'all 0.3s'
                      }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: entity.risk > 90 ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255,255,255,0.1)', border: entity.risk > 90 ? '1px solid var(--danger)' : '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: entity.risk > 90 ? '#ff5252' : '#fff', fontWeight: 'bold', fontSize: '13px', flexShrink: 0 }}>
                          {entity.avatar}
                        </div>
                        <div className="entity-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <span className="entity-name" style={{ display: 'block', fontWeight: '600', color: entity.risk > 90 ? '#ff5252' : '#fff', marginBottom: '3px', filter: entity.risk > 90 ? 'drop-shadow(0 0 8px rgba(255,59,48,0.4))' : 'none' }}>
                            {entity.entity} <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)', fontSize: '11px', marginLeft: '4px' }}>({entity.type})</span>
                          </span>
                          <span className="entity-id" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)' }}>{entity.id} • {entity.activity}</span>
                        </div>
                        <div className="entity-score">
                          <span className={`badge ${entity.risk > 90 ? 'badge-high' : entity.risk > 80 ? 'badge-medium' : 'badge-low'}`}>
                            Risk {entity.risk}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div style={{ color: 'var(--text-secondary)', padding: '20px', textAlign: 'center' }}>Loading data...</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'credit' ? (
              <motion.div
                key="credit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="dashboard-grid"
              >
                {creditProfile ? (
                  <>
                    {/* Profile Card */}
                    <div className="glass-panel" style={{ gridColumn: 'span 4' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: creditProfile.riskLevel > 90 ? 'var(--danger)' : creditProfile.riskLevel > 80 ? 'var(--warning)' : 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
                          {creditProfile.avatar || creditProfile.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>{t('Viewing Credit Profile:')}</p>
                          <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{creditProfile.name}</h2>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('ID:')} {creditProfile.id}</p>
                        </div>
                      </div>

                      <div style={{ padding: '20px', background: creditProfile.riskLevel > 80 ? 'rgba(255, 59, 48, 0.05)' : 'rgba(0,240,255,0.05)', borderRadius: '12px', border: creditProfile.riskLevel > 80 ? '1px solid rgba(255, 59, 48, 0.1)' : '1px solid rgba(0,240,255,0.1)', textAlign: 'center', marginBottom: '24px' }}>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{t('AI Credit Score')}</div>
                        <div className={creditProfile.riskLevel > 80 ? '' : 'text-gradient'} style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1', color: creditProfile.riskLevel > 80 ? 'var(--danger)' : 'inherit', filter: creditProfile.riskLevel > 80 ? 'drop-shadow(0 0 8px rgba(255,59,48,0.5))' : 'none' }}>{creditProfile.score}</div>
                        <div style={{ marginTop: '8px', color: creditProfile.riskLevel > 80 ? 'var(--danger)' : 'var(--success)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          {creditProfile.riskLevel > 80 ? <ShieldAlert size={14} /> : <TrendingUp size={14} /> } 
                          {creditProfile.riskLevel > 80 ? t('High Risk Model Flag') : t('Model Validated')}
                        </div>
                      </div>

                      <div className="panel-title mb-4">{t('Risk Factors Attribution')}</div>
                      <div className="risk-factors">
                        {creditProfile.impacts && creditProfile.impacts.map((imp, idx) => (
                          <div key={idx} className="risk-factor">
                            <div className="risk-factor-header">
                              <span>{t(imp.label)}</span>
                              <span style={{ color: imp.color }}>{t(imp.value)}</span>
                            </div>
                            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: imp.percent, background: imp.color }}></div></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Radar Chart */}
                    <div className="glass-panel" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
                      <div className="panel-header">
                        <div className="panel-title">{t('Behavioral Modeling Profile')}</div>
                      </div>
                      <div style={{ flex: 1, minHeight: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={creditProfile.factors}>
                            <PolarGrid stroke="var(--panel-border)" />
                            <PolarAngleAxis dataKey="factor" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name={creditProfile.name} dataKey="score" stroke="var(--accent-cyan)" fill="var(--accent-cyan)" fillOpacity={0.5} />
                            <Radar name={t("Population Avg")} dataKey="avg" stroke="var(--text-secondary)" fill="var(--text-secondary)" fillOpacity={0.2} strokeDasharray="3 3" />
                            <Tooltip
                              contentStyle={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', borderRadius: '8px' }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></div> {t('Customer Profile')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--text-secondary)', opacity: 0.5 }}></div> {t('Population Average')}
                        </div>
                      </div>
                    </div>

                    {/* Approvals */}
                    <div className="glass-panel" style={{ gridColumn: 'span 4' }}>
                      <div className="panel-header">
                        <div className="panel-title">{t('Model Explainability Output')}</div>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                        {t("The SHAP (SHapley Additive exPlanations) values indicate that the customer's on-time utility payments (alternative data) significantly offset their thin traditional credit file, pushing the decision boundary beyond the threshold for approval.")}
                      </p>

                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('RECOMMENDATION')}</div>
                        <div style={{ color: 'var(--success)', fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {creditProfile.recommendation} <ShieldAlert size={18} />
                        </div>
                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '12px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{t('Suggested Limit:')}</span>
                          <span style={{ color: 'white', fontWeight: '500' }}>₹{creditProfile.limit.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '8px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{t('Interest Tier:')}</span>
                          <span style={{ color: 'white', fontWeight: '500' }}>{creditProfile.tier}</span>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginBottom: '24px' }}
                        onClick={generateComplianceReport}
                      >
                        <Download size={16} />
                        {t('Generate Compliance Rationale Report')}
                      </button>

                      {/* Contact / Send Report Simulation Section */}
                      <div className="panel-title mb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>{t('Send Report to Customer')}</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(52, 199, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                            <MessageCircle size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{t('Registered Mobile')}</div>
                            <div style={{ fontSize: '15px', fontWeight: '500', color: 'white' }}>+91 98XXXXXX{Math.floor(Math.random() * 90 + 10)}</div>
                          </div>
                        </div>
                        
                        <button 
                          className="btn" 
                          style={{ background: 'rgba(52, 199, 89, 0.15)', color: 'var(--success)', border: '1px solid rgba(52, 199, 89, 0.3)', position: 'relative' }}
                          onClick={() => {
                            if (isSendingReport) return;
                            setIsSendingReport(true);
                            setTimeout(() => {
                              setIsSendingReport(false);
                              setReportSent(true);
                              setTimeout(() => setReportSent(false), 4000);
                            }, 1500);
                          }}
                        >
                          {isSendingReport ? <div className="pulse" style={{ margin: '0 8px' }}></div> : '👉 Send Report'}
                        </button>
                      </div>

                      <AnimatePresence>
                        {reportSent && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            style={{ padding: '16px', background: 'rgba(52, 199, 89, 0.15)', border: '1px solid var(--success)', borderRadius: '12px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}
                          >
                            <div style={{ background: 'var(--success)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Check size={14} strokeWidth={3} />
                            </div>
                            <div>
                              <div style={{ color: 'var(--success)', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{t('Report Sent Successfully!')}</div>
                              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.4' }}>{t('The credit report has been securely shared with the registered mobile number.')}</div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <CounterfactualExplainer entityName="Apex Global Trading LLC" baseScore={555} />
                  </>
                ) : (
                  <div style={{ gridColumn: 'span 12', color: 'white', textAlign: 'center', padding: '40px' }}>{t('Loading Credit Risk Profile from Backend...')}</div>
                )}
              </motion.div>
            ) : activeTab === 'investigation' ? (
              <motion.div
                key="investigation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{ padding: '0' }}
              >
                <EntityInvestigation
                  addToast={addToast}
                  setComplianceLogs={setComplianceLogs}
                  selectedBank={selectedBank}
                />
              </motion.div>
            ) : activeTab === 'freeze_tracker' ? (
              <motion.div
                key="freeze_tracker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="dashboard-grid"
              >
                <div className="glass-panel" style={{ gridColumn: 'span 12' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{t('Freeze Source Tracker')}</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('Trace account freeze & block origins across inter-bank branches.')}</p>
                    </div>
                    <div style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={14} color="var(--accent-cyan)" />
                      {t('Accessing from:')} {currentUser?.branch_name}, {currentUser?.city}
                    </div>
                  </div>

                  <form onSubmit={handleFreezeSearch} style={{ display: 'flex', gap: '16px', marginBottom: '30px' }}>
                    <input
                      type="text"
                      placeholder={t("Enter Customer ID, Account No, or Name (e.g. CUST001)")}
                      value={freezeSearchInput}
                      onChange={(e) => setFreezeSearchInput(e.target.value)}
                      autoFocus
                      style={{ flex: 1, padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0 24px', display: 'flex', gap: '8px', alignItems: 'center' }} disabled={isFreezeSearching}>
                      {isFreezeSearching ? <div className="pulse" style={{ width: 16, height: 16 }}></div> : <Search size={18} />}
                      {t('Search Trace')}
                    </button>
                  </form>

                  {isFreezeSearching && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      <div className="pulse" style={{ width: 30, height: 30, margin: '0 auto 16px', background: 'var(--accent-cyan)' }}></div>
                      {t('Querying FI Network Nodes...')}
                    </div>
                  )}

                  {!isFreezeSearching && hasSearched && !freezeSearchResults && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      <AlertTriangle size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                      {t('No freeze or block trace found for this input.')}
                    </div>
                  )}

                  {!isFreezeSearching && freezeSearchResults && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `4px solid ${freezeSearchResults.status === 'Blocked' ? 'var(--danger)' : freezeSearchResults.status === 'Frozen' ? 'var(--warning)' : 'var(--success)'}` }}>
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{freezeSearchResults.name}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{t('ID:')} {freezeSearchResults.customerId} | {t('Acc:')} {freezeSearchResults.accountNumber}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ padding: '6px 12px', borderRadius: '4px', background: freezeSearchResults.status === 'Blocked' ? 'rgba(255,70,70,0.1)' : 'rgba(255,180,0,0.1)', color: freezeSearchResults.status === 'Blocked' ? 'var(--danger)' : 'var(--warning)', fontWeight: 'bold', fontSize: '14px' }}>
                            {t('STATUS:')} {freezeSearchResults.status.toUpperCase()}
                          </div>
                          <button className="btn" onClick={() => setActiveTab('investigation')} style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px' }}>
                            <Network size={14} /> {t('View in Graph')}
                          </button>
                        </div>
                      </div>

                      <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-secondary)' }}>{t('Action Trace Timeline')}</h3>
                      <div style={{ position: 'relative', paddingLeft: '24px' }}>
                        <div style={{ position: 'absolute', top: '10px', bottom: '10px', left: '7px', width: '2px', background: 'var(--panel-border)' }}></div>
                        {freezeSearchResults.actions.map((act, i) => (
                          <div key={i} style={{ position: 'relative', marginBottom: i === freezeSearchResults.actions.length - 1 ? 0 : '24px', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                            <div style={{ position: 'absolute', left: '-22px', top: '24px', width: '10px', height: '10px', borderRadius: '50%', background: act.action.includes('Block') ? 'var(--danger)' : act.action.includes('Freeze') ? 'var(--warning)' : act.action.includes('Suspicious') ? 'var(--accent-purple)' : 'var(--success)', border: '2px solid var(--panel-bg)', zIndex: 1 }}></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div style={{ fontWeight: 'bold', fontSize: '15px', color: act.action.includes('Block') ? 'var(--danger)' : act.action.includes('Freeze') ? 'var(--warning)' : 'white' }}>{act.action}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{act.timestamp}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🏦 {act.bank} - {act.branch}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {act.city}</span>
                            </div>
                            <div style={{ fontSize: '13px', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', borderLeft: '2px solid var(--accent-cyan)' }}>
                              <strong>{t('Reason:')}</strong> {act.reason}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : activeTab === 'kyc' ? (
              <motion.div
                key="kyc"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="dashboard-grid"
              >
                <div className="glass-panel" style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{t('UIDAI e-KYC Verification & Onboarding')}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('Aadhaar OTP + Liveness Real-time Image Capture Verification')}</p>
                  </div>
                  <div style={{ padding: '6px 12px', background: 'rgba(52, 199, 89, 0.1)', color: 'var(--success)', borderRadius: '20px', border: '1px solid rgba(52, 199, 89, 0.3)', fontSize: '12px', fontWeight: 'bold' }}>{t('UIDAI GATEWAY: ONLINE')}</div>
                </div>

                <div className="glass-panel" style={{ gridColumn: 'span 7', minHeight: '400px' }}>
                  <div className="panel-header">
                    <div className="panel-title"><Users size={18} color="var(--accent-cyan)" /> {t('Customer Identification Data')}</div>
                  </div>

                  <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Customer Full Name')}</label>
                        <input type="text" value={kycData.customerName} onChange={(e) => setKycData({ ...kycData, customerName: e.target.value })} placeholder={t("As per bank records")} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Account Number')}</label>
                        <input type="text" value={kycData.accountNumber} onChange={(e) => setKycData({ ...kycData, accountNumber: e.target.value })} placeholder={t("Account Number")} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Bank Name')}</label>
                        <input type="text" value={kycData.bankName} onChange={(e) => setKycData({ ...kycData, bankName: e.target.value })} placeholder={t("e.g. SBI, HDFC")} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{t('IFSC Code')}</label>
                        <input type="text" value={kycData.ifscCode} onChange={(e) => setKycData({ ...kycData, ifscCode: e.target.value })} placeholder={t("IFSC Code")} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Aadhaar Number')}</label>
                        <input type="text" value={kycData.aadhaarNumber} onChange={(e) => setKycData({ ...kycData, aadhaarNumber: e.target.value })} placeholder={t("XXXX - XXXX - XXXX")} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none', letterSpacing: '2px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Linked Mobile Number')}</label>
                        <input type="text" value={kycData.mobileNumber} onChange={(e) => setKycData({ ...kycData, mobileNumber: e.target.value })} placeholder={t("+91 9XXXX XXXX")} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <button type="button" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                        if (!kycData.aadhaarNumber || !kycData.mobileNumber) {
                          addToast(t("Please enter Aadhaar and Mobile Number first."), "warning");
                        } else {
                          addToast(t("OTP will be sent to registered mobile number"), "success");
                        }
                      }}>{t('Request Aadhaar OTP')}</button>
                      <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                        <input id="kyc-otp-input" type="text" placeholder={t("Enter 6-digit OTP")} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px dotted var(--accent-cyan)', color: 'var(--accent-cyan)', outline: 'none', textAlign: 'center', letterSpacing: '4px' }} />
                        <button type="button" className="btn" style={{ background: 'var(--success)', color: 'white', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }} onClick={() => {
                          const otpVal = document.getElementById('kyc-otp-input').value;
                          if (otpVal.length >= 4) {
                            addToast(t("Data is sent successfully"), "success");
                          } else {
                            addToast(t("Please enter a valid OTP"), "warning");
                          }
                        }}>{t('Submit')}</button>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--panel-border)', margin: '16px 0' }}></div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>{t('Residential Address')}</label>
                      <textarea placeholder={t("Enter address...")} value={kycData.address} onChange={(e) => setKycData({ ...kycData, address: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none', resize: 'none', minHeight: '80px' }}></textarea>
                    </div>
                  </form>
                </div>

                <div className="glass-panel" style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="panel-header">
                    <div className="panel-title"><ScanFace size={18} color="var(--accent-purple)" /> {t('Liveness Image Capture')}</div>
                  </div>

                  <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px dashed var(--panel-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden' }}>
                    {capturedImage ? (
                      <img src={capturedImage} alt="Captured Liveness" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          onPlay={handleVideoPlay}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', display: cameraActive ? 'block' : 'none' }}
                        ></video>

                        {!cameraActive && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <ScanFace size={64} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
                            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>{t('Awaiting Camera Permissions...')}</p>
                          </div>
                        )}

                        {/* Camera UI Guidelines overlay (removed static dashed line in favor of AI box) */}
                      </>
                    )}
                    <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: cameraActive && !capturedImage ? 'block' : 'none' }}></canvas>
                    
                    {cameraActive && !capturedImage && (
                       <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', background: isFaceAligned ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '20px', border: `1px solid ${isFaceAligned ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)'}`, whiteSpace: 'nowrap' }}>
                         <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500' }}>{faceMessage}</span>
                       </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    {!cameraActive ? (
                      <button type="button" onClick={startCamera} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', textAlign: 'center', justifyContent: 'center' }}>
                        {modelsLoaded ? t('Enable Camera') : t('Load AI & Camera')}
                      </button>
                    ) : (
                      <button type="button" onClick={captureImage} disabled={!isFaceAligned} className="btn" style={{ flex: 1, background: isFaceAligned ? 'rgba(0, 255, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: isFaceAligned ? '#00ff00' : 'var(--text-secondary)', border: `1px solid ${isFaceAligned ? 'rgba(0, 255, 0, 0.4)' : 'transparent'}`, textAlign: 'center', justifyContent: 'center', cursor: isFaceAligned ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                        {isFaceAligned ? t('Capture Photo') : t('Waiting for AI Lock...')}
                      </button>
                    )}
                    <button type="button" disabled={!capturedImage} onClick={handleKYCSubmit} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', background: capturedImage ? 'var(--success)' : 'rgba(255,255,255,0.05)', borderColor: capturedImage ? 'var(--success)' : 'transparent', color: capturedImage ? '#fff' : 'var(--text-secondary)' }}>{t('Verify Liveness & Submit')}</button>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button type="button" onClick={handleResetKYC} className="btn" style={{ width: '100%', justifyContent: 'center', background: 'rgba(255, 59, 48, 0.1)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.3)' }}>
                      <RefreshCw size={16} style={{ marginRight: '6px' }} /> {t('Start New Entry')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'compliance' ? (
              <motion.div
                key="compliance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="dashboard-grid"
              >
                <div className="glass-panel" style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{t('Regulatory Filing & Compliance Vault')}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('FIPS 140-2 Audited Logs • Retained for 7 Years')}</p>
                  </div>
                  <button className="btn btn-primary"><Search size={16} style={{ marginRight: '6px' }} /> {t('Query Archives')}</button>
                </div>

                <div className="glass-panel" style={{ gridColumn: 'span 8', minHeight: '400px' }}>
                  <div className="panel-header">
                    <div className="panel-title"><FileKey size={18} color="var(--accent-purple)" /> Document Master Log</div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {selectedLogs.length > 0 && (
                        <button onClick={handleDeleteSelectedLogs} className="btn" style={{ background: 'rgba(255, 59, 48, 0.1)', color: 'var(--danger)', border: '1px solid rgba(255, 59, 48, 0.3)', padding: '6px 12px', fontSize: '12px' }}>
                          Delete Selected ({selectedLogs.length})
                        </button>
                      )}
                      <button onClick={handleExportCSV} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        Export to CSV
                      </button>
                    </div>
                  </div>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '12px 8px', width: '30px' }}>
                          <input
                            type="checkbox"
                            checked={complianceLogs.length > 0 && selectedLogs.length === complianceLogs.length}
                            onChange={handleSelectAllLogs}
                            style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                          />
                        </th>
                        <th style={{ padding: '12px 8px' }}>Report ID</th>
                        <th style={{ padding: '12px 8px' }}>Type</th>
                        <th style={{ padding: '12px 8px' }}>Target Entity</th>
                        <th style={{ padding: '12px 8px' }}>Generated By</th>
                        <th style={{ padding: '12px 8px' }}>Timestamp</th>
                        <th style={{ padding: '12px 8px' }}>Status</th>
                        <th style={{ padding: '12px 8px', width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {complianceLogs.map((log) => (
                          <motion.tr
                            key={log.id}
                            initial={{ opacity: 0, y: -20, backgroundColor: 'rgba(0, 240, 255, 0.2)' }}
                            animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                            transition={{ duration: 0.5 }}
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
                          >
                            <td style={{ padding: '12px 8px' }}>
                              <input
                                type="checkbox"
                                checked={selectedLogs.includes(log.id)}
                                onChange={() => handleSelectLog(log.id)}
                                style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '12px 8px', color: 'var(--accent-cyan)' }}>{log.id}</td>
                            <td style={{ padding: '12px 8px' }}>{log.type}</td>
                            <td style={{ padding: '12px 8px', fontWeight: log.type === 'e-KYC Onboarding' ? '600' : 'normal' }}>{log.entity}</td>
                            <td style={{ padding: '12px 8px' }}>{log.author}</td>
                            <td style={{ padding: '12px 8px' }}>{log.time}</td>
                            <td style={{ padding: '12px 8px' }}>
                              <span className={`badge ${log.statusColor === 'high' ? 'badge-high' :
                                log.statusColor === 'medium' ? 'badge-medium' :
                                  log.statusColor === 'success' ? 'badge-success' : 'badge-low'
                                }`}>{log.status}</span>
                            </td>
                            <td style={{ padding: '12px 8px', position: 'relative' }}>
                              <button onClick={() => setOpenMenuId(openMenuId === log.id ? null : log.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '18px', padding: '0 8px', fontWeight: 'bold' }}>⋮</button>
                              <AnimatePresence>
                                {openMenuId === log.id && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', background: '#1a1f2e', border: '1px solid var(--panel-border)', borderRadius: '8px', zIndex: 50, padding: '4px', minWidth: '120px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                                    <button className="btn" onClick={() => handleUpdateLogStatus(log.id, 'BLOCKED', 'high')} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', fontSize: '12px', padding: '8px 12px', textAlign: 'left', justifyContent: 'flex-start' }}>Block</button>
                                    <button className="btn" onClick={() => handleDeleteSingleLog(log.id)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '12px', padding: '8px 12px', textAlign: 'left', justifyContent: 'flex-start' }}>Remove</button>
                                    <button className="btn" onClick={() => handleUpdateLogStatus(log.id, 'VERIFIED', 'success')} style={{ background: 'transparent', border: 'none', color: 'var(--success)', fontSize: '12px', padding: '8px 12px', textAlign: 'left', justifyContent: 'flex-start' }}>Verified</button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                <div className="glass-panel" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="panel-title"><ShieldAlert size={18} color="var(--success)" /> Federal Sync Status</div>
                  <div style={{ background: 'rgba(52, 199, 89, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
                    <div style={{ color: 'var(--success)', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>FINCEN API: CONNECTED</div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      All SAR files are successfully propagating to the federal Financial Crimes Enforcement Network.
                    </p>
                  </div>

                  <div className="panel-title mt-4">Automated Data Retention</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Records (Encrypted):</span> <span style={{ fontWeight: '600' }}>1.4 Million</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Retention Cycle:</span> <span style={{ fontWeight: '600' }}>7 Years</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Next Auto-Purge:</span> <span style={{ fontWeight: '600', color: 'var(--warning)' }}>Oct 12, 2026</span></div>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'redteam' ? (
              <motion.div
                key="redteam"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <RedTeamSimulator onNavigate={(tab) => setActiveTab(tab)} />
              </motion.div>
            ) : activeTab === 'heatmap' ? (
              <motion.div
                key="heatmap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{ padding: '0 4px', height: 'calc(100vh - 130px)' }}
              >
                <IndiaFraudHeatmap />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Toast Notifications */}
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  background: toast.type === 'error' ? 'rgba(255, 59, 48, 0.9)' :
                    toast.type === 'warning' ? 'rgba(255, 204, 0, 0.9)' :
                      'rgba(52, 199, 89, 0.9)',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontWeight: '500',
                  fontSize: '14px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                {toast.type === 'error' ? <AlertTriangle size={18} /> :
                  toast.type === 'warning' ? <ShieldAlert size={18} /> :
                    <CheckCircle size={18} />}
                {toast.message}
                <button
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', marginLeft: 'auto', display: 'flex', alignItems: 'center' }}
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default App;
