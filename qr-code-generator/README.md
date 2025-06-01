# QR Code Generator Plugin 🔗

A NetPad plugin that generates QR codes from text, URLs, and data with customizable options.

## Features

- ✅ **Multiple Input Types**: Text, URLs, JSON data, etc.
- ✅ **Customizable Options**: Size, colors, error correction, format
- ✅ **Multiple Formats**: PNG, JPG, SVG output
- ✅ **Error Correction**: L (Low), M (Medium), Q (Quartile), H (High)
- ✅ **Base64 Output**: Ready for web display or further processing
- ✅ **Metadata**: Size, format, generation timestamp

## Installation

### From NetPad Plugin Store
```bash
# Search for QR Code Generator in the NetPad Plugin Store
# Click "Install" to add it to your NetPad instance
```

### Manual Installation
```bash
# Clone and publish this plugin
git clone <this-repo>
cd qr-code-generator
netpad-cli plugin publish
```

## Usage

### Basic Usage
1. **Add QR Code Generator node** to your NetPad workflow
2. **Connect text input** - any text, URL, or data
3. **Configure options** (optional) - size, colors, format
4. **Run workflow** - get QR code as base64 data URL

### Node Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | ✅ | Text, URL, or data to encode |
| `options` | object | ❌ | Customization options (see below) |

### Options Object

```json
{
  "size": 200,                    // QR code size: 100,150,200,250,300,400,500
  "format": "png",                // Output format: png, jpg, svg  
  "errorCorrectionLevel": "M",    // Error correction: L,M,Q,H
  "margin": 4,                    // Margin around QR code (0-10)
  "backgroundColor": "#ffffff",   // Background color (hex)
  "foregroundColor": "#000000"    // Foreground color (hex)
}
```

### Node Outputs

| Output | Type | Description |
|--------|------|-------------|
| `qr_code` | string | Base64 data URL of generated QR code |
| `metadata` | object | Generation details (size, format, timestamp, etc.) |
| `error` | object | Error information if generation fails |

## Examples

### Example 1: Simple URL QR Code
```
Input: "https://netpad.io"
Output: data:image/png;base64,iVBORw0KGgo...
```

### Example 2: Custom Colored QR Code
```
Text Input: "Hello NetPad!"
Options Input: {
  "size": 300,
  "backgroundColor": "#f0f9ff", 
  "foregroundColor": "#0ea5e9"
}
```

### Example 3: WiFi QR Code
```
Text Input: "WIFI:T:WPA;S:MyNetwork;P:MyPassword;;"
Options: {
  "size": 400,
  "errorCorrectionLevel": "H"
}
```

## Development

### Setup
```bash
# Install dependencies
npm install

# Install QR code library for real implementation
npm install qrcode

# Start development mode  
npm run dev
```

### Implementation Notes

The current implementation uses a mock QR code generator. To create actual QR codes:

1. **Install qrcode library**:
   ```bash
   npm install qrcode
   ```

2. **Update runner.js**:
   ```javascript
   const QRCode = require('qrcode');
   
   async function generateQRCode(text, options) {
     const dataUrl = await QRCode.toDataURL(text, {
       width: options.size,
       margin: options.margin,
       color: {
         dark: options.foregroundColor,
         light: options.backgroundColor
       },
       errorCorrectionLevel: options.errorCorrectionLevel
     });
     
     return {
       dataUrl: dataUrl,
       byteSize: Math.ceil(dataUrl.length * 0.75)
     };
   }
   ```

### Testing
```bash
# Run unit tests
npm test

# Test plugin validation
netpad-cli plugin publish --dry-run

# Test in NetPad workflow
npm run dev
```

### Publishing
```bash
# Validate plugin
netpad-cli plugin publish --dry-run

# Publish to NetPad Plugin Store
netpad-cli plugin publish
```

## Workflow Integration

### Common Use Cases

1. **URL Shortener + QR Code**:
   ```
   URL → URL Shortener → QR Code Generator → Display
   ```

2. **Dynamic Contact Cards**:
   ```
   Contact Data → vCard Formatter → QR Code Generator → Email/Share
   ```

3. **Event Check-in**:
   ```
   Event Data → JSON Formatter → QR Code Generator → Print/Display
   ```

## Configuration Options

### Error Correction Levels
- **L (Low)**: ~7% error correction
- **M (Medium)**: ~15% error correction  
- **Q (Quartile)**: ~25% error correction
- **H (High)**: ~30% error correction

### Supported Data Types
- Plain text
- URLs
- Email addresses  
- Phone numbers
- WiFi credentials (`WIFI:T:WPA;S:NetworkName;P:Password;;`)
- vCard contact info
- JSON data
- Custom protocols

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

- **Issues**: Report bugs and request features
- **Documentation**: Full API documentation in NetPad
- **Community**: Join the NetPad Discord for help

## Author

**NetPad Team** <team@netpad.io>

---

🔗 **Generate QR codes effortlessly in your NetPad workflows!**