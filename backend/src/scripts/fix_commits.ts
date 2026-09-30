import { PrismaClient } from '@prisma/client';
import { getOctokitClient } from '../lib/octokit.js';

const prisma = new PrismaClient();
const octokit = getOctokitClient();

async function fix() {
  const commits = await prisma.commit.findMany({
    where: { additions: 0, deletions: 0 },
    include: { repository: true }
  });
  console.log('Found ' + commits.length + ' commits to fix.');
  for (let c of commits) {
    try {
      const { data: d } = await octokit.rest.repos.getCommit({
        owner: c.repository.owner,
        repo: c.repository.name,
        ref: c.sha
      });
      if (d.stats) {
        await prisma.commit.update({
          where: { id: c.id },
          data: { additions: d.stats.additions || 0, deletions: d.stats.deletions || 0, filesChanged: d.files?.length || 1 }
        });
        console.log('Fixed ' + c.sha + ': +' + d.stats.additions + ' -' + d.stats.deletions);
      }
    } catch (e) { console.error('Failed ' + c.sha); }
  }
}
fix();
