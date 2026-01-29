// ===== src/hooks/useCopyToClipboard.js =====
import { useState } from 'react';

/**
 * useCopyToClipboard Hook
 * Copy text to clipboard
 */
export const useCopyToClipboard = () => {
  const [copiedText, setCopiedText] = useState(null);
  const [error, setError] = useState(null);

  const copy = async (text) => {
    if (!navigator?.clipboard) {
      setError('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setError(null);
      return true;
    } catch (err) {
      setError(err.message);
      setCopiedText(null);
      return false;
    }
  };

  return { copiedText, error, copy };
};