import type { EmailAdapter, SendEmailOptions } from 'payload'

/** Captures all emails sent during tests. Tests import this to inspect/clear. */
export const capturedEmails: SendEmailOptions[] = []

export const testEmailAdapter: EmailAdapter<void> = ({ payload }) => ({
  name: 'test-email-adapter',
  defaultFromAddress: 'dev@payloadcms.com',
  defaultFromName: 'Payload Test',
  sendEmail: async (message) => {
    capturedEmails.push(message)
    payload.logger.info({ msg: `Test email to '${String(message.to)}': ${message.subject}` })
    return Promise.resolve()
  },
})
