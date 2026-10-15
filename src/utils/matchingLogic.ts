import type { UserProfile, SkillItem, MatchResult, SkillChain } from '../types/index.ts';

/**
 * Normalizes skill string for flexible matching
 */
export function normalizeSkill(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

/**
 * Determines whether two skills are considered matching
 */
export function areSkillsMatching(skillA: string, skillB: string): boolean {
  const normA = normalizeSkill(skillA);
  const normB = normalizeSkill(skillB);
  if (!normA || !normB) return false;
  return normA.includes(normB) || normB.includes(normA);
}

/**
 * Finds direct matches where teachers teach what the current user wants to learn.
 * Highlights mutual matches where the teacher also wants to learn something the current user teaches.
 */
export function findDirectMatches(
  currentUserId: string,
  allUsers: UserProfile[]
): MatchResult[] {
  const currentUser = allUsers.find((u) => u.id === currentUserId);
  if (!currentUser) return [];

  const matches: MatchResult[] = [];

  for (const otherUser of allUsers) {
    if (otherUser.id === currentUserId) continue;

    for (const desiredSkill of currentUser.skillsLearning) {
      const offeredSkill = otherUser.skillsTeaching.find((teachSkill) =>
        areSkillsMatching(teachSkill.name, desiredSkill.name)
      );

      if (offeredSkill) {
        // Check if other user wants anything current user teaches (Mutual match!)
        let mutualSkillOffer: SkillItem | undefined;
        for (const userTeaches of currentUser.skillsTeaching) {
          const match = otherUser.skillsLearning.find((learnSkill) =>
            areSkillsMatching(learnSkill.name, userTeaches.name)
          );
          if (match) {
            mutualSkillOffer = userTeaches;
            break;
          }
        }

        const isMutual = Boolean(mutualSkillOffer);
        const matchScore = isMutual ? 98 : 85;
        const matchReason = isMutual
          ? `Mutual Match! ${otherUser.name} teaches ${offeredSkill.name} and wants to learn your ${mutualSkillOffer?.name}!`
          : `${otherUser.name} teaches ${offeredSkill.name} which matches your interest.`;

        matches.push({
          teacher: otherUser,
          skillMatched: offeredSkill,
          learnerWants: desiredSkill,
          isMutual,
          mutualSkillOffer,
          matchScore,
          matchReason,
        });
      }
    }
  }

  // Sort by mutual match first, then score descending, then teacher rating
  return matches.sort((a, b) => {
    if (a.isMutual && !b.isMutual) return -1;
    if (!a.isMutual && b.isMutual) return 1;
    return b.teacher.rating - a.teacher.rating;
  });
}

/**
 * Detects 3-person cycles (A -> B -> C -> A) where:
 * User A teaches User B, User B teaches User C, and User C teaches User A.
 * No user is repeated, forming a perfect 3-person skill swap circle.
 */
export function findThreePersonChains(users: UserProfile[]): SkillChain[] {
  const chains: SkillChain[] = [];
  const visitedFingerprints = new Set<string>();

  // Helper to check if user X can teach user Y
  const canTeach = (
    teacher: UserProfile,
    learner: UserProfile
  ): SkillItem | undefined => {
    for (const tSkill of teacher.skillsTeaching) {
      for (const lSkill of learner.skillsLearning) {
        if (areSkillsMatching(tSkill.name, lSkill.name)) {
          return tSkill;
        }
      }
    }
    return undefined;
  };

  const n = users.length;
  for (let i = 0; i < n; i++) {
    const userA = users[i];
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const userB = users[j];
      const skillAB = canTeach(userA, userB);
      if (!skillAB) continue;

      for (let k = 0; k < n; k++) {
        if (k === i || k === j) continue;
        const userC = users[k];
        const skillBC = canTeach(userB, userC);
        if (!skillBC) continue;

        const skillCA = canTeach(userC, userA);
        if (!skillCA) continue;

        // Found 3-person loop: A teaches B, B teaches C, C teaches A
        // Create canonical fingerprint sorted by IDs so cycle rotations aren't duplicated
        const ids = [userA.id, userB.id, userC.id].sort().join(':');
        if (visitedFingerprints.has(ids)) continue;
        visitedFingerprints.add(ids);

        chains.push({
          id: `chain-${userA.id}-${userB.id}-${userC.id}`,
          users: [userA, userB, userC],
          links: [
            { fromUser: userA, toUser: userB, skillTaught: skillAB.name },
            { fromUser: userB, toUser: userC, skillTaught: skillBC.name },
            { fromUser: userC, toUser: userA, skillTaught: skillCA.name },
          ],
          summary: `${userA.name} teaches ${userB.name} (${skillAB.name}) → ${userB.name} teaches ${userC.name} (${skillBC.name}) → ${userC.name} teaches ${userA.name} (${skillCA.name})`,
        });
      }
    }
  }

  return chains;
}
