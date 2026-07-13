export function getMembershipVerificationTemplate(otp: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
      <div style="background-color: #001C55; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; tracking-wide; font-family: serif;">DK Foundation of Freedom & Justice</h1>
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
      <div style="background-color: #001C55; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; tracking-wide; font-family: serif;">DKFFJ Academy</h1>
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
      <div style="background-color: #001C55; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-family: serif;">DK Foundation of Freedom & Justice</h1>
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
      <div style="background-color: #001C55; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-family: serif;">DK Foundation of Freedom & Justice</h1>
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
      <div style="background-color: #001C55; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-family: serif;">DKFFJ Academy</h1>
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
      <div style="background-color: #001C55; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-family: serif;">DKFFJ Academy</h1>
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
      <div style="background-color: #001C55; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-family: serif;">DK Foundation of Freedom & Justice</h1>
      </div>
      <div style="padding: 32px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #001C55; margin-top: 0; font-size: 20px;">Verify Contact for Appreciation Application</h2>
        <p style="font-size: 15px; line-height: 1.6;">A request has been initiated to verify your contact information for the Certificate of Appreciation Application. Please use the following One-Time Password (OTP) to complete your application verification:</p>
        
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
      <div style="background-color: #001C55; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-family: serif;">DK Foundation of Freedom & Justice</h1>
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
