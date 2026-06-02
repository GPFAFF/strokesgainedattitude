import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import Fuse from "fuse.js";
import { useCourseSearch } from "../hooks/useCourseSearch";
import { useDebounce } from "../hooks/debounce";
import { colors } from "../theme";
import { Course } from "../lib/types";

type CourseSearchBarProps = {
  onSelect: (course: Course) => void;
  onResultsEmpty?: (isEmpty: boolean) => void;
  onClearSelection?: () => void; // ← new
};

export default function CourseSearchBar({
  onSelect,
  onResultsEmpty,
  onClearSelection,
}: CourseSearchBarProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  const { data = [], isFetching } = useCourseSearch(debouncedQuery);

  useEffect(() => {
    const noResults = data.length === 0 && query.trim().length > 2;
    onResultsEmpty?.(noResults);
    if (noResults) {
      onClearSelection?.(); // ← clear both course and tee
    }
  }, [data]);

  const results = useMemo<Course[]>(() => {
    const normalized: Course[] = data.map((item) => ({
      ...item,
      name: item.name || "",
      city: item?.city || "",
      state: item?.state || "",
    }));

    const fuse = new Fuse(normalized, {
      keys: ["name", "city", "state"],
      threshold: 0.3,
    });

    return query ? fuse.search(query).map((r) => r.item) : normalized;
  }, [data, query]);

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Find a course..."
        style={styles.input}
      />

      {isFetching && <ActivityIndicator style={styles.loader} />}

      <FlashList
        data={results}
        estimatedItemSize={56}
        keyExtractor={(item: Course) =>
          item.isCustom ? `custom-${item.id}` : `api-${item.id}`
        }
        renderItem={({ item }: { item: Course }) => {
          return (
            <TouchableOpacity
              style={styles.item}
              onPress={() => onSelect(item)}
            >
              <Text style={styles.name}>{item.club || item.name}</Text>
              <Text style={styles.subtext}>
                {item.city}, {item.state}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !isFetching && query.length > 2 ? (
            <Text style={styles.empty}>No courses found.</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    // backgroundColor: "#fff",
    borderRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    backgroundColor: colors.white,
    borderRadius: 8,
    // marginBottom: 10,
  },
  loader: {
    marginVertical: 10,
  },
  count: {
    marginBottom: 8,
    fontWeight: "500",
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtext: {
    fontSize: 14,
    color: "#666",
  },
  addCourseText: {
    color: colors.forestGreen,
    textAlign: "center",
    marginTop: 20,
    fontWeight: "500",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    // color: "#999",
  },
});
