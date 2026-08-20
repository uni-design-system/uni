/**
 * Changelog adapter — parses each package's changesets-authored `CHANGELOG.md`
 * into structured releases for the index. Release notes are written once, in
 * the changesets that ship a change; indexing them here means "what changed in
 * 8.1?" is answerable from the exact release a developer installed.
 */
import { existsSync, readFileSync } from 'node:fs';
import type { ChangelogEntryModel, PackageChangelogModel, ReleaseModel } from '../schema.js';

const H1 = /^#\s+(\S.*)$/;
const VERSION = /^##\s+(\d+\.\d+\.\d+(?:[-+][\w.]+)?)\s*$/;
const BUMP = /^###\s+(Major|Minor|Patch)\s+Changes\s*$/;
/** The changesets bullet preamble: commit link, then an optional Thanks credit. */
const PREAMBLE = /^\[`([0-9a-f]+)`\]\([^)]*\)(?:\s+Thanks\s+\[[^\]]*\]\([^)]*\)!)?\s+-\s+/;
const DEP_BUMP = /^-\s+(@?[\w./-]+@\d+\.\d+\.\d+(?:[-+][\w.]+)?)\s*$/;

/** Parse one changesets CHANGELOG.md. Pure — testable without a filesystem. */
export function parseChangelog(source: string): PackageChangelogModel | undefined {
  let pkg: string | undefined;
  const releases: ReleaseModel[] = [];
  let release: ReleaseModel | undefined;
  let bump: ChangelogEntryModel['bump'] | undefined;
  let entry: ChangelogEntryModel | undefined;
  let entryBody: string[] = [];
  let inDependencyBumps = false;

  const commitEntry = () => {
    if (!entry) return;
    entry.body = entryBody.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    entryBody = [];
    entry = undefined;
  };

  for (const line of source.split('\n')) {
    const h1 = line.match(H1);
    if (h1 && !pkg) {
      pkg = h1[1].trim();
      continue;
    }

    const version = line.match(VERSION);
    if (version) {
      commitEntry();
      release = { version: version[1], entries: [], dependencyBumps: [] };
      releases.push(release);
      bump = undefined;
      inDependencyBumps = false;
      continue;
    }

    const bumpHeading = line.match(BUMP);
    if (bumpHeading) {
      commitEntry();
      bump = bumpHeading[1].toLowerCase() as ChangelogEntryModel['bump'];
      inDependencyBumps = false;
      continue;
    }
    if (!release || !bump) continue;

    if (line.startsWith('- ')) {
      commitEntry();
      const text = line.slice(2);
      if (text.startsWith('Updated dependencies')) {
        // The bullet itself is boilerplate; the indented `- pkg@version` lines
        // that follow are the payload.
        inDependencyBumps = true;
        continue;
      }
      inDependencyBumps = false;
      const preamble = text.match(PREAMBLE);
      entry = {
        bump,
        title: preamble ? text.slice(preamble[0].length).trim() : text.trim(),
        body: '',
        commit: preamble?.[1],
      };
      release.entries.push(entry);
      continue;
    }

    if (line.startsWith('  ') || line.trim() === '') {
      const dedented = line.startsWith('  ') ? line.slice(2) : line;
      if (inDependencyBumps) {
        const dep = dedented.match(DEP_BUMP);
        if (dep) release.dependencyBumps.push(dep[1]);
        continue;
      }
      if (entry) entryBody.push(dedented);
    }
  }
  commitEntry();

  if (!pkg || !releases.length) return undefined;
  return { package: pkg, releases };
}

/** Read and parse the given CHANGELOG.md files; missing files are skipped. */
export function ingestChangelogs(paths: string[]): PackageChangelogModel[] {
  const out: PackageChangelogModel[] = [];
  for (const path of paths) {
    if (!existsSync(path)) continue;
    const parsed = parseChangelog(readFileSync(path, 'utf8'));
    if (parsed) out.push(parsed);
  }
  const releases = out.reduce((n, c) => n + c.releases.length, 0);
  console.log(`  changelogs: ${out.length} packages, ${releases} releases`);
  return out;
}
