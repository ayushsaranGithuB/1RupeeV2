// Pluggable notification senders.
//
// In development (or when no provider key is configured) messages are logged to
// the API console so the full auth flow can be exercised without external
// services. Swap the marked branches for Resend (email) / MSG91 (SMS) in prod.

const isProd = process.env.NODE_ENV === 'production';

export async function sendEmail(opts: {
    to: string;
    subject: string;
    text: string;
}): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;

    if (!isProd || !apiKey) {
        console.log(
            `\n📧 [DEV EMAIL]\n  to: ${opts.to}\n  subject: ${opts.subject}\n  ${opts.text}\n`
        );
        return;
    }

    // --- Production: Resend -------------------------------------------------
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: process.env.EMAIL_FROM || '1Rupee <noreply@1rupee.io>',
            to: opts.to,
            subject: opts.subject,
            text: opts.text,
        }),
    });
}

export async function sendSms(opts: { to: string; text: string }): Promise<void> {
    const apiKey = process.env.MSG91_API_KEY;

    if (!isProd || !apiKey) {
        console.log(`\n📱 [DEV SMS]\n  to: ${opts.to}\n  ${opts.text}\n`);
        return;
    }

    // --- Production: MSG91 (stub — wire real request/template) --------------
    console.warn('MSG91 SMS sending not yet implemented; message not sent.');
}
