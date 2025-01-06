import { useEffect, useCallback } from 'react';

type KeyHandlerCallback = (event: KeyboardEvent) => void;

const useEnterKeyHandler = (
  callback: KeyHandlerCallback,
  dependencies: React.DependencyList = []
) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        callback(event);
        event.preventDefault();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [callback, ...dependencies]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useEnterKeyHandler;
