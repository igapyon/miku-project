# #137 v1 reference update proposal

State: **proposal prepared; G-REFERENCE adoption pending**. This note prepares the reference identity for the corrected Node v1 source and the Java contract snapshot. It does not create a tag, runtime candidate, lock, Java snapshot, commit, or release.

## Current approved reference

| Item | Frozen G4 value |
| --- | --- |
| Source tag / revision | `v1.0.3` / `693b4ecd7d4328d77f3b2eada9c4965a9c9b15f5` |
| Contract version / fixture suite version | `1` / `1` |
| Conformance corpus digest | `f0b4a821f80f155ba01afc1fdf7c5d2fa6ca5e744bbd0090819e0d591f1c47a3` |
| Internal runtime candidate | Three-member candidate under `workplace/gate-g4/v1.0.3/runtime/`, pinned by `docs/miku-project-node-reference-runtime-lock-v1.0.3.json` |
| Java snapshot | `vendor/miku-project-contract/v1.0.3/`, imported from the exact tag/revision |

The v1.0.3 tag, runtime candidate, outer lock, and Java snapshot are historical approved inputs and remain unchanged.

## Proposed next source identity

| Item | Proposal | State |
| --- | --- | --- |
| Source tag / full revision | `v1.1.1` / `9a9f562c03d28f1b0f3c809226dc61d0cd9d5f7e` | Exact existing tag; adoption pending |
| Product/runtime version at that tag | `1.1.1` | Recorded from the exact tag's `package.json`; not inferred from the dirty worktree |
| Contract version / fixture suite version | `1` / `1` | Unchanged |
| Corpus digest | `f0b4a821f80f155ba01afc1fdf7c5d2fa6ca5e744bbd0090819e0d591f1c47a3` | Corpus files are unchanged from v1.0.3 through v1.1.1 |
| Java snapshot identity | New immutable `v1.1.1` snapshot, including a newly generated `SOURCE.json` | Requires G-REFERENCE adoption; preserve v1.0.3 |
| Runtime candidate and lock | Fresh v1.1.1 three-member internal candidate and a separate outer lock | Build and hashes are deferred to REF-02 after adoption |

The candidate uses the existing exact v1.1.1 tag because its committed source contains both corrections required by the plan. A clean isolated checkout of that tag is the source; it is not the current dirty checkout. The local uncommitted `1.1.2` version change is not a tag, source revision, or approved runtime identity. If maintainers instead require that version for the reference, that would need a clean commit and exact tag first; the current worktree does not supply that identity.

## Delta from v1.0.3 to v1.1.1

### v1 runtime source

- `scripts/lib/v1/cli-v1-argv.mjs`: a leading unsupported `--...` token is classified as `cli.unknown-option`, with the option and received token details. This matches the fixed `CU-USAGE-001` expectation instead of treating it as an unknown command.
- `scripts/lib/v1/cli-v1-router.mjs` and new `scripts/lib/v1/cli-v1-presentation.mjs`: add help, command help, and version control operations to the versioned runtime. They return before runtime asset verification, do not read project input, and do not create result files.
- `docs/miku-project-cli-contract-v1.md`: clarifies that help/version text is not proof of runtime integrity and that workflow manifest checks still apply.

### Contract and corpus members

- `docs/miku-project-cli-contract-v1.md` differs from v1.0.3 by the control-operation asset-verification clarification. This is why Java needs a new snapshot even though the numbered contract version remains `1`.
- The schemas and `testdata/conformance/v1/` corpus are unchanged. The fixed corpus still has suite version `1` and the digest above. The source-tag identity and snapshot member inventory change, so the snapshot `SOURCE.json` and its inventory digest must be generated anew from the adopted exact tag.
- Other source/docs/package changes between the product tags do not by themselves authorize new v1 contract semantics. A runtime build must record the pinned toolchain, package-lock digest, generated member sizes and hashes, manifest digest, and outer-lock digest as REF-02 requires.

## Compatibility and downstream handling

- v1.0.3 remains the only current G4-approved internal candidate and remains the Java repository's existing snapshot. Do not replace its lock or snapshot.
- The v1.1.1 candidate would be a new internal reference identity, not a public v1 runtime Release. The current public runtime Release workflow does not package this three-member v1 bundle.
- The Java importer currently fixes v1.0.3's tag/revision and allowlist. After adoption, REF-03 must add a fixed v1.1.1 registry entry and an immutable versioned snapshot directory, verify the new exact tag/revision, preserve the old selector behavior, and reject unknown identities. It must not copy a dirty Node worktree.
- The `v1.1.1` candidate updates the approved source identity used for later P5 comparison. It does not itself complete P5-C1 review/approval or Gate G5.

## Decision record

Recommendation: adopt the exact existing `v1.1.1` tag/revision above as the source for a new internal v1 reference candidate and Java snapshot. Keep contract version `1`, fixture suite version `1`, and the unchanged corpus; capture the changed CLI contract text and source-tag identity in the new snapshot inventory. Build and approve a separate three-member candidate/outer lock before Java snapshot implementation.

Decision: **未決定**. Decision maker/date: **未決定**. G-REFERENCE remains open. REF-02 may start after a maintainer explicitly adopts this exact source identity and scope. REF-03 may start only after REF-02 builds and verifies the candidate runtime and outer lock, and a maintainer explicitly adopts their resulting manifest and outer-lock digests. No runtime build, snapshot edit, tag, commit, or publication was performed for this proposal.
