/**
 * QR Code Generator Node Shape Component
 * 
 * React component for rendering QR Code Generator nodes in the NetPad canvas
 */

import React from 'react';
import { ModernNodeBase } from '@netpad/components/nodes/ModernNodeBase';
import { NodeVisualization } from '@netpad/components/visualizations/NodeVisualization';

/**
 * QR Code Generator Node Schema Definition
 */
export const QrcodegeneratorSchema = {
  id: 'qr-code-generator',
  name: 'QR Code Generator',
  category: 'utility',
  description: 'Generate QR codes from text, URLs, and data with customizable options',
  
  inputs: {
    text: {
      type: 'string',
      required: true,
      description: 'Text to encode in the QR code',
      placeholder: 'Enter text or URL to encode'
    },
    options: {
      type: 'object',
      required: false,
      description: 'QR code generation options',
      properties: {
        size: {
          type: 'number',
          default: 200,
          enum: [100, 150, 200, 250, 300, 400, 500],
          description: 'QR code size in pixels'
        },
        format: {
          type: 'string',
          default: 'png',
          enum: ['png', 'jpg', 'svg'],
          description: 'Output image format'
        },
        errorCorrectionLevel: {
          type: 'string',
          default: 'M',
          enum: ['L', 'M', 'Q', 'H'],
          description: 'Error correction level (L=Low, M=Medium, Q=Quartile, H=High)'
        },
        margin: {
          type: 'number',
          default: 4,
          min: 0,
          max: 10,
          description: 'Margin size around QR code'
        },
        backgroundColor: {
          type: 'string',
          default: '#ffffff',
          description: 'Background color (hex format)'
        },
        foregroundColor: {
          type: 'string',
          default: '#000000',
          description: 'Foreground color (hex format)'
        }
      }
    }
  },
  
  outputs: {
    qr_code: {
      type: 'string',
      description: 'Generated QR code as base64 data URL'
    },
    metadata: {
      type: 'object',
      description: 'QR code generation metadata',
      properties: {
        text: { type: 'string', description: 'Original text that was encoded' },
        size: { type: 'number', description: 'QR code size in pixels' },
        format: { type: 'string', description: 'Output format used' },
        errorCorrectionLevel: { type: 'string', description: 'Error correction level used' },
        generatedAt: { type: 'string', description: 'Timestamp when QR code was generated' },
        byteSize: { type: 'number', description: 'Size of generated image in bytes' }
      }
    },
    error: {
      type: 'object',
      description: 'Error information if QR code generation fails',
      properties: {
        message: { type: 'string', description: 'Error message' },
        timestamp: { type: 'string', description: 'When the error occurred' }
      }
    }
  },
  
  config: {
    gradientColors: ['#22c55e', '#16a34a'],
    primaryColor: '#22c55e',
    badgeText: 'QR',
    icon: '🔗'
  }
};

/**
 * QR Code Generator Shape Component
 */
export function QrcodegeneratorShape({ shape, isSelected, ...props }) {
  const config = QrcodegeneratorSchema.config;

  return (
    <ModernNodeBase
      shape={shape}
      isSelected={isSelected}
      config={config}
      {...props}
    >
      <NodeVisualization
        type="plugin"
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        data={{
          title: shape.label || 'QR Code Generator',
          subtitle: QrcodegeneratorSchema.description,
          icon: config.icon,
          badgeText: config.badgeText,
          status: shape.status || 'ready',
          inputs: Object.keys(QrcodegeneratorSchema.inputs),
          outputs: Object.keys(QrcodegeneratorSchema.outputs)
        }}
      />
    </ModernNodeBase>
  );
}

export default QrcodegeneratorShape;