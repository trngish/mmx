import { useCallback } from 'react';
import { MediaItem } from '@/store/chatStore';

export function useMedia() {
  const saveMediaReference = useCallback((item: MediaItem) => {
    // Save media path to IndexedDB via chatStore
    console.log('Media ready:', item);
  }, []);

  return { saveMediaReference };
}