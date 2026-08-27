// ============================================
// services/email.service.js
// ============================================

import { Resend } from 'resend';
import config from '../config/env.js';
import logger from '../config/logger.js';

const resend = config.email.resendApiKey
    ? new Resend(config.email.resendApiKey)
    : null;

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetToken) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const resetUrl =
        `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
    // Development mode without Resend configuration
    if (!resend) {
        logger.warn(
            'Resend is not configured. Password reset email was not sent.'
        );

        logger.info('Password reset URL', {
            email,
            resetUrl,
        });

        return;
    }

    const { data, error } = await resend.emails.send({
        from: config.email.from,
        to: email,
        subject: 'Reset your JobSphere password',

        html: `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Reset your password</title>
                </head>

                <body style="
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                ">
                    <h2>Reset your password</h2>

                    <p>Hello,</p>

                    <p>
                        We received a request to reset your JobSphere password.
                    </p>

                    <p>
                        Click the button below to create a new password.
                    </p>

                    <p style="margin: 30px 0;">
                        <a
                            href="${resetUrl}"
                            style="
                                display: inline-block;
                                padding: 12px 24px;
                                background: #2563eb;
                                color: #ffffff;
                                text-decoration: none;
                                border-radius: 6px;
                            "
                        >
                            Reset Password
                        </a>
                    </p>

                    <p>
                        This password reset link will expire in
                        <strong>15 minutes</strong>.
                    </p>

                    <p>
                        If you did not request a password reset,
                        you can safely ignore this email.
                    </p>

                    <p>
                        Thanks,<br />
                        The JobSphere Team
                    </p>
                </body>
            </html>
        `,

        text: `
Reset your JobSphere password

We received a request to reset your password.

Use the following link to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request this password reset,
you can safely ignore this email.

The JobSphere Team
        `,
    });

    if (error) {
        logger.error('Failed to send password reset email', {
            email,
            error: error.message,
        });

        throw new Error('Failed to send password reset email');
    }

    logger.info('Password reset email sent successfully', {
        email,
        emailId: data?.id,
    });
};