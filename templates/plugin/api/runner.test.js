/**
 * {{displayName}} API Node Runner Tests
 */

import run{{name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase())}}Node from '../src/runner.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('{{displayName}} API Node Runner', () => {
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
      params: {
        baseUrl: 'https://api.example.com',
        endpoint: '/test',
        method: 'GET'
      }
    };

    // Reset fetch mock
    fetch.mockClear();
  });

  test('should make successful API call', async () => {
    // Arrange
    const mockResponse = { data: 'test response' };
    const requestData = { query: { param: 'value' } };
    
    mockHelpers.getInput.mockResolvedValue(requestData);
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map([['content-type', 'application/json']]),
      json: () => Promise.resolve(mockResponse)
    });

    // Act
    await run{{name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase())}}Node(mockNode, mockHelpers);

    // Assert
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.example.com/test'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );

    expect(mockHelpers.setOutput).toHaveBeenCalledWith('response', mockResponse);
    expect(mockHelpers.setOutput).toHaveBeenCalledWith('status', 200);
    expect(mockHelpers.trigger).toHaveBeenCalledWith('response');
  });

  test('should handle API errors', async () => {
    // Arrange
    mockHelpers.getInput.mockResolvedValue({});
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Map([['content-type', 'application/json']]),
      json: () => Promise.resolve({ error: 'Not found' })
    });

    // Act & Assert
    await expect(run{{name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase())}}Node(mockNode, mockHelpers))
      .rejects.toThrow('API request failed: Not Found');

    expect(mockHelpers.setOutput).toHaveBeenCalledWith('error', expect.objectContaining({
      message: expect.stringContaining('API request failed'),
      status: 404
    }));
    expect(mockHelpers.trigger).toHaveBeenCalledWith('error');
  });

  test('should handle authentication', async () => {
    // Arrange
    mockNode.params.authType = 'bearer';
    mockNode.params.token = 'test-token';
    mockHelpers.getInput.mockResolvedValue({});
    
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      json: () => Promise.resolve({})
    });

    // Act
    await run{{name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase())}}Node(mockNode, mockHelpers);

    // Assert
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      })
    );
  });

  test('should handle POST requests with body', async () => {
    // Arrange
    mockNode.params.method = 'POST';
    const requestData = { 
      body: { name: 'test', value: 123 }
    };
    
    mockHelpers.getInput.mockResolvedValue(requestData);
    fetch.mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Map([['content-type', 'application/json']]),
      json: () => Promise.resolve({ id: 'created' })
    });

    // Act
    await run{{name.replace(/-/g, '').replace(/\b\w/g, l => l.toUpperCase())}}Node(mockNode, mockHelpers);

    // Assert
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(requestData.body)
      })
    );
  });
});