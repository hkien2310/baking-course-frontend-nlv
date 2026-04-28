import { useCallback, useState } from 'react';

const usePendingAction = () => {
  const [pendingKeys, setPendingKeys] = useState({});

  const startPending = useCallback((key) => {
    setPendingKeys((prev) => ({ ...prev, [key]: true }));
  }, []);

  const stopPending = useCallback((key) => {
    setPendingKeys((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const withPending = useCallback(async (key, action) => {
    startPending(key);
    try {
      return await action();
    } finally {
      stopPending(key);
    }
  }, [startPending, stopPending]);

  const isPending = useCallback((key) => Boolean(pendingKeys[key]), [pendingKeys]);

  return {
    isPending,
    withPending,
    startPending,
    stopPending,
    hasPending: Object.keys(pendingKeys).length > 0,
  };
};

export default usePendingAction;
