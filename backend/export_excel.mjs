import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';

async function generateExcel() {
  const prisma = new PrismaClient();

  console.log('Fetching committers and repositories from database...');

  // 1. Fetch Committers
  const committers = await prisma.contributor.findMany({
    where: { commits: { some: {} } },
    select: {
      login: true,
      name: true,
      _count: { select: { commits: true } },
      repositories: true,
    },
    orderBy: { commits: { _count: 'desc' } },
  });

  // 2. Fetch All Repositories
  const repos = await prisma.repository.findMany({
    select: {
      fullName: true,
      stars: true,
      forks: true,
      openIssues: true,
      healthScore: true,
      _count: { select: { commits: true } },
    },
    orderBy: { commits: { _count: 'desc' } },
  });

  // Create Workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Active Committers
  const committersData = committers.map((c, idx) => ({
    'Rank': idx + 1,
    'GitHub Username': c.login,
    'GitHub Profile Link': `https://github.com/${c.login}`,
    'Total Commits': c._count.commits,
    'Associated Repositories': c.repositories.join(', '),
  }));

  const wsCommitters = XLSX.utils.json_to_sheet(committersData);

  // Set column widths for Committers sheet
  wsCommitters['!cols'] = [
    { wch: 8 },  // Rank
    { wch: 28 }, // GitHub Username
    { wch: 40 }, // Profile Link
    { wch: 15 }, // Commits
    { wch: 65 }, // Repositories
  ];

  // Add clickable hyperlinks for GitHub Profile Links
  committersData.forEach((row, i) => {
    const cellRef = `C${i + 2}`; // Column C, 1-based index (header is row 1)
    if (wsCommitters[cellRef]) {
      wsCommitters[cellRef].l = { Target: row['GitHub Profile Link'], Tooltip: `Open ${row['GitHub Username']} on GitHub` };
    }
  });

  XLSX.utils.book_append_sheet(wb, wsCommitters, 'Contributors & Committers');

  // Sheet 2: Repositories Summary
  const reposData = repos.map((r, idx) => ({
    'No.': idx + 1,
    'Repository Name': r.fullName,
    'GitHub Link': `https://github.com/${r.fullName}`,
    'Total Synced Commits': r._count.commits,
    'Stars': r.stars,
    'Forks': r.forks,
    'Open Issues': r.openIssues,
    'Health Score (%)': r.healthScore,
  }));

  const wsRepos = XLSX.utils.json_to_sheet(reposData);
  wsRepos['!cols'] = [
    { wch: 6 },
    { wch: 45 },
    { wch: 55 },
    { wch: 22 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 },
    { wch: 18 },
  ];

  reposData.forEach((row, i) => {
    const cellRef = `C${i + 2}`;
    if (wsRepos[cellRef]) {
      wsRepos[cellRef].l = { Target: row['GitHub Link'], Tooltip: `Open ${row['Repository Name']}` };
    }
  });

  XLSX.utils.book_append_sheet(wb, wsRepos, 'Repositories Summary');

  // Write file to workspace root as both committers_list.xlsx and RepoPulse_Fleet_Report.xlsx
  const file1 = path.resolve('..', 'committers_list.xlsx');
  const file2 = path.resolve('..', 'RepoPulse_Fleet_Report.xlsx');

  XLSX.writeFile(wb, file1);
  XLSX.writeFile(wb, file2);

  console.log(`✅ SUCCESS! Created Excel files at:\n - ${file1}\n - ${file2}`);
  await prisma.$disconnect();
}

generateExcel().catch(console.error);
