/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Curriculum Registry and Dynamic Lesson Loader
 * Ensures scalable on-demand loading of full-depth lessons and questions.
 */

import { DetailedBacLesson } from "./types";
import { LESSON_1_1 } from "./lessons/lesson1_1_phase_changes";
import { LESSON_1_2 } from "./lessons/lesson1_2_vapor_pressure";
import { LESSON_1_3 } from "./lessons/lesson1_3_gas_laws";
import { adaptBacLessonToDetailed } from "./lessonAdapter";
import { BACCALAUREATE_PART_1 } from "../data/baccalaureatePart1";
import { BACCALAUREATE_PART_2 } from "../data/baccalaureatePart2";
import { BacLesson } from "../types";

// Static map for initially loaded unabridged lessons
const LOADED_LESSONS: Record<string, DetailedBacLesson> = {
  ch1_l1_phase_changes: LESSON_1_1,
  ch1_l2_vapor_pressure: LESSON_1_2,
  ch1_l3_gas_laws: LESSON_1_3,
};

// Flattened cache of all 52 BacLessons
const ALL_BAC_LESSONS_MAP: Record<string, BacLesson> = {};
[
  ...BACCALAUREATE_PART_1.chapters.flatMap((c) => c.lessons),
  ...BACCALAUREATE_PART_2.chapters.flatMap((c) => c.lessons),
].forEach((l) => {
  ALL_BAC_LESSONS_MAP[l.id] = l;
});

/**
 * Fetch a detailed unabridged 17-section lesson by its ID
 */
export async function getDetailedLesson(
  lessonId: string
): Promise<DetailedBacLesson | null> {
  // 1. Check if already loaded in memory
  if (LOADED_LESSONS[lessonId]) {
    return LOADED_LESSONS[lessonId];
  }

  // 2. If standard lesson exists in Part 1 or Part 2, adapt it dynamically
  const standard = ALL_BAC_LESSONS_MAP[lessonId];
  if (standard) {
    const adapted = adaptBacLessonToDetailed(standard);
    LOADED_LESSONS[lessonId] = adapted;
    return adapted;
  }

  return null;
}

/**
 * Synchronous version to get detailed lesson if available or generate on the fly
 */
export function getDetailedLessonSync(
  lessonId: string
): DetailedBacLesson | null {
  if (LOADED_LESSONS[lessonId]) {
    return LOADED_LESSONS[lessonId];
  }

  const standard = ALL_BAC_LESSONS_MAP[lessonId];
  if (standard) {
    const adapted = adaptBacLessonToDetailed(standard);
    LOADED_LESSONS[lessonId] = adapted;
    return adapted;
  }

  return null;
}

/**
 * Register a detailed lesson into the registry
 */
export function registerDetailedLesson(lesson: DetailedBacLesson) {
  LOADED_LESSONS[lesson.id] = lesson;
}

/**
 * Check if a detailed lesson is available
 */
export function hasDetailedLesson(lessonId: string): boolean {
  return Boolean(LOADED_LESSONS[lessonId] || ALL_BAC_LESSONS_MAP[lessonId]);
}
