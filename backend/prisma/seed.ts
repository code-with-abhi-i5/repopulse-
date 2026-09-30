// ============================================================
// RepoPulse — Database Seed Script
// ============================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialRepositories = [
  {
    githubId: 90123456n,
    name: 'the-grocery-hub',
    fullName: 'Zectral/the-grocery-hub',
    owner: 'Zectral',
    description: 'Modern grocery commerce platform with real-time inventory tracking',
    visibility: 'PUBLIC' as const,
    defaultBranch: 'main',
    license: 'MIT',
    language: 'TypeScript',
    createdAt: new Date('2026-09-28T09:30:00Z'),
    updatedAt: new Date('2026-09-29T16:10:00Z'),
    pushedAt: new Date('2026-09-29T16:10:00Z'),
    stars: 1248,
    forks: 183,
    watchers: 97,
    openIssues: 12,
    sizeKb: 24800,
    archived: false,
    topics: ['grocery', 'ecommerce', 'typescript', 'react'],
    healthScore: 92,
    teamName: 'Team ByteCraft',
    hackathonBatch: 'HackQubit-2026',
    antiCheatStatus: 'VERIFIED_FRESH' as const,
  },
  {
    githubId: 90123457n,
    name: 'agentic-ai-platform',
    fullName: 'Zectral/agentic-ai-platform',
    owner: 'Zectral',
    description: 'Enterprise AI agent orchestration and deployment framework',
    visibility: 'PUBLIC' as const,
    defaultBranch: 'main',
    license: 'Apache-2.0',
    language: 'Python',
    createdAt: new Date('2026-09-28T14:00:00Z'),
    updatedAt: new Date('2026-09-29T14:30:00Z'),
    pushedAt: new Date('2026-09-29T14:30:00Z'),
    stars: 2341,
    forks: 412,
    watchers: 156,
    openIssues: 8,
    sizeKb: 18200,
    archived: false,
    topics: ['ai', 'agents', 'llm', 'python'],
    healthScore: 88,
    teamName: 'NeuralCoders',
    hackathonBatch: 'HackQubit-2026',
    antiCheatStatus: 'VERIFIED_FRESH' as const,
  },
  {
    githubId: 90123458n,
    name: 'canopi',
    fullName: 'Zectral/canopi',
    owner: 'Zectral',
    description: 'Cloud-native application platform for modern infrastructure',
    visibility: 'PUBLIC' as const,
    defaultBranch: 'main',
    license: 'MIT',
    language: 'Go',
    createdAt: new Date('2026-09-28T10:00:00Z'),
    updatedAt: new Date('2026-09-29T11:20:00Z'),
    pushedAt: new Date('2026-09-29T11:20:00Z'),
    stars: 876,
    forks: 124,
    watchers: 63,
    openIssues: 5,
    sizeKb: 12400,
    archived: false,
    topics: ['cloud', 'infrastructure', 'golang', 'kubernetes'],
    healthScore: 79,
    teamName: 'CloudArchitects',
    hackathonBatch: 'HackQubit-2026',
    antiCheatStatus: 'VERIFIED_FRESH' as const,
  },
  {
    githubId: 90123459n,
    name: 'repopulse',
    fullName: 'Zectral/repopulse',
    owner: 'Zectral',
    description: 'GitHub repository intelligence and monitoring platform',
    visibility: 'PUBLIC' as const,
    defaultBranch: 'main',
    license: 'MIT',
    language: 'TypeScript',
    createdAt: new Date('2026-09-28T08:00:00Z'),
    updatedAt: new Date('2026-09-29T16:45:00Z'),
    pushedAt: new Date('2026-09-29T16:45:00Z'),
    stars: 467,
    forks: 52,
    watchers: 38,
    openIssues: 4,
    sizeKb: 8600,
    archived: false,
    topics: ['github', 'analytics', 'monitoring', 'dashboard'],
    healthScore: 95,
    teamName: 'Team Alpha (HackQubit)',
    hackathonBatch: 'HackQubit-2026',
    antiCheatStatus: 'VERIFIED_FRESH' as const,
  },
];

async function main() {
  console.log('🌱 [Seed] Seeding initial hackathon repositories into Supabase...');

  for (const repo of initialRepositories) {
    const teamId = `team-${repo.teamName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    // Upsert Team
    await prisma.team.upsert({
      where: { id: teamId },
      create: {
        id: teamId,
        name: repo.teamName,
        hackathonBatch: repo.hackathonBatch,
      },
      update: { hackathonBatch: repo.hackathonBatch },
    });

    // Upsert Repository
    await prisma.repository.upsert({
      where: { fullName: repo.fullName },
      create: {
        ...repo,
        teamId,
      },
      update: repo,
    });

    console.log(`✅ Seeded repo: ${repo.fullName}`);
  }

  console.log('🎉 [Seed] Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
