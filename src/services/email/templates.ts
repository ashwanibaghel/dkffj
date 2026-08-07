export function getMembershipVerificationTemplate(otp: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
</div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #001C55; margin-top: 0; font-size: 20px;">Verify Your Mobile / Email Connection</h2>
        <p style="font-size: 15px; line-height: 1.6;">A request has been initiated to verify your contact information for DKFFJ Membership registration. Please use the following One-Time Password (OTP) to complete your application:</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #C00000; padding: 12px 28px; background-color: #fef2f2; border: 1px dashed #f87171; border-radius: 8px; display: inline-block;">${otp}</span>
        </div>
        
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">This OTP is valid for 10 minutes. If you did not initiate this request, you can safely ignore this email.</p>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
      </div>
    </div>
  `;
}

export function getCourseVerificationTemplate(otp: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
</div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #001C55; margin-top: 0; font-size: 20px;">Verify Your Email Address</h2>
        <p style="font-size: 15px; line-height: 1.6;">A request has been initiated to verify your email address for DKFFJ Academy course registration. Please use the following One-Time Password (OTP) to verify your email and complete your enrollment:</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #C00000; padding: 12px 28px; background-color: #fef2f2; border: 1px dashed #f87171; border-radius: 8px; display: inline-block;">${otp}</span>
        </div>
        
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">This OTP is valid for 10 minutes. If you did not initiate this request, you can safely ignore this email.</p>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
      </div>
    </div>
  `;
}

export function getMembershipReceiptTemplate(name: string, ackNo: string, amount: number): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
</div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #001C55; margin-top: 0; font-size: 20px;">Membership Application Received</h2>
        <p style="font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">We have successfully received your membership enrollment application and registration fee payment of <strong>INR ${amount}</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #001C55; font-size: 15px;">Application Summary</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Acknowledgement No:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #0f172a; text-align: right;">${ackNo}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Application Status:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #d97706; text-align: right;">PENDING REVIEW</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Payment Amount:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #C00000; text-align: right;">INR ${amount}.00</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6;">Your application is currently under review by our executive board. You will be notified via email once the review is completed and your permanent membership ID number is generated.</p>
        
        <div style="margin-top: 32px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track?type=membership&id=${ackNo}" style="background-color: #001C55; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">Track Application Status</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
      </div>
    </div>
  `;
}

export function getComplaintSubmittedTemplate(name: string, complaintNo: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
</div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #C00000; margin-top: 0; font-size: 20px;">Grievance Filed Successfully</h2>
        <p style="font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">Thank you for reaching out to the DK Foundation. Your grievance has been registered in our portal. Our legal assistance and human rights department will look into the details shortly.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #001C55; font-size: 15px;">Grievance Details</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Grievance Docket No:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #C00000; text-align: right;">${complaintNo}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Current Status:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #2563eb; text-align: right;">SUBMITTED</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6;">Please save this docket number to track the status of your complaint online. We stand committed to ensuring freedom, justice, and human rights for all citizens.</p>
        
        <div style="margin-top: 32px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track/complaint?id=${complaintNo}" style="background-color: #C00000; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">Track Complaint Status</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
      </div>
    </div>
  `;
}

export function getCourseRegistrationReceiptTemplate(name: string, courseTitle: string, enrollmentNo: string, amount: number): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
</div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #001C55; margin-top: 0; font-size: 20px;">Course Enrollment Successful</h2>
        <p style="font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">You have successfully enrolled in the course: <strong>${courseTitle}</strong>. We have processed your registration and payment of <strong>INR ${amount}</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #001C55; font-size: 15px;">Enrollment Summary</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Enrollment/Reg No:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #0f172a; text-align: right;">${enrollmentNo}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Course Title:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #001C55; text-align: right;">${courseTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Payment Amount:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #C00000; text-align: right;">INR ${amount}.00</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6;">Your access key and class instructions will be shared shortly by the Academy coordinator. If you have any queries, feel free to reply to this email.</p>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
      </div>
    </div>
  `;
}

export function getCertificateIssuedTemplate(name: string, courseTitle: string, certNo: string, verifyUrl: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
</div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #C00000; margin-top: 0; font-size: 20px;">Congratulations! Your Certificate is Ready</h2>
        <p style="font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">We are pleased to inform you that you have successfully completed all the requirements for <strong>${courseTitle}</strong>. Your official certificate has been issued by the DK Foundation Board.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Certificate No:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #C00000; text-align: right;">${certNo}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Issue Date:</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a; text-align: right;">${new Date().toLocaleDateString('en-IN')}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6;">You can download a digital copy of your certificate or verify its authenticity directly by scanning the QR code on the certificate document or clicking the link below:</p>
        
        <div style="margin-top: 32px; text-align: center;">
          <a href="${verifyUrl}" style="background-color: #001C55; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">Verify & Download Certificate</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
      </div>
    </div>
  `;
}

export function getAppreciationVerificationTemplate(otp: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
<img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
<h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
<div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
<div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
</div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #001C55; margin-top: 0; font-size: 20px;">Verify Contact for Appreciation Application</h2>
        <p style="font-size: 15px; line-height: 1.6;">A request has been initiated to verify your contact information for the Certificate of Appreciation Application. Please use the following One-Time Password (OTP) to complete your application verification:</p>
        
        <p style="font-size: 15px; line-height: 1.6;">A request has been initiated to verify your email address for DKFFJ Academy course registration. Please use the following One-Time Password (OTP) to verify your email and complete your enrollment:</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #C00000; padding: 12px 28px; background-color: #fef2f2; border: 1px dashed #f87171; border-radius: 8px; display: inline-block;">${otp}</span>
        </div>
        
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">This OTP is valid for 10 minutes. If you did not initiate this request, you can safely ignore this email.</p>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
      </div>
    </div>
  `;
}

export function getAppreciationReceiptTemplate(name: string, ackNo: string, amount: number): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
        <img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
        <div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
        <div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
      </div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #001C55; margin-top: 0; font-size: 20px;">Appreciation Application Received</h2>
        <p style="font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">We have successfully received your application for a Certificate of Appreciation and fee payment of <strong>INR ${amount}</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #001C55; font-size: 15px;">Application Summary</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Acknowledgement No:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #0f172a; text-align: right;">${ackNo}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Application Status:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #d97706; text-align: right;">PENDING REVIEW</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Payment Amount:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #C00000; text-align: right;">INR ${amount}.00</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6;">Your application is currently under review by our executive board. You will be notified via email once the review is completed and your certificate has been approved and issued.</p>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
      </div>
    </div>
  `;
}

export function getAffiliationReceiptTemplate(
  name: string,
  instituteName: string,
  draftNo: string,
  officialNo: string,
  amount: number,
  transactionId: string,
  receiptNo: string,
  date: string
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dkffj.org";
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="background-color: #1E60B4; padding: 24px; text-align: center;">
        <img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
        <div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
        <div style="color: #e0f2fe; font-size: 11px; margin-top: 6px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; opacity: 0.9;">Regd By Ministry of Corporate Affairs Govt. of India</div>
      </div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #001C55; margin-top: 0; font-size: 20px;">Affiliation Payment Received & Application Submitted</h2>
        <p style="font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">Thank you for submitting your institute affiliation application for <strong>${instituteName}</strong>. We have verified your payment of <strong>INR ${amount}.00</strong>.</p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #001C55; font-size: 15px;">Application & Payment Details</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Official Application No:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #001C55; text-align: right;">${officialNo}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Draft Reference:</td>
              <td style="padding: 6px 0; font-weight: 500; color: #64748b; text-align: right;">${draftNo}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Receipt Number:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #0f172a; text-align: right;">${receiptNo}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Transaction ID:</td>
              <td style="padding: 6px 0; font-weight: 500; color: #0f172a; text-align: right;">${transactionId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Fee Paid:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #166534; text-align: right;">INR ${amount}.00</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Status:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #2563eb; text-align: right;">SUBMITTED FOR REVIEW</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-bottom: 24px; font-size: 12px; color: #166534;">
          <strong>Refund Guarantee:</strong> In case the affiliation application is rejected by DKFFJ, the complete processing fee of INR ${amount} will be refunded to your original payment method automatically.
        </div>
        
        <p style="font-size: 15px; line-height: 1.6;">Your application is now under review by our executive board. E-receipt PDF is attached to this email.</p>
        
        <div style="margin-top: 32px; text-align: center;">
          <a href="${appUrl}/affiliation/track?appNo=${officialNo}" style="background-color: #001C55; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">Track Application Status</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
      </div>
    </div>
  `;
}

export function getAffiliationApprovalTemplate(
  name: string,
  instituteName: string,
  applicationNo: string,
  affiliationNo: string,
  validFrom: string,
  validTo: string,
  verificationToken: string
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dkffj.org";
  const verifyUrl = `${appUrl}/affiliation/verify/${verificationToken}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;

  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="background-color: #166534; padding: 24px; text-align: center;">
        <img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
        <div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
      </div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #166534; margin-top: 0; font-size: 20px;">🏆 Congratulations! Institute Affiliation Approved</h2>
        <p style="font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">We are pleased to inform you that your application for institute affiliation of <strong>${instituteName}</strong> has been <strong>APPROVED</strong> by the DK Foundation Governing Board.</p>
        
        <div style="background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #166534; font-size: 15px;">Affiliation Details</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Affiliation Number:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #166534; font-size: 16px; text-align: right;">${affiliationNo}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Application No:</td>
              <td style="padding: 6px 0; font-weight: 500; color: #0f172a; text-align: right;">${applicationNo}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Valid From:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #0f172a; text-align: right;">${validFrom}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Valid Until:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #0f172a; text-align: right;">${validTo}</td>
            </tr>
          </table>
        </div>

        <!-- Verification QR Code -->
        <div style="text-align: center; margin: 24px 0; padding: 16px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b; margin-top: 0; font-weight: bold;">SCAN TO VERIFY AFFILIATION</p>
          <img src="${qrUrl}" alt="Verification QR" style="width: 130px; height: 130px; border: 1px solid #cbd5e1; padding: 4px; background-color: #ffffff; border-radius: 6px;" />
        </div>
        
        <p style="font-size: 15px; line-height: 1.6;">Your official Certificate of Affiliation PDF is attached to this email. You can also verify and download your certificate anytime online.</p>
        
        <div style="margin-top: 28px; text-align: center;">
          <a href="${verifyUrl}" style="background-color: #166534; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">Verify Affiliation Online</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
      </div>
    </div>
  `;
}

export function getAffiliationRejectionTemplate(
  name: string,
  instituteName: string,
  applicationNo: string,
  reason: string,
  refundInitiated: boolean,
  refundId?: string | null
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dkffj.org";
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="background-color: #991b1b; padding: 24px; text-align: center;">
        <img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
        <div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
      </div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #991b1b; margin-top: 0; font-size: 20px;">Application Update — Affiliation Not Approved</h2>
        <p style="font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">We regret to inform you that your affiliation application for <strong>${instituteName}</strong> (Application No: <strong>${applicationNo}</strong>) was not approved upon review.</p>
        
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #991b1b; font-size: 14px;">Reason for Rejection</h3>
          <p style="font-size: 14px; color: #7f1d1d; margin-bottom: 0; line-height: 1.5;">${reason}</p>
        </div>

        ${refundInitiated ? `
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #166534; font-size: 14px;">💚 Fee Refund Initiated</h3>
          <p style="font-size: 14px; color: #14532d; line-height: 1.5; margin-bottom: 8px;">
            A full refund of <strong>INR 2,100.00</strong> has been initiated to your original payment method.
          </p>
          ${refundId ? `<p style="font-size: 12px; color: #15803d; margin: 0; font-family: monospace;">Refund Reference ID: <strong>${refundId}</strong></p>` : ""}
          <p style="font-size: 12px; color: #64748b; margin-top: 8px; margin-bottom: 0;">
            Refund has been initiated. The credit timeline depends on your bank/payment provider.
          </p>
        </div>
        ` : ""}
        
        <p style="font-size: 14px; line-height: 1.6; color: #64748b;">If you believe this decision was made in error or wish to re-apply with corrected documents, please contact our support team at info@dkffj.org.</p>
        
        <div style="margin-top: 28px; text-align: center;">
          <a href="${appUrl}/affiliation/track?appNo=${applicationNo}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">View Details Online</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
      </div>
    </div>
  `;
}

export function getAffiliationRefundTemplate(
  name: string,
  instituteName: string,
  applicationNo: string,
  refundId: string,
  amount: number,
  refundedAt: string
): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dkffj.org";
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="background-color: #166534; padding: 24px; text-align: center;">
        <img src="https://dkffj.vercel.app/logo.png" alt="DKFFJ Logo" style="width: 70px; height: 70px; margin-bottom: 12px; display: inline-block;" />
        <h1 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: bold; letter-spacing: 0.5px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.3; text-transform: uppercase;">DK FOUNDATION OF FREEDOM AND JUSTICE</h1>
        <div style="color: #ffffff; font-size: 13px; font-weight: 600; letter-spacing: 1px; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-transform: uppercase;">HUMAN RIGHTS PROTECTION</div>
      </div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #166534; margin-top: 0; font-size: 20px;">💚 Refund Completed Successfully</h2>
        <p style="font-size: 15px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6;">This is to confirm that the affiliation fee refund of <strong>INR ${amount}.00</strong> for <strong>${instituteName}</strong> (Application No: <strong>${applicationNo}</strong>) has been completed.</p>
        
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #166534; font-size: 15px;">Refund Summary</h3>
          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Refunded Amount:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #166534; font-size: 16px; text-align: right;">INR ${amount}.00</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Refund Reference:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #0f172a; text-align: right; font-family: monospace;">${refundId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Completion Date:</td>
              <td style="padding: 6px 0; font-weight: 500; color: #0f172a; text-align: right;">${refundedAt}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #64748b;">The amount has been credited to your original payment method. Thank you for your patience.</p>
        
        <div style="margin-top: 28px; text-align: center;">
          <a href="${appUrl}/affiliation/track?appNo=${applicationNo}" style="background-color: #166534; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">Track Application Status</a>
        </div>
      </div>
      <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        &copy; ${new Date().getFullYear()} DK Foundation of Freedom and Justice. All Rights Reserved.
      </div>
    </div>
  `;
}

