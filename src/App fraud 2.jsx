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
    ScanFace
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
import ParticleBackground from './ParticleBackground';

const API_URL = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [selectedBank, setSelectedBank] = useState(null);
    const [activeTab, setActiveTab] = useState('fraud');
    const [networkAnomalies, setNetworkAnomalies] = useState([]);
    const [creditProfile, setCreditProfile] = useState(null);

    // Camera State for e-KYC
    const [cameraActive, setCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // KYC Form State
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

    // Fetch initial data
    useEffect(() => {
        // Fetch Anomalies
        fetch(`${API_URL}/anomalies`)
            .then(res => res.json())
            .then(data => setNetworkAnomalies(data))
            .catch(err => console.error("Error fetching anomalies:", err));

        // Fetch Credit Profile (Mocking an ID)
        fetch(`${API_URL}/credit/CUST-88219`)
            .then(res => res.json())
            .then(data => setCreditProfile(data))
            .catch(err => console.error("Error fetching credit profile:", err));
    }, []);

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
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    const generateComplianceReport = () => {
        if (!creditProfile) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text('FinGuard AI - Compliance Rationale Report', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Account ID: ${creditProfile.id}`, 14, 36);

        // Customer Info Section
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Customer Assessment Summary', 14, 48);

        // Autotable for profile info
        doc.autoTable({
            startY: 52,
            head: [['Attribute', 'Value']],
            body: [
                ['Customer Name', creditProfile.name],
                ['AI Credit Score', creditProfile.score.toString()],
                ['Model Recommendation', creditProfile.recommendation],
                ['Suggested Limit', `$${creditProfile.limit.toLocaleString()}`],
                ['Interest Tier', creditProfile.tier]
            ],
            theme: 'grid',
            headStyles: { fillColor: [0, 240, 255], textColor: 20 },
            styles: { fontSize: 11, cellPadding: 4 }
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

        const rationaleText = doc.splitTextToSize(
            "Regulatory Rationale: The AI model utilizes alternative data factors per guidelines. " +
            "The SHAP explanation proves that strong on-time alternative utility payments offset " +
            "any thin traditional credit history attributes. No discriminatory variables (age, race, gender) " +
            "are utilized in compiling this credit evaluation.",
            180
        );

        doc.text(rationaleText, 14, textY);

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
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraActive(true);
            setCapturedImage(null);
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Please allow camera permissions to proceed with Liveness Capture.");
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            // Set canvas size matching video resolving size
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const imgDataUrl = canvasRef.current.toDataURL('image/png');
            setCapturedImage(imgDataUrl);

            // Stop camera after capture if desired, or keep it running. Let's keep it running.
            alert("Image Captured successfully! You can verify and submit.");
        }
    };

    // Clean up camera stream on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleKYCSubmit = async () => {
        if (!capturedImage) {
            alert("Please capture liveness photo first.");
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
                alert(data.message);
                generateKYCReport();
            } else {
                alert("Failed to process KYC.");
            }
        } catch (err) {
            console.error(err);
            alert("Network error processing KYC.");
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

    const handleLogin = (e) => {
        e.preventDefault();
        if (!selectedBank) return;
        setIsAuthenticated(true);
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
                alert(data.message);
                // Refresh anomalies if it's the fraud tab, but we're mocking it so just an alert is fine
            } else {
                alert("Action failed.");
            }
        } catch (err) {
            console.error(err);
            alert("Network error.");
        }
    };

    const supportedBanks = [
        { id: 'sbi', name: 'SBI', color: '#005596', logo: 'https://www.freepnglogos.com/uploads/sbi-logo-png/sbi-logo-state-bank-india-group-vector-eps-0.png' },
        { id: 'hdfc', name: 'HDFC Bank', color: '#004C8F', logo: 'https://1000logos.net/wp-content/uploads/2021/06/HDFC-Bank-logo.jpg' },
        { id: 'pnb', name: 'PNB', color: '#A32020', logo: 'https://static.vecteezy.com/system/resources/previews/020/336/282/original/punjab-national-bank-pnb-bank-logo-free-free-vector.jpg' },
        { id: 'bob', name: 'Bank of Baroda', color: '#F15A22', logo: 'https://1000logos.net/wp-content/uploads/2021/06/Bank-of-Baroda-logo.png' },
        { id: 'canara', name: 'Canara', color: '#005EB8', logo: 'https://www.liblogo.com/img-logo/ca8792c86d-canara-bank-logo-canara-bank-launches-qualified-institutional-placement.png' },
        { id: 'union', name: 'Union Bank', color: '#D52B1E', logo: 'https://www.bankingfinance.in/wp-content/uploads/2017/12/Union-Bank-of-India.jpg' },
        { id: 'boi', name: 'Bank of India', color: '#005A9C', logo: 'https://logos-world.net/wp-content/uploads/2020/01/Bank-of-India-Logo-before-2011.png' },
        { id: 'indian', name: 'Indian Bank', color: '#005EB8', logo: 'https://companieslogo.com/img/orig/INDIANB.NS_BIG-f675f730.png?t=1615846835' },
        { id: 'central', name: 'Central Bank', color: '#005EB8', logo: 'https://logo.clearbit.com/centralbankofindia.co.in' },
        { id: 'iob', name: 'Indian Overseas', color: '#005A9C', logo: 'https://logo.clearbit.com/iob.in' },
        { id: 'uco', name: 'UCO Bank', color: '#FFD700', logo: 'https://logo.clearbit.com/ucobank.com' },
        { id: 'bom', name: 'Maharashtra', color: '#005A9C', logo: 'https://logo.clearbit.com/bankofmaharashtra.in' },
        { id: 'psb', name: 'Punjab & Sind', color: '#00703C', logo: 'https://assets.stickpng.com/images/627cce601b2e263b45696abb.png' }
    ];

    if (!isAuthenticated) {
        return (
            <>
                <ParticleBackground />
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="glass-panel"
                        style={{ width: '100%', maxWidth: '520px', padding: '40px' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
                                            onClick={() => setSelectedBank(bank)}
                                            style={{
                                                padding: '12px 8px',
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = bank.color }}
                                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                                        >
                                            <div style={{ width: '76px', height: '76px', background: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: `2px solid rgba(255,255,255,0.1)` }}>
                                                <img
                                                    src={bank.logo}
                                                    alt={bank.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }}
                                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                />
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
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: selectedBank.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ background: '#fff', borderRadius: '4px', padding: '2px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '20px', width: '20px' }}>
                                            <img src={selectedBank.logo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
                                        </div>
                                        {selectedBank.name} Portal
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setSelectedBank(null)}>Change Bank</span>
                                </div>
                                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>Bank Official Username</label>
                                        <input type="text" placeholder={`e.g. employee@${selectedBank.id}.co.in`} defaultValue={`admin@${selectedBank.id}.co.in`} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }} required />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>Security Phase Key</label>
                                        <input type="password" placeholder="••••••••" defaultValue="password" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }} required />
                                    </div>

                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '14px' }}>
                                        Secure Login to Network
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <FileKey size={14} /> FIPS 140-2 Compliant Node
                        </div>
                    </motion.div>
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
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '36px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Connected to
                            <div style={{ background: '#fff', borderRadius: '4px', padding: '2px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '20px', width: '20px' }}>
                                <img src={selectedBank.logo} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
                            </div>
                            <strong>{selectedBank.name}</strong>
                        </div>
                    </div>

                    <div className="nav-menu">
                        <div className={`nav-item ${activeTab === 'fraud' ? 'active' : ''}`} onClick={() => setActiveTab('fraud')}>
                            <Network size={20} />
                            Graph Fraud Detection
                        </div>
                        <div className={`nav-item ${activeTab === 'credit' ? 'active' : ''}`} onClick={() => setActiveTab('credit')}>
                            <BarChart3 size={20} />
                            Credit Risk Modeling
                        </div>
                        <div className={`nav-item ${activeTab === 'investigation' ? 'active' : ''}`} onClick={() => setActiveTab('investigation')}>
                            <Users size={20} />
                            Entity Investigation
                        </div>
                        <div className={`nav-item ${activeTab === 'kyc' ? 'active' : ''}`} onClick={() => setActiveTab('kyc')}>
                            <ScanFace size={20} />
                            e-KYC Processing
                        </div>
                        <div className={`nav-item ${activeTab === 'compliance' ? 'active' : ''}`} onClick={() => setActiveTab('compliance')}>
                            <FileKey size={20} />
                            Compliance Reports
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', padding: '20px 0', borderTop: '1px solid var(--panel-border)' }}>
                        <div className="live-indicator mb-4">
                            <div className="pulse"></div>
                            System Online & Active
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    <div className="header">
                        <div className="header-title">
                            <h1 className="text-gradient">
                                {activeTab === 'fraud' ? 'Real-Time Network Intelligence' : 'Explainable AI Assessment'}
                            </h1>
                            <p>
                                {activeTab === 'fraud'
                                    ? 'Graph-based anomaly detection across multi-layer transaction networks. Live Telemetry enabled.'
                                    : 'Interpretable risk scoring framework combining behavioral and financial features.'}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Search size={16} color="var(--text-secondary)" />
                                <input type="text" placeholder="Search entity or TXN..." style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none' }} />
                            </div>
                            <button className="btn" style={{ background: 'transparent', padding: '8px' }}>
                                <Bell size={20} />
                            </button>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                AD
                            </div>
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
                                    <div className="stat-card-title">Live Transactions</div>
                                    <div className="stat-card-value">
                                        {currentTelemetry.transactions.toLocaleString()}
                                        <Activity size={20} color="var(--accent-cyan)" />
                                    </div>
                                    <div className="stat-card-change change-positive">Streaming</div>
                                </div>
                                <div className="glass-panel stat-card" data-suspicious="true">
                                    <div className="stat-card-title">Ongoing Anomalies (Flagged)</div>
                                    <div className="stat-card-value">
                                        {currentTelemetry.flagged.toLocaleString()}
                                        <AlertTriangle size={20} color="var(--warning)" />
                                    </div>
                                    <div className="stat-card-change change-warning">Review Required</div>
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
                                            <div key={i} className="entity-item">
                                                <div className="entity-info">
                                                    <span className="entity-name">{entity.entity}</span>
                                                    <span className="entity-id">{entity.id} • {entity.type}</span>
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
                                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                                                    {creditProfile.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <h2 style={{ fontSize: '20px', fontWeight: '600' }}>{creditProfile.name}</h2>
                                                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>ID: {creditProfile.id}</p>
                                                </div>
                                            </div>

                                            <div style={{ padding: '20px', background: 'rgba(0,240,255,0.05)', borderRadius: '12px', border: '1px solid rgba(0,240,255,0.1)', textAlign: 'center', marginBottom: '24px' }}>
                                                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>AI Credit Score</div>
                                                <div className="text-gradient" style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1' }}>{creditProfile.score}</div>
                                                <div style={{ marginTop: '8px', color: 'var(--success)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                    <TrendingUp size={14} /> Model Validated
                                                </div>
                                            </div>

                                            <div className="panel-title mb-4">Risk Factors Attribution</div>
                                            <div className="risk-factors">
                                                <div className="risk-factor">
                                                    <div className="risk-factor-header">
                                                        <span>Payment Consistency</span>
                                                        <span className="text-gradient">High Positive Impact (+45)</span>
                                                    </div>
                                                    <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '85%', background: 'var(--success)' }}></div></div>
                                                </div>
                                                <div className="risk-factor">
                                                    <div className="risk-factor-header">
                                                        <span>Credit Utilization (32%)</span>
                                                        <span style={{ color: 'var(--warning)' }}>Moderate Impact (-10)</span>
                                                    </div>
                                                    <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '68%', background: 'var(--warning)' }}></div></div>
                                                </div>
                                                <div className="risk-factor">
                                                    <div className="risk-factor-header">
                                                        <span>Alternative Data (Utility Bills)</span>
                                                        <span className="text-gradient">Positive Impact (+15)</span>
                                                    </div>
                                                    <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '75%', background: 'var(--accent-cyan)' }}></div></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Radar Chart */}
                                        <div className="glass-panel" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column' }}>
                                            <div className="panel-header">
                                                <div className="panel-title">Behavioral Modeling Profile</div>
                                            </div>
                                            <div style={{ flex: 1, minHeight: '300px' }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={creditProfile.factors}>
                                                        <PolarGrid stroke="var(--panel-border)" />
                                                        <PolarAngleAxis dataKey="factor" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                        <Radar name={creditProfile.name} dataKey="score" stroke="var(--accent-cyan)" fill="var(--accent-cyan)" fillOpacity={0.5} />
                                                        <Radar name="Population Avg" dataKey="avg" stroke="var(--text-secondary)" fill="var(--text-secondary)" fillOpacity={0.2} strokeDasharray="3 3" />
                                                        <Tooltip
                                                            contentStyle={{ background: 'var(--panel-bg)', borderColor: 'var(--panel-border)', borderRadius: '8px' }}
                                                        />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-cyan)' }}></div> Customer Profile
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--text-secondary)', opacity: 0.5 }}></div> Population Average
                                                </div>
                                            </div>
                                        </div>

                                        {/* Approvals */}
                                        <div className="glass-panel" style={{ gridColumn: 'span 4' }}>
                                            <div className="panel-header">
                                                <div className="panel-title">Model Explainability Output</div>
                                            </div>
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                                                The SHAP (SHapley Additive exPlanations) values indicate that the customer's on-time utility payments (alternative data) significantly offset their thin traditional credit file, pushing the decision boundary beyond the threshold for approval.
                                            </p>

                                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>RECOMMENDATION</div>
                                                <div style={{ color: 'var(--success)', fontSize: '18px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {creditProfile.recommendation} <ShieldAlert size={18} />
                                                </div>
                                                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', margin: '12px 0' }}></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Suggested Limit:</span>
                                                    <span style={{ color: 'white', fontWeight: '500' }}>${creditProfile.limit.toLocaleString()}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '8px' }}>
                                                    <span style={{ color: 'var(--text-secondary)' }}>Interest Tier:</span>
                                                    <span style={{ color: 'white', fontWeight: '500' }}>{creditProfile.tier}</span>
                                                </div>
                                            </div>

                                            <button
                                                className="btn btn-primary"
                                                style={{ width: '100%', justifyContent: 'center' }}
                                                onClick={generateComplianceReport}
                                            >
                                                Generate Compliance Rationale Report
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ gridColumn: 'span 12', color: 'white', textAlign: 'center', padding: '40px' }}>Loading Credit Risk Profile from Backend...</div>
                                )}
                            </motion.div>
                        ) : activeTab === 'investigation' ? (
                            <motion.div
                                key="investigation"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="dashboard-grid"
                            >
                                {/* Case Management Header */}
                                <div className="glass-panel" data-suspicious="true" style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Active Investigation: TXN-8942 (CryptoBridge Ltd)</h2>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Assigned Analyst: Auto-Discovery • Status: PENDING REVIEW</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button onClick={() => handleCaseAction('freeze', 'TXN-8942')} className="btn" style={{ background: 'rgba(255, 59, 48, 0.1)', color: 'var(--danger)', border: '1px solid rgba(255, 59, 48, 0.3)' }}>Freeze Assets</button>
                                        <button onClick={() => handleCaseAction('false-positive', 'TXN-8942')} className="btn" style={{ background: 'rgba(255, 204, 0, 0.1)', color: 'var(--warning)', border: '1px solid rgba(255, 204, 0, 0.3)' }}>Mark False Positive</button>
                                        <button onClick={() => handleCaseAction('sar', 'TXN-8942')} className="btn btn-primary">File SAR (Suspicious Activity Report)</button>
                                    </div>
                                </div>

                                {/* Link Analysis Visual Mock */}
                                <div className="glass-panel" style={{ gridColumn: 'span 8', minHeight: '400px' }}>
                                    <div className="panel-header">
                                        <div className="panel-title"><Network size={18} color="var(--accent-purple)" /> Link Analysis (Entity Hops)</div>
                                    </div>
                                    <div style={{ position: 'relative', height: '300px', background: 'radial-gradient(circle at center, rgba(157,78,221,0.05), transparent 70%)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                                        {/* CSS-based Mock Nodes */}
                                        <div style={{ position: 'absolute', top: '130px', left: '10%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--text-secondary)', borderRadius: '8px', fontSize: '12px', zIndex: 2 }}>Origin: John Doe</div>
                                        <div style={{ position: 'absolute', top: '50px', left: '40%', padding: '8px 12px', background: 'rgba(0,240,255,0.1)', border: '1px solid var(--accent-cyan)', borderRadius: '8px', fontSize: '12px', zIndex: 2 }}>Hop 1: Shell Corp A</div>
                                        <div style={{ position: 'absolute', top: '220px', left: '45%', padding: '8px 12px', background: 'rgba(0,240,255,0.1)', border: '1px solid var(--accent-cyan)', borderRadius: '8px', fontSize: '12px', zIndex: 2 }}>Hop 1: Shell Corp B</div>
                                        <div style={{ position: 'absolute', top: '130px', left: '70%', padding: '8px 12px', background: 'rgba(255,59,48,0.1)', border: '1px solid var(--danger)', borderRadius: '8px', fontSize: '12px', zIndex: 2, boxShadow: '0 0 15px rgba(255,59,48,0.5)' }}>Destination: CryptoBridge Ltd</div>

                                        {/* SVG Connecting Lines Mock */}
                                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
                                            <path d="M 120 145 C 200 145, 200 65, 300 65" stroke="var(--text-secondary)" fill="transparent" strokeWidth="2" strokeDasharray="5,5" />
                                            <path d="M 120 145 C 200 145, 200 235, 350 235" stroke="var(--text-secondary)" fill="transparent" strokeWidth="2" strokeDasharray="5,5" />
                                            <path d="M 380 65 C 450 65, 450 145, 520 145" stroke="var(--danger)" fill="transparent" strokeWidth="2" />
                                            <path d="M 430 235 C 480 235, 480 145, 520 145" stroke="var(--danger)" fill="transparent" strokeWidth="2" />
                                        </svg>
                                    </div>
                                </div>

                                {/* KYC Profile & Geolocation Mock */}
                                <div className="glass-panel" style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <div className="panel-title mb-2">KYC Discrepancies</div>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', fontSize: '13px', lineHeight: '1.6' }}>
                                            <div style={{ color: 'var(--danger)', fontWeight: '600', marginBottom: '8px' }}>High Risk Failure</div>
                                            Domain <span style={{ color: 'var(--accent-cyan)' }}>cryptobridge.ltd</span> registered 3 days ago. IP originates from high-risk jurisdiction (Embargoed Region).
                                        </div>
                                    </div>

                                    <div>
                                        <div className="panel-title mb-2">Transaction Velocity Rules</div>
                                        <div className="risk-factors">
                                            <div className="risk-factor">
                                                <div className="risk-factor-header">
                                                    <span>Deposits &gt; $10,000 (24h)</span>
                                                    <span style={{ color: 'var(--danger)' }}>Triggered 9x</span>
                                                </div>
                                                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '100%', background: 'var(--danger)' }}></div></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <span className="badge badge-high">AML Alert</span>
                                        <span className="badge badge-high">Structuring</span>
                                        <span className="badge badge-medium">IP Proxy Detected</span>
                                    </div>
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
                                        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>UIDAI e-KYC Verification & Onboarding</h2>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Aadhaar OTP + Liveness Real-time Image Capture Verification</p>
                                    </div>
                                    <div style={{ padding: '6px 12px', background: 'rgba(52, 199, 89, 0.1)', color: 'var(--success)', borderRadius: '20px', border: '1px solid rgba(52, 199, 89, 0.3)', fontSize: '12px', fontWeight: 'bold' }}>UIDAI GATEWAY: ONLINE</div>
                                </div>

                                <div className="glass-panel" style={{ gridColumn: 'span 7', minHeight: '400px' }}>
                                    <div className="panel-header">
                                        <div className="panel-title"><Users size={18} color="var(--accent-cyan)" /> Customer Identification Data</div>
                                    </div>

                                    <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Customer Full Name</label>
                                                <input type="text" value={kycData.customerName} onChange={(e) => setKycData({ ...kycData, customerName: e.target.value })} placeholder="As per bank records" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Account Number</label>
                                                <input type="text" value={kycData.accountNumber} onChange={(e) => setKycData({ ...kycData, accountNumber: e.target.value })} placeholder="Account Number" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Bank Name</label>
                                                <input type="text" value={kycData.bankName} onChange={(e) => setKycData({ ...kycData, bankName: e.target.value })} placeholder="e.g. SBI, HDFC" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>IFSC Code</label>
                                                <input type="text" value={kycData.ifscCode} onChange={(e) => setKycData({ ...kycData, ifscCode: e.target.value })} placeholder="IFSC Code" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Aadhaar Number</label>
                                                <input type="text" value={kycData.aadhaarNumber} onChange={(e) => setKycData({ ...kycData, aadhaarNumber: e.target.value })} placeholder="XXXX - XXXX - XXXX" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none', letterSpacing: '2px' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Linked Mobile Number</label>
                                                <input type="text" value={kycData.mobileNumber} onChange={(e) => setKycData({ ...kycData, mobileNumber: e.target.value })} placeholder="+91 9XXXX XXXX" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none' }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                            <button type="button" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Request Aadhaar OTP</button>
                                            <input type="text" placeholder="Enter 6-digit OTP" style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px dotted var(--accent-cyan)', color: 'var(--accent-cyan)', outline: 'none', textAlign: 'center', letterSpacing: '4px' }} />
                                        </div>

                                        <div style={{ borderTop: '1px solid var(--panel-border)', margin: '16px 0' }}></div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Residential Address</label>
                                            <textarea placeholder="Enter address..." value={kycData.address} onChange={(e) => setKycData({ ...kycData, address: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', color: 'white', outline: 'none', resize: 'none', minHeight: '80px' }}></textarea>
                                        </div>
                                    </form>
                                </div>

                                <div className="glass-panel" style={{ gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div className="panel-header">
                                        <div className="panel-title"><ScanFace size={18} color="var(--accent-purple)" /> Liveness Image Capture</div>
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
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', display: cameraActive ? 'block' : 'none' }}
                                                ></video>

                                                {!cameraActive && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                        <ScanFace size={64} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '16px' }} />
                                                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center' }}>Awaiting Camera Permissions...</p>
                                                    </div>
                                                )}

                                                {/* Camera UI Guidelines overlay */}
                                                <div style={{ position: 'absolute', width: '180px', height: '240px', border: '2px dashed rgba(0, 240, 255, 0.5)', borderRadius: '120px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', display: cameraActive ? 'block' : 'none' }}></div>
                                            </>
                                        )}
                                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {!cameraActive ? (
                                            <button type="button" onClick={startCamera} className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', textAlign: 'center', justifyContent: 'center' }}>Enable Camera</button>
                                        ) : (
                                            <button type="button" onClick={captureImage} className="btn" style={{ flex: 1, background: 'rgba(0, 240, 255, 0.1)', color: 'var(--accent-cyan)', border: '1px solid rgba(0, 240, 255, 0.3)', textAlign: 'center', justifyContent: 'center' }}>Capture Photo</button>
                                        )}
                                        <button type="button" onClick={handleKYCSubmit} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', background: 'var(--success)', borderColor: 'var(--success)' }}>Verify Liveness & Submit</button>
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
                                        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Regulatory Filing & Compliance Vault</h2>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>FIPS 140-2 Audited Logs • Retained for 7 Years</p>
                                    </div>
                                    <button className="btn btn-primary"><Search size={16} style={{ marginRight: '6px' }} /> Query Archives</button>
                                </div>

                                <div className="glass-panel" style={{ gridColumn: 'span 8', minHeight: '400px' }}>
                                    <div className="panel-header">
                                        <div className="panel-title"><FileKey size={18} color="var(--accent-purple)" /> Document Master Log</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Export to CSV</div>
                                    </div>
                                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '13px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-secondary)' }}>
                                                <th style={{ padding: '12px 8px' }}>Report ID</th>
                                                <th style={{ padding: '12px 8px' }}>Type</th>
                                                <th style={{ padding: '12px 8px' }}>Target Entity</th>
                                                <th style={{ padding: '12px 8px' }}>Generated By</th>
                                                <th style={{ padding: '12px 8px' }}>Timestamp</th>
                                                <th style={{ padding: '12px 8px' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                <td style={{ padding: '12px 8px', color: 'var(--accent-cyan)' }}>SAR-9901</td>
                                                <td style={{ padding: '12px 8px' }}>Federal SAR Filing</td>
                                                <td style={{ padding: '12px 8px' }}>CryptoBridge Ltd</td>
                                                <td style={{ padding: '12px 8px' }}>admin@{selectedBank?.id || 'finguard'}.co.in</td>
                                                <td style={{ padding: '12px 8px' }}>Just Now</td>
                                                <td style={{ padding: '12px 8px' }}><span className="badge badge-high">SUBMITTED</span></td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                <td style={{ padding: '12px 8px', color: 'var(--accent-cyan)' }}>CR-FBD-22</td>
                                                <td style={{ padding: '12px 8px' }}>Credit Assessment (SHAP)</td>
                                                <td style={{ padding: '12px 8px' }}>CUST-88219</td>
                                                <td style={{ padding: '12px 8px' }}>Automated Model</td>
                                                <td style={{ padding: '12px 8px' }}>2 Hrs Ago</td>
                                                <td style={{ padding: '12px 8px' }}><span className="badge badge-low">ARCHIVED</span></td>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                <td style={{ padding: '12px 8px', color: 'var(--accent-cyan)' }}>FR-AL-011</td>
                                                <td style={{ padding: '12px 8px' }}>False Positive Log</td>
                                                <td style={{ padding: '12px 8px' }}>TXN-3910</td>
                                                <td style={{ padding: '12px 8px' }}>johndoe@bank.internal</td>
                                                <td style={{ padding: '12px 8px' }}>4 Hrs Ago</td>
                                                <td style={{ padding: '12px 8px' }}><span className="badge badge-medium">TRAINING SET</span></td>
                                            </tr>
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
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>
        </>
    );
};

export default App;
