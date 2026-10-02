import { queryPermission } from '../permission/permission';

/**
 * How a copy ended:
 * - `copied` — the content is on the clipboard.
 * - `denied` — the user or a policy has blocked clipboard access for this
 *   site; only a change in the browser's site settings will fix it.
 * - `unsupported` — no Clipboard API here (an insecure context, a server
 *   render, an old browser) or the browser cannot write one of the types.
 * - `failed` — the browser refused this attempt for another reason, most
 *   often a call made outside a user gesture or from an unfocused document.
 */
export type ClipboardCopyResult = 'copied' | 'denied' | 'unsupported' | 'failed';

/** One clipboard representation; a promise lets the data arrive after the gesture. */
export type ClipboardData = string | Blob | PromiseLike<string | Blob>;

/**
 * What to copy: a plain string, or one item in several representations keyed
 * by MIME type — `{ 'text/plain': …, 'text/html': … }`, `{ 'image/png': blob }`.
 */
export type ClipboardContent = string | Record<string, ClipboardData>;

/**
 * Copies text or rich content with the Async Clipboard API. Never rejects:
 * the result says what happened, so a caller can tell the user why.
 *
 * Call it directly from the click or key handler. The write starts
 * synchronously, before anything is awaited, because browsers only honor it
 * inside the user gesture — which is also why the `clipboard-write`
 * permission is consulted after a refusal, to explain it, rather than before
 * the attempt. For content that has to be fetched or rendered first, pass a
 * promise as the value instead of awaiting it yourself.
 */
export async function copyToClipboard(content: ClipboardContent): Promise<ClipboardCopyResult> {
  const clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard;
  if (!clipboard) return 'unsupported';
  try {
    if (typeof content === 'string') {
      if (!clipboard.writeText) return 'unsupported';
      await clipboard.writeText(content);
    } else {
      if (!clipboard.write || typeof ClipboardItem === 'undefined') return 'unsupported';
      const types = Object.keys(content);
      // `supports` is newer than ClipboardItem itself; where it is missing
      // the write below is the only way to find out.
      if (types.length === 0 || types.some((type) => ClipboardItem.supports?.(type) === false)) {
        return 'unsupported';
      }
      await clipboard.write([new ClipboardItem(toBlobs(content))]);
    }
    return 'copied';
  } catch (error) {
    if ((error as { name?: string } | null)?.name !== 'NotAllowedError') return 'failed';
    return (await queryPermission('clipboard-write')) === 'denied' ? 'denied' : 'failed';
  }
}

/** Strings as ClipboardItem data are a recent addition; Blobs work everywhere. */
function toBlobs(content: Record<string, ClipboardData>): Record<string, Blob | Promise<Blob>> {
  const toBlob = (type: string, data: string | Blob) =>
    typeof data === 'string' ? new Blob([data], { type }) : data;
  return Object.fromEntries(
    Object.entries(content).map(([type, data]) => [
      type,
      typeof data === 'string' || data instanceof Blob
        ? toBlob(type, data)
        : Promise.resolve(data).then((resolved) => toBlob(type, resolved)),
    ])
  );
}
