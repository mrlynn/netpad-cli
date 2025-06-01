/**
 * {{displayName}} API Integration Node Runner
 * 
 * {{description}}
 */

export async function run{{functionName}}Node(node, { getInput, setOutput, trigger, context, log }) {
  try {
    log(`Executing {{displayName}} API node: ${node.id}`);
    
    // Get inputs from connected nodes
    const requestData = await getInput('request') || {};
    const config = node.params || {};
    
    // Build API request
    const apiRequest = buildApiRequest(requestData, config, context);
    
    // Make API call
    const response = await makeApiCall(apiRequest);
    
    // Process response
    const result = processApiResponse(response, config);
    
    // Set outputs
    setOutput('response', result.data);
    setOutput('status', result.status);
    setOutput('headers', result.headers);
    
    // Trigger connected downstream nodes
    await trigger('response');
    
    log(`{{displayName}} API call completed successfully`);
    
  } catch (error) {
    log(`Error in {{displayName}} API node: ${error.message}`);
    
    // Set error output
    setOutput('error', {
      message: error.message,
      status: error.status || 500,
      timestamp: new Date().toISOString()
    });
    
    // Trigger error path if available
    await trigger('error');
    
    throw error;
  }
}

/**
 * Build API request from inputs and configuration
 */
function buildApiRequest(requestData, config, context) {
  const baseUrl = config.baseUrl || process.env.API_BASE_URL;
  const endpoint = config.endpoint || '';
  const method = config.method || 'GET';
  
  if (!baseUrl) {
    throw new Error('API base URL is required');
  }
  
  // Substitute context variables in URL
  const url = substituteVariables(`${baseUrl}${endpoint}`, {
    ...context,
    ...requestData
  });
  
  const request = {
    url,
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'NetPad-Plugin/1.0',
      ...config.headers
    }
  };
  
  // Add authentication if configured
  if (config.authType === 'bearer' && config.token) {
    request.headers.Authorization = `Bearer ${config.token}`;
  } else if (config.authType === 'apikey' && config.apiKey) {
    request.headers['X-API-Key'] = config.apiKey;
  }
  
  // Add request body for POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    request.body = JSON.stringify(requestData.body || requestData);
  }
  
  // Add query parameters
  if (requestData.query || config.query) {
    const params = new URLSearchParams({
      ...config.query,
      ...requestData.query
    });
    request.url += `?${params.toString()}`;
  }
  
  return request;
}

/**
 * Make HTTP API call
 */
async function makeApiCall(request) {
  const response = await fetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body
  });
  
  let data;
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else if (contentType?.includes('text/')) {
    data = await response.text();
  } else {
    data = await response.blob();
  }
  
  if (!response.ok) {
    const error = new Error(`API request failed: ${response.statusText}`);
    error.status = response.status;
    error.response = data;
    throw error;
  }
  
  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  };
}

/**
 * Process API response based on configuration
 */
function processApiResponse(response, config) {
  let processedData = response.data;
  
  // Apply data transformation if configured
  if (config.transform) {
    processedData = applyTransformation(processedData, config.transform);
  }
  
  // Extract specific fields if configured
  if (config.extractFields && Array.isArray(config.extractFields)) {
    processedData = extractFields(processedData, config.extractFields);
  }
  
  return {
    data: processedData,
    status: response.status,
    headers: response.headers,
    metadata: {
      timestamp: new Date().toISOString(),
      responseTime: response.responseTime
    }
  };
}

/**
 * Substitute variables in string templates
 */
function substituteVariables(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}

/**
 * Apply data transformation
 */
function applyTransformation(data, transformation) {
  // Simple transformation examples
  switch (transformation.type) {
    case 'map':
      return transformation.mapping ? 
        Object.fromEntries(
          Object.entries(transformation.mapping).map(([key, path]) => [
            key, 
            getNestedValue(data, path)
          ])
        ) : data;
    
    case 'filter':
      return Array.isArray(data) ? 
        data.filter(item => evaluateFilter(item, transformation.filter)) : 
        data;
    
    case 'sort':
      return Array.isArray(data) ?
        data.sort((a, b) => compareValues(a, b, transformation.sortBy)) :
        data;
    
    default:
      return data;
  }
}

/**
 * Extract specific fields from data
 */
function extractFields(data, fields) {
  if (Array.isArray(data)) {
    return data.map(item => 
      Object.fromEntries(
        fields.map(field => [field, getNestedValue(item, field)])
      )
    );
  } else {
    return Object.fromEntries(
      fields.map(field => [field, getNestedValue(data, field)])
    );
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Evaluate filter condition
 */
function evaluateFilter(item, filter) {
  // Simple filter evaluation - extend as needed
  const value = getNestedValue(item, filter.field);
  
  switch (filter.operator) {
    case 'equals':
      return value === filter.value;
    case 'contains':
      return String(value).includes(filter.value);
    case 'gt':
      return Number(value) > Number(filter.value);
    case 'lt':
      return Number(value) < Number(filter.value);
    default:
      return true;
  }
}

/**
 * Compare values for sorting
 */
function compareValues(a, b, sortBy) {
  const valueA = getNestedValue(a, sortBy);
  const valueB = getNestedValue(b, sortBy);
  
  if (valueA < valueB) return -1;
  if (valueA > valueB) return 1;
  return 0;
}

export default run{{functionName}}Node;