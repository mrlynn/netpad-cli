/**
 * QR Code Generator Node Runner
 * 
 * Generate QR codes from text, URLs, and data with customizable options
 */

export async function runQrcodegeneratorNode(node, { getInput, setOutput, trigger, context, log }) {
  try {
    log(`Executing QR Code Generator node: ${node.id}`);
    
    // Get inputs from connected nodes
    const textInput = await getInput('text');
    const optionsInput = await getInput('options') || {};
    
    // Get node configuration
    const config = node.params || {};
    
    // Validate input
    if (!textInput && !config.text) {
      throw new Error('Text input is required for QR code generation');
    }
    
    const textToEncode = textInput || config.text;
    const qrOptions = {
      size: optionsInput.size || config.size || 200,
      errorCorrectionLevel: optionsInput.errorCorrectionLevel || config.errorCorrectionLevel || 'M',
      margin: optionsInput.margin || config.margin || 4,
      format: optionsInput.format || config.format || 'png',
      backgroundColor: optionsInput.backgroundColor || config.backgroundColor || '#ffffff',
      foregroundColor: optionsInput.foregroundColor || config.foregroundColor || '#000000'
    };
    
    // Generate QR code
    const qrResult = await generateQRCode(textToEncode, qrOptions);
    
    // Set outputs
    setOutput('qr_code', qrResult.dataUrl);
    setOutput('metadata', {
      text: textToEncode,
      size: qrOptions.size,
      format: qrOptions.format,
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
      generatedAt: new Date().toISOString(),
      byteSize: qrResult.byteSize
    });
    
    // Trigger connected downstream nodes
    await trigger('qr_code');
    await trigger('metadata');
    
    log(`QR code generated successfully for: "${textToEncode.substring(0, 50)}${textToEncode.length > 50 ? '...' : ''}"`);
    
  } catch (error) {
    log(`Error in QR Code Generator node: ${error.message}`);
    
    // Set error output
    setOutput('error', {
      message: error.message,
      timestamp: new Date().toISOString()
    });
    
    await trigger('error');
    throw error;
  }
}

/**
 * Generate QR code using a simple implementation
 * In a real plugin, you'd use a proper QR code library like 'qrcode'
 */
async function generateQRCode(text, options) {
  // This is a mock implementation - in reality you'd use a QR code library
  // For demonstration purposes, we'll create a data URL placeholder
  
  const canvas = createMockCanvas(options.size, options.backgroundColor, options.foregroundColor);
  const dataUrl = `data:image/${options.format};base64,${canvas}`;
  
  return {
    dataUrl: dataUrl,
    byteSize: Math.ceil(dataUrl.length * 0.75) // Approximate base64 byte size
  };
}

/**
 * Create a mock canvas representation
 * In a real implementation, you'd use the 'qrcode' npm package:
 * 
 * const QRCode = require('qrcode');
 * const dataUrl = await QRCode.toDataURL(text, options);
 */
function createMockCanvas(size, bgColor, fgColor) {
  // Create a simple mock base64 representation
  // This would be replaced with actual QR code generation
  const mockImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  return mockImageData;
}

/**
 * Validate QR code generation parameters
 */
function validateQROptions(options) {
  const validSizes = [100, 150, 200, 250, 300, 400, 500];
  const validFormats = ['png', 'jpg', 'svg'];
  const validErrorLevels = ['L', 'M', 'Q', 'H'];
  
  if (!validSizes.includes(options.size)) {
    throw new Error(`Invalid size. Must be one of: ${validSizes.join(', ')}`);
  }
  
  if (!validFormats.includes(options.format)) {
    throw new Error(`Invalid format. Must be one of: ${validFormats.join(', ')}`);
  }
  
  if (!validErrorLevels.includes(options.errorCorrectionLevel)) {
    throw new Error(`Invalid error correction level. Must be one of: ${validErrorLevels.join(', ')}`);
  }
  
  return true;
}

export default runQrcodegeneratorNode;