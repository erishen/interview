'use client';

import { useState } from 'react';

export default function RedisTestPage() {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSet = async () => {
    if (!key || !value) {
      setError('Key and value are required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/redis/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) throw new Error('Failed to set value');
      const data = await response.json();
      setResult(`Set successful: ${JSON.stringify(data)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleGet = async () => {
    if (!key) {
      setError('Key is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/redis/get?key=${encodeURIComponent(key)}`);
      if (!response.ok) throw new Error('Failed to get value');
      const data = await response.json();
      setResult(`Value: ${data.value || 'null'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!key) {
      setError('Key is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/redis/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) throw new Error('Failed to delete value');
      const data = await response.json();
      setResult(`Delete successful: ${JSON.stringify(data)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Redis Test</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter value"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSet}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              Set
            </button>
            <button
              onClick={handleGet}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              Get
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400"
            >
              Delete
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
