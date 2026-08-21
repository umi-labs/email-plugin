/**
 * Idempotency guard for status-change email notifications. Returns true only on
 * the first transition *into* `completed` when no send has been recorded yet —
 * so re-saves, retries and already-completed docs don't re-send.
 */
export const shouldSend = (
  previousStatus: string | null | undefined,
  nextStatus: string | null | undefined,
  alreadySentAt: string | null | undefined,
  completedStatus = 'completed',
): boolean =>
  nextStatus === completedStatus && previousStatus !== completedStatus && !alreadySentAt
