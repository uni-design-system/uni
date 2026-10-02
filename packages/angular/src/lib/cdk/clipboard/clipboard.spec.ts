import { copyToClipboard } from './clipboard';

describe('copyToClipboard', () => {
  const writeText = vi.fn();
  const write = vi.fn();
  const query = vi.fn();
  const supports = vi.fn();
  const notAllowed = () => Object.assign(new Error('blocked'), { name: 'NotAllowedError' });

  class FakeClipboardItem {
    static supports = supports;
    constructor(readonly data: Record<string, Blob | Promise<Blob>>) {}
  }

  beforeEach(() => {
    writeText.mockReset().mockResolvedValue(undefined);
    write.mockReset().mockResolvedValue(undefined);
    query.mockReset().mockRejectedValue(new TypeError('unknown permission'));
    supports.mockReset().mockReturnValue(true);
    vi.stubGlobal('navigator', { clipboard: { writeText, write }, permissions: { query } });
    vi.stubGlobal('ClipboardItem', FakeClipboardItem);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('copies text', async () => {
    expect(await copyToClipboard('hello')).toBe('copied');
    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('starts the write before awaiting anything, and never asks permission on success', async () => {
    const pending = copyToClipboard('hello');
    expect(writeText).toHaveBeenCalledTimes(1);
    await pending;
    expect(query).not.toHaveBeenCalled();
  });

  it('copies rich content as one item, with strings wrapped in typed blobs', async () => {
    const image = new Blob(['png'], { type: 'image/png' });
    const result = await copyToClipboard({
      'text/plain': 'hello',
      'text/html': Promise.resolve('<b>hello</b>'),
      'image/png': image,
    });
    expect(result).toBe('copied');
    const [[item]] = write.mock.calls[0] as [[FakeClipboardItem]];
    const plain = item.data['text/plain'] as Blob;
    expect(plain.type).toBe('text/plain');
    expect(plain.size).toBe(5);
    expect((await item.data['text/html']).type).toBe('text/html');
    expect(item.data['image/png']).toBe(image);
  });

  it('reports unsupported without a Clipboard API', async () => {
    vi.stubGlobal('navigator', {});
    expect(await copyToClipboard('hello')).toBe('unsupported');
  });

  it('reports unsupported for a type the browser cannot write', async () => {
    supports.mockImplementation((type: string) => type !== 'image/webp');
    expect(await copyToClipboard({ 'image/webp': new Blob() })).toBe('unsupported');
    expect(write).not.toHaveBeenCalled();
  });

  it('still attempts rich content where ClipboardItem.supports is missing', async () => {
    vi.stubGlobal(
      'ClipboardItem',
      class {
        constructor(readonly data: unknown) {}
      }
    );
    expect(await copyToClipboard({ 'text/plain': 'hello' })).toBe('copied');
  });

  it('reports denied when the refusal is a blocked permission', async () => {
    writeText.mockRejectedValue(notAllowed());
    query.mockResolvedValue({ state: 'denied' });
    expect(await copyToClipboard('hello')).toBe('denied');
    expect(query).toHaveBeenCalledWith({ name: 'clipboard-write' });
  });

  it('reports failed for a refusal the permission does not explain', async () => {
    writeText.mockRejectedValue(notAllowed());
    // Firefox and Safari: the query itself rejects.
    expect(await copyToClipboard('hello')).toBe('failed');
    query.mockResolvedValue({ state: 'granted' });
    expect(await copyToClipboard('hello')).toBe('failed');
  });

  it('reports failed for any other error, without consulting the permission', async () => {
    write.mockRejectedValue(new Error('boom'));
    expect(await copyToClipboard({ 'text/plain': 'hello' })).toBe('failed');
    expect(query).not.toHaveBeenCalled();
  });
});
