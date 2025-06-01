/**
 * {{displayName}} Node Runner Tests
 */

import run{{name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase())}}Node from '../src/runner.js';

describe('{{displayName}} Node Runner', () => {
  let mockHelpers;
  let mockNode;

  beforeEach(() => {
    mockHelpers = {
      getInput: jest.fn(),
      setOutput: jest.fn(),
      trigger: jest.fn(),
      context: {
        userId: 'test-user',
        workflowId: 'test-workflow'
      },
      log: jest.fn()
    };

    mockNode = {
      id: 'test-node-id',
      type: '{{name}}',
      params: {}
    };
  });

  test('should process input correctly', async () => {
    // Arrange
    const testInput = { message: 'test input' };
    mockHelpers.getInput.mockResolvedValue(testInput);

    // Act
    await run{{name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase())}}Node(mockNode, mockHelpers);

    // Assert
    expect(mockHelpers.getInput).toHaveBeenCalledWith('input');
    expect(mockHelpers.setOutput).toHaveBeenCalledWith('output', expect.objectContaining({
      ...testInput,
      processedBy: '{{displayName}}',
      processedAt: expect.any(String)
    }));
    expect(mockHelpers.trigger).toHaveBeenCalledWith('output');
  });

  test('should handle missing input gracefully', async () => {
    // Arrange
    mockHelpers.getInput.mockResolvedValue(null);

    // Act
    await run{{name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase())}}Node(mockNode, mockHelpers);

    // Assert
    expect(mockHelpers.setOutput).toHaveBeenCalledWith('output', expect.objectContaining({
      message: 'Hello from {{displayName}}!',
      timestamp: expect.any(String)
    }));
  });

  test('should log execution steps', async () => {
    // Arrange
    mockHelpers.getInput.mockResolvedValue({ test: 'data' });

    // Act
    await run{{name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase())}}Node(mockNode, mockHelpers);

    // Assert
    expect(mockHelpers.log).toHaveBeenCalledWith(expect.stringContaining('Executing {{displayName}} node'));
    expect(mockHelpers.log).toHaveBeenCalledWith(expect.stringContaining('completed successfully'));
  });

  test('should handle errors and re-throw', async () => {
    // Arrange
    const error = new Error('Test error');
    mockHelpers.getInput.mockRejectedValue(error);

    // Act & Assert
    await expect(run{{name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase())}}Node(mockNode, mockHelpers))
      .rejects.toThrow('Test error');
    
    expect(mockHelpers.log).toHaveBeenCalledWith(expect.stringContaining('Error in {{displayName}} node'));
  });
});