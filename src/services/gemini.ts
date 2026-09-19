import { GoogleGenAI } from '@google/genai';
import { SecurityAuditReport } from '../types';

// Read API key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function runSecurityAudit(codeOrManifest: string, fileName: string = 'package.json'): Promise<SecurityAuditReport> {
  // If client-side VITE_GEMINI_API_KEY is provided, attempt Gemini directly
  if (apiKey && apiKey.trim().length > 0 && apiKey !== 'your_actual_gemini_api_key_here') {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are DevTrace AI Engine, a specialized AI code security auditor and license compliance engine for HackDevengers 2.0.
Analyze the following target file (${fileName}) for security risks:

${codeOrManifest}

Return a valid JSON object matching this schema:
{
  "security_score": 85,
  "summary": "Brief 2-sentence audit summary.",
  "secrets_found": [
    {
      "file": "src/config/aws.js",
      "line": 12,
      "type": "AWS Access Key",
      "masked_snippet": "AKIA****************"
    }
  ],
  "vulnerabilities": [
    {
      "package_name": "lodash",
      "installed_version": "4.17.15",
      "severity": "HIGH",
      "cve_id": "CVE-2021-23337",
      "summary": "Command Injection in lodash."
    }
  ],
  "license_issues": [
    {
      "package_name": "gpl-library",
      "license_type": "GPL-3.0",
      "status": "Conflict",
      "recommendation": "Replace with MIT/Apache-2.0 equivalent."
    }
  ],
  "remediation_steps": [
    "Move AWS credentials into environment variables (.env).",
    "Upgrade lodash to version 4.17.21 or higher.",
    "Replace gpl-library to avoid copyleft license conflict."
  ]
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
    } catch (clientErr) {
      console.warn('Direct client-side Gemini call failed, falling back to server API endpoint:', clientErr);
    }
  }

  // Use the server-side API proxy which securely uses process.env.GEMINI_API_KEY and has automated model cascading & retries
  const res = await fetch('/api/audit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: codeOrManifest,
      fileName: fileName || 'package.json',
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || `Audit failed with status ${res.status}`);
  }

  return res.json();
}
