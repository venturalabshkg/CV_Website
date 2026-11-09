export type ContributionDay = {
  date: string;
  count: number;
};

export type ContributionGraph = {
  username: string;
  total: number;
  days: ContributionDay[];
  from: string;
  to: string;
  source: "github" | "unconfigured" | "unavailable";
  message?: string;
};

type CacheEntry = { at: number; value: ContributionGraph };
const cache = new Map<string, CacheEntry>();
const TTL = 60 * 60 * 1000;

export async function getContributions(username: string | null | undefined): Promise<ContributionGraph | null> {
  const login = username?.trim();
  if (!login) return null;

  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) {
    return {
      username: login,
      total: 0,
      days: [],
      from: "",
      to: "",
      source: "unconfigured",
      message: "Add GITHUB_TOKEN to the server environment to load contribution activity.",
    };
  }

  const cached = cache.get(login);
  if (cached && Date.now() - cached.at < TTL) return cached.value;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "portfolio-site",
      },
      body: JSON.stringify({
        query: `query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays { date contributionCount }
                }
              }
            }
          }
        }`,
        variables: { login },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return unavailable(login, "GitHub did not return contribution data.");
    }

    const json = (await response.json()) as {
      data?: {
        user?: {
          contributionsCollection?: {
            contributionCalendar?: {
              totalContributions: number;
              weeks: { contributionDays: { date: string; contributionCount: number }[] }[];
            };
          };
        };
      };
      errors?: { message: string }[];
    };

    const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      return unavailable(login, json.errors?.[0]?.message || "No public contribution calendar was found.");
    }

    const days = calendar.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({ date: day.date, count: day.contributionCount })),
    );
    const value: ContributionGraph = {
      username: login,
      total: calendar.totalContributions,
      days,
      from: days[0]?.date || "",
      to: days[days.length - 1]?.date || "",
      source: "github",
    };
    cache.set(login, { at: Date.now(), value });
    return value;
  } catch {
    return unavailable(login, "The contribution graph could not be loaded.");
  }
}

function unavailable(username: string, message: string): ContributionGraph {
  return { username, total: 0, days: [], from: "", to: "", source: "unavailable", message };
}
