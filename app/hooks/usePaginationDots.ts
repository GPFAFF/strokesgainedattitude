import { useState, useCallback } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

export function usePaginationDots(
  itemWidth: number,
  spacing: number,
  itemCount: number
) {
  const [activeIndex, setActiveIndex] = useState(0);
  const snapSize = itemWidth + spacing;

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.floor(offsetX / snapSize + 0.5); // biased rounding
      setActiveIndex(Math.max(0, Math.min(index, itemCount - 1)));
    },
    [snapSize, itemCount]
  );

  return { activeIndex, handleScroll };
}
