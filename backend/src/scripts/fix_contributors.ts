import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixContributors() {
  const contributors = await prisma.contributor.findMany();
  console.log(`Found ${contributors.length} contributors.`);

  for (const c of contributors) {
    const stats = await prisma.commit.aggregate({
      where: { authorLogin: c.login },
      _sum: {
        additions: true,
        deletions: true,
      },
      _count: {
        _all: true
      }
    });

    const additions = stats._sum.additions || 0;
    const deletions = stats._sum.deletions || 0;
    const totalCommits = stats._count._all || 0;

    await prisma.contributor.update({
      where: { login: c.login },
      data: {
        additions,
        deletions,
        totalCommits
      }
    });
    console.log(`Updated ${c.login}: ${totalCommits} commits, +${additions} -${deletions}`);
  }
}

fixContributors().catch(console.error).finally(() => prisma.$disconnect());
