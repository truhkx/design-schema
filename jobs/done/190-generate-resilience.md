The RN regen window died mid-phase: `claude -p` returned is_error with an empty result on Slider.rn round 1 (a transient API failure), and tools/generate.py raised RuntimeError from CliRunner.run, aborting the whole phase (logs/regen-rn.log). Make generation resilient:

1. In generate_one, catch RuntimeError/subprocess errors from the runner per round: retry the same round once after 30 s; if it fails again, record the target as failed in the lock (hash null, `error` field with the message), print "✖ <target>: runner error, will retry on the next pass", and continue with the next target instead of exiting.
2. Treat an is_error result whose `result` is empty or mentions rate limit / overloaded / 529 / ECONNRESET as transient (retry with backoff 30 s, 90 s); anything else is recorded and skipped as above.
3. Exit code stays non-zero when any target failed so regen.ps1 still reports the phase as failed, but the phase completes.
4. Test with the fake runner in tests: a runner that raises once then succeeds passes; one that raises twice records the failure and the loop continues.
Do not modify packages/*/src or generated/.
