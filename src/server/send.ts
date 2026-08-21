import type { Payload } from 'payload'

export type OutgoingEmail = {
  to: string
  subject: string
  html: string
  text: string
  from?: string
}

/**
 * Thin wrapper over `payload.sendEmail` so callers never touch the configured
 * email adapter directly. The adapter is configured on the Payload config
 * (`email:`), exactly as with any Payload project.
 */
export const sendEmail = async (payload: Payload, email: OutgoingEmail): Promise<void> => {
  await payload.sendEmail({
    to: email.to,
    from: email.from,
    subject: email.subject,
    html: email.html,
    text: email.text,
  })
}
