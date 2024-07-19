import { useRef } from 'react';

function useEnterKey(cb) {
  const inputRef = useRef();
  const handleKeyDown = (e) => {
    if (inputRef.current && e.key === 'Enter' && !e.shiftKey) {
      cb();
    }
  };
  return { inputRef, handleKeyDown };
}

export default useEnterKey;
