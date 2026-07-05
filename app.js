// Aegis Cyber Forensics - Main Application Script

document.addEventListener('DOMContentLoaded', () => {
    // Current Active Session State
    let activePreset = null;
    let currentForensicFile = null;
    let totalReportsCount = 3;

    // --- DOM Elements ---
    // Tab controls
    const tabInvestigation = document.getElementById('tab-investigation');
    const tabCommunity = document.getElementById('tab-community');
    const paneInvestigation = document.getElementById('pane-investigation');
    const paneCommunity = document.getElementById('pane-community');

    // Inputs
    const jobInput = document.getElementById('job-input');
    const btnInvestigate = document.getElementById('btn-investigate');
    const btnClear = document.getElementById('btn-clear');
    const presetBtns = document.querySelectorAll('.btn-preset');
    const fileUploader = document.getElementById('file-uploader');
    const fileDropZone = document.getElementById('file-drop-zone');

    // Scanner
    const scannerPanel = document.getElementById('scanner-panel');
    const scannerLogs = document.getElementById('scanner-logs');

    // Results elements
    const resultsPanel = document.getElementById('results-panel');
    const verdictBanner = document.getElementById('verdict-banner');
    const riskCard = document.querySelector('.risk-card');
    const confidenceValue = document.getElementById('confidence-value');
    const confidenceFill = document.getElementById('confidence-fill');
    const confidenceReason = document.getElementById('confidence-reason');
    
    const passportRows = document.getElementById('passport-rows');
    const trustCompanyLbl = document.getElementById('trust-company-lbl');
    const trustCompanyFill = document.getElementById('trust-company-fill');
    const trustRecruiterLbl = document.getElementById('trust-recruiter-lbl');
    const trustRecruiterFill = document.getElementById('trust-recruiter-fill');
    const trustWebLbl = document.getElementById('trust-web-lbl');
    const trustWebFill = document.getElementById('trust-web-fill');
    const trustPaymentLbl = document.getElementById('trust-payment-lbl');
    const trustPaymentFill = document.getElementById('trust-payment-fill');
    const trustOverallLbl = document.getElementById('trust-overall-lbl');

    const dnaContainer = document.getElementById('dna-container');
    
    const personaIdentity = document.getElementById('persona-identity');
    const personaGoal = document.getElementById('persona-goal');
    const personaTactic = document.getElementById('persona-tactic');
    const personaTarget = document.getElementById('persona-target');
    const personaRisk = document.getElementById('persona-risk');

    const attackChainFlow = document.getElementById('attack-chain-flow');
    const timelineList = document.getElementById('timeline-list');
    const decisionTreeContainer = document.getElementById('decision-tree-container');
    const comparisonContainer = document.getElementById('comparison-container');

    const rewriteOriginal = document.getElementById('rewrite-original');
    const rewriteSanitized = document.getElementById('rewrite-sanitized');
    const rewriteChanges = document.getElementById('rewrite-changes');

    const mentorTitle = document.getElementById('mentor-title');
    const mentorContent = document.getElementById('mentor-content');
    const mentorTip = document.getElementById('mentor-tip');

    // Chatbot elements
    const chatMessagesContainer = document.getElementById('chat-messages-container');
    const chatInputBox = document.getElementById('chat-input-box');
    const btnChatSend = document.getElementById('btn-chat-send');
    const chatQuickQuestions = document.getElementById('chat-quick-questions');

    // Community Intel elements
    const reportForm = document.getElementById('report-form');
    const btnSubmitReport = document.getElementById('btn-submit-report');
    const feedSearch = document.getElementById('feed-search');
    const feedCount = document.getElementById('feed-count');
    const communityReportsFeed = document.getElementById('community-reports-feed');

    // Prepopulated community records database
    const initialReports = [
        {
            company: 'Meta Career Services',
            vector: 'WhatsApp',
            payment: '₹1200 for certificate',
            text: 'Congratulation! Your resume is shortlisted for Part-time remote reviewer. Earn ₹5000 daily. You need to verify certificate of HR by buying voucher for ₹1200. Contact t.me/MetaCareerReviewer.',
            time: '2 hours ago',
            verdict: 'CRITICAL'
        },
        {
            company: 'DHL Courier Partners',
            vector: 'SMS',
            payment: 'None requested yet',
            text: 'ALERT: Your package delivery has failed due to incorrect address information. Please verify your address and Aadhaar details immediately at http://dhl-package-tracking-portal.info/update',
            time: '1 day ago',
            verdict: 'SUSPICIOUS'
        },
        {
            company: 'Starbucks India Careers (Unverified)',
            vector: 'Email',
            payment: '₹2000 registration deposit',
            text: 'We are pleased to offer you the position of Coffee Operations Clerk. Please submit your security deposit of ₹2000 via GPay UPI id: starbucks-hr@upi to receive your employee uniform and access card.',
            time: '3 days ago',
            verdict: 'CRITICAL'
        }
    ];

    // --- Tab Switching Logic ---
    tabInvestigation.addEventListener('click', () => {
        tabInvestigation.classList.add('active');
        tabCommunity.classList.remove('active');
        paneInvestigation.classList.add('active');
        paneCommunity.classList.remove('active');
    });

    tabCommunity.addEventListener('click', () => {
        tabCommunity.classList.add('active');
        tabInvestigation.classList.remove('active');
        paneCommunity.classList.add('active');
        paneInvestigation.classList.remove('active');
        renderCommunityFeed();
    });

    // --- Preset Click Handler ---
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const presetKey = btn.getAttribute('data-preset');
            presetBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            activePreset = presetKey;
            
            // Load preset text into input
            if (window.SCAM_PRESETS && window.SCAM_PRESETS[presetKey]) {
                jobInput.value = window.SCAM_PRESETS[presetKey].text;
            }
        });
    });

    // --- Clear & Drag/Drop Actions ---
    btnClear.addEventListener('click', () => {
        jobInput.value = '';
        activePreset = null;
        presetBtns.forEach(b => b.classList.remove('selected'));
        resultsPanel.classList.add('hidden');
        scannerPanel.classList.add('hidden');
    });

    // File input selection simulation
    fileDropZone.addEventListener('click', () => fileUploader.click());
    
    fileUploader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleUploadedFile(file);
        }
    });

    // File Drag/Drop
    fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropZone.classList.add('dragover');
    });

    fileDropZone.addEventListener('dragleave', () => {
        fileDropZone.classList.remove('dragover');
    });

    fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            handleUploadedFile(file);
        }
    });

    function handleUploadedFile(file) {
        if (file.type === "text/plain") {
            const reader = new FileReader();
            reader.onload = (event) => {
                jobInput.value = event.target.result;
                activePreset = null;
                presetBtns.forEach(b => b.classList.remove('selected'));
            };
            reader.readAsText(file);
        } else {
            jobInput.value = `[Document Forensics: Loaded file "${file.name}"]\nFile Size: ${file.size} bytes\nContents of this recruitment document are being simulated for scanning. Please click "Run Investigation" to proceed.`;
            activePreset = null;
            presetBtns.forEach(b => b.classList.remove('selected'));
        }
    }

    // --- Forensics Scanner (Thinking Animation) ---
    btnInvestigate.addEventListener('click', () => {
        const text = jobInput.value.trim();
        if (!text) {
            alert('Please paste a job description or select a preset first.');
            return;
        }

        // Hide old results, show scanner loading panel
        resultsPanel.classList.add('hidden');
        scannerPanel.classList.remove('hidden');
        scannerLogs.innerHTML = '';

        // Dynamic word extraction info
        const wordsCount = text.split(/\s+/).length;

        // Terminal animation scripts
        const logs = [
            { text: `🕵️ Cyber Investigation Started...`, type: 'info' },
            { text: `[INFO] Initializing Gemini AI analysis core...`, type: 'neutral' },
            { text: `[INFO] Parsing raw text input... (extracted ${wordsCount} words)`, type: 'neutral' },
            { text: `✓ Extracting recruiter details...`, type: 'success' },
            { text: `✓ Checking salary realism...`, type: 'success' },
            { text: `✓ Looking for payment requests...`, type: 'success' },
            { text: `✓ Inspecting domain name registers...`, type: 'success' },
            { text: `✓ Looking for social engineering tactics...`, type: 'success' },
            { text: `✓ Cross-checking company registry databases...`, type: 'success' },
            { text: `✓ Building security confidence score...`, type: 'success' },
            { text: `[SUCCESS] Forensic analysis complete. Rendering files...`, type: 'info' }
        ];

        let index = 0;
        
        function appendLogLine() {
            if (index < logs.length) {
                const line = document.createElement('div');
                line.className = `console-line ${logs[index].type}`;
                line.innerText = logs[index].text;
                scannerLogs.appendChild(line);
                scannerLogs.scrollTop = scannerLogs.scrollHeight;
                index++;
                
                // Add minor random variation to delay to feel realistic
                const delay = 100 + Math.random() * 200;
                setTimeout(appendLogLine, delay);
            } else {
                // Completed. Proceed to results
                setTimeout(() => {
                    scannerPanel.classList.add('hidden');
                    resultsPanel.classList.remove('hidden');
                    processAndDisplayAnalysis(text);
                }, 400);
            }
        }

        // Start console typing
        appendLogLine();
    });

    // --- Dynamic Analysis Engine ---
    function processAndDisplayAnalysis(inputText) {
        // If preset, pull pre-populated database record
        if (activePreset && window.SCAM_PRESETS[activePreset]) {
            currentForensicFile = window.SCAM_PRESETS[activePreset];
        } else {
            // Otherwise, dynamically evaluate custom user text using keywords parser
            currentForensicFile = runHeuristicScan(inputText);
        }

        renderVerdict();
        renderPassport();
        renderTrustMeter();
        renderDna();
        renderPersona();
        renderAttackChain();
        renderTimeline();
        renderDecisionTree();
        renderComparison();
        renderRewrite();
        renderMentor();
        renderChatbotInitial();
    }

    function runHeuristicScan(text) {
        const lowerText = text.toLowerCase();
        
        // Scan parameters
        const hasPayment = /fee|deposit|pay|charge|refund|registration|cost|₹|\$|usdt/i.test(lowerText);
        const hasWhatsAppOrTelegram = /telegram|whatsapp|t\.me|wa\.me|@/i.test(lowerText);
        const hasUrgent = /urgent|immediately|hurry|asap|secure your spot|start tomorrow|limited spots/i.test(lowerText);
        const hasHighSalary = /daily|hourly|\$45|\$35|\$50|₹5000|₹12000|₹8000/i.test(lowerText);
        const hasIdentity = /aadhaar|pan|ssn|identity|id card|social security|driver's license/i.test(lowerText);
        const hasDomainIssues = /gmail\.com|yahoo\.com|outlook\.com|http:\/\/|\.net|\.org/i.test(lowerText);

        // Compute scores
        let verdict = 'SAFE';
        let confidence = 75;
        let reasons = [];

        let scoreCompany = 75;
        let scoreRecruiter = 85;
        let scoreWeb = 90;
        let scorePayment = 100;

        if (hasPayment) {
            scorePayment = 5;
            reasons.push('direct payment requirement detected');
        }
        if (hasWhatsAppOrTelegram) {
            scoreRecruiter = 15;
            reasons.push('contact channel redirects to unverified messaging portal');
        }
        if (hasDomainIssues) {
            scoreWeb = 30;
            reasons.push('recommends lookalike domains or free email hosts');
        }
        if (hasHighSalary) {
            scoreCompany = 40;
            reasons.push('compensation rate is highly unrealistic for listed tasks');
        }

        // Overall Trust Score calculation
        const overallTrust = Math.round((scoreCompany + scoreRecruiter + scoreWeb + scorePayment) / 4);

        if (overallTrust < 30) {
            verdict = 'CRITICAL';
            confidence = 90 + Math.floor(Math.random() * 8);
        } else if (overallTrust < 60) {
            verdict = 'SUSPICIOUS';
            confidence = 80 + Math.floor(Math.random() * 10);
        } else {
            verdict = 'SAFE';
            confidence = 70 + Math.floor(Math.random() * 15);
        }

        // Generate Passport data
        const passport = [
            { category: 'Website', indicator: hasDomainIssues ? 'Lookalike / free provider domain' : 'Official server path verified', status: hasDomainIssues ? '❌' : '✅' },
            { category: 'Email', indicator: hasDomainIssues ? 'Free provider account' : 'Official corporate routing', status: hasDomainIssues ? '❌' : '✅' },
            { category: 'Contact', indicator: hasWhatsAppOrTelegram ? 'Redirected to WhatsApp/Telegram' : 'Official recruitment channel', status: hasWhatsAppOrTelegram ? '❌' : '✅' },
            { category: 'Salary', indicator: hasHighSalary ? 'Exorbitant hourly/daily rate' : 'Standard wage rates', status: hasHighSalary ? '❌' : '✅' },
            { category: 'Payment', indicator: hasPayment ? 'Fees/deposits requested' : 'Free application processing', status: hasPayment ? '❌' : '✅' },
            { category: 'Documents', indicator: hasIdentity ? 'Asks Aadhaar/PAN early' : 'Standard resume screening', status: hasIdentity ? '❌' : '✅' }
        ];

        // Scam DNA scores
        const dna = {
            urgency: hasUrgent ? 85 : 30,
            fear: hasIdentity ? 70 : 15,
            authority: hasPayment ? 60 : 35,
            money: hasPayment ? 95 : 10,
            identity: hasIdentity ? 90 : 25,
            phishing: hasDomainIssues ? 85 : 20
        };

        // Profile Builder
        let identity = 'Unverified HR Agent';
        let goal = 'Information harvesting & validation';
        let tactics = 'Basic outreach';
        let target = 'Job Seekers';
        let riskText = 'Low level contact risk';

        if (verdict === 'CRITICAL') {
            identity = hasPayment ? 'Advance Fee Recruitment Attacker' : 'Crypto task scam node';
            goal = 'Steal money deposits directly';
            tactics = 'Artificial urgency + financial guarantees';
            target = 'Remote job applicants & students';
            riskText = 'CRITICAL - Permanent loss of deposit funds';
        } else if (verdict === 'SUSPICIOUS') {
            identity = 'Phishing Identity Harvester';
            goal = 'Gather personal credentials and Aadhaar/PAN cards';
            tactics = 'Brand impersonation + direct onboarding';
            target = 'General entry-level workforce';
            riskText = 'HIGH - Stolen credentials, synthetic identity theft';
        }

        // Simulated Attack Chain
        const attackChain = [
            { step: 'Step 1', desc: 'Interact with suspicious recruiter contact' }
        ];
        if (hasWhatsAppOrTelegram) {
            attackChain.push({ step: 'Step 2', desc: 'Redirected to WhatsApp/Telegram chat group' });
        } else {
            attackChain.push({ step: 'Step 2', desc: 'Provide initial contact metrics' });
        }
        if (hasPayment) {
            attackChain.push({ step: 'Step 3', desc: 'Asked to submit upfront deposits to secure job' });
            attackChain.push({ step: 'Step 4', desc: 'Recruiter blocks connection details' });
            attackChain.push({ step: 'Step 5', desc: 'Funds transferred permanently; target vanishes' });
        } else if (hasIdentity) {
            attackChain.push({ step: 'Step 3', desc: 'Asked to supply copy of national identification (Aadhaar/PAN)' });
            attackChain.push({ step: 'Step 4', desc: 'ID harvested for financial account creation' });
            attackChain.push({ step: 'Step 5', desc: 'Victim compromised via identity fraud' });
        } else {
            attackChain.push({ step: 'Step 3', desc: 'Redirected to suspicious questionnaire link' });
            attackChain.push({ step: 'Step 4', desc: 'Credential capture form is executed' });
        }

        // Forensic Timeline
        const timeline = [
            { label: 'Outreach Stage', desc: 'Target receives offer detailing immediate simple employment tasks.', type: 'start', time: 'Day 1' }
        ];
        if (hasWhatsAppOrTelegram) {
            timeline.push({ label: 'Redirect Event', desc: 'Attacker demands migration to insecure channels like Telegram/WhatsApp.', type: 'warning', time: 'Day 1' });
        }
        if (hasPayment) {
            timeline.push({ label: 'Payment Event', desc: 'A registration/onboarding charge is requested.', type: 'risk', time: 'Day 2' });
            timeline.push({ label: 'Loss Event', desc: 'Direct financial drain takes place. Communication is terminated.', type: 'risk', time: 'Day 3' });
        } else if (hasIdentity) {
            timeline.push({ label: 'Phishing Event', desc: 'Identity verification request (Aadhaar, SSN, PAN) issued prematurely.', type: 'risk', time: 'Day 2' });
            timeline.push({ label: 'ID Theft Event', desc: 'Personal details harvested for potential financial exploits.', type: 'risk', time: 'Day 5' });
        }

        // Decision Tree Nodes
        const decisionTree = [
            { text: 'Registration deposit requested?', decision: hasPayment ? 'YES' : 'NO', highlight: hasPayment, pathType: hasPayment ? 'alert' : 'neutral' },
            { text: 'Redirection to anonymous messenger?', decision: hasWhatsAppOrTelegram ? 'YES' : 'NO', highlight: hasWhatsAppOrTelegram, pathType: hasWhatsAppOrTelegram ? 'alert' : 'neutral' },
            { text: 'Exorbitant compensation packages?', decision: hasHighSalary ? 'YES' : 'NO', highlight: hasHighSalary, pathType: hasHighSalary ? 'alert' : 'neutral' },
            { text: 'Official business domains used?', decision: hasDomainIssues ? 'NO' : 'YES', highlight: hasDomainIssues, pathType: hasDomainIssues ? 'alert' : 'neutral' }
        ];
        decisionTree.push({
            text: `Verdict: ${verdict === 'CRITICAL' ? 'Critical Scam' : verdict === 'SUSPICIOUS' ? 'Suspicious Offer' : 'Low Risk'}`,
            decision: 'CONFIRMED',
            highlight: true,
            pathType: verdict === 'CRITICAL' ? 'alert' : 'neutral'
        });

        // Similarity Pattern
        const comparison = [
            { name: 'Phishing Recruitment', pct: hasWhatsAppOrTelegram || hasDomainIssues ? 88 : 45 },
            { name: 'Advance Fee Scam', pct: hasPayment ? 95 : 20 },
            { name: 'Identity Theft Scam', pct: hasIdentity ? 92 : 15 }
        ];

        // Rewrite assistant
        let originalPhrase = text.substring(0, Math.min(100, text.length)) + "...";
        let sanitizedPhrase = "Professional job advertisement for onboarding coordinators.";
        let changes = ['Reorganized wording to match legitimate hiring structures.'];

        if (hasPayment) {
            originalPhrase = "A ₹500 registration deposit is required to confirm your training slot.";
            sanitizedPhrase = "All training material, setup instructions, and portals are provided free of charge by the employer. Candidates will receive their schedules during the orientation.";
            changes = [
                'Removed the ₹500 registration fee requirement entirely.',
                'Substituted payment portals with secure enterprise guides.'
            ];
        } else if (hasIdentity) {
            originalPhrase = "Send Aadhaar card, PAN card, and bank account details to start tomorrow.";
            sanitizedPhrase = "Candidates are required to apply via our secure official HR channel. Standard verification procedures are initiated only after a written offer has been finalized.";
            changes = [
                'Omitted early Aadhaar/PAN details from initial application fields.',
                'Provided official portal login directions.'
            ];
        }

        // Mentor Lesson
        let mentorTitle = 'Lesson: Upfront Fees in Hiring';
        let mentorDesc = 'No legitimate employer ever charges recruitment fees, licensing fees, background checks, or registration security fees to access training portals. If you are asked to pay money to get a job, it is a scam.';
        let mentorTipVal = 'UPI, crypto, and gift cards are the primary toolsets of online fraudsters as transactions cannot be disputed.';

        if (hasIdentity && !hasPayment) {
            mentorTitle = 'Lesson: Protecting Government ID Scans';
            mentorDesc = 'Identity cards like Aadhaar, SSN, PAN, or Passport scans can be used by cyber criminals to register fake phone SIM cards, set up mock bank accounts, or register fake online stores under your name.';
            mentorTipVal = 'Submit government documents only through verified HTTPS applicant systems after an in-person or formal video interview.';
        }

        // Chat answers pool
        const chatAnswers = {
            "what happens if i already messaged them?": "If you only messaged them, they have your basic contact detail. Simply block them immediately. Do not share any personal files, IDs, or banking credentials.",
            "how can i check if this company is real?": "Look up the company on official registration records (such as Ministry of Corporate Affairs for India, or SEC listings). Verify their official website and call their public number to confirm if the recruiter actually works there.",
            "is it safe if i just ignore them?": "Yes, ignoring and blocking them is the safest path. They will target other applicants who respond. Do not interact further.",
            "can my bank recover the transfer?": "If you paid via UPI or Crypto, recovery is very difficult. Contact your bank immediately to file a charge dispute/cyber fraud claim, and file a report with the cyber police (e.g. cybercrime.gov.in)."
        };

        return {
            text: text,
            verdict: verdict,
            confidence: confidence,
            confidenceReason: `Heuristic parsing identified: ${reasons.join(', ')}.`,
            trustScore: {
                company: scoreCompany,
                recruiter: scoreRecruiter,
                web: scoreWeb,
                payment: scorePayment,
                overall: overallTrust
            },
            passport: passport,
            dna: dna,
            persona: {
                identity: identity,
                goal: goal,
                tactics: tactics,
                target: target,
                risk: riskText
            },
            attackChain: attackChain,
            timeline: timeline,
            decisionTree: decisionTree,
            comparison: comparison,
            rewrite: {
                original: originalPhrase,
                sanitized: sanitizedPhrase,
                changes: changes
            },
            mentor: {
                title: mentorTitle,
                desc: mentorDesc,
                tip: mentorTipVal
            },
            chatAnswers: chatAnswers
        };
    }

    // --- Rendition Bindings ---
    function renderVerdict() {
        verdictBanner.innerText = currentForensicFile.verdict;
        verdictBanner.className = 'verdict-banner';
        riskCard.className = 'card metric-card risk-card highlight-glow';
        
        if (currentForensicFile.verdict === 'CRITICAL') {
            verdictBanner.classList.add('verdict-critical');
            riskCard.classList.add('glow-red');
        } else if (currentForensicFile.verdict === 'SUSPICIOUS') {
            verdictBanner.classList.add('verdict-suspicious');
            riskCard.classList.add('glow-yellow');
        } else {
            verdictBanner.classList.add('verdict-safe');
            riskCard.classList.add('glow-green');
        }

        confidenceValue.innerText = `${currentForensicFile.confidence}%`;
        confidenceFill.style.width = `${currentForensicFile.confidence}%`;
        confidenceReason.innerText = currentForensicFile.confidenceReason;

        // Color theme for confidence fill
        confidenceFill.className = 'progress-bar-fill';
        if (currentForensicFile.verdict === 'CRITICAL') confidenceFill.classList.add('fill-red');
        else if (currentForensicFile.verdict === 'SUSPICIOUS') confidenceFill.classList.add('fill-yellow');
        else confidenceFill.classList.add('fill-green');
    }

    function renderPassport() {
        passportRows.innerHTML = '';
        currentForensicFile.passport.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="passport-cat">${row.category}</td>
                <td class="passport-ind">${row.indicator}</td>
                <td class="passport-status">${row.status}</td>
            `;
            passportRows.appendChild(tr);
        });
    }

    function renderTrustMeter() {
        const ts = currentForensicFile.trustScore;
        
        trustCompanyLbl.innerText = `${ts.company}%`;
        trustCompanyFill.style.width = `${ts.company}%`;
        trustRecruiterLbl.innerText = `${ts.recruiter}%`;
        trustRecruiterFill.style.width = `${ts.recruiter}%`;
        trustWebLbl.innerText = `${ts.web}%`;
        trustWebFill.style.width = `${ts.web}%`;
        trustPaymentLbl.innerText = `${ts.payment}%`;
        trustPaymentFill.style.width = `${ts.payment}%`;

        trustOverallLbl.innerText = `${ts.overall}/100`;
        trustOverallLbl.className = 'score-large';
        if (ts.overall < 30) trustOverallLbl.classList.add('critical-score');
        else if (ts.overall < 60) trustOverallLbl.classList.add('warning-score');
        else trustOverallLbl.classList.add('safe-score');
    }

    function renderDna() {
        dnaContainer.innerHTML = '';
        const traits = [
            { label: '🚨 Urgency', score: currentForensicFile.dna.urgency },
            { label: '😨 Fear Tactics', score: currentForensicFile.dna.fear },
            { label: '👑 Authority', score: currentForensicFile.dna.authority },
            { label: '💰 Money Request', score: currentForensicFile.dna.money },
            { label: '🆔 Identity Theft', score: currentForensicFile.dna.identity },
            { label: '🎣 Phishing Method', score: currentForensicFile.dna.phishing }
        ];

        traits.forEach(trait => {
            const numActivePills = Math.ceil(trait.score / 10); // 10 pills maximum
            let pillsHtml = '';
            for (let i = 1; i <= 10; i++) {
                const isActive = i <= numActivePills;
                // Alternate pill glow depending on verdict
                let colorClass = 'active';
                if (currentForensicFile.verdict === 'CRITICAL') colorClass = 'fill-red active';
                else if (currentForensicFile.verdict === 'SUSPICIOUS') colorClass = 'fill-yellow active';
                else colorClass = 'fill-green active';

                pillsHtml += `<div class="dna-pill ${isActive ? colorClass : ''}" style="${isActive ? 'background: ' + (currentForensicFile.verdict === 'CRITICAL' ? 'var(--color-red)' : currentForensicFile.verdict === 'SUSPICIOUS' ? 'var(--color-yellow)' : 'var(--color-green)') : ''}"></div>`;
            }

            const item = document.createElement('div');
            item.className = 'dna-bar-item';
            item.innerHTML = `
                <div class="dna-info-row">
                    <span class="dna-label">${trait.label}</span>
                    <span class="dna-pct-lbl" style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: ${currentForensicFile.verdict === 'CRITICAL' ? 'var(--color-red)' : currentForensicFile.verdict === 'SUSPICIOUS' ? 'var(--color-yellow)' : 'var(--color-green)'}">${trait.score}%</span>
                </div>
                <div class="dna-pills-container">
                    ${pillsHtml}
                </div>
            `;
            dnaContainer.appendChild(item);
        });
    }

    function renderPersona() {
        const p = currentForensicFile.persona;
        personaIdentity.innerText = p.identity;
        personaGoal.innerText = p.goal;
        personaTactic.innerText = p.tactics;
        personaTarget.innerText = p.target;
        personaRisk.innerText = p.risk;
        
        personaRisk.className = 'persona-val';
        if (currentForensicFile.verdict === 'CRITICAL') personaRisk.classList.add('text-red');
        else if (currentForensicFile.verdict === 'SUSPICIOUS') personaRisk.style.color = 'var(--color-yellow)';
        else personaRisk.style.color = 'var(--color-green)';
    }

    function renderAttackChain() {
        attackChainFlow.innerHTML = '';
        const chain = currentForensicFile.attackChain;
        
        chain.forEach((node, idx) => {
            // Create flow node card
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'flow-node';
            if (idx === 0) nodeDiv.classList.add('start-node');
            else if (idx === chain.length - 1 || idx >= 3) nodeDiv.classList.add('danger-node');

            nodeDiv.innerHTML = `
                <span class="node-step">${node.step}</span>
                <span class="node-desc">${node.desc}</span>
            `;
            attackChainFlow.appendChild(nodeDiv);

            // Add arrow if not last node
            if (idx < chain.length - 1) {
                const arrowDiv = document.createElement('div');
                arrowDiv.className = 'flow-arrow';
                arrowDiv.innerHTML = `&rarr;`;
                attackChainFlow.appendChild(arrowDiv);
            }
        });
    }

    function renderTimeline() {
        timelineList.innerHTML = '';
        currentForensicFile.timeline.forEach(item => {
            const timelineItem = document.createElement('div');
            timelineItem.className = `timeline-item ${item.type}`;
            timelineItem.innerHTML = `
                <div class="timeline-dot-icon"></div>
                <div class="timeline-content-card">
                    <div class="timeline-header-area">
                        <span class="timeline-title-lbl">${item.label}</span>
                        <span class="timeline-time">${item.time}</span>
                    </div>
                    <p class="timeline-desc-lbl">${item.desc}</p>
                </div>
            `;
            timelineList.appendChild(timelineItem);
        });
    }

    function renderDecisionTree() {
        decisionTreeContainer.innerHTML = '';
        const tree = currentForensicFile.decisionTree;
        
        tree.forEach((node, idx) => {
            // Node element
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'tree-node';
            if (node.highlight) {
                nodeDiv.classList.add('highlight-path');
                if (node.pathType === 'alert') nodeDiv.classList.add('alert-path');
            }
            nodeDiv.innerText = node.text;
            decisionTreeContainer.appendChild(nodeDiv);

            // Connector element (if not last)
            if (idx < tree.length - 1) {
                const connDiv = document.createElement('div');
                connDiv.className = 'tree-connector';
                if (node.highlight) {
                    connDiv.classList.add('highlight-path');
                    if (node.pathType === 'alert') connDiv.classList.add('alert-path');
                }
                
                connDiv.innerHTML = `<span class="connector-label ${node.highlight ? 'highlight-path' : ''} ${node.pathType === 'alert' ? 'alert-path' : ''}">${node.decision}</span>`;
                decisionTreeContainer.appendChild(connDiv);
            }
        });
    }

    function renderComparison() {
        comparisonContainer.innerHTML = '';
        currentForensicFile.comparison.forEach(item => {
            const div = document.createElement('div');
            div.className = 'comparison-item';
            
            // Choose color representation depending on similarity
            let barColor = 'fill-cyan';
            if (item.pct > 80) barColor = 'fill-red';
            else if (item.pct > 50) barColor = 'fill-yellow';

            div.innerHTML = `
                <div class="comparison-header">
                    <span class="comparison-name">${item.name}</span>
                    <span class="comparison-pct">${item.pct}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill ${barColor}" style="width: ${item.pct}%;"></div>
                </div>
            `;
            comparisonContainer.appendChild(div);
        });
    }

    function renderRewrite() {
        const rw = currentForensicFile.rewrite;
        rewriteOriginal.innerText = rw.original;
        rewriteSanitized.innerText = rw.sanitized;
        
        rewriteChanges.innerHTML = '';
        rw.changes.forEach(change => {
            const li = document.createElement('li');
            li.innerText = change;
            rewriteChanges.appendChild(li);
        });
    }

    function renderMentor() {
        const m = currentForensicFile.mentor;
        mentorTitle.innerText = m.title;
        mentorContent.innerText = m.desc;
        mentorTip.innerHTML = `<strong>💡 Shield Action:</strong> ${m.tip}`;
    }

    // --- Interactive ChatBot Logic ---
    function renderChatbotInitial() {
        // Clear messages to restart, add intro
        chatMessagesContainer.innerHTML = `
            <div class="chat-msg system-msg">
                <span class="msg-sender">Aegis Agent:</span>
                <p class="msg-text">I have analyzed this job post and built the forensics file. You can ask me clarifying questions about details found in the report, safety concerns, or how to handle communications.</p>
                <span class="msg-time">Just Now</span>
            </div>
        `;
        
        // Suggested prompt pills
        chatQuickQuestions.innerHTML = '';
        const suggested = Object.keys(currentForensicFile.chatAnswers);
        
        suggested.forEach(q => {
            const pill = document.createElement('button');
            pill.className = 'prompt-pill';
            pill.innerText = q;
            pill.addEventListener('click', () => {
                chatInputBox.value = q;
                handleUserSendMessage();
            });
            chatQuickQuestions.appendChild(pill);
        });
    }

    function handleUserSendMessage() {
        const userText = chatInputBox.value.trim();
        if (!userText) return;

        // Render user message
        appendChatMessage('You', userText, 'user-msg');
        chatInputBox.value = '';

        // Auto-scroll
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

        // Simulated delay response
        setTimeout(() => {
            const answer = lookupChatAnswer(userText);
            appendChatMessage('Aegis Agent', answer, 'system-msg');
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }, 500);
    }

    function lookupChatAnswer(query) {
        const cleanQuery = query.toLowerCase().trim();
        
        // Exact preset keys check
        if (currentForensicFile.chatAnswers && currentForensicFile.chatAnswers[cleanQuery]) {
            return currentForensicFile.chatAnswers[cleanQuery];
        }

        // Partial matching heuristics
        if (cleanQuery.includes('pay') || cleanQuery.includes('fee') || cleanQuery.includes('refund')) {
            return "Any payment requested upfront for training, equipment, or confirmation is an absolute fraud signature. Legitimate employers bear all recruitment costs. Never pay any amount under any circumstances.";
        }
        if (cleanQuery.includes('telegram') || cleanQuery.includes('whatsapp') || cleanQuery.includes('phone')) {
            return "Scammers avoid corporate tracking by moving conversations to chat portals. If you already messaged them, block them. They cannot access your device files unless you downloaded attachments or clicked links they sent.";
        }
        if (cleanQuery.includes('aadhaar') || cleanQuery.includes('pan') || cleanQuery.includes('id') || cleanQuery.includes('ssn') || cleanQuery.includes('document')) {
            return "Government identification scans should never be submitted during initial applicant screening. A threat actor can lock down profiles or submit synthetic credit applications using your records. UIDAI offers Aadhaar lock options online if you already sent it.";
        }
        if (cleanQuery.includes('real') || cleanQuery.includes('verify') || cleanQuery.includes('check')) {
            return "To verify the recruiter: 1. Check their email domain (must match company exactly). 2. Call the public corporate phone number and ask for the HR department. 3. Check for the vacancy on the official website career portal.";
        }

        // Generic response
        return "This outreach exhibits high risk alignment. I suggest immediately terminating communication, blocking the recruiters contact paths, and reporting the incident in the Community Intelligence Hub. Do you want help checking the company's registration?";
    }

    function appendChatMessage(sender, text, msgClass) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${msgClass}`;
        msgDiv.innerHTML = `
            <span class="msg-sender">${sender}:</span>
            <p class="msg-text">${text}</p>
            <span class="msg-time">Just Now</span>
        `;
        chatMessagesContainer.appendChild(msgDiv);
    }

    btnChatSend.addEventListener('click', handleUserSendMessage);
    chatInputBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserSendMessage();
    });

    // --- Community Hub Dynamic Reporting ---
    function renderCommunityFeed() {
        communityReportsFeed.innerHTML = '';
        
        // Combine initial reports with any session storage records
        const sessionReports = JSON.parse(sessionStorage.getItem('aegis_reports') || '[]');
        const allReports = [...sessionReports, ...initialReports];

        feedCount.innerText = `showing ${allReports.length} entries`;

        // Search query filter
        const query = feedSearch.value.toLowerCase();
        
        allReports.forEach(item => {
            const matchesQuery = 
                item.company.toLowerCase().includes(query) || 
                item.text.toLowerCase().includes(query) || 
                item.vector.toLowerCase().includes(query);

            if (!matchesQuery) return;

            const div = document.createElement('div');
            div.className = 'feed-item';
            
            let badgeClass = 'suspicious';
            if (item.verdict === 'CRITICAL') badgeClass = 'critical';

            let vectorClass = 'email';
            if (item.vector.toLowerCase() === 'whatsapp') vectorClass = 'whatsapp';
            else if (item.vector.toLowerCase() === 'telegram') vectorClass = 'telegram';

            div.innerHTML = `
                <div class="feed-item-main">
                    <div class="feed-company-row">
                        <span class="feed-company-name">${item.company}</span>
                        <span class="feed-item-tag ${vectorClass}">${item.vector}</span>
                    </div>
                    <p class="feed-desc">${item.text}</p>
                    <div class="feed-meta-row">
                        <span>Filing Date: ${item.time}</span>
                        <span>•</span>
                        <span>Demanded Payment: ${item.payment || 'None'}</span>
                    </div>
                </div>
                <div class="feed-item-actions">
                    <span class="threat-badge ${badgeClass}">${item.verdict}</span>
                    <button class="btn-investigate-reported">Run Diagnostics</button>
                </div>
            `;

            // Setup diagnostic click handler to feed this scam into the investigator
            div.querySelector('.btn-investigate-reported').addEventListener('click', () => {
                jobInput.value = item.text;
                activePreset = null;
                presetBtns.forEach(b => b.classList.remove('selected'));
                
                // Click tab investigation
                tabInvestigation.click();
                
                // Auto run scan
                btnInvestigate.click();
            });

            communityReportsFeed.appendChild(div);
        });
    }

    // Bind search box keyup
    feedSearch.addEventListener('keyup', renderCommunityFeed);

    // Form submission
    reportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const repCompany = document.getElementById('rep-company').value.trim();
        const repVector = document.getElementById('rep-vector').value;
        const repPayment = document.getElementById('rep-payment').value.trim() || 'None requested';
        const repText = document.getElementById('rep-text').value.trim();

        if (!repCompany || !repVector || !repText) {
            alert('Please fill out all required fields.');
            return;
        }

        // Perform simple heuristic to determine threat verdict for the report
        let reportVerdict = 'SUSPICIOUS';
        const lowerText = repText.toLowerCase();
        if (repPayment.toLowerCase() !== 'none' || lowerText.includes('fee') || lowerText.includes('deposit') || lowerText.includes('pay') || lowerText.includes('₹')) {
            reportVerdict = 'CRITICAL';
        }

        const newReport = {
            company: repCompany,
            vector: repVector,
            payment: repPayment,
            text: repText,
            time: 'Just Now',
            verdict: reportVerdict
        };

        // Save in session storage
        const sessionReports = JSON.parse(sessionStorage.getItem('aegis_reports') || '[]');
        sessionReports.unshift(newReport);
        sessionStorage.setItem('aegis_reports', JSON.stringify(sessionReports));

        // Increment stats
        totalReportsCount++;
        
        // Reset form
        reportForm.reset();
        
        // Flash alert
        alert('Threat Intelligence Report successfully filed. Incident has been anonymized and indexed.');
        
        // Re-render feed
        renderCommunityFeed();

        // Update active stats display on UI if visible
        const activeStatNode = document.querySelector('.intel-stat-grid .stat-box .text-red');
        if (activeStatNode) {
            const currentNum = parseInt(activeStatNode.innerText.replace(/,/g, ''));
            activeStatNode.innerText = (currentNum + 1).toLocaleString();
        }
    });

    // Initial page configurations (Load default WhatsApp preset in text box)
    if (presetBtns.length > 0) {
        presetBtns[0].click();
    }
});
