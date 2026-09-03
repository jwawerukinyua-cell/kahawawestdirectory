/**
 * Safe clipboard copy utility with automatic fallback to document.execCommand('copy').
 * Fully resilient in sandboxed or iframe environments where `navigator.clipboard.writeText` fails with:
 * "Failed to execute 'writeText' on 'Clipboard': Document is not focused."
 */

// Install global listener to catch and prevent unhandled promise rejections from clipboard focus errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event?.reason?.message || String(event?.reason || '');
    if (
      msg.includes('writeText') ||
      msg.includes('Document is not focused') ||
      msg.includes('Clipboard')
    ) {
      event.preventDefault();
    }
  });
}

/**
 * Copies the specified text to clipboard safely.
 * Returns true if copy was successful, false otherwise.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Try modern navigator.clipboard if available and allowed
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === 'function'
  ) {
    try {
      // Ensure window is focused if possible
      if (typeof window !== 'undefined' && typeof window.focus === 'function') {
        try {
          window.focus();
        } catch {
          // Ignore focus errors
        }
      }
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Modern API failed (e.g. Document is not focused in iframe). Proceed to fallback.
    }
  }

  // 2. Fallback: Hidden textarea using document.execCommand('copy')
  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      // Position offscreen so it does not affect visual layout or scrolling
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        return true;
      }
    } catch {
      // Fallback failed
    }
  }

  return false;
}
