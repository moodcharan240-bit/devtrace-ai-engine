import { GoogleGenAI, Type } from "@google/genai";
import { SecurityAuditReport, SecretFound, Vulnerability, LicenseIssue } from "../src/types.js";

// Known vulnerability registry for deterministic analysis & fallback
interface KnownVuln {
  pkg: string;
  versionRegex: RegExp;
  cve_id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  summary: string;
}

const KNOWN_VULNS: KnownVuln[] = [
  {
    pkg: "lodash",
    versionRegex: /^(?:[0-3]\.|4\.(?:0|1[0-6]|17\.(?:[0-9]|1[0-9]|20)))(?:\.|$)/,
    cve_id: "CVE-2021-23337",
    severity: "HIGH",
    summary: "Command Injection and Prototype Pollution in lodash template/merge.",
  },
  {
    pkg: "axios",
    versionRegex: /^0\.(?:[0-1]\d|20|21\.[0-1])(?:\.|$)/,
    cve_id: "CVE-2020-28168",
    severity: "HIGH",
    summary: "Server-Side Request Forgery (SSRF) and credential leak in Axios.",
  },
  {
    pkg: "express",
    versionRegex: /^(?:[0-3]\.|4\.(?:[0-9]|1[0-8])\.)/,
    cve_id: "CVE-2024-29041",
    severity: "MEDIUM",
    summary: "Open Redirect vulnerability via express response redirect handling.",
  },
  {
    pkg: "minimist",
    versionRegex: /^(?:0\.|1\.(?:[0-1]\.|2\.[0-5]))/,
    cve_id: "CVE-2021-44906",
    severity: "CRITICAL",
    summary: "Prototype pollution in minimist argument parsing.",
  },
  {
    pkg: "django",
    versionRegex: /^(?:[0-2]\.|3\.(?:[0-1]\.|2\.(?:[0-9]|1[0-2])))/,
    cve_id: "CVE-2022-28346",
    severity: "HIGH",
    summary: "SQL injection in QuerySet.annotate(), aggregate(), and extra().",
  },
  {
    pkg: "pyyaml",
    versionRegex: /^(?:[0-4]\.|5\.[0-3])/,
    cve_id: "CVE-2020-14343",
    severity: "CRITICAL",
    summary: "Arbitrary code execution through untrusted YAML deserialization.",
  },
  {
    pkg: "urllib3",
    versionRegex: /^1\.(?:[0-9]|1\d|2[0-5]|26\.[0-4])(?:\.|$)/,
    cve_id: "CVE-2021-33503",
    severity: "HIGH",
    summary: "Catastrophic ReDoS in urllib3 authority regular expression parsing.",
  },
  {
    pkg: "json-web-token",
    versionRegex: /^[0-8]\./,
    cve_id: "CVE-2022-23529",
    severity: "HIGH",
    summary: "Arbitrary code execution when verifying untrusted craft signatures.",
  },
  {
    pkg: "jsonwebtoken",
    versionRegex: /^[0-8]\./,
    cve_id: "CVE-2022-23529",
    severity: "HIGH",
    summary: "Insecure key validation leading to remote code execution.",
  }
];

const COPYLEFT_LICENSES: Record<string, { status: string; recommendation: string }> = {
  "GPL-3.0": {
    status: "Conflict",
    recommendation: "Replace with MIT/Apache-2.0 equivalent to prevent viral copyleft obligations on commercial proprietary code."
  },
  "GPL-2.0": {
    status: "Conflict",
    recommendation: "Replace with MIT/Apache-2.0 equivalent; requires distributing source under GPL."
  },
  "AGPL-3.0": {
    status: "Conflict",
    recommendation: "Strict conflict for SaaS/commercial deployment; mandates disclosing complete network application source."
  },
  "AGPL-1.0": {
    status: "Conflict",
    recommendation: "Strict network copyleft conflict; replace immediately with Apache-2.0 or BSD-3-Clause."
  },
  "SSPL": {
    status: "Conflict",
    recommendation: "Non-OSI commercial restriction; requires releasing entire management stack if offered as a service."
  },
  "UNLICENSE": {
    status: "Review",
    recommendation: "Public domain dedication lacks warranty disclaimers in certain jurisdictions. Consider MIT."
  }
};

export function runDeterministicAudit(code: string, fileName: string = "source"): SecurityAuditReport {
  const lines = code.split("\n");
  const secretsFound: SecretFound[] = [];
  const vulnerabilities: Vulnerability[] = [];
  const licenseIssues: LicenseIssue[] = [];

  // 1. Scan for secrets line by line
  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;

    // AWS Access Key (AKIA...)
    const awsMatch = lineText.match(/(AKIA[0-9A-Z]{16})/);
    if (awsMatch) {
      const raw = awsMatch[1];
      secretsFound.push({
        file: fileName,
        line: lineNum,
        type: "AWS Access Key",
        masked_snippet: `${raw.slice(0, 4)}****************`,
      });
    }

    // AWS Secret Key
    const awsSecretMatch = lineText.match(/(?:aws_secret_access_key|AWS_SECRET_KEY|secret_key)\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})["']?/i);
    if (awsSecretMatch) {
      secretsFound.push({
        file: fileName,
        line: lineNum,
        type: "AWS Secret Access Key",
        masked_snippet: "wJalrXUtnFEMI****************************",
      });
    }

    // GitHub Personal Access Token
    const ghpMatch = lineText.match(/(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})/);
    if (ghpMatch) {
      const raw = ghpMatch[1];
      secretsFound.push({
        file: fileName,
        line: lineNum,
        type: "GitHub Personal Access Token",
        masked_snippet: `${raw.slice(0, 4)}****************`,
      });
    }

    // JWT Token
    const jwtMatch = lineText.match(/(eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})/);
    if (jwtMatch) {
      secretsFound.push({
        file: fileName,
        line: lineNum,
        type: "JSON Web Token (JWT)",
        masked_snippet: "eyJhbGciOiJIUzI1NiIsIn********************",
      });
    }

    // Database URIs
    const dbMatch = lineText.match(/(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql):\/\/([^:]+):([^@]+)@([^\s"']+)/i);
    if (dbMatch) {
      secretsFound.push({
        file: fileName,
        line: lineNum,
        type: "Database Connection URI with Credentials",
        masked_snippet: lineText.replace(/:\/\/[^:]+:[^@]+@/, "://***:***@").trim().slice(0, 48) + "...",
      });
    }

    // Generic Private Keys
    if (lineText.includes("BEGIN PRIVATE KEY") || lineText.includes("BEGIN RSA PRIVATE KEY")) {
      secretsFound.push({
        file: fileName,
        line: lineNum,
        type: "Private Cryptographic Key",
        masked_snippet: "-----BEGIN PRIVATE KEY----- ****************",
      });
    }
  });

  // 2. Parse dependencies if JSON or requirements.txt
  // Check if it's package.json
  try {
    const parsed = JSON.parse(code);
    const deps = {
      ...(parsed.dependencies || {}),
      ...(parsed.devDependencies || {}),
      ...(parsed.peerDependencies || {})
    };

    for (const [pkg, verRaw] of Object.entries(deps)) {
      const cleanVer = String(verRaw).replace(/^[\^~>=<v]/, "").trim();

      // Check CVEs
      for (const kv of KNOWN_VULNS) {
        if (kv.pkg.toLowerCase() === pkg.toLowerCase()) {
          if (kv.versionRegex.test(cleanVer)) {
            vulnerabilities.push({
              package_name: pkg,
              installed_version: cleanVer,
              severity: kv.severity,
              cve_id: kv.cve_id,
              summary: kv.summary,
            });
          }
        }
      }

      // Check package licenses if package known as GPL or license key present
      if (pkg.includes("gpl") || pkg.includes("copyleft")) {
        licenseIssues.push({
          package_name: pkg,
          license_type: "GPL-3.0",
          status: "Conflict",
          recommendation: "Replace with MIT/Apache-2.0 equivalent.",
        });
      }
    }

    // Also check root license if present
    if (parsed.license) {
      const rootLic = String(parsed.license).toUpperCase();
      for (const [licKey, licInfo] of Object.entries(COPYLEFT_LICENSES)) {
        if (rootLic.includes(licKey)) {
          licenseIssues.push({
            package_name: parsed.name || "project-root",
            license_type: licKey,
            status: licInfo.status,
            recommendation: licInfo.recommendation,
          });
        }
      }
    }
  } catch {
    // Not valid JSON, check lines for requirements.txt (e.g. package==1.2.3)
    lines.forEach((line) => {
      const trimmed = line.trim();
      const reqMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*(?:==|>=|<=|~=)\s*([0-9a-zA-Z._-]+)/);
      if (reqMatch) {
        const pkg = reqMatch[1];
        const ver = reqMatch[2];
        for (const kv of KNOWN_VULNS) {
          if (kv.pkg.toLowerCase() === pkg.toLowerCase()) {
            if (kv.versionRegex.test(ver)) {
              vulnerabilities.push({
                package_name: pkg,
                installed_version: ver,
                severity: kv.severity,
                cve_id: kv.cve_id,
                summary: kv.summary,
              });
            }
          }
        }
        if (pkg.includes("gpl") || pkg.includes("agpl")) {
          licenseIssues.push({
            package_name: pkg,
            license_type: pkg.includes("agpl") ? "AGPL-3.0" : "GPL-3.0",
            status: "Conflict",
            recommendation: "Replace with permissive MIT or BSD license alternative.",
          });
        }
      }
    });
  }

  // Calculate score
  let deductions = 0;
  deductions += secretsFound.length * 25;
  deductions += vulnerabilities.reduce((acc, v) => {
    if (v.severity === "CRITICAL") return acc + 20;
    if (v.severity === "HIGH") return acc + 15;
    if (v.severity === "MEDIUM") return acc + 8;
    return acc + 4;
  }, 0);
  deductions += licenseIssues.filter(l => l.status === "Conflict").length * 15;

  const securityScore = Math.max(10, Math.min(100, 100 - deductions));

  let summary = "";
  if (secretsFound.length === 0 && vulnerabilities.length === 0 && licenseIssues.length === 0) {
    summary = "No exposed secrets, known CVE vulnerabilities, or license conflicts were detected in the provided code. The repository demonstrates solid security compliance.";
  } else {
    summary = `Security audit detected ${secretsFound.length} exposed secret(s), ${vulnerabilities.length} package vulnerability(ies), and ${licenseIssues.length} license conflict(s). Immediate remediation is recommended before deployment.`;
  }

  const remediationSteps: string[] = [];
  secretsFound.forEach((s) => {
    remediationSteps.push(`Move exposed ${s.type} in ${s.file} (line ${s.line}) into environment variables (.env) and revoke compromised key.`);
  });
  vulnerabilities.forEach((v) => {
    remediationSteps.push(`Upgrade ${v.package_name} (currently ${v.installed_version}) to resolve ${v.cve_id} (${v.severity} severity).`);
  });
  licenseIssues.filter((l) => l.status === "Conflict").forEach((l) => {
    remediationSteps.push(`Replace ${l.package_name} (${l.license_type}) with an MIT or Apache-2.0 licensed alternative.`);
  });
  if (remediationSteps.length === 0) {
    remediationSteps.push("Maintain dependency hygiene by enabling automated security advisory alerts.");
  }

  return {
    security_score: securityScore,
    summary,
    secrets_found: secretsFound,
    vulnerabilities,
    license_issues: licenseIssues,
    remediation_steps: remediationSteps,
  };
}

export async function runGeminiAudit(code: string, fileName: string = "package.json"): Promise<SecurityAuditReport> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.log("No valid GEMINI_API_KEY configured; executing deterministic audit engine.");
    return runDeterministicAudit(code, fileName);
  }

  const systemInstruction = `You are DevTrace AI Engine, a specialized AI code security auditor and license compliance engine for HackDevengers 2.0.
Your objective is to analyze GitHub repository manifest files (like package.json, requirements.txt, Cargo.toml, go.mod, or raw source code files) provided by the user and return a strictly structured JSON security audit report.

When provided with code or a file manifest, evaluate:
1. Exposed Secrets & Credentials (AWS keys, JWTs, GitHub PATs, database URIs, API tokens, private certificates).
2. Package Vulnerabilities (CVEs, outdated high-risk dependencies like old versions of lodash, axios, express, django, pyyaml, etc.).
3. License Compliance Matrix (Flag GPL v2/v3, AGPL, or unlicenses that conflict with commercial software).
4. AI Remediation Plan (Provide clear, actionable step-by-step fix recommendations for each flagged issue).

OUTPUT FORMAT:
Always return a valid JSON object matching this schema:
{
  "security_score": 88,
  "summary": "Repository analysis complete. Identified 1 exposed credential, 2 vulnerable packages, and 1 license conflict.",
  "secrets_found": [
    {
      "file": "src/config/aws.js",
      "line": 14,
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
      "summary": "Command Injection vulnerability in lodash prototypePollution."
    }
  ],
  "license_issues": [
    {
      "package_name": "gpl-utility",
      "license_type": "GPL-3.0",
      "status": "Conflict",
      "recommendation": "Replace with an MIT or Apache-2.0 licensed alternative."
    }
  ],
  "remediation_steps": [
    "Move AWS credentials from src/config/aws.js into environment variables (.env).",
    "Upgrade lodash to version 4.17.21 or higher.",
    "Replace gpl-utility dependency to avoid copyleft licensing obligations."
  ]
}

CRITICAL RULES:
- Never break JSON output formatting.
- Always mask secrets (e.g., "AKIA****************", "ghp_****************", "postgres://***:***@host/db").
- security_score must be an integer from 0 to 100.
- summary must be strictly a brief 2-sentence summary.
- remediation_steps must contain actionable step-by-step guidance.
`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      security_score: {
        type: Type.INTEGER,
        description: "Overall security rating from 0 to 100"
      },
      summary: {
        type: Type.STRING,
        description: "Brief 2-sentence audit summary."
      },
      secrets_found: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            file: { type: Type.STRING },
            line: { type: Type.INTEGER },
            type: { type: Type.STRING },
            masked_snippet: { type: Type.STRING }
          },
          required: ["file", "line", "type", "masked_snippet"]
        }
      },
      vulnerabilities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            package_name: { type: Type.STRING },
            installed_version: { type: Type.STRING },
            severity: { type: Type.STRING },
            cve_id: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ["package_name", "installed_version", "severity", "cve_id", "summary"]
        }
      },
      license_issues: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            package_name: { type: Type.STRING },
            license_type: { type: Type.STRING },
            status: { type: Type.STRING },
            recommendation: { type: Type.STRING }
          },
          required: ["package_name", "license_type", "status", "recommendation"]
        }
      },
      remediation_steps: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING
        }
      }
    },
    required: ["security_score", "summary", "secrets_found", "vulnerabilities", "license_issues"]
  };

  const candidateModels = ["gemini-2.5-flash", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  for (const modelName of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Audit the following target file (${fileName}):\n\n\`\`\`\n${code}\n\`\`\``,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
          }
        });

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text) as SecurityAuditReport;
          if (typeof parsed.security_score === "number") {
            return parsed;
          }
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isTransient = errMsg.includes("503") || errMsg.includes("429") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand");
        if (isTransient) {
          console.info(`Model ${modelName} temporary demand spike (${errMsg.slice(0, 100)}). Retrying or cascading...`);
          await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
          continue; // try next attempt or cascade
        } else {
          console.warn(`Model ${modelName} encountered error: ${errMsg.slice(0, 120)}`);
          break; // break to next model in candidateModels
        }
      }
    }
  }

  // If all models encounter transient spikes or errors, smoothly use the deterministic audit
  console.info("Gemini models temporarily under peak demand; using built-in deterministic security audit engine.");
  return runDeterministicAudit(code, fileName);
}
