// ============================================================
// RepoPulse — Excel / CSV Sheet Parser Service
// ============================================================

import * as xlsx from 'xlsx';

export interface ParsedRepoRow {
  teamName: string;
  repoUrl: string;
  fullName: string;
  owner: string;
  repoName: string;
  batch?: string;
  lead?: string;
}

export function parseExcelBuffer(
  buffer: Buffer,
  fallbackBatch: string = 'HackQubit-2026'
): { repos: ParsedRepoRow[]; errors: Array<{ row: number; reason: string; raw: any }> } {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Uploaded Excel file has no sheets.');
  }

  const rawRows: any[] = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheetName]);
  const repos: ParsedRepoRow[] = [];
  const errors: Array<{ row: number; reason: string; raw: any }> = [];

  rawRows.forEach((row, index) => {
    // Find URL in any column name variation
    const rawUrl =
      row['Repository URL'] ||
      row['Repository'] ||
      row['Repo URL'] ||
      row['repo_url'] ||
      row['GitHub URL'] ||
      row['github_url'] ||
      row['Github'] ||
      row['URL'] ||
      row['url'] ||
      row['Link'] ||
      row['link'];

    const rawTeam =
      row['Team Name'] ||
      row['team_name'] ||
      row['Team'] ||
      row['team'] ||
      row['Group'] ||
      row['Project Name'] ||
      'Independent Team';

    const rawBatch =
      row['Batch'] ||
      row['batch'] ||
      row['Track'] ||
      row['track'] ||
      row['Hackathon'] ||
      fallbackBatch;

    const rawLead = row['Lead'] || row['leader'] || row['Author'] || undefined;

    if (!rawUrl || typeof rawUrl !== 'string') {
      errors.push({
        row: index + 2,
        reason: 'Missing or empty Repository URL column',
        raw: row,
      });
      return;
    }

    // Match GitHub URL or plain owner/repo string
    const match = rawUrl.trim().match(/(?:https?:\/\/github\.com\/)?([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/i);

    if (!match) {
      errors.push({
        row: index + 2,
        reason: `Invalid GitHub URL: "${rawUrl}"`,
        raw: row,
      });
      return;
    }

    const owner = match[1];
    const repoName = match[2].replace(/\.git$/, '');
    const fullName = `${owner}/${repoName}`;

    repos.push({
      teamName: String(rawTeam).trim(),
      repoUrl: `https://github.com/${fullName}`,
      fullName,
      owner,
      repoName,
      batch: String(rawBatch).trim(),
      lead: rawLead ? String(rawLead).trim() : undefined,
    });
  });

  return { repos, errors };
}
