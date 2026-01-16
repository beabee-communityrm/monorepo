import { Readable } from 'stream';
import tar from 'tar-stream';
import { describe, expect, it, vi } from 'vitest';

import { extractJsonArchive } from './file';

// Helper function to create a mock tar archive with JSON files
function createTarArchive(files: { name: string; content: any }[]): Readable {
  const pack = tar.pack();

  for (const file of files) {
    pack.entry({ name: file.name, type: 'file' }, JSON.stringify(file.content));
  }

  pack.finalize();
  return pack;
}

function createInvalidTarArchive(): Readable {
  const pack = tar.pack();
  pack.entry({ name: 'invalid.json', type: 'file' }, '{ invalidJson: true ');
  pack.finalize();
  return pack;
}

describe('extractJsonArchive', () => {
  it('should extract and process a JSON object from a single file', async () => {
    const testData = {
      users: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 3, name: 'Bob' },
      ],
    };

    const stream = createTarArchive([
      { name: 'users.json', content: testData },
    ]);

    const processJson = vi.fn((json: any) => ({ ...json, processed: true }));

    const result = await extractJsonArchive(stream, processJson);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ ...testData, processed: true });
    expect(processJson).toHaveBeenCalledTimes(1);
  });

  it('should extract and process JSON objects from multiple files', async () => {
    const usersData = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];
    const productsData = [
      { id: 101, product: 'Widget' },
      { id: 102, product: 'Gadget' },
    ];

    const stream = createTarArchive([
      { name: 'users.json', content: usersData },
      { name: 'products.json', content: productsData },
    ]);

    const processJson = vi.fn((json: any) => json);

    const result = await extractJsonArchive(stream, processJson);

    expect(result).toHaveLength(2);
    expect(result).toEqual([usersData, productsData]);
    expect(processJson).toHaveBeenCalledTimes(2);
  });

  it('should filter out null results from processJson', async () => {
    const usersData = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];
    const productsData = [
      { id: 101, product: 'Widget' },
      { id: 102, product: 'Gadget' },
    ];

    const archive = createTarArchive([
      { name: 'users.json', content: { data: usersData, keep: true } },
      { name: 'products.json', content: { data: productsData, keep: true } },
      { name: 'users2.json', content: { data: usersData, keep: false } },
    ]);

    const processJson = vi.fn((json: any) => {
      return json.keep ? json.data : null;
    });

    const result = await extractJsonArchive(archive, processJson);

    expect(result).toHaveLength(2);
    expect(result).toEqual([usersData, productsData]);
    expect(processJson).toHaveBeenCalledTimes(3);
  });

  it('should handle empty archive gracefully', async () => {
    const archive = createTarArchive([]);
    const processJson = vi.fn((json: any) => json);

    const result = await extractJsonArchive(archive, processJson);

    expect(result).toHaveLength(0);
    expect(processJson).not.toHaveBeenCalled();
  });

  it('should handle archive with empty JSON files', async () => {
    const archive = createTarArchive([{ name: 'empty.json', content: [] }]);

    const processJson = vi.fn((json: any) => json);

    const result = await extractJsonArchive(archive, processJson);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual([]);
    expect(processJson).toHaveBeenCalledTimes(1);
  });

  it('should reject when processJson throws an exception', async () => {
    const usersData = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' },
    ];
    const productsData = [
      { id: 101, product: 'Widget' },
      { id: 102, product: 'Gadget' },
    ];

    const archive = createTarArchive([
      { name: 'users.json', content: { data: usersData, reject: false } },
      { name: 'products.json', content: { data: productsData, reject: false } },
      { name: 'users2.json', content: { data: usersData, reject: true } },
      { name: 'products2.json', content: { data: productsData, reject: true } },
    ]);

    const processJson = vi.fn((json: any) => {
      if (json.reject) {
        throw new Error('Processing error');
      }
      return json.data;
    });

    await expect(extractJsonArchive(archive, processJson)).rejects.toThrow();
    expect(processJson).toHaveBeenCalledTimes(3);
  });

  it("should reject when the file isn't valid JSON", async () => {
    const archive = createInvalidTarArchive();

    const processJson = vi.fn((json: any) => json);

    await expect(extractJsonArchive(archive, processJson)).rejects.toThrow();
    expect(processJson).not.toHaveBeenCalled();
  });

  it('should reject when the stream has an error', async () => {
    const stream = new Readable({
      read() {
        this.emit('error', new Error('Stream error'));
      },
    });

    const processJson = vi.fn((json: any) => json);

    await expect(extractJsonArchive(stream, processJson)).rejects.toThrow(
      'Stream error'
    );
    expect(processJson).not.toHaveBeenCalled();
  });
});
