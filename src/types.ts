export interface SecretFound {
  file: string;
  line: number;
  type: string;
  masked_snippet: string;
}

export interface Vulnerability {
  package_name: string;
  installed_version: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  cve_id: string;
  summary: string;
}

export interface LicenseIssue {
  package_name: string;
  license_type: string;
  status: string;
  recommendation: string;
}

export interface SecurityAuditReport {
  security_score: number;
  summary: string;
  secrets_found: SecretFound[];
  vulnerabilities: Vulnerability[];
  license_issues: LicenseIssue[];
  remediation_steps?: string[];
}

export interface AuditRequestPayload {
  code: string;
  fileName?: string;
  repoContext?: string;
}
