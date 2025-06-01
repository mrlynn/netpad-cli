/**
 * {{displayName}} Node Shape Component
 * 
 * React component for rendering {{displayName}} nodes in the NetPad canvas
 */

import React from 'react';
import { ModernNodeBase } from '@netpad/components/nodes/ModernNodeBase';
import { NodeVisualization } from '@netpad/components/visualizations/NodeVisualization';

/**
 * {{displayName}} Shape Component
 */
export function {{name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase())}}Shape({ shape, isSelected, ...props }) {
  // Get plugin configuration from manifest
  const config = {
    gradientColors: ['#4F46E5', '#7C3AED'],
    primaryColor: '#4F46E5',
    badgeText: 'PLUGIN',
    description: '{{description}}',
    category: '{{category}}'
  };

  return (
    <ModernNodeBase
      shape={shape}
      isSelected={isSelected}
      config={config}
      {...props}
    >
      <NodeVisualization
        type="custom"
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        data={{
          title: shape.label || '{{displayName}}',
          subtitle: config.description,
          icon: 'plugin',
          status: shape.status || 'ready'
        }}
      />
    </ModernNodeBase>
  );
}

export default {{name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase())}}Shape;