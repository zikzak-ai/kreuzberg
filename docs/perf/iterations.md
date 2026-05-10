# Performance Iteration Log

Per-iteration tracker for kreuzberg perf optimization rounds. Append one row per accepted or rejected candidate. Follows the protocol in `profiling.md`. The institutional memory replacement for the `feedback_perf_subagent_verification.md` failure-mode warning.

## Format

| commit | candidate | hotspot self-time | p50 Δ | p95 Δ | SF1 Δ | verdict | notes |
|--------|-----------|-------------------|-------|-------|-------|---------|-------|

- **commit** — short SHA of the optimization commit (or REVERTED if rejected).
- **candidate** — file:function being optimized.
- **hotspot self-time** — pre-fix percentage from the flamegraph.
- **p50 Δ / p95 Δ** — change in median/tail extraction time vs prior baseline JSON.
- **SF1 Δ** — change in aggregate SF1 score. Must be ≥ −0.1pt or revert.
- **verdict** — ACCEPT, MARGINAL (lift < 3%, no regression), or REJECT.
- **notes** — one sentence on why.

## History

| commit | candidate | hotspot self-time | p50 Δ | p95 Δ | SF1 Δ | verdict | notes |
|--------|-----------|-------------------|-------|-------|-------|---------|-------|
| REVERTED | normalize_whitespace rewrite | not measured | n/a | n/a | n/a | REJECT | perf-engineer agent ACCEPT'd without measurement; correctness regression on leading/trailing spaces. See `feedback_perf_subagent_verification.md`. |
| REVERTED | split_embedded bullet-count fast path | not measured | +5% | +5% | 0 | REJECT | speculation-driven; ~5% wall-time *regression*. Don't optimize without a flamegraph. |

## Queue (next session)

The following candidates are pending the first flamegraph round. Each must be flamegraph-confirmed as a top-15 self-time hotspot before being implemented.

1. **`pdf::structure::pipeline::fuse_paragraphs`** — known to do per-paragraph clones; verify it's still in the top-15 after the layout-hints fix shifted the call graph.
2. **`rendering::markdown` escape passes** — six successive `.replace()` calls always allocate; candidate for `Cow::Borrowed` until needle found.
3. **`pdf::structure::text_repair::*`** — `split_whitespace` byte iteration; potential `memchr` win.

### Blocker for the queue

A first attempt at flamegraph generation produced `flamegraphs/61170f7f6/baseline.svg` (~466KB, 2218 stack rectangles), but only system symbols (`__mh_execute_header`, `__os_lock_handoff_lock_slow`, raw addresses) are resolved. The kreuzberg crate's symbols are stripped by the default release profile.

**Next session must:**

1. Rebuild with `cargo build --profile profiling -p kreuzberg-cli --features full` (the `profiling` profile inherits `release` but keeps debug info per `feature-flag-policy` in CLAUDE.md).
2. Rebuild `benchmark-harness` with `--features profiling --profile profiling`.
3. Re-run `pipeline-benchmark --profile-dir flamegraphs/<sha>/`.
4. Re-extract the top-15 from the resulting SVG; confirm or reorder the queue above.

Until that lands, the three candidates listed are *intuition-confirmed only* (from prior code review); they must NOT be implemented until they're flamegraph-confirmed. This is the rule the prior `split_embedded` REJECT was designed to enforce.

## Stopping conditions

Per `profiling.md` § Iteration protocol:

- **Three consecutive REJECT or MARGINAL** → optimization curve flattened; stop.
- **Aggregate p95 plaintext ms/MB within 20% of pandoc** → competitive ceiling reached; stop.
- **SF1 regression > 0.1pt on any iteration** → immediate revert; reset the streak.
