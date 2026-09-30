import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncActivities() {
  console.log('🔄 Cleaning up and syncing Activity Events from database commits...');
  
  await prisma.activityEvent.deleteMany({});

  const commits = await prisma.commit.findMany({
    include: {
      repository: true,
      author: true,
    },
    orderBy: { timestamp: 'desc' },
  });

  console.log(`Found ${commits.length} commits in database.`);

  for (const c of commits) {
    const avatarUrl = c.author?.avatarUrl || `https://github.com/${c.authorLogin || 'ghost'}.png`;
    const name = c.author?.name || c.authorLogin || 'Developer';
    const firstLine = (c.message || '').split('\n')[0].trim();

    await prisma.activityEvent.create({
      data: {
        type: 'PUSH',
        repositoryId: c.repositoryId,
        repositoryName: c.repository?.name || 'repository',
        teamName: c.repository?.teamName || null,
        actorLogin: c.authorLogin || 'contributor',
        actorName: name,
        actorAvatarUrl: avatarUrl,
        timestamp: c.timestamp,
        title: firstLine || 'Commit pushed to repository',
        description: c.message,
        url: c.url,
        branch: c.branch || 'main',
        commitSha: c.sha.slice(0, 7),
        linesAdded: c.additions || 0,
        linesDeleted: c.deletions || 0,
        commitCount: 1,
      },
    });
  }

  const count = await prisma.activityEvent.count();
  console.log(`✅ Successfully created ${count} real activity events in Supabase!`);
}

syncActivities()
  .catch((e) => console.error('Error syncing activities:', e))
  .finally(() => prisma.$disconnect());
