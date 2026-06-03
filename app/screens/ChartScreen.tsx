import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native";

import { useAuth } from "../hooks/auth";
import ScreenWrapper from "../components/ScreenWrapper";
import { usePaginationDots } from "../hooks/usePaginationDots";
import PaginationDots from "../components/PaginationDots";
import HeaderBar from "../components/HeaderBar";
import ChartCard from "../components/ChartCard";
import { useMentalRounds } from "../hooks/useMentalRounds";

const { width: screenWidth } = Dimensions.get("window");
const CARD_PADDING = 16;
const CARD_WIDTH = screenWidth - CARD_PADDING * 2;

export default function ChartScreen() {
  const { firebaseUser: user } = useAuth();

  const [visibleIndex, setVisibleIndex] = useState(0);
  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length && viewableItems[0].index !== null) {
        setVisibleIndex(viewableItems[0].index);
      }
    }
  ).current;

  const { data = [], isLoading: roundsLoading } = useMentalRounds(user);

  const concepts = Object.keys(data[0]?.scores || {});

  const { activeIndex, handleScroll } = usePaginationDots(
    CARD_WIDTH,
    CARD_PADDING,
    concepts.length
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please login to view charts</Text>
      </View>
    );
  }

  if (roundsLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.loaderWrapper}>
          <ActivityIndicator size="large" color="#1B4332" />
          <Text style={styles.loadingText}>Loading charts...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (data.length === 0) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Text style={styles.title}>No rounds available</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderBar title="Charts" />
      <View style={styles.container}>
        <FlatList
          data={concepts}
          keyExtractor={(c) => c}
          horizontal
          pagingEnabled
          snapToInterval={CARD_WIDTH}
          snapToAlignment="start"
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          onScroll={handleScroll}
          renderItem={({ item, index }) => (
            <ChartCard
              concept={item}
              rounds={data}
              animate={index === visibleIndex}
            />
          )}
          initialNumToRender={1}
          windowSize={5}
          removeClippedSubviews
          viewabilityConfig={viewConfig}
          onViewableItemsChanged={onViewableItemsChanged}
        />
      </View>
      <PaginationDots count={concepts.length} activeIndex={activeIndex} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    display: "flex",
    flex: 1,
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#2D6A4F",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B4332",
    marginVertical: 16,
    textAlign: "center",
  },
});
