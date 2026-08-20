import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../hooks/auth";
import { useMentalRounds } from "../hooks/useMentalRounds";
import ScreenWrapper from "../components/ScreenWrapper";
import HeaderBar from "../components/HeaderBar";
import { colors, spacing } from "../theme";
import { MentalRound } from "../lib/types";
const MIN_ROUNDS_FOR_INSIGHT = 3;

// ─── helpers ────────────────────────────────────────────────────────────────

function average(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function overallMentalScore(round: MentalRound): number {
  const vals = Object.values(round.scores || {});
  return vals.length ? average(vals) : 0;
}

// Pearson correlation coefficient between two equal-length arrays.
function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const mx = average(xs);
  const my = average(ys);
  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const den = Math.sqrt(
    xs.reduce((s, x) => s + (x - mx) ** 2, 0) *
      ys.reduce((s, y) => s + (y - my) ** 2, 0)
  );
  return den === 0 ? 0 : num / den;
}

// Map a differential to a display string: lower = better.
function diffLabel(d: number): string {
  if (d <= 0) return `+${Math.abs(d).toFixed(1)} above rating`;
  return `${d.toFixed(1)} over rating`;
}

// ─── sub-components ─────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <View
      style={[styles.statCard, highlight && { borderColor: colors.darkGreen, borderWidth: 2 }]}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

function ScoreBar({
  label,
  score,
  max = 5,
}: {
  label: string;
  score: number;
  max?: number;
}) {
  const pct = Math.min(score / max, 1);
  const color =
    score >= 4 ? colors.turfGreen : score >= 3 ? colors.bunkerSand : colors.red;

  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barValue}>{score.toFixed(1)}</Text>
    </View>
  );
}

// Simple dot-plot: each round is a dot on a horizontal axis.
function DotPlot({
  rounds,
  getValue,
  label,
  lowerIsBetter = false,
}: {
  rounds: MentalRound[];
  getValue: (r: MentalRound) => number;
  label: string;
  lowerIsBetter?: boolean;
}) {
  const values = rounds.map(getValue);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <View style={styles.dotPlot}>
      <Text style={styles.dotPlotLabel}>{label}</Text>
      <View style={styles.dotTrack}>
        {rounds.map((r, i) => {
          const val = getValue(r);
          const pct = (val - min) / range;
          // Flip if lower-is-better so green dots are to the right.
          const pos = lowerIsBetter ? 1 - pct : pct;
          const isGood = lowerIsBetter ? val <= min + range * 0.33 : val >= min + range * 0.67;
          return (
            <View
              key={r.id}
              style={[
                styles.dot,
                {
                  left: `${pos * 88}%`,
                  backgroundColor: isGood ? colors.turfGreen : colors.coolGray,
                },
              ]}
            >
              <Text style={styles.dotIndex}>{i + 1}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.dotAxisRow}>
        <Text style={styles.dotAxisText}>
          {lowerIsBetter ? "Better" : "Lower"}
        </Text>
        <Text style={styles.dotAxisText}>
          {lowerIsBetter ? "Worse" : "Higher"}
        </Text>
      </View>
    </View>
  );
}

// ─── screen ─────────────────────────────────────────────────────────────────

export default function InsightScreen() {
  const { userId } = useAuth();
  const { data: rounds = [], isLoading } = useMentalRounds(userId);

  const roundsWithDiff = useMemo(
    () => rounds.filter((r) => r.handicapDifferential !== undefined),
    [rounds]
  );

  const roundsWithScore = useMemo(
    () => rounds.filter((r) => r.roundScore && r.roundScore > 0),
    [rounds]
  );

  // Per-category averages across all rounds.
  const categoryAverages = useMemo(() => {
    if (!rounds.length) return {};
    const totals: Record<string, number[]> = {};
    for (const r of rounds) {
      for (const [cat, score] of Object.entries(r.categoryScores || {})) {
        if (!totals[cat]) totals[cat] = [];
        totals[cat].push(score);
      }
    }
    return Object.fromEntries(
      Object.entries(totals).map(([cat, vals]) => [cat, average(vals)])
    );
  }, [rounds]);

  // Correlation: overall mental score vs handicap differential.
  const diffCorrelation = useMemo(() => {
    if (roundsWithDiff.length < MIN_ROUNDS_FOR_INSIGHT) return null;
    const mental = roundsWithDiff.map(overallMentalScore);
    const diffs = roundsWithDiff.map((r) => r.handicapDifferential as number);
    return pearson(mental, diffs);
  }, [roundsWithDiff]);

  // Best vs worst mental rounds (by overall score).
  const ranked = useMemo(
    () =>
      [...roundsWithScore].sort(
        (a, b) => overallMentalScore(b) - overallMentalScore(a)
      ),
    [roundsWithScore]
  );
  const topRounds = ranked.slice(0, 3);
  const bottomRounds = ranked.slice(-3).reverse();

  const avgScoreTop = average(topRounds.map((r) => r.roundScore ?? 0));
  const avgScoreBottom = average(bottomRounds.map((r) => r.roundScore ?? 0));
  const scoreDelta = avgScoreBottom - avgScoreTop;

  if (!userId) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Log in to see your insights.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.darkGreen} />
        </View>
      </ScreenWrapper>
    );
  }

  if (rounds.length < MIN_ROUNDS_FOR_INSIGHT) {
    return (
      <ScreenWrapper>
        <HeaderBar title="Insights" />
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Not enough data yet</Text>
          <Text style={styles.emptyText}>
            Log {MIN_ROUNDS_FOR_INSIGHT - rounds.length} more round
            {MIN_ROUNDS_FOR_INSIGHT - rounds.length === 1 ? "" : "s"} to unlock
            your personal insights.
          </Text>
          <Text style={styles.emptyHint}>
            Each round you track builds a picture of how your mindset affects
            your score.
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderBar title="Insights" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── summary stats ── */}
        <Text style={styles.sectionTitle}>Your Numbers</Text>
        <View style={styles.statRow}>
          <StatCard
            label="Rounds tracked"
            value={String(rounds.length)}
          />
          <StatCard
            label="Avg mental score"
            value={average(rounds.map(overallMentalScore)).toFixed(1)}
            sub="out of 5"
          />
          {roundsWithDiff.length >= 2 && (
            <StatCard
              label="Avg differential"
              value={average(
                roundsWithDiff.map((r) => r.handicapDifferential as number)
              ).toFixed(1)}
              sub="lower = better"
            />
          )}
        </View>

        {/* ── mental vs score delta ── */}
        {roundsWithScore.length >= MIN_ROUNDS_FOR_INSIGHT && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mind → Score</Text>
            <View style={styles.insightCard}>
              <Text style={styles.insightHeadline}>
                {scoreDelta > 0
                  ? `Your top mental rounds score ${scoreDelta.toFixed(1)} strokes better`
                  : "Keep logging — your trend is forming"}
              </Text>
              <Text style={styles.insightSub}>
                Best 3 mental rounds avg:{" "}
                <Text style={styles.bold}>{avgScoreTop.toFixed(1)}</Text>
                {"  ·  "}
                Worst 3 avg:{" "}
                <Text style={styles.bold}>{avgScoreBottom.toFixed(1)}</Text>
              </Text>
            </View>
          </View>
        )}

        {/* ── differential correlation ── */}
        {diffCorrelation !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Mental Score vs Course Differential
            </Text>
            <View style={styles.insightCard}>
              <Text style={styles.insightHeadline}>
                {diffCorrelation < -0.3
                  ? `Strong link: higher mental scores → lower differentials`
                  : diffCorrelation < 0
                  ? "Mild trend: better mindset tends toward lower differentials"
                  : "No clear link yet — keep logging"}
              </Text>
              <Text style={styles.insightSub}>
                Correlation: {(diffCorrelation * -1).toFixed(2)}{" "}
                <Text style={styles.dimText}>(higher = stronger link)</Text>
              </Text>
            </View>
            <DotPlot
              rounds={roundsWithDiff}
              getValue={(r) => r.handicapDifferential as number}
              label="Differential per round (lower = better)"
              lowerIsBetter
            />
          </View>
        )}

        {/* ── per-category averages ── */}
        {Object.keys(categoryAverages).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Averages</Text>
            {Object.entries(categoryAverages)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, avg]) => (
                <ScoreBar key={cat} label={cat} score={avg} />
              ))}
          </View>
        )}

        {/* ── putts / GIR / FWY breakdown ── */}
        {rounds.some((r) => r.putts !== undefined) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shot Stats</Text>
            <View style={styles.statRow}>
              {rounds.some((r) => r.putts !== undefined) && (
                <StatCard
                  label="Avg putts"
                  value={average(
                    rounds
                      .filter((r) => r.putts !== undefined)
                      .map((r) => r.putts as number)
                  ).toFixed(1)}
                />
              )}
              {rounds.some((r) => r.fairwaysHit !== undefined) && (
                <StatCard
                  label="Avg FWY"
                  value={average(
                    rounds
                      .filter((r) => r.fairwaysHit !== undefined)
                      .map((r) => r.fairwaysHit as number)
                  ).toFixed(1)}
                />
              )}
              {rounds.some((r) => r.greensInRegulation !== undefined) && (
                <StatCard
                  label="Avg GIR"
                  value={average(
                    rounds
                      .filter((r) => r.greensInRegulation !== undefined)
                      .map((r) => r.greensInRegulation as number)
                  ).toFixed(1)}
                />
              )}
            </View>
          </View>
        )}

        {/* ── best/worst rounds ── */}
        {topRounds.length >= 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Best Mental Rounds</Text>
            {topRounds.map((r, i) => (
              <View key={r.id} style={styles.roundRow}>
                <Text style={styles.roundIndex}>#{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roundCourse}>
                    {r.courseName ?? "Unknown course"}
                  </Text>
                  <Text style={styles.roundMeta}>
                    Mental {overallMentalScore(r).toFixed(1)}
                    {r.roundScore ? ` · Score ${r.roundScore}` : ""}
                    {r.handicapDifferential !== undefined
                      ? ` · Diff ${diffLabel(r.handicapDifferential)}`
                      : ""}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.charcoal,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.duskGray,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: 14,
    color: colors.coolGray,
    textAlign: "center",
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.duskGray,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  section: { marginBottom: spacing.lg },
  statRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.whiteSmoke,
    borderRadius: 10,
    padding: spacing.sm,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.darkGreen,
  },
  statLabel: {
    fontSize: 11,
    color: colors.duskGray,
    textAlign: "center",
    marginTop: 2,
  },
  statSub: {
    fontSize: 10,
    color: colors.coolGray,
    textAlign: "center",
  },
  insightCard: {
    backgroundColor: colors.darkGreen,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  insightHeadline: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
    marginBottom: spacing.xs,
  },
  insightSub: {
    fontSize: 13,
    color: colors.oliveLeaf,
  },
  bold: { fontWeight: "700" },
  dimText: { color: colors.coolGray },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  barLabel: {
    width: 90,
    fontSize: 12,
    color: colors.charcoal,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.mistGray,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4 },
  barValue: {
    width: 28,
    fontSize: 12,
    color: colors.duskGray,
    textAlign: "right",
  },
  dotPlot: { marginBottom: spacing.sm },
  dotPlotLabel: {
    fontSize: 12,
    color: colors.duskGray,
    marginBottom: spacing.xs,
  },
  dotTrack: {
    height: 28,
    backgroundColor: colors.lightGray,
    borderRadius: 14,
    position: "relative",
    marginHorizontal: 4,
  },
  dot: {
    position: "absolute",
    top: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  dotIndex: { fontSize: 9, color: colors.white, fontWeight: "700" },
  dotAxisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  dotAxisText: { fontSize: 10, color: colors.coolGray },
  roundRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.mistGray,
  },
  roundIndex: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.darkGreen,
    width: 32,
  },
  roundCourse: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.charcoal,
  },
  roundMeta: {
    fontSize: 12,
    color: colors.duskGray,
    marginTop: 2,
  },
});
