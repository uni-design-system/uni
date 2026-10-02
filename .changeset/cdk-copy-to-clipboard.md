---
'@uni-design-system/uni-angular': minor
---

New CDK utility: `copyToClipboard`, for text and rich content.

`copyToClipboard(content)` wraps the Async Clipboard API and never rejects. It resolves `'copied' | 'denied' | 'unsupported' | 'failed'`, so a caller can tell the user why a copy did not work. Pass a string for text, or a map of MIME type to data (`{ 'text/plain': …, 'text/html': … }`, `{ 'image/png': blob }`) for rich content; a value may be a promise, for content that has to be fetched or rendered first.

The write starts synchronously inside the user gesture. The `clipboard-write` permission is consulted only after a refusal, to tell `denied` apart from `failed`: only Chromium answers that query, and waiting on it before the write can cost the gesture in other browsers.

`PermissionService`, the `Permission` and `PermissionState` types, and a new plain function `queryPermission` are now exported; the docs already described the service as importable, but it was missing from the public API.
