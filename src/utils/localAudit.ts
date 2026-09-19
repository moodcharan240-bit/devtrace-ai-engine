import { SecurityAuditReport, SecretFound, Vulnerability, LicenseIssue } from '../types';

const KNOWN_VULNS = [
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
    pkg: "jsonwebtoken",
    versionRegex: /^[0-8]\./,
    cve_id: "CVE-2022-23529",
    severity: "HIGH",
    summary: "Insecure key validation leading to remote code execution.",
  }
];

export function clientFallbackAudit(code: string, fileName: string = "source"): SecurityAuditReport {
  const lines = code.split("\n");
  const secretsFound: SecretFound[] = [];
  const vulnerabilities: Vulnerability[] = [];
  const licenseIssues: LicenseIssue[] = [];

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;

    const awsMatch = lineText.match(/(AKIA[0-9A-Z]{16})/);
    if (awsMatch) {
      secretsFound.push({
        file: fileName,
        line: lineNum,
        type: "AWS Access Key",
        masked_snippet: `${awsMatch[1].slice(0, 4)}****************`,
      });
    }

    const awsSecretMatch = lineText.match(/(?:aws_secret_access_key|AWS_SECRET_KEY|secret_key)\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})["']?/i);
    if (awsSecretMatch) {
      secretsFound.push({
        file: fileName,
        line: lineNum,
        type: "AWS Secret Access Key",
        masked_snippet: "wJalrXUtnFEMI****************************",
      });
    }

    const ghpMatch = lineText.match(/(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})/);
    if (ghpMatch) {
      secretsFound.push({
        file: fileName,
        line: lineNum,
        type: "GitHub Personal Access Token",
        masked_snippet: `${ghpMatch[1].slice(0, 4)}****************`,
      });
    }

    const jwtMatch = lineText.match(/(eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})/);
    if (jwtMatch) {
      secretsFound.push({
        file: fileName,
        line: lineNum,
        type: "JSON Web Token (JWT)",
        masked_snippet: "eyJhbGciOiJIUzI1NiIsIn********************",
      });
    }

    const dbMatch = lineText.match(/(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql):\/\/([^:]+):([^@]+)@([^\s"']+)/i);
    if (dbMatch) {
      secretsFound.push({
        file: fileName,
        line: lineNum,
        type: "Database Connection URI with Credentials",
        masked_snippet: lineText.replace(/:\/\/[^:]+:[^@]+@/, "://***:***@").trim().slice(0, 48) + "...",
      });
    }
  });

  try {
    const parsed = JSON.parse(code);
    const deps = {
      ...(parsed.dependencies || {}),
      ...(parsed.devDependencies || {}),
      ...(parsed.peerDependencies || {})
    };

    for (const [pkg, verRaw] of Object.entries(deps)) {
      const cleanVer = String(verRaw).replace(/^[\^~>=<v]/, "").trim();

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

      if (pkg.includes("gpl") || pkg.includes("copyleft")) {
        licenseIssues.push({
          package_name: pkg,
          license_type: "GPL-3.0",
          status: "Conflict",
          recommendation: "Replace with MIT/Apache-2.0 equivalent.",
        });
      }
    }
  } catch {
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
            recommendation: "Replace with permissive MIT/Apache-2.0 equivalent.",
          });
        }
      }
    });
  }

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
