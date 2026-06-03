import * as functions from "firebase-functions/v1";
import { admin } from "./initFirebase";
import mentalConcepts from "./mentalConcepts.json";

type Scores = Record<string, number>;

interface Round {
  uid: string;
  scores: Scores;
}

interface ConceptStat {
  total: number;
  count: number;
  average: number;
}

interface CategoryStats {
  category: string;
  total: number;
  count: number;
  average: number;
  concepts: Record<string, ConceptStat>;
}

const categoryMap: Record<string, string> = {};
(mentalConcepts as { concept: string; category: string }[]).forEach((item) => {
  categoryMap[item.concept] = item.category;
});

export const aggregateMentalCategories = functions.firestore
  .document("mentalRounds/{roundId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot) => {
    const round = snap.data() as Round;
    if (!round?.uid || !round?.scores) return;

    const { uid, scores } = round;
    const userStatsRef = admin
      .firestore()
      .collection("mentalCategoryStats")
      .doc(uid);

    // Group the incoming round's concept scores by category so each category
    // document is read and written exactly once. (Reading/writing per concept
    // inside a single batch clobbers categories that contain multiple
    // concepts, since later reads don't see earlier un-committed writes.)
    const incoming: Record<string, Record<string, number>> = {};
    for (const [concept, score] of Object.entries(scores)) {
      const category = categoryMap[concept];
      if (!category) continue;
      if (!incoming[category]) incoming[category] = {};
      incoming[category][concept] = score;
    }

    const batch = admin.firestore().batch();

    for (const [category, conceptScores] of Object.entries(incoming)) {
      const categoryRef = userStatsRef.collection("categories").doc(category);
      const doc = await categoryRef.get();
      const prev = (doc.exists ? doc.data() : undefined) as
        | CategoryStats
        | undefined;

      let total = prev?.total ?? 0;
      let count = prev?.count ?? 0;
      const conceptStats: Record<string, ConceptStat> = {
        ...(prev?.concepts ?? {}),
      };

      for (const [concept, score] of Object.entries(conceptScores)) {
        total += score;
        count += 1;

        const c = conceptStats[concept] ?? { total: 0, count: 0, average: 0 };
        const cTotal = c.total + score;
        const cCount = c.count + 1;
        conceptStats[concept] = {
          total: cTotal,
          count: cCount,
          average: cTotal / cCount,
        };
      }

      batch.set(
        categoryRef,
        {
          category,
          total,
          count,
          average: count > 0 ? total / count : 0,
          concepts: conceptStats,
        },
        { merge: true }
      );
    }

    await batch.commit();
  });
