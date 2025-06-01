/**
 * {{displayName}} Node Runner
 * 
 * {{description}}
 */

export async function run{{functionName}}Node(node, { getInput, setOutput, trigger, context, log }) {
  try {
    log(`Executing {{displayName}} node: ${node.id}`);
    
    // Get inputs from connected nodes
    const input = await getInput('input');
    
    // Implement your node logic here
    const result = processInput(input);
    
    // Set output for downstream nodes
    setOutput('output', result);
    
    // Trigger connected downstream nodes
    await trigger('output');
    
    log(`{{displayName}} node completed successfully`);
    
  } catch (error) {
    log(`Error in {{displayName}} node: ${error.message}`);
    throw error;
  }
}

/**
 * Process input data according to node configuration
 */
function processInput(input) {
  // TODO: Implement your custom processing logic
  
  // Example: Simple pass-through with transformation
  if (!input) {
    return { 
      message: 'Hello from {{displayName}}!',
      timestamp: new Date().toISOString()
    };
  }
  
  // Process the input data
  return {
    ...input,
    processedBy: '{{displayName}}',
    processedAt: new Date().toISOString()
  };
}

export default run{{functionName}}Node;