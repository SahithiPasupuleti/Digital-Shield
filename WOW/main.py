# Digital Shield FastAPI Backend
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import asyncio
import httpx
import json
import base64
import hashlib
from typing import Optional, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Digital Shield API", version="1.0.0")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PORT = int(os.getenv("PORT", 5001))

# In-memory caches for successful API responses
threat_cache = {}
url_cache = {}
qr_cache = {}

def get_cache_key(prefix: str, data: str, language: str) -> str:
    h = hashlib.sha256(data.encode('utf-8')).hexdigest()
    return f"{prefix}:{language}:{h}"

def local_analyze_text(text: str) -> dict:
    """
    Built-in local analysis fallback for general text/job descriptions.
    """
    # Simple rule-based scanner
    text_lower = text.lower()
    
    reasons = []
    recommendations = []
    tips = []
    
    # Red flags
    red_flags = {
        "registration fee": "Request for upfront 'registration fee'",
        "security deposit": "Request for upfront 'security deposit'",
        "processing fee": "Request for upfront 'processing fee'",
        "pay fee": "Requirement to pay a fee to secure work",
        "refundable fee": "Claim of a 'refundable' upfront payment",
        "card number": "Unsolicited request for payment card details",
        "otp": "Request to share One Time Password (OTP)"
    }
    
    # Yellow flags
    yellow_flags = {
        "typing captchas": "Offers captcha typing work (highly associated with scams)",
        "data entry": "Offers remote data entry jobs with suspicious profiles",
        "earn \u20b9": "Promises high daily/weekly salary figures",
        "make \u20b9": "Promises rapid financial return structures",
        "telegram": "Communication redirected to third-party chat app Telegram",
        "whatsapp": "Communication redirected to third-party chat app WhatsApp",
        "no interview": "Job offered without formal screening or video interview",
        "no experience": "High paying job requiring zero experience or credentials"
    }
    
    for phrase, desc in red_flags.items():
        if phrase in text_lower:
            reasons.append(desc)
            
    for phrase, desc in yellow_flags.items():
        if phrase in text_lower:
            reasons.append(desc)

    # Determine status and scores
    if any(phrase in text_lower for phrase in red_flags):
        threat_level = "Dangerous"
        risk_score = 90
        threat_category = "Advance Fee / Identity Theft Scam"
        highlighted = next((phrase for phrase in red_flags if phrase in text_lower), "None")
        recommendations = [
            "Do NOT pay any registration or processing fees. Legitimate employers pay you; you never pay them.",
            "Do NOT share card numbers, PINs, or bank OTPs with anyone.",
            "Report the recruiter details to cyber authorities."
        ]
        tips = [
            "Always research the parent company of the job offer.",
            "Real recruiters use corporate email domains, never Gmail/WhatsApp solely for onboarding."
        ]
    elif any(phrase in text_lower for phrase in yellow_flags):
        threat_level = "Suspicious"
        risk_score = 55
        threat_category = "Suspicious Recruitment Offer"
        highlighted = next((phrase for phrase in yellow_flags if phrase in text_lower), "None")
        recommendations = [
            "Verify the job listing directly on the company's official corporate portal before replying.",
            "Request a formal video call screening rather than chatting via text apps."
        ]
        tips = [
            "High pay for low-skilled tasks is a common scam bait tactic.",
            "Check if the job posting is listed on official sites like LinkedIn or Indeed."
        ]
    else:
        threat_level = "Safe"
        risk_score = 15
        threat_category = "No Major Threats Found"
        highlighted = "None"
        reasons = ["No known phishing or employment scam pattern phrases found in the provided description text."]
        recommendations = [
            "Always stay vigilant and continue verifying email domains and link destinations."
        ]
        tips = [
            "Phishing and social engineering tactics change constantly. Keep your security parameters active."
        ]
        
    explanation = f"[Local Vetting Engine] (AI Offline Fallback) Predefined rule analysis scan complete. Risk evaluation shows {threat_level} threat indicators based on syntax matching."
    
    return {
        "riskScore": risk_score,
        "threatLevel": threat_level,
        "threatCategory": threat_category,
        "confidenceScore": 85,
        "explanation": explanation,
        "highlightedContent": highlighted,
        "reasons": reasons,
        "recommendations": recommendations,
        "tips": tips
    }

def local_analyze_url(url_str: str) -> dict:
    """
    Built-in local analysis fallback for URLs.
    """
    url_lower = url_str.lower()
    
    reasons = []
    
    # Check unsecured HTTP
    if url_lower.startswith("http://"):
        reasons.append("Unsecured Connection: URL uses HTTP instead of HTTPS, exposing transmitted data to interception.")
        
    # Check suspicious TLDs
    suspicious_tlds = [".xyz", ".top", ".work", ".click", ".info", ".loan", ".gq", ".cf", ".tk", ".ml", ".ga"]
    for tld in suspicious_tlds:
        if url_lower.endswith(tld) or f"{tld}/" in url_lower:
            reasons.append(f"Suspicious TLD: The domain uses '{tld}', a top-level domain frequently associated with low-cost registration and spam/phishing campaigns.")
            break
            
    # Check lookalike brand keywords (Typosquatting)
    scam_keywords = ["win", "gift", "prize", "cash", "typing", "captcha", "free", "pay", "money"]
    brand_keywords = ["tcs", "wipro", "google", "microsoft", "amazon", "flipkart", "infosys", "hdfc", "sbi"]
    
    detected_brand = None
    for brand in brand_keywords:
        if brand in url_lower:
            if not (url_lower.endswith(f"{brand}.com") or url_lower.endswith(f"{brand}.in") or 
                    f"{brand}.com/" in url_lower or f"{brand}.in/" in url_lower or
                    f".{brand}.com" in url_lower or f".{brand}.in" in url_lower):
                detected_brand = brand
                break
                
    if detected_brand:
        reasons.append(f"Lookalike Domain (Typosquatting): URL mentions '{detected_brand}' but does not reside on the official company domain. This is a common tactic to deceive users.")
        
    for keyword in scam_keywords:
        if keyword in url_lower:
            reasons.append(f"Scam Keyword Detected: URL path contains '{keyword}', a phrase highly associated with spam, prize drawings, or job scams.")
            break

    # Determine risk category
    if len(reasons) >= 2 or any("Lookalike" in r for r in reasons):
        status = "Dangerous"
        reason = "[Local URL Scanner] (AI Offline) High-risk indicators found:\n" + "\n".join(f"- {r}" for r in reasons)
        recommendation = "[Local URL Scanner] Do NOT visit this link or enter personal credentials. Verify legitimacy directly with the official organization."
    elif len(reasons) == 1:
        status = "Caution"
        reason = "[Local URL Scanner] (AI Offline) Caution advised:\n- " + reasons[0]
        recommendation = "[Local URL Scanner] Verify the link source before visiting. Avoid entering financial info or login credentials on this website."
    else:
        status = "Safe"
        reason = "[Local URL Scanner] (AI Offline) No high-risk domain anomalies or typosquatting keywords detected by the local signature rule scanner."
        recommendation = "[Local URL Scanner] Continue to exercise normal online security precautions. Always ensure the lock icon is shown in the address bar."
        
    return {
        "status": status,
        "reason": reason,
        "recommendation": recommendation
    }

def local_analyze_qr(base64_data: str) -> dict:
    """
    Built-in local analysis fallback for QR code images.
    """
    return {
        "decodedUrl": "[Local Analysis] Decoder offline (AI unavailable)",
        "riskScore": 50,
        "recommendation": "[Local QR Scanner] (AI Offline Fallback) The cloud-based AI decoder is currently unavailable. To protect against malicious redirection, do not proceed with scan execution. Verify the origin of this QR code physically or from print sources before interacting."
    }

# Helper to fetch response from Gemini API
async def call_gemini(contents: list, system_instruction: Optional[str] = None) -> dict:
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY is not configured on the backend server."
        )

    # Use gemini-flash-latest for stable multimodal capabilities
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": contents,
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2
        }
    }

    if system_instruction:
        payload["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    max_retries = 3
    delays = [2.0, 4.0, 8.0]

    async with httpx.AsyncClient(timeout=30.0) as client:
        for attempt in range(max_retries + 1):
            try:
                response = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
                if response.status_code == 200:
                    break
                
                if response.status_code == 503 and attempt < max_retries:
                    print(f"Gemini API returned 503 (High Demand). Retrying in {delays[attempt]}s (Attempt {attempt+1}/{max_retries})...")
                    await asyncio.sleep(delays[attempt])
                    continue
                
                print(f"Gemini API returned status {response.status_code}: {response.text}")
                try:
                    error_json = response.json()
                    error_message = error_json.get("error", {}).get("message", response.text)
                except Exception:
                    error_message = response.text
                
                if response.status_code == 503:
                    error_message = "The AI service is temporarily busy. Please try again in a few moments."
                
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Gemini API error: {error_message}"
                )
            except httpx.RequestError as exc:
                if attempt < max_retries:
                    print(f"Connection error: {str(exc)}. Retrying in {delays[attempt]}s...")
                    await asyncio.sleep(delays[attempt])
                    continue
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"Failed to communicate with AI endpoint: {str(exc)}"
                )

        try:
            data = response.json()
            text_result = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            
            if not text_result:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Empty response received from Gemini AI model."
                )

            # Strip Markdown wrappers if any
            clean_text = text_result.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            
            return json.loads(clean_text.strip())
        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI model did not return valid JSON format: {str(exc)}"
            )

# Pydantic Schemas
class AnalyzeRequest(BaseModel):
    text: Optional[str] = None
    image: Optional[str] = None  # Base64 string
    mimeType: Optional[str] = "image/png"
    url: Optional[str] = None
    language: Optional[str] = "English"

class URLRequest(BaseModel):
    url: str
    language: Optional[str] = "English"

class QRRequest(BaseModel):
    image: str  # Base64 string
    mimeType: Optional[str] = "image/png"
    language: Optional[str] = "English"

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    language: Optional[str] = "English"

# Endpoints

# 1. AI Threat Analyzer (Main Endpoint)
@app.post("/api/analyze")
async def analyze_threat(req: AnalyzeRequest):
    language = req.language or "English"
    
    # Calculate Cache Key
    if req.image:
        input_data = req.image
        cache_prefix = "image"
    elif req.url:
        input_data = req.url
        cache_prefix = "url_threat"
    else:
        input_data = req.text or ""
        cache_prefix = "text_threat"
        
    cache_key = get_cache_key(cache_prefix, input_data, language)
    if cache_key in threat_cache:
        print(f"Cache Hit for threat analysis: {cache_key}")
        return threat_cache[cache_key]

    system_instruction = f"""You are Digital Shield, an expert cybersecurity defense system.
Your job is to analyze the provided content (which could be text, a URL, a PDF, or a screenshot of an email, chat, flyer, or website).
You must analyze this content for scams, phishing, fake job offers, malicious link redirects, financial fraud requests, or identity harvesting details.

You must respond with a JSON object in this format:
{{
  "riskScore": number (0 to 100 representing threat severity),
  "threatLevel": "Safe" | "Suspicious" | "Dangerous",
  "threatCategory": string (e.g. "Advance Fee Scam", "Credential Phishing", "Malicious QR Redirection", "Genuine Contact"),
  "confidenceScore": number (0 to 100 representing AI confidence),
  "explanation": string (A simple, non-technical explanation explaining what the threat is and why it was flagged),
  "highlightedContent": string (the exact sentence or fragment from the input text/image that is suspicious, or "None"),
  "reasons": string[] (List of key red flags found),
  "recommendations": string[] (List of recommended recovery or defensive actions),
  "tips": string[] (List of cybersecurity best-practice educational tips)
}}

All text fields (threatLevel, threatCategory, explanation, highlightedContent, reasons, recommendations, tips) MUST be returned in the requested language: {language}.
Keep JSON keys strictly in English and write valid JSON."""

    contents = []
    
    # Check if image data is present
    if req.image:
        # Strip data URL prefix if present
        base64_data = req.image
        if "," in base64_data:
            base64_data = base64_data.split(",")[1]
            
        contents.append({
            "parts": [
                {
                    "inlineData": {
                        "mimeType": req.mimeType or "image/png",
                        "data": base64_data
                    }
                },
                {
                    "text": "Analyze this screenshot/image. Extract and inspect any text, QR codes, links, or contact addresses. Identify threats."
                }
            ]
        })
    elif req.url:
        contents.append({
            "parts": [{
                "text": f"Inspect and analyze this website URL for security risks: {req.url}"
            }]
        })
    elif req.text:
        contents.append({
            "parts": [{
                "text": f"Inspect and analyze this text/document content: {req.text}"
            }]
        })
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No content (text, image, or url) provided for analysis.")

    try:
        result = await call_gemini(contents, system_instruction)
        threat_cache[cache_key] = result
        return result
    except HTTPException as exc:
        if exc.status_code in [429, 503, 502, 500]:
            print(f"Gemini API offline/quota exceeded ({exc.status_code}). Triggering local text vetting fallback...")
            fallback_result = local_analyze_text(req.text or req.url or "")
            threat_cache[cache_key] = fallback_result
            return fallback_result
        raise exc
    except Exception as exc:
        print(f"Unexpected error calling Gemini: {str(exc)}. Triggering local text vetting fallback...")
        fallback_result = local_analyze_text(req.text or req.url or "")
        threat_cache[cache_key] = fallback_result
        return fallback_result

# 2. URL Analyzer Endpoint
@app.post("/api/url")
async def analyze_url(req: URLRequest):
    language = req.language or "English"
    
    # Calculate Cache Key
    cache_key = get_cache_key("url", req.url, language)
    if cache_key in url_cache:
        print(f"Cache Hit for URL safety: {cache_key}")
        return url_cache[cache_key]

    system_instruction = f"""You are Digital Shield URL Security Engine.
Inspect the provided URL. Look for:
- Fake Domains / Spoofing popular brands (typosquatting)
- Unsecured HTTP connection structures
- Phishing TLDs (.xyz, .top, .work)
- Malicious redirect patterns

Respond with a JSON object in this format:
{{
  "status": "Safe" | "Caution" | "Dangerous",
  "reason": string (Explanation of findings in {language}),
  "recommendation": string (Recommended action in {language})
}}

Respond in valid JSON only."""

    contents = [{
        "parts": [{
            "text": f"URL to analyze: {req.url}"
        }]
    }]
    
    try:
        result = await call_gemini(contents, system_instruction)
        url_cache[cache_key] = result
        return result
    except HTTPException as exc:
        if exc.status_code in [429, 503, 502, 500]:
            print(f"Gemini API offline/quota exceeded ({exc.status_code}). Triggering local URL fallback...")
            fallback_result = local_analyze_url(req.url)
            url_cache[cache_key] = fallback_result
            return fallback_result
        raise exc
    except Exception as exc:
        print(f"Unexpected error calling Gemini: {str(exc)}. Triggering local URL fallback...")
        fallback_result = local_analyze_url(req.url)
        url_cache[cache_key] = fallback_result
        return fallback_result

# 3. QR Code Scanner Endpoint
@app.post("/api/qr")
async def analyze_qr(req: QRRequest):
    language = req.language or "English"
    
    # Calculate Cache Key
    cache_key = get_cache_key("qr", req.image, language)
    if cache_key in qr_cache:
        print(f"Cache Hit for QR scan: {cache_key}")
        return qr_cache[cache_key]

    system_instruction = f"""You are Digital Shield QR Decoder.
Scan the uploaded QR code image. You must:
1. Locate and decode the URL or text hidden in the QR code.
2. Analyze the decoded link or content for safety.

Respond with a JSON object in this format:
{{
  "decodedUrl": string (the exact decoded URL or text found, or "No URL found"),
  "riskScore": number (0 to 100),
  "recommendation": string (Clear guidelines in {language} on what to do next)
}}

Respond in valid JSON only."""

    base64_data = req.image
    if "," in base64_data:
        base64_data = base64_data.split(",")[1]

    contents = [{
        "parts": [
            {
                "inlineData": {
                    "mimeType": req.mimeType or "image/png",
                    "data": base64_data
                }
            },
            {
                "text": "Decode this QR code image, extract its URL or text, and analyze its threat profile."
            }
        ]
    }]

    try:
        result = await call_gemini(contents, system_instruction)
        qr_cache[cache_key] = result
        return result
    except HTTPException as exc:
        if exc.status_code in [429, 503, 502, 500]:
            print(f"Gemini API offline/quota exceeded ({exc.status_code}). Triggering local QR fallback...")
            fallback_result = local_analyze_qr(req.image)
            qr_cache[cache_key] = fallback_result
            return fallback_result
        raise exc
    except Exception as exc:
        print(f"Unexpected error calling Gemini: {str(exc)}. Triggering local QR fallback...")
        fallback_result = local_analyze_qr(req.image)
        qr_cache[cache_key] = fallback_result
        return fallback_result

# 4. AI Cyber Assistant (Educational Chatbot)
@app.post("/api/chat")
async def chat_assistant(req: ChatRequest):
    language = req.language or "English"
    system_instruction = f"""You are Digital Shield Assistant, an AI expert in cybersecurity education, online safety, and scam prevention.
Explain security concepts (phishing, social engineering, OTP scams, UPI fraud, link safety) in extremely simple, friendly, and non-technical language.
Focus strictly on educational advice and immediate recovery guides.
You MUST respond in the requested language: {language}."""

    # Format messages for Gemini API format
    contents = []
    for msg in req.messages:
        role = "model" if msg.role == "assistant" else "user"
        contents.append({
            "role": role,
            "parts": [{"text": msg.content}]
        })

    # Since Gemini model expects text response rather than JSON for normal chat,
    # we don't force JSON MIME type here. Let's make a custom request for normal text reply.
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": contents,
        "systemInstruction": {
            "parts": [{"text": system_instruction}]
        },
        "generationConfig": {
            "temperature": 0.7
        }
    }

    max_retries = 3
    delays = [2.0, 4.0, 8.0]

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt in range(max_retries + 1):
                try:
                    response = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
                    if response.status_code == 200:
                        break
                    
                    if response.status_code == 503 and attempt < max_retries:
                        print(f"Gemini Chat API returned 503. Retrying in {delays[attempt]}s (Attempt {attempt+1}/{max_retries})...")
                        await asyncio.sleep(delays[attempt])
                        continue
                    
                    try:
                        error_json = response.json()
                        error_message = error_json.get("error", {}).get("message", response.text)
                    except Exception:
                        error_message = response.text
                    
                    if response.status_code == 503:
                        error_message = "The AI service is temporarily busy. Please try again in a few moments."
                    
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Gemini API returned error: {error_message}"
                    )
                except httpx.RequestError as exc:
                    if attempt < max_retries:
                        print(f"Chat connection error: {str(exc)}. Retrying in {delays[attempt]}s...")
                        await asyncio.sleep(delays[attempt])
                        continue
                    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Chat failed: {str(exc)}")

            try:
                data = response.json()
                reply = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                return {"reply": reply or "I'm having trouble thinking of a response. Please try again."}
            except Exception as exc:
                raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Failed to decode chat response: {str(exc)}")
    except HTTPException as exc:
        if exc.status_code in [429, 503, 502, 500]:
            print(f"Gemini API offline/quota exceeded ({exc.status_code}) during chat. Triggering local assistant fallback...")
            return {"reply": "[Local Assistant Offline Mode] The AI assistant is temporarily busy or experiencing high demand. Please try again in a few moments. In the meantime, you can check URLs, email contents, or screenshots using our Vetting tools which include an automatic offline rules scanner."}
        raise exc
    except Exception as exc:
        print(f"Unexpected chat error: {str(exc)}. Triggering local assistant fallback...")
        return {"reply": "[Local Assistant Offline Mode] The AI assistant is temporarily offline. You can still use our local analysis engines in the threat vetting tabs to scan URLs, texts, and QR codes."}

# Serve frontend build in production
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

dist_dir = os.path.join(os.path.dirname(__file__), "dist")
if os.path.exists(dist_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Serve static assets or fallback to index.html for React SPA Router
        file_path = os.path.join(dist_dir, full_path)
        if full_path and os.path.exists(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
