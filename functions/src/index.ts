import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import mentalConcepts from "./mentalConcepts.json";

admin.initializeApp();

type Scores = Record<string, number>;

interface Round {
  uid: string;
  scores: Scores;
}

interface CategoryStats {
  category: string;
  totalScore: number;
  count: number;
  average: number;
}

// Build category lookup from concepts
const categoryMap: Record<string, string> = {};
(mentalConcepts as any[]).forEach((item) => {
  categoryMap[item.concept] = item.category;
});

export const aggregateMentalCategories = functions.firestore
  .document("mentalRounds/{roundId}")
  .onCreate(async (snap: functions.firestore.DocumentSnapshot) => {
    const round = snap.data() as Round;
    if (!round?.uid || !round?.scores) return;

    const {uid, scores} = round;
    const userStatsRef = admin
      .firestore()
      .collection("mentalCategoryStats")
      .doc(uid);

    const batch = admin.firestore().batch();

    for (const [concept, score] of Object.entries(scores)) {
      const category = categoryMap[concept];
      if (!category) continue;

      const categoryRef = userStatsRef.collection("categories").doc(category);
      const doc = await categoryRef.get();

      if (doc.exists) {
        const data = doc.data() as CategoryStats;
        const newTotal = data.totalScore + score;
        const newCount = data.count + 1;
        batch.update(categoryRef, {
          totalScore: newTotal,
          count: newCount,
          average: newTotal / newCount,
        });
      } else {
        batch.set(categoryRef, {
          category,
          totalScore: score,
          count: 1,
          average: score,
        });
      }
    }

    await batch.commit();
  });
