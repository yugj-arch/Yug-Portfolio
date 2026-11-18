// Live, public GitHub numbers for the profile. Cached per session to stay well under the
// unauthenticated API rate limit (60 requests/hour per visitor IP).

import { profile } from "../data/profile";

export type GitHubStats = {
  repos: number;
  stars: number;
  lastPush: string | null;
  latestRepo: string | null;
};

const KEY = "yj:gh-stats";
let inflight: Promise<GitHubStats> | null = null;

export function fetchGitHubStats(): Promise<GitHubStats> {
  try {
    const cached = sessionStorage.getItem(KEY);
    if (cached) return Promise.resolve(JSON.parse(cached) as GitHubStats);
  } catch {
    /* ignore */
  }
  if (inflight) return inflight;
  const base = `https://api.github.com/users/${profile.githubHandle}`;
  inflight = Promise.all([
    fetch(base).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    fetch(`${base}/repos?per_page=100&sort=pushed`).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
  ])
    .then(([user, repos]: [{ public_repos: number }, { name: string; stargazers_count: number; pushed_at: string; fork: boolean }[]]) => {
      const own = repos.filter((r) => !r.fork);
      const stats: GitHubStats = {
        repos: user.public_repos,
        stars: own.reduce((n, r) => n + r.stargazers_count, 0),
        lastPush: own[0]?.pushed_at ?? null,
        latestRepo: own[0]?.name ?? null,
      };
      try {
        sessionStorage.setItem(KEY, JSON.stringify(stats));
      } catch {
        /* ignore */
      }
      return stats;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
