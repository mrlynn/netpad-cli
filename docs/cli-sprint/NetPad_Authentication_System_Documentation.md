# NetPad Authentication System Documentation

## Overview

NetPad implements a comprehensive authentication system supporting multiple authentication methods for both user sessions and programmatic API access. The system is built on NextAuth.js for session management and includes a robust API key system for CLI tools and external integrations.

## Table of Contents

1. [Authentication Methods](#authentication-methods)
2. [Session-Based Authentication](#session-based-authentication)
3. [API Key Authentication](#api-key-authentication)
4. [Authentication Flow](#authentication-flow)
5. [API Endpoints](#api-endpoints)
6. [Data Models](#data-models)
7. [Middleware & Security](#middleware--security)
8. [CLI Integration Guide](#cli-integration-guide)
9. [Code Examples](#code-examples)

## Authentication Methods

NetPad supports three primary authentication methods:

### 1. Session-Based Authentication (Web UI)
- **NextAuth.js** with JWT strategy
- **Google OAuth** - Social authentication via Google accounts
- **GitHub OAuth** - Social authentication via GitHub accounts  
- **Credentials** - Email/password authentication with bcrypt hashing

### 2. API Key Authentication (Programmatic Access)
- **API Keys** with scoped permissions (`READ_ONLY`, `EXECUTE`, `ADMIN`)
- **Bearer Token** authentication via `Authorization` header
- **X-API-Key** header authentication
- Rate limiting and IP restrictions support

### 3. Admin Authentication
- Role-based access control with `isAdmin` flag
- Server-side session validation for admin routes

## Session-Based Authentication

### NextAuth Configuration

Located in `/src/app/api/auth/[...nextauth]/route.js`:

```javascript
export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Validates email/password against MongoDB
        // Returns user object if valid, null if invalid
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/signin',
    register: '/auth/register'
  },
  callbacks: {
    async session({ session }) {
      // Enriches session with user data from database
      const dbUser = await User.findOne({ email: session.user.email });
      session.user.isAdmin = dbUser?.isAdmin || false;
      return session;
    }
  }
};
```

### User Registration

**Endpoint:** `POST /api/auth/register`

```javascript
// Request
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "securepassword123"
}

// Response
{
  "message": "User registered",
  "user": {
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### Session Management

**Client-side usage:**
```javascript
import { useSession, signIn, signOut } from 'next-auth/react';

function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") return <p>Loading...</p>
  if (status === "unauthenticated") return <button onClick={() => signIn()}>Sign in</button>
  
  return (
    <div>
      <p>Signed in as {session.user.email}</p>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  )
}
```

**Server-side usage:**
```javascript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Authenticated logic here
}
```

## API Key Authentication

### API Key Model

Located in `/src/models/APIKey.js`:

```javascript
const APIKeySchema = new mongoose.Schema({
  name: { type: String, required: true },           // User-friendly name
  key: { type: String, required: true, unique: true }, // API key value
  owner: { type: String, required: true },          // User email
  scopes: {
    type: [String],
    enum: ['READ_ONLY', 'EXECUTE', 'ADMIN'],
    default: ['READ_ONLY']
  },
  status: { 
    type: String, 
    enum: ['active', 'revoked'], 
    default: 'active' 
  },
  lastUsed: { type: Date },
  expiresAt: { type: Date, required: false },       // Optional expiration
  rateLimit: { 
    requests: { type: Number, default: 100 },
    periodInSeconds: { type: Number, default: 60 }
  },
  allowedIPs: [{ type: String }],                   // Optional IP restriction
  createdAt: { type: Date, default: Date.now },
  description: { type: String }
}, { timestamps: true });
```

### API Key Scopes

- **READ_ONLY**: Access to GET endpoints, view tools, schemas, documentation
- **EXECUTE**: Full access to command execution, workflow running, tool invocation
- **ADMIN**: Administrative access to all endpoints

### API Key Generation

API keys follow the format: `mcp_[32_hex_characters]`

Example: `mcp_f93407ad4d519dc954ecbf949157a34e`

### Authentication Methods

**Option 1: Authorization Header (Recommended)**
```bash
curl -H "Authorization: Bearer mcp_your_api_key_here" \
     https://yourapp.com/api/mcp/tools
```

**Option 2: X-API-Key Header**
```bash
curl -H "X-API-Key: mcp_your_api_key_here" \
     https://yourapp.com/api/mcp/tools
```

## Authentication Flow

### Web Application Flow

1. **User visits protected route**
2. **Next.js middleware checks session**
3. **If no session:** Redirect to `/auth/signin`
4. **User chooses auth method:**
   - Google/GitHub: OAuth flow
   - Credentials: Email/password form
5. **NextAuth validates credentials**
6. **Session created with JWT**
7. **User redirected to original route**

### CLI/API Flow

1. **CLI tool sends request with API key**
2. **validateApiKey middleware extracts key**
3. **Database lookup for API key**
4. **Validation checks:**
   - Key exists in database
   - Status is 'active'
   - Not expired
   - IP restrictions (if set)
5. **Scope validation for endpoint**
6. **Request processed**
7. **lastUsed timestamp updated**

## API Endpoints

### Authentication Endpoints

#### NextAuth Endpoints
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers
- `POST /api/auth/register` - User registration

#### API Key Management
- `GET /api/user/preferences/apikeys` - List user's API keys
- `POST /api/user/preferences/apikeys` - Create new API key
- `GET /api/user/preferences/apikeys/[id]` - Get specific API key details
- `DELETE /api/user/preferences/apikeys/[id]` - Delete API key

#### mCP API Endpoints (Require API Key)
- `GET /api/mcp` - API information (public)
- `GET /api/mcp/tools` - List available tools (READ_ONLY)
- `GET /api/mcp/tools/[id]` - Get tool details (READ_ONLY)
- `GET /api/mcp/schema` - Get schemas (READ_ONLY)
- `POST /api/mcp/command` - Execute commands (EXECUTE)
- `POST /api/mcp/workflow/run` - Run workflows (EXECUTE)
- `GET/POST /api/mcp/memory/[sessionId]` - Memory operations (EXECUTE)
- `POST /api/mcp/llm` - LLM interactions (EXECUTE)

### User Management Endpoints (Session Required)
- `GET /api/user/preferences` - Get user preferences
- `POST /api/user/preferences` - Update user preferences
- `GET /api/diagrams` - List user diagrams
- `POST /api/diagrams` - Create diagram

### Admin Endpoints (Admin Session Required)
- `GET /api/admin/users` - List all users
- `GET /api/admin/diagrams` - List all diagrams
- `GET /api/admin/logs` - View system logs

## Data Models

### User Model (`/src/models/User.js`)

```javascript
const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },         // Only for credentials users
  image: { type: String },                           // Profile image URL
  createdAt: { type: Date, default: Date.now },
  preferences: { 
    type: mongoose.Schema.Types.Mixed, 
    default: { theme: 'dark' } 
  },
  BETA_USER: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  onboardingCompleted: { type: Boolean, default: false }
});
```

### API Key Model (Detailed)

Key methods:
- `APIKey.generateKey()` - Static method to generate new API key
- `apiKey.isValid()` - Instance method to check if key is valid
- `apiKey.updateLastUsed()` - Instance method to update usage timestamp

## Middleware & Security

### API Key Validation Middleware

Located in `/src/app/api/middleware/validateApiKey.js`:

```javascript
export async function validateApiKey(request) {
  // 1. Extract API key from headers
  const apiKey = request.headers.get('x-api-key') || 
                 request.headers.get('authorization')?.replace('Bearer ', '');
  
  // 2. Allow unauthenticated access to public routes
  if (!apiKey && isPublicRoute) {
    return { isValid: false, isPublicRoute: true };
  }
  
  // 3. Database lookup
  const keyDoc = await APIKey.findOne({ key: apiKey });
  
  // 4. Validation checks
  if (!keyDoc || !keyDoc.isValid()) {
    return { isValid: false, response: errorResponse };
  }
  
  // 5. IP restrictions
  if (keyDoc.allowedIPs && !keyDoc.allowedIPs.includes(clientIP)) {
    return { isValid: false, response: errorResponse };
  }
  
  // 6. Update usage tracking
  keyDoc.updateLastUsed();
  
  return { isValid: true, key: keyDoc };
}
```

### Scope Validation

```javascript
export function checkScope(key, requiredScope) {
  if (Array.isArray(key.scopes)) {
    return key.scopes.includes(requiredScope) || key.scopes.includes('ADMIN');
  }
  return key.scope === requiredScope || key.scope === 'ADMIN';
}
```

### Password Security

- **Hashing**: bcrypt with salt rounds (default: 10)
- **Password storage**: Never stored in plain text
- **Session security**: JWT tokens with secure cookies

## CLI Integration Guide

### 1. Obtain API Key

**Web UI Method:**
1. Sign in to NetPad
2. Navigate to Preferences → API Keys
3. Click "Create New API Key"
4. Set name, description, and scopes
5. Copy the generated key (shown only once)

**API Method:**
```bash
# First authenticate and get session
curl -X POST https://yourapp.com/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Then create API key
curl -X POST https://yourapp.com/api/user/preferences/apikeys \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your_session_token" \
  -d '{
    "name": "CLI Tool",
    "scopes": ["READ_ONLY", "EXECUTE"],
    "description": "API key for CLI tool"
  }'
```

### 2. CLI Configuration

Store the API key securely in your CLI configuration:

```bash
# Environment variable
export NETPAD_API_KEY="mcp_your_api_key_here"

# Config file (~/.netpad/config.json)
{
  "apiKey": "mcp_your_api_key_here",
  "baseUrl": "https://yourapp.com"
}
```

### 3. Making Authenticated Requests

```javascript
// Node.js example
const fetch = require('node-fetch');

const apiKey = process.env.NETPAD_API_KEY;
const baseUrl = 'https://yourapp.com';

async function makeAuthenticatedRequest(endpoint, options = {}) {
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }
  
  return response.json();
}

// Usage examples
const tools = await makeAuthenticatedRequest('/api/mcp/tools');
const result = await makeAuthenticatedRequest('/api/mcp/command', {
  method: 'POST',
  body: JSON.stringify({ command: { type: 'example' } })
});
```

### 4. Error Handling

Common authentication errors:

```javascript
{
  "success": false,
  "status": 401,
  "message": "Authentication failed",
  "error": {
    "code": "MISSING_API_KEY",
    "message": "API key is required"
  }
}

{
  "success": false,
  "status": 401,
  "message": "Authentication failed", 
  "error": {
    "code": "INVALID_API_KEY",
    "message": "Invalid API key"
  }
}

{
  "success": false,
  "status": 401,
  "message": "Authentication failed",
  "error": {
    "code": "EXPIRED_API_KEY", 
    "message": "API key is no longer valid"
  }
}

{
  "success": false,
  "status": 403,
  "message": "Access denied",
  "error": {
    "code": "IP_RESTRICTED",
    "message": "IP address not allowed"
  }
}
```

## Code Examples

### Complete CLI Authentication Example

```javascript
class NetPadClient {
  constructor(apiKey, baseUrl = 'https://yourapp.com') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`${data.error?.code || 'API_ERROR'}: ${data.error?.message || data.message}`);
    }
    
    return data;
  }
  
  // List available tools
  async getTools() {
    return this.request('/api/mcp/tools');
  }
  
  // Execute a command
  async executeCommand(command) {
    return this.request('/api/mcp/command', {
      method: 'POST',
      body: JSON.stringify({ command })
    });
  }
  
  // Run a workflow
  async runWorkflow(workflow, context = {}) {
    return this.request('/api/mcp/workflow/run', {
      method: 'POST',
      body: JSON.stringify({ workflow, context })
    });
  }
  
  // Memory operations
  async memory(sessionId, operation) {
    return this.request(`/api/mcp/memory/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify(operation)
    });
  }
}

// Usage
const client = new NetPadClient(process.env.NETPAD_API_KEY);

try {
  const tools = await client.getTools();
  console.log('Available tools:', tools);
  
  const result = await client.executeCommand({
    type: 'llm',
    input: {
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      prompt: 'Hello, world!'
    }
  });
  console.log('LLM response:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### React Hook for Session Management

```javascript
import { useSession } from 'next-auth/react';

export function useAuthenticatedUser() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user || null,
    isAuthenticated: !!session,
    isAdmin: session?.user?.isAdmin || false,
    isLoading: status === 'loading',
    email: session?.user?.email
  };
}

// Usage in components
function MyComponent() {
  const { user, isAuthenticated, isAdmin } = useAuthenticatedUser();
  
  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

### Server-side Authentication Check

```javascript
// Utility function for API routes
export async function requireAuth(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}

export async function requireAdmin(request) {
  const session = await requireAuth(request);
  if (!session.user?.isAdmin) {
    throw new Error('Admin access required');
  }
  return session;
}

// Usage in API routes
export async function GET(req) {
  try {
    const session = await requireAuth(req);
    // Your authenticated logic here
    return NextResponse.json({ data: 'success' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
```

## Environment Variables

Required environment variables for authentication:

```bash
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Database
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/netpad"

# Optional: API Rate Limiting
REDIS_URL="redis://localhost:6379" # For advanced rate limiting
```

## Security Best Practices

### For Web Applications
1. **Use HTTPS** in production
2. **Secure session cookies** with httpOnly, secure, sameSite
3. **Implement CSRF protection** (built into NextAuth)
4. **Regular session rotation**
5. **Strong password policies**

### For API Keys
1. **Scope limitation** - Use minimal required scopes
2. **Key rotation** - Regular rotation of API keys
3. **IP restrictions** when possible
4. **Monitoring** - Track API key usage and suspicious activity
5. **Secure storage** - Never commit API keys to version control
6. **Expiration dates** - Set reasonable expiration times

### For CLI Tools
1. **Secure storage** - Use OS credential stores when available
2. **Environment variables** - For temporary usage
3. **Error handling** - Don't log API keys in error messages
4. **Key validation** - Verify API key format before sending requests

## CLI Device Code Authentication (NEW)

NetPad now supports OAuth 2.0 Device Code Flow for CLI authentication, similar to GitHub CLI and Google Cloud CLI. This solves the redirect callback issues with browser-based OAuth flows.

### Device Code Flow Overview

1. **Request Device Code**: CLI requests a device code and user code
2. **User Authorization**: CLI opens browser to verification page where user enters code
3. **Poll for Token**: CLI polls until user completes authorization
4. **Receive API Key**: CLI receives long-lived API key for future requests

### Device Code Flow Endpoints

#### 1. Request Device Code
```bash
POST /api/cli/auth/device-code
Content-Type: application/json

{
  "client_id": "netpad-cli",
  "scope": "read write execute"
}
```

**Response:**
```json
{
  "device_code": "abc123...",
  "user_code": "ABCD-1234", 
  "verification_uri": "https://netpad.io/cli-auth",
  "verification_uri_complete": "https://netpad.io/cli-auth?user_code=ABCD-1234",
  "expires_in": 600,
  "interval": 5
}
```

#### 2. Poll for Authorization
```bash
POST /api/cli/auth/token
Content-Type: application/json

{
  "device_code": "abc123...",
  "grant_type": "urn:ietf:params:oauth:grant-type:device_code"
}
```

**Pending Response:**
```json
{
  "error": "authorization_pending",
  "error_description": "User has not yet completed authorization"
}
```

**Success Response:**
```json
{
  "access_token": "mcp_f93407ad4d519dc954ecbf949157a34e",
  "token_type": "Bearer", 
  "scope": "read write execute"
}
```

### CLI Implementation Example

```javascript
class NetPadCLI {
  async login() {
    // Step 1: Request device code
    const deviceResponse = await fetch('https://netpad.io/api/cli/auth/device-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        client_id: 'netpad-cli',
        scope: 'read write execute'
      })
    });
    
    const deviceData = await deviceResponse.json();
    
    // Step 2: Show user the code and open browser
    console.log(`\\nTo authorize this CLI, please visit: ${deviceData.verification_uri}`);
    console.log(`And enter this code: ${deviceData.user_code}\\n`);
    
    // Open browser automatically
    const open = await import('open');
    await open.default(deviceData.verification_uri_complete);
    
    // Step 3: Poll for authorization
    const startTime = Date.now();
    const timeoutMs = deviceData.expires_in * 1000;
    
    while (Date.now() - startTime < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, deviceData.interval * 1000));
      
      const tokenResponse = await fetch('https://netpad.io/api/cli/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_code: deviceData.device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        })
      });
      
      const tokenData = await tokenResponse.json();
      
      if (tokenResponse.ok) {
        // Success! Save the API key
        console.log('✅ Authentication successful!');
        this.saveApiKey(tokenData.access_token);
        return tokenData.access_token;
      }
      
      if (tokenData.error === 'authorization_pending') {
        process.stdout.write('.');
        continue;
      }
      
      // Other errors (denied, expired, etc.)
      throw new Error(`Authentication failed: ${tokenData.error_description}`);
    }
    
    throw new Error('Authentication timed out');
  }
  
  saveApiKey(apiKey) {
    // Save to config file or keychain
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    
    const configDir = path.join(os.homedir(), '.netpad');
    const configFile = path.join(configDir, 'config.json');
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    const config = { apiKey };
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
  }
}
```

### Error Handling

The device code flow can return several error types:

- `authorization_pending`: User hasn't completed auth yet (keep polling)
- `slow_down`: Polling too fast (increase interval)  
- `access_denied`: User denied the request
- `expired_token`: Device code expired (restart flow)
- `invalid_grant`: Invalid device code

### Security Features

- **Short-lived codes**: Device codes expire in 10 minutes
- **Rate limiting**: Prevents abuse of polling endpoint
- **Secure storage**: Device codes are automatically cleaned up
- **Scoped access**: API keys are created with appropriate scopes
- **Auto-cleanup**: Expired codes are automatically deleted

### CLI Usage Commands

Once implemented, the CLI should support:

```bash
# Authenticate via device code flow
netpad-cli login --google
netpad-cli login --github

# Check authentication status
netpad-cli auth status

# Logout (clear stored credentials)
netpad-cli logout
```

This documentation provides a complete overview of NetPad's authentication system for CLI development teams. The new device code flow solves the OAuth redirect issues and provides a smooth authentication experience similar to other popular CLI tools.