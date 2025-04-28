import {useState, useCallback} from 'react';

/**
 * Hook to track map movement state
 * @returns Object containing movement state and handler functions
 */
export const useMapMovement = () => {
  const [isMapMoving, setIsMapMoving] = useState(false);

  const handleMapMoveStart = useCallback(() => {
    setIsMapMoving(true);
  }, []);

  const handleMapMoveEnd = useCallback(() => {
    setIsMapMoving(false);
  }, []);

  return {
    isMapMoving,
    handleMapMoveStart,
    handleMapMoveEnd,
  };
};
