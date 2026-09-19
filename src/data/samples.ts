export interface SampleManifest {
  id: string;
  name: string;
  category: 'node' | 'python' | 'secrets' | 'clean';
  fileName: string;
  description: string;
  code: string;
}

export const SAMPLE_MANIFESTS: SampleManifest[] = [
  {
    id: "node-vulnerable",
    name: "Node.js (package.json)",
    category: "node",
    fileName: "package.json",
    description: "Contains vulnerable lodash, axios, copyleft GPL-3.0 dependency, and leaked AWS config",
    code: `{
  "name": "ecommerce-payment-gateway",
  "version": "1.2.0",
  "private": true,
  "description": "Enterprise checkout microservice",
  "dependencies": {
    "express": "4.16.0",
    "lodash": "4.17.15",
    "axios": "0.21.1",
    "minimist": "1.2.0",
    "gpl-invoice-generator": "3.2.1",
    "jsonwebtoken": "8.5.0"
  },
  "devDependencies": {
    "mocha": "9.1.0"
  },
  "scripts": {
    "start": "node index.js"
  },
  "// AWS_BACKUP_CREDENTIALS": "Do not commit AKIAIOSFODNN7EXAMPLE to public repo",
  "license": "UNLICENSED"
}`
  },
  {
    id: "python-requirements",
    name: "Python (requirements.txt)",
    category: "python",
    fileName: "requirements.txt",
    description: "Python stack with vulnerable Django, PyYAML, urllib3, and AGPL copyleft dependency",
    code: `# Production requirements for analytics service
django==2.2.10
pyyaml==5.1
urllib3==1.24.1
requests==2.20.0
agpl-report-builder==1.4.0
psycopg2-binary==2.8.6
# DB_BACKUP_URL=postgres://admin_user:P@ssw0rd2026_HackDev@db.production.internal:5432/core_db
gunicorn==20.1.0`
  },
  {
    id: "raw-code-secrets",
    name: "Source Code (aws.js & secrets)",
    category: "secrets",
    fileName: "src/config/aws.js",
    description: "Raw JavaScript config file containing leaked AWS keys, GitHub PAT, and database URIs",
    code: `// AWS S3 Storage and Integration Service
const AWS = require('aws-sdk');

const AWS_ACCESS_KEY_ID = "AKIA1234567890ABCDEF";
const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
const GITHUB_DEPLOY_TOKEN = "ghp_AbCdEf1234567890GhIjKlMnOpQrStUvWxYz";

const DATABASE_URI = "mongodb+srv://root:SuperSecretMongoDBPass99@cluster0.prod.mongodb.net/analytics?retryWrites=true&w=majority";

const JWT_SESSION_SAMPLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJhZG1pbiI6dHJ1ZX0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ";

module.exports = {
  s3: new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
  }),
  dbUri: DATABASE_URI,
  token: GITHUB_DEPLOY_TOKEN
};`
  },
  {
    id: "clean-manifest",
    name: "Secured Clean (package.json)",
    category: "clean",
    fileName: "package.json",
    description: "Hardened modern Node.js project with MIT/Apache licenses and zero known CVEs",
    code: `{
  "name": "devtrace-secured-app",
  "version": "2.0.0",
  "license": "MIT",
  "dependencies": {
    "express": "4.21.2",
    "lodash": "4.17.21",
    "axios": "1.7.9",
    "zod": "3.23.8",
    "dotenv": "16.4.7"
  }
}`
  }
];
