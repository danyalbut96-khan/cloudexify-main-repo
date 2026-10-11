/**
 * CloudExify Pipeline Email Notification Service
 * Sends transactional HTML emails for every pipeline milestone.
 */

interface BaseEmailOptions {
  to: string;
  fullName: string;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'CloudExify Admissions <admissions@cloudexify.com>';

  console.log(`[EMAIL DISPATCH] To: ${to} | Subject: ${subject}`);

  if (!apiKey) {
    console.log(`[EMAIL SIMULATED (No RESEND_API_KEY configured)]: To: ${to} | Subject: ${subject}`);
    return true;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`[EMAIL ERROR] ${res.status}: ${err}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[EMAIL SEND EXCEPTION]:', error);
    return false;
  }
}

function emailWrapper(title: string, contentHtml: string): string {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .content { padding: 32px 24px; }
        .badge { display: inline-block; background: #eff6ff; color: #1d4ed8; font-weight: 700; font-size: 13px; padding: 4px 12px; border-radius: 999px; margin-bottom: 16px; }
        .credentials-box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 18px; margin: 24px 0; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 10px; margin-top: 16px; text-align: center; }
        .footer { padding: 20px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CloudExify Internship Program</h1>
        </div>
        <div class="content">
          ${contentHtml}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} CloudExify. All rights reserved.<br>This is an automated system notification regarding your application.</p>
        </div>
      </div>
    </body>
  </html>
  `;
}

// 1. Registration Received & Ready for AI Interview
export async function sendRegistrationSuccessEmail({
  to,
  fullName,
  registrationNumber,
  domain,
  batchName,
  portalUrl = 'http://localhost:3001/login',
}: BaseEmailOptions & {
  registrationNumber: string;
  domain: string;
  batchName: string;
  portalUrl?: string;
}) {
  const html = emailWrapper(
    'Registration Confirmed',
    `
    <span class="badge">Application Received</span>
    <h2 style="margin-top:0; color:#0f172a;">Welcome, ${fullName}!</h2>
    <p>Your registration for the <strong>${domain}</strong> track in <strong>${batchName}</strong> has been successfully accepted.</p>
    
    <div class="credentials-box">
      <p style="margin:0 0 8px 0; font-size:12px; color:#475569; font-weight:bold; text-transform:uppercase;">Your Login Credentials</p>
      <p style="margin:4px 0;"><strong>Registered Email:</strong> ${to}</p>
      <p style="margin:4px 0;"><strong>Registration Number:</strong> <span style="font-family:monospace; color:#2563eb; font-weight:bold; font-size:16px;">${registrationNumber}</span></p>
    </div>

    <h3 style="color:#0f172a; margin-top:24px;">Next Step: Mandatory AI Text Interview</h3>
    <p>To proceed with your application, you must log in to the Intern Portal and complete your short, timed AI Text Interview. You will answer between 2 to 5 questions based on your domain and level.</p>
    
    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="btn">Log In to Take Interview</a>
    </div>

    <p style="font-size:13px; color:#64748b;">Important: Please complete your interview within the allotted time. Switching tabs or leaving the screen will automatically flag your session.</p>
    `
  );

  return sendEmail({
    to,
    subject: `Application Confirmed: Your Registration Number & AI Interview (${registrationNumber})`,
    html,
  });
}

// 2. Waitlisted Email
export async function sendWaitlistEmail({
  to,
  fullName,
  domain,
  batchName,
}: BaseEmailOptions & { domain: string; batchName: string }) {
  const html = emailWrapper(
    'Waitlist Confirmation',
    `
    <span class="badge" style="background:#fef3c7; color:#b45309;">Domain Full - Waitlisted</span>
    <h2 style="margin-top:0; color:#0f172a;">Hello ${fullName},</h2>
    <p>Thank you for applying for the <strong>${domain}</strong> track in <strong>${batchName}</strong>.</p>
    <p>All regular seats for this domain are currently filled. We have automatically placed you on the <strong>Official Waitlist</strong>.</p>
    <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:12px; padding:16px; margin:20px 0; color:#92400e;">
      <strong>What happens next?</strong><br>
      As soon as a seat opens up (e.g., if a candidate declines, fails payment deadline, or is released), our system automatically promotes the next waitlisted candidate and emails you immediately.
    </div>
    <p style="font-size:13px; color:#64748b;">No further action is required from your side at this time. We will notify you via this email address.</p>
    `
  );

  return sendEmail({
    to,
    subject: `Waitlist Status: ${domain} - CloudExify Internship`,
    html,
  });
}

// 3. Waitlist Promoted Email
export async function sendWaitlistPromotedEmail({
  to,
  fullName,
  registrationNumber,
  domain,
  batchName,
  portalUrl = 'http://localhost:3001/login',
}: BaseEmailOptions & {
  registrationNumber: string;
  domain: string;
  batchName: string;
  portalUrl?: string;
}) {
  const html = emailWrapper(
    'Seat Available!',
    `
    <span class="badge" style="background:#dcfce7; color:#15803d;">Good News - Seat Opened!</span>
    <h2 style="margin-top:0; color:#0f172a;">Congratulations ${fullName}!</h2>
    <p>A seat has just become available for you in the <strong>${domain}</strong> internship track (${batchName}).</p>
    <p>Your status has been upgraded from Waitlisted to Active Candidate.</p>
    
    <div class="credentials-box">
      <p style="margin:0 0 8px 0; font-size:12px; color:#475569; font-weight:bold; text-transform:uppercase;">Your Login Credentials</p>
      <p style="margin:4px 0;"><strong>Registered Email:</strong> ${to}</p>
      <p style="margin:4px 0;"><strong>Registration Number:</strong> <span style="font-family:monospace; color:#2563eb; font-weight:bold; font-size:16px;">${registrationNumber}</span></p>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="btn">Log In and Start Interview</a>
    </div>
    `
  );

  return sendEmail({
    to,
    subject: `Seat Opened! Start Your AI Interview - CloudExify Internship (${registrationNumber})`,
    html,
  });
}

// 4. Shortlisted & Payment Instructions Email
export async function sendShortlistedEmail({
  to,
  fullName,
  batchName,
  paymentDeadline,
  amount = 'Rs. 2,500',
  accountTitle = 'CloudExify Payments',
  accountNumber = '0300-1234567 (JazzCash / Easypaisa)',
  portalUrl = 'http://localhost:3001/login',
}: BaseEmailOptions & {
  batchName: string;
  paymentDeadline: string;
  amount?: string;
  accountTitle?: string;
  accountNumber?: string;
  portalUrl?: string;
}) {
  const html = emailWrapper(
    'Application Shortlisted',
    `
    <span class="badge" style="background:#dcfce7; color:#15803d;">Candidate Shortlisted</span>
    <h2 style="margin-top:0; color:#0f172a;">Congratulations, ${fullName}!</h2>
    <p>Following your AI interview and mentor evaluation, you have been <strong>Shortlisted</strong> for <strong>${batchName}</strong>.</p>
    <p>To confirm and secure your seat, please complete the verification fee payment before your deadline:</p>
    
    <div style="background:#f8fafc; border:2px dashed #3b82f6; border-radius:12px; padding:20px; margin:20px 0;">
      <p style="margin:0 0 10px 0; font-size:14px; font-weight:bold; color:#1e40af;">Payment Details:</p>
      <p style="margin:4px 0;"><strong>Amount:</strong> <span style="font-size:18px; font-weight:bold; color:#0f172a;">${amount}</span></p>
      <p style="margin:4px 0;"><strong>Account Title:</strong> ${accountTitle}</p>
      <p style="margin:4px 0;"><strong>Account / Mobile:</strong> ${accountNumber}</p>
      <p style="margin:8px 0 0 0; color:#dc2626; font-weight:bold;">Deadline: ${paymentDeadline}</p>
    </div>

    <p>After transferring, please log in to your portal, enter your Transaction ID, and upload the receipt screenshot.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="btn">Submit Payment Verification</a>
    </div>

    <p style="font-size:12px; color:#dc2626; font-weight:bold;">Note: If payment is not submitted before the deadline, your seat will be automatically released to the waitlist.</p>
    `
  );

  return sendEmail({
    to,
    subject: `Shortlisted! Next Steps & Seat Confirmation - ${batchName}`,
    html,
  });
}
// 5. Rejection Email
export async function sendRejectionEmail({
  to,
  fullName,
  batchName,
  reason = 'After careful review of your interview responses, our team has decided not to proceed with your application for this batch.',
}: BaseEmailOptions & {
  batchName: string;
  reason?: string;
}) {
  const html = emailWrapper(
    'Application Status',
    `
    <span class="badge" style="background:#fee2e2; color:#991b1b;">Application Not Selected</span>
    <h2 style="margin-top:0; color:#0f172a;">Dear ${fullName},</h2>
    <p>Thank you for taking the time to complete your AI interview for <strong>${batchName}</strong>.</p>
    <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:16px; margin:20px 0; color:#991b1b;">
      <p style="margin:0 0 8px 0; font-weight:bold;">Evaluation Outcome</p>
      <p style="margin:0;">${reason}</p>
    </div>
    <p>Due to high competition and limited domain seats, we are unable to offer you an internship position at this time.</p>
    <p>We encourage you to continue enhancing your skills and welcome you to apply again for our upcoming batches.</p>
    `
  );

  return sendEmail({
    to,
    subject: `Application Update: ${batchName} - CloudExify Internship`,
    html,
  });
}

// 6. Final Approval & Portal Unlock Email
export async function sendApprovalEmail({
  to,
  fullName,
  batchName,
  domain,
  registrationNumber,
  portalUrl = 'http://localhost:3001/login',
}: BaseEmailOptions & {
  batchName: string;
  domain: string;
  registrationNumber: string;
  portalUrl?: string;
}) {
  const html = emailWrapper(
    'Official Acceptance',
    `
    <span class="badge" style="background:#dcfce7; color:#15803d;">Application Approved</span>
    <h2 style="margin-top:0; color:#0f172a;">Welcome Aboard, ${fullName}! 🎉</h2>
    <p>Your payment verification has succeeded, and your internship seat in <strong>${batchName}</strong> (${domain}) is officially confirmed!</p>
    
    <div class="credentials-box">
      <p style="margin:0 0 8px 0; font-size:12px; color:#475569; font-weight:bold; text-transform:uppercase;">Internship Credentials</p>
      <p style="margin:4px 0;"><strong>Intern Name:</strong> ${fullName}</p>
      <p style="margin:4px 0;"><strong>Registration Number:</strong> <span style="font-family:monospace; color:#2563eb; font-weight:bold; font-size:16px;">${registrationNumber}</span></p>
      <p style="margin:4px 0;"><strong>Track:</strong> ${domain}</p>
      <p style="margin:4px 0;"><strong>Batch:</strong> ${batchName}</p>
    </div>

    <p>Your student dashboard is now fully unlocked. You have immediate access to your orientation documents, project repositories, weekly milestones, and mentor office hours.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="btn">Enter Your Intern Dashboard</a>
    </div>

    <p style="font-size:13px; color:#64748b;">We look forward to seeing your outstanding contributions throughout the program.</p>
    `
  );

  return sendEmail({
    to,
    subject: `Official Acceptance: Welcome to CloudExify Internship (${batchName})!`,
    html,
  });
}

// 7. Retry Granted Email
export async function sendRetryGrantedEmail({
  to,
  fullName,
  batchName,
  portalUrl = 'http://localhost:3001/login',
}: BaseEmailOptions & {
  batchName: string;
  portalUrl?: string;
}) {
  const html = emailWrapper(
    'Interview Retry Granted',
    `
    <span class="badge" style="background:#e0e7ff; color:#3730a3;">Interview Reset</span>
    <h2 style="margin-top:0; color:#0f172a;">Hello ${fullName},</h2>
    <p>An administrator has reviewed your application for <strong>${batchName}</strong> and has granted you a <strong>one-time retry</strong> for your AI Interview.</p>
    <p>Please log in to your portal when you have a stable internet connection and an uninterrupted environment.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="btn">Log In and Retake Interview</a>
    </div>

    <p style="font-size:13px; color:#64748b;">Reminder: Please remain in full screen and do not switch browser tabs during the test.</p>
    `
  );

  return sendEmail({
    to,
    subject: `Interview Reset: One-Time Retry Granted - ${batchName}`,
    html,
  });
}

// 8. Technical Interview Invitation Email (Call for Interview)
export async function sendInterviewInvitationEmail({
  to,
  fullName,
  domain,
  registrationNumber,
  batchName = 'CloudExify Internship',
  portalUrl = 'http://localhost:3001/login',
}: BaseEmailOptions & {
  domain: string;
  registrationNumber: string;
  batchName?: string;
  portalUrl?: string;
}) {
  const html = emailWrapper(
    'Technical Interview Call',
    `
    <span class="badge" style="background:#e0e7ff; color:#3730a3;">Interview Invitation</span>
    <h2 style="margin-top:0; color:#0f172a;">Hello ${fullName},</h2>
    <p>Great news! Your application for the <strong>${domain}</strong> track in <strong>${batchName}</strong> has passed preliminary screening, and you are officially <strong>called for your Technical Interview</strong>.</p>
    
    <div class="credentials-box">
      <p style="margin:0 0 8px 0; font-size:12px; color:#475569; font-weight:bold; text-transform:uppercase;">Interview Details</p>
      <p style="margin:4px 0;"><strong>Candidate:</strong> ${fullName}</p>
      <p style="margin:4px 0;"><strong>Registration Number:</strong> <span style="font-family:monospace; color:#2563eb; font-weight:bold; font-size:16px;">${registrationNumber}</span></p>
      <p style="margin:4px 0;"><strong>Track:</strong> ${domain}</p>
      <p style="margin:4px 0;"><strong>Format:</strong> Timed Technical Assessment (Browser-based)</p>
    </div>

    <p>Please log in to your portal using your registration number to start your interview. Make sure you are using a desktop or laptop browser in a quiet environment.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${portalUrl}" class="btn">Log In & Start Technical Interview</a>
    </div>

    <p style="font-size:13px; color:#64748b;">Important: Once started, the assessment runs on a strict timer. Do not switch tabs or exit fullscreen.</p>
    `
  );

  return sendEmail({
    to,
    subject: `Invitation: Take Your Technical Interview - ${domain} (${registrationNumber})`,
    html,
  });
}
