# Jobs run inside the API process, triggered over HTTP

Every scheduled task used to start the backend CLI, which loads the whole
core (all entities, migrations and provider clients) for a single run and
transiently costs about 300 Mi per invocation; on hosting with tight memory
limits this caused OOM kills. We decided that a Job is registered in the
backend and runs inside the API process, triggered by the thin CLI through a
single generic endpoint that streams log lines back synchronously. System cron
keeps the schedule and only spawns the thin CLI, so no second full boot
happens.

## Considered Options

- **A long-lived worker process with a job queue.** Rejected for now: it needs
  persistent job state and a queue, and with one API replica per instance
  the API process can absorb the peaks. It remains the next step if it
  cannot.
- **A scheduler inside the API process instead of system cron.** Rejected: the
  schedule would leave the crontab where operators look for it, and several
  replicas would need a distributed lock.
- **Asynchronous jobs with polling.** Rejected: the CLI talks to the API
  container directly, without a proxy timeout, so an open request is enough.

## Consequences

- Peak memory of a job now counts against the API container's limit, which
  must cover the largest job (the newsletter reconcile loads all contacts).
- Overlapping runs of the same Job are refused with a conflict; the lock is
  in memory and therefore per replica.
- Tools that need direct database or file access (database export and
  import) are not Jobs and stay inside the API container.
