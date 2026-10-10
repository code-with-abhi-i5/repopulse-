import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function main() {
  const prisma = new PrismaClient();
  const list = await prisma.contributor.findMany({
    where: { commits: { some: {} } },
    select: {
      login: true,
      _count: { select: { commits: true } },
      repositories: true,
    },
    orderBy: { commits: { _count: 'desc' } },
  });

  const data = list.map((c, i) => ({
    rank: i + 1,
    githubUsername: c.login,
    githubProfileUrl: `https://github.com/${c.login}`,
    commitsCount: c._count.commits,
    repositories: c.repositories.join(', '),
  }));

  const jsonPath = path.resolve('..', 'committers_list.json');
  const csvPath = path.resolve('..', 'committers_list.csv');

  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');

  const csvRows = [
    'Rank,GitHub Username,GitHub Profile URL,Commits Count,Repositories',
    ...data.map(
      (d) =>
        `"${d.rank}","${d.githubUsername}","${d.githubProfileUrl}","${d.commitsCount}","${d.repositories.replace(/"/g, '""')}"`
    ),
  ];
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf-8');

  console.log(`SUCCESS: Exported ${data.length} committers to ${jsonPath} and ${csvPath}`);
  await prisma.$disconnect();
}

main().catch(console.error);
