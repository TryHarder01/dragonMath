# Research: a central notes repo for agent workflow and handoffs

- **Date:** 2026-09-26
- **Status:** Idea, not decided. Not about this repo. It's written here because no notes repo exists yet, and should move there once one does.
- **Revisit when:** Setting up a notes repo, or starting agent work in a team repo where the in-repo worklog convention hasn't been agreed.

## Question

My conventions for agent handoffs (the worklog, decision files, session flow, parallel-branch procedure) may not match what others at work use. Should that workflow, and my notes about projects, live in a central personal notes repo instead of inside each project repo?

## Proposed answer: split by what the thing is

**Process** (how I work) is mine and goes in the central repo. **State** (what happened in a project) goes wherever the project's other people can see it, or stays out of their way if they haven't agreed to it.

| Thing | Where | Why |
|---|---|---|
| Workflow: skills, decision template, session flow, merge procedure | Central notes repo, exposed as personal skills | One copy to improve, used in every repo. It's my convention, not the project's. |
| Handoff log and decisions for **personal** repos | In the repo (as in this one) | No one else to disturb. Keeps the same-commit link, `git blame`, and branch awareness. |
| Handoff log for **team** repos | Notes repo, `projects/<repo>/WORKLOG.md` | Keeps my handoff style out of a shared repo where it wasn't agreed. |
| Decisions that bind a **team** | The team's own process (their ADRs, design docs, PRs) | A decision that binds others belongs where they can see and challenge it. |
| Bigger project notes and cross-project context | Notes repo | Readable from any project session. |
| Personal instructions for a team repo | `~/.claude/CLAUDE.md`, or an `@~/notes/...` import | Keeps them out of the team's `CLAUDE.md`. |

## How Claude Code supports this (checked against the docs, 2026-09-26)

- **Personal skills** live in `~/.claude/skills/<name>/SKILL.md` and load in all projects on the machine, but **not in cloud sessions**.
- **Skill folders can be symlinks**, so `~/.claude/skills/worklog` can point into the notes repo. Claude Code loads the skill once even if several locations point at the same target.
- **Precedence:** "personal over project." If a repo has its own `.claude/skills/worklog`, the personal one wins. So either give them different names, or accept that the personal version overrides the repo's.
- **User instructions** in `~/.claude/CLAUDE.md` apply to all projects. User-level `~/.claude/rules/` also apply everywhere.
- **Imports:** a CLAUDE.md can import files with `@path`, including absolute paths like `@~/notes/...`. In a *project* CLAUDE.md, an import from outside the repo triggers a one-time approval dialog. Imports in user-level files load without one.
- **Per-project personal notes:** `CLAUDE.local.md` (gitignored) exists, but it only lives in the worktree where you created it. The docs recommend importing a file from your home directory instead, so it works across worktrees.
- **Access to the notes folder:** use `--add-dir` for a session, or `permissions.additionalDirectories` in `~/.claude/settings.json`. CLAUDE.md files in added folders load only if `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` is set. Skills in an added folder's `.claude/skills/` load for that session.

## Proposed layout

```
~/code/notes/                      # its own git repo
  skills/
    worklog/SKILL.md               # symlinked from ~/.claude/skills/worklog
  templates/
    decision.md
  projects/
    <repo-name>/
      WORKLOG.md                   # handoff log for team repos
      notes.md                     # bigger project context
  research/                        # docs like this one
```

The worklog skill picks the log's location: "If this repo tracks a `WORKLOG.md`, use it. Otherwise use `~/code/notes/projects/<repo-name>/WORKLOG.md`." One skill covers both kinds of repo.

## Trade-offs when the log lives outside the repo

- **You lose the same-commit link.** Entries can't land in the commit they describe, so `git blame` no longer connects them.
  - **But hashes become possible.** The log isn't part of the commit, so there's nothing circular about writing the hash, which isn't possible in-repo. Record the branch plus the PR number or commit hash.
- **Branches don't carry their own log.** All worktrees of a repo share one notes file:
  - **Good:** parallel agents can see what each other are doing, which in-repo logs can't give you.
  - **Bad:** two agents writing the same file at the same moment can overwrite each other. Use one section or file per branch, e.g. `projects/<repo>/<branch>.md`.
- **Teammates can't see the handoff.** That's intended, but anything the team needs goes in the PR description.
- **Cloud sessions won't see personal skills or the notes folder.** This only works on a local machine.
- **The notes repo needs its own commits.** Otherwise the notes exist only on one laptop. The skill could commit to the notes repo after each entry, but that's commits to a second repo without being asked each time. Decide deliberately.
- **Privacy:** notes about work projects in a personal repo may conflict with employer policy on where work information can live. Check before putting team-repo notes somewhere synced to a personal account.

## Open questions

- Should this repo's `.claude/skills/worklog` become the personal skill and be deleted here, or stay as the project copy? Personal would override it anyway.
- Where does the notes repo live and sync (private GitHub repo, iCloud, work-managed storage)? The privacy point above may force a work copy and a personal copy.
- Should the notes-repo commit be automatic after each entry, or manual?
- One log per repo or one per branch in the notes repo?

## Sources

- [Claude Code docs – Skills](https://code.claude.com/docs/en/skills): skill locations, precedence, symlinks
- [Claude Code docs – Memory](https://code.claude.com/docs/en/memory): CLAUDE.md scopes, `@` imports, `CLAUDE.local.md` and worktrees, `--add-dir`
- [Claude Code docs – Settings](https://code.claude.com/docs/en/settings): settings scopes, `permissions.additionalDirectories`
- Related: [worklog research](2026-09-26-worklog-pattern.md) and [worklog decision](../decisions/2026-09-26-worklog-format.md)
