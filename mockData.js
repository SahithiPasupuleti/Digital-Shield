// Aegis Cyber Forensics - Pre-analyzed Scam Presets

const SCAM_PRESETS = {
    whatsapp: {
        text: `Urgent! We are looking for remote assistants to work 1-2 hours a day from home.
Salary: ₹3,000 - ₹8,000 daily.
Tasks: Simple data entry and rating merchants. No experience required. Training provided.
Contact our hiring manager on Telegram at @AegisRecruitHR immediately to secure your spot.
Note: A ₹500 registration/security deposit is required to activate your training portal (fully refundable with your first paycheck).`,
        verdict: 'CRITICAL',
        confidence: 96,
        confidenceReason: 'Multiple high-risk indicators detected: payment request for training, high daily salary for simple tasks, and communication redirected to Telegram.',
        trustScore: {
            company: 30,
            recruiter: 10,
            web: 25,
            payment: 0,
            overall: 16
        },
        passport: [
            { category: 'Website', indicator: 'No company domain', status: '❌' },
            { category: 'Email', indicator: 'Free Gmail/Outlook address', status: '⚠️' },
            { category: 'Contact', indicator: 'Telegram Chat redirection', status: '❌' },
            { category: 'Salary', indicator: 'Exorbitant hourly/daily rate', status: '❌' },
            { category: 'Payment', indicator: '₹500 refundable deposit requested', status: '❌' },
            { category: 'Documents', indicator: 'None requested yet', status: '✅' }
        ],
        dna: {
            urgency: 90,
            fear: 10,
            authority: 45,
            money: 100,
            identity: 30,
            phishing: 80
        },
        persona: {
            identity: 'Fake HR Recruiting Bot',
            goal: 'Extract advance-fee payment (deposit scam)',
            tactics: 'Artificial Urgency + Refund Guarantee',
            target: 'Students & Part-time Job Seekers',
            risk: 'CRITICAL - Direct Financial Loss'
        },
        attackChain: [
            { step: 'Step 1', desc: 'Message @AegisRecruitHR on Telegram' },
            { step: 'Step 2', desc: 'Recruiter builds trust & shares fake stats' },
            { step: 'Step 3', desc: 'Asked to pay ₹500 via UPI QR code' },
            { step: 'Step 4', desc: 'Telegram account blocks you' },
            { step: 'Step 5', desc: 'Money lost; no job provided' }
        ],
        timeline: [
            { label: 'Received Message', desc: 'Spam WhatsApp/SMS message received with high-paying remote offer.', type: 'start', time: 'Day 1' },
            { label: 'Telegram Shift', desc: 'Directed to contact HR manager on Telegram to proceed with application.', type: 'warning', time: 'Day 1' },
            { label: 'Payment Demand', desc: 'Hiring manager requests ₹500 training registration fee before onboarding.', type: 'risk', time: 'Day 1' },
            { label: 'Compromise Risk', desc: 'If UPI payment is made, attacker disappears and blocks contact. Direct financial theft occurs.', type: 'risk', time: 'Day 2' }
        ],
        decisionTree: [
            { text: 'Registration deposit requested?', decision: 'YES', highlight: true, pathType: 'alert' },
            { text: 'Redirection to anonymous messaging (Telegram)?', decision: 'YES', highlight: true, pathType: 'alert' },
            { text: 'Exorbitant salary for simple tasks?', decision: 'YES', highlight: true, pathType: 'alert' },
            { text: 'Official email domain used?', decision: 'NO', highlight: true, pathType: 'alert' },
            { text: 'Verdict: Critical Risk Scam', decision: 'CONFIRMED', highlight: true, pathType: 'alert' }
        ],
        comparison: [
            { name: 'Advance Fee Scam (Deposit)', pct: 98 },
            { name: 'Phishing Recruitment', pct: 85 },
            { name: 'Identity Theft', pct: 20 }
        ],
        rewrite: {
            original: `Note: A ₹500 registration/security deposit is required to activate your training portal (fully refundable with your first paycheck).`,
            sanitized: `Thank you for your application.
All onboarding training, portal access, and software licenses are provided free of charge by our organization.
Please log in to your dashboard to begin your introductory modules.`,
            changes: [
                'Removed the ₹500 registration fee requirement entirely.',
                'Shifted communication from Telegram to a secure internal portal.',
                'Substituted urgent commands with professional professional onboarding procedures.'
            ]
        },
        mentor: {
            title: 'Lesson: Training & Registration Fees',
            desc: 'Legitimate employers never charge candidates for recruitment, training materials, onboarding access, or background checks. All business expenses are absorbed by the employer. Any upfront cost—even if promised as refundable—is a major scam indicator.',
            tip: 'If a recruiter asks for UPI transfer, gift cards, or crypto to initiate training, immediately flag it and block the contact.'
        },
        chatAnswers: {
            "what happens if i already messaged them?": "If you only sent a message, they have your phone number/username. Do not worry, but block them immediately on Telegram. Do not click any links they send, and never send money.",
            "they say the fee is fully refundable, is that true?": "No. Scammers claim fees are refundable to lower your guard. Once you pay via UPI or bank transfer, the money is gone instantly, and they will block you or ask for even more money.",
            "how do i report this person?": "You can report the Telegram handle directly in the Telegram app (Report -> Spam/Scam). You can also report the incident in our 'Community Intelligence' tab to alert others.",
            "what if they sent a job contract?": "Fake contracts are easy to generate using stolen company logos. A contract containing payment demands, spelling mistakes, or generic formatting is legally meaningless and fabricated by the attacker."
        }
    },
    amazon: {
        text: `AMAZON LOGISTICS INDIA: Urgent Recruitment for Work-from-Home Package Dispatch Coordinators.
Salary: ₹35,000 - ₹50,000 monthly.
Fast registration. No interview required.
To start tomorrow, send a photo of your Aadhaar card/PAN card, phone number, and bank account details to amazon-logistics-recruitment@gmail.com or fill the form at: http://amazon-logistics-careers-india.net`,
        verdict: 'SUSPICIOUS',
        confidence: 89,
        confidenceReason: 'Severe phishing risk. Attacker is requesting sensitive government identification and bank details on a free Gmail address and a non-official lookalike domain.',
        trustScore: {
            company: 85, // Amazon brand has high trust, but the recruiter doesn't
            recruiter: 15,
            web: 10,
            payment: 90, // No payment requested
            overall: 38
        },
        passport: [
            { category: 'Website', indicator: 'Lookalike domain (.net, not amazon.in)', status: '❌' },
            { category: 'Email', indicator: 'Free @gmail.com recruiter address', status: '❌' },
            { category: 'Contact', indicator: 'Unsecured form link', status: '⚠️' },
            { category: 'Salary', indicator: 'Realistic but high entry salary', status: '⚠️' },
            { category: 'Payment', indicator: 'No immediate cash request', status: '✅' },
            { category: 'Documents', indicator: 'Requests Aadhaar & Bank Details upfront', status: '❌' }
        ],
        dna: {
            urgency: 85,
            fear: 20,
            authority: 80,
            money: 10,
            identity: 100,
            phishing: 95
        },
        persona: {
            identity: 'Corporate Identity Thief',
            goal: 'Harvest credentials & government IDs for identity theft/financial fraud',
            tactics: 'Brand Impersonation + Skipping Recruitment Hurdles',
            target: 'Unemployed Individuals & Job Seekers',
            risk: 'HIGH - Identity Theft & Bank Account Compromise'
        },
        attackChain: [
            { step: 'Step 1', desc: 'Click lookalike portal URL' },
            { step: 'Step 2', desc: 'Upload PAN/Aadhaar & Bank numbers' },
            { step: 'Step 3', desc: 'Attacker takes loans or opens accounts in your name' },
            { step: 'Step 4', desc: 'Victim faces financial liabilities and legal inquiries' }
        ],
        timeline: [
            { label: 'Spam Alert', desc: 'Received SMS claiming to represent Amazon Logistics with immediate hire.', type: 'start', time: 'Day 1' },
            { label: 'Data Harvest', desc: 'User navigates to lookalike portal and uploads KYC documentation.', type: 'warning', time: 'Day 2' },
            { label: 'Bank Exploit', desc: 'Attacker uses bank details and PAN/Aadhaar to execute fraudulent credit card registrations.', type: 'risk', time: 'Day 5' },
            { label: 'Legal Liability', desc: 'Victim discovers unauthorized credit inquiries or withdrawals.', type: 'risk', time: 'Day 30' }
        ],
        decisionTree: [
            { text: 'Requests Aadhaar/PAN / SSN upfront?', decision: 'YES', highlight: true, pathType: 'alert' },
            { text: 'Official business domain used?', decision: 'NO', highlight: true, pathType: 'alert' },
            { text: 'Recruitment bypasses interviews?', decision: 'YES', highlight: true, pathType: 'alert' },
            { text: 'Verdict: Phishing/Identity Scam', decision: 'CONFIRMED', highlight: true, pathType: 'alert' }
        ],
        comparison: [
            { name: 'Identity Theft Scam', pct: 95 },
            { name: 'Phishing Recruitment', pct: 92 },
            { name: 'Advance Fee Scam', pct: 15 }
        ],
        rewrite: {
            original: `To start tomorrow, send a photo of your Aadhaar card/PAN card, phone number, and bank account details to amazon-logistics-recruitment@gmail.com`,
            sanitized: `To apply, please submit your resume through the official Amazon Jobs portal at jobs.amazon.in.
If shortlisted, you will undergo a multi-stage background check ONLY after a formal interview and a written offer of employment.`,
            changes: [
                'Substituted Gmail contact with the verified official corporate recruitment portal.',
                'Removed the request for critical KYC identity documents during the initial phase.',
                'Emphasized standard professional background verification procedures.'
            ]
        },
        mentor: {
            title: 'Lesson: Document Safety in Hiring',
            desc: 'Legitimate HR departments will never request sensitive identification (Aadhaar, SSN, PAN, Passport scans) or banking details prior to a formal interview and a signed, authenticated job offer. Attaining this data beforehand is characteristic of credential phishing.',
            tip: 'Always verify the site domain. Amazon recruitment will strictly take place on *.amazon.jobs or amazon.in/jobs.'
        },
        chatAnswers: {
            "what happens if they have my aadhaar number?": "If they only have the number, the threat is low, but if you uploaded a photo of the card, lock your Aadhaar biometric data via the UIDAI portal/mAadhaar app immediately. Watch out for unauthorized banking actions.",
            "the website looks exactly like amazon. how can i be sure?": "Scammers clone website layouts. Always look at the address bar. A genuine Amazon link ends in '.amazon.in' or '.amazon.jobs' before the first slash. Domains like 'amazon-logistics-india.net' are fake.",
            "why do they want my bank details?": "They want them to set up unauthorized transfers, use them as money mule destinations, or steal funds directly by matching your identity documents to bank records.",
            "what is the official site to apply?": "Apply exclusively through Amazon's verified portal: https://www.amazon.jobs."
        }
    },
    crypto: {
        text: `CryptoYield Ltd: Earn ₹12,000 daily processing transaction audits on crypto networks.
No experience necessary. Fully automated platform.
Instructions:
1. Open account at: www.cryptoyield-audits-trx.org
2. Deposit ₹2,000 (equivalent USDT) to activate your account node.
3. Earn 10% commission on every transaction processed.
Immediate withdrawals. Direct support on WhatsApp at +91 98765 43210.`,
        verdict: 'CRITICAL',
        confidence: 94,
        confidenceReason: 'High threat pattern: Crypto investment task scam. Features immediate payment requirement via cryptocurrency and WhatsApp redirection.',
        trustScore: {
            company: 10,
            recruiter: 15,
            web: 20,
            payment: 0,
            overall: 11
        },
        passport: [
            { category: 'Website', indicator: 'Newly registered crypto domain', status: '❌' },
            { category: 'Email', indicator: 'No email contact provided', status: '⚠️' },
            { category: 'Contact', indicator: 'WhatsApp Business support', status: '❌' },
            { category: 'Salary', indicator: 'Unrealistic return (10% daily commissions)', status: '❌' },
            { category: 'Payment', indicator: '₹2,000 USDT deposit required', status: '❌' },
            { category: 'Documents', indicator: 'None requested', status: '✅' }
        ],
        dna: {
            urgency: 75,
            fear: 10,
            authority: 30,
            money: 100,
            identity: 20,
            phishing: 90
        },
        persona: {
            identity: 'Crypto Ponzi / Task Scammer',
            goal: 'Absorb cryptocurrency deposits via mock tasks',
            tactics: 'High-Yield Returns + Task Gamification',
            target: 'Retail Investors & Mobile Device Users',
            risk: 'CRITICAL - Permanent loss of crypto assets'
        },
        attackChain: [
            { step: 'Step 1', desc: 'Create account on fake crypto site' },
            { step: 'Step 2', desc: 'Deposit ₹2,000 in USDT to activate account' },
            { step: 'Step 3', desc: 'Dashboard displays fake profit growth' },
            { step: 'Step 4', desc: 'Asked to deposit more to withdraw earnings' },
            { step: 'Step 5', desc: 'Platform locks you out; wallet address is drained' }
        ],
        timeline: [
            { label: 'Ad Link', desc: 'Saw social media post detailing simple crypto transaction audits.', type: 'start', time: 'Day 1' },
            { label: 'Initial Deposit', desc: 'Transferred ₹2,000 worth of USDT to activate the audit dashboard.', type: 'warning', time: 'Day 1' },
            { label: 'Task Trap', desc: 'Platform shows simulated earnings. User is prompted to invest ₹10,000 more to unlock larger assignments.', type: 'risk', time: 'Day 3' },
            { label: 'Withdrawal Lock', desc: 'Attempting to withdraw yields a warning demanding a 20% "tax payment". Total capital is stolen.', type: 'risk', time: 'Day 5' }
        ],
        decisionTree: [
            { text: 'Deposit required in cryptocurrency (USDT/BTC)?', decision: 'YES', highlight: true, pathType: 'alert' },
            { text: 'High-yield profit dashboard simulation?', decision: 'YES', highlight: true, pathType: 'alert' },
            { text: 'Official license documentation available?', decision: 'NO', highlight: true, pathType: 'alert' },
            { text: 'Verdict: Crypto Task Scam', decision: 'CONFIRMED', highlight: true, pathType: 'alert' }
        ],
        comparison: [
            { name: 'Crypto Yield / Task Scam', pct: 97 },
            { name: 'Advance Fee Scam', pct: 88 },
            { name: 'Phishing Recruitment', pct: 40 }
        ],
        rewrite: {
            original: `Deposit ₹2,000 (equivalent USDT) to activate your account node.`,
            sanitized: `We offer technical audit training for system administrators.
Our tools are provided entirely free to our employees. Training schedules are coordinated with our engineering teams.`,
            changes: [
                'Removed cryptocurrency deposit and investment instructions.',
                'Substituted fake tasks with legitimate IT system audits.',
                'Replaced WhatsApp support with secure enterprise communications.'
            ]
        },
        mentor: {
            title: 'Lesson: Crypto Task Schemes',
            desc: 'Task scams operate by making you perform minor jobs (liking videos, reviewing items, auditing transactions) on a fake dashboard. They show fake earnings and force you to deposit money to "level up" or withdraw your balance. You will never be able to withdraw these funds.',
            tip: 'If an employment opportunity requires you to fund a wallet, buy crypto tokens, or pay network fee deposits, abort immediately. Cryptocurrency transactions cannot be reversed.'
        },
        chatAnswers: {
            "can i get my crypto deposit back?": "No. Cryptocurrency transactions are mathematically irreversible. There is no central authority or bank that can dispute the transaction. Avoid services claiming they can recover it; those are 'recovery scams'.",
            "why does my balance keep growing in the app?": "The balance is a simulation. Scammers use simple website graphics to make it look like you are earning money, tempting you to deposit larger sums. It has no actual value.",
            "what happens if i ignore the tax payment request?": "Nothing. Do not pay. It is a secondary trap. If you pay the tax, they will create another fake fee (e.g. KYC fee, release fee). Cut all communication immediately.",
            "how did they find me?": "They broadcast ads on platforms like Telegram, Facebook, and Instagram, or buy databases containing phone numbers of job seekers."
        }
    }
};

// Make it globally available on browser window context
window.SCAM_PRESETS = SCAM_PRESETS;
