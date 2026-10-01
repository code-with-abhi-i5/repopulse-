import { prisma } from '../lib/prisma.js';
import { cacheService } from '../services/cache/cache.service.js';

async function backfill() {
  console.log('🔄 Checking commits and activities in Supabase...');

  const [commits, activities] = await Promise.all([
    prisma.commit.findMany({ include: { repository: true } }),
    prisma.activityEvent.findMany({ select: { commitSha: true } }),
  ]);

  console.log(`Found ${commits.length} commits and ${activities.length} activities.`);

  const existingShas = new Set(
    activities.map((a) => a.commitSha).filter(Boolean)
  );

  const missing = commits.filter((c) => !existingShas.has(c.sha.slice(0, 7)));
  console.log(`Found ${missing.length} commits missing from ActivityEvent table.`);

  for (const c of missing) {
    const cleanTitle = (c.message || '').split('\n')[0].trim() || 'Commit pushed';
    await prisma.activityEvent.create({
      data: {
        type: 'PUSH',
        repositoryId: c.repositoryId,
        repositoryName: c.repository.name,
        teamName: c.repository.teamName,
        actorLogin: c.authorLogin,
        actorName: c.authorLogin,
        actorAvatarUrl: `https://github.com/${c.authorLogin}.png`,
        timestamp: c.timestamp,
        title: cleanTitle,
        description: c.message,
        url: c.url,
        branch: c.branch,
        commitSha: c.sha.slice(0, 7),
        linesAdded: c.additions,
        linesDeleted: c.deletions,
        commitCount: 1,
      },
    });
  }

  // Clear activities cache so fresh list is served
  await cacheService.invalidateActivities();

  const total = await prisma.activityEvent.count();
  console.log(`✅ Backfill complete! Total activities now: ${total}`);
  await prisma.$disconnect();
}

backfill().catch((err) => {
  console.error('Backfill error:', err);
  process.exit(1);
});
