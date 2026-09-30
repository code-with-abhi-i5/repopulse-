import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { getOctokitClient } from '../lib/octokit.js';

const prisma = new PrismaClient();
const octokit = getOctokitClient();

async function fixContributors() {
  const contributors = await prisma.contributor.findMany();
  console.log(`Found ${contributors.length} contributors.`);

  for (const c of contributors) {
    const commits = await prisma.commit.findMany({
      where: { authorLogin: c.login },
      include: { repository: true },
      orderBy: { timestamp: 'desc' },
    });

    const totalCommits = commits.length;
    let additions = 0;
    let deletions = 0;
    const repoSet = new Set<string>();
    const dates = new Set<string>();

    for (const commit of commits) {
      additions += commit.additions || 0;
      deletions += commit.deletions || 0;
      if (commit.repository?.fullName) {
        repoSet.add(commit.repository.fullName);
      }
      if (commit.timestamp) {
        dates.add(new Date(commit.timestamp).toISOString().split('T')[0]);
      }
    }

    const reposList = Array.from(repoSet);
    const activeDays = Math.max(1, dates.size);
    const pushesCount = Math.max(1, Math.ceil(totalCommits * 0.7));
    const currentStreak = Math.min(activeDays, 3);
    const primaryRepo = reposList[0] || c.primaryRepo || 'repopulse';

    // Try fetching GitHub user name if null
    let name = c.name;
    if (!name) {
      try {
        const { data: user } = await octokit.rest.users.getByUsername({ username: c.login });
        name = user.name || user.login;
      } catch {
        name = c.login;
      }
    }

    await prisma.contributor.update({
      where: { login: c.login },
      data: {
        name,
        additions,
        deletions,
        totalCommits,
        activeDays,
        pushesCount,
        currentStreak,
        longestStreak: Math.max(currentStreak, c.longestStreak || 1),
        repositories: reposList.length > 0 ? reposList : c.repositories,
        primaryRepo,
      },
    });
    console.log(`Updated ${c.login} (${name}): ${totalCommits} commits, repos: [${reposList.join(', ')}]`);
  }
}

fixContributors().catch(console.error).finally(() => prisma.$disconnect());
