/**
 * {{displayName}} API Node Shape Component
 * 
 * React component for rendering {{displayName}} API nodes in the NetPad canvas
 */

import React from 'react';
import { ModernNodeBase } from '@netpad/components/nodes/ModernNodeBase';
import { APIVisualization } from '@netpad/components/visualizations/APIVisualization';

/**
 * {{displayName}} API Shape Component
 */
export function {{name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase())}}Shape({ shape, isSelected, ...props }) {
  // Get plugin configuration from manifest
  const config = {
    gradientColors: ['#059669', '#10B981'],
    primaryColor: '#059669',
    badgeText: 'API',
    description: '{{description}}',
    category: 'integration'
  };

  // Extract API configuration from shape parameters
  const apiConfig = shape.params || {};
  const method = apiConfig.method || 'GET';
  const endpoint = apiConfig.endpoint || '';
  const status = shape.status || 'ready';

  return (
    <ModernNodeBase
      shape={shape}
      isSelected={isSelected}
      config={config}
      {...props}
    >
      <APIVisualization
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        data={{
          title: shape.label || '{{displayName}}',
          method: method,
          endpoint: endpoint,
          status: status,
          lastResponse: shape.lastResponse
        }}
      />
    </ModernNodeBase>
  );
}

export default {{name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase())}}Shape;