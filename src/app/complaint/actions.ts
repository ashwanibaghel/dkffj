"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { sendTransactionalEmail } from "@/services/email/service";
import { getComplaintSubmittedTemplate } from "@/services/email/templates";

export async function submitComplaint(prevData: any, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Extract auth user if available (complaints can be public, anonymous, or logged-in)
  let userId: string | null = null;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    userId = user.id;
  }

  // Extract Form Fields
  const name = formData.get("name") as string;
  const fatherName = formData.get("fatherName") as string;
  const gender = formData.get("gender") as string;
  const country = (formData.get("country") as string) || "India";
  const mobile = formData.get("mobile") as string;
  const email = formData.get("email") as string || null;
  const address = formData.get("address") as string;
  const state = formData.get("state") as string;
  const district = formData.get("district") as string;
  const policeStation = formData.get("policeStation") as string;
  const details = formData.get("details") as string;

  // Validate fields
  if (!name || !fatherName || !mobile || !address || !state || !district || !policeStation || !details) {
    return { success: false, error: "Please fill in all mandatory fields." };
  }

  // Extract Attachments
  const attachments = formData.getAll("attachments") as File[];
  const uploadedFiles: { file_url: string; file_name: string; file_size: string }[] = [];

  try {
    // 1. Generate unique DKC complaint number
    const { data: complaintNo, error: rpcError } = await supabase.rpc("generate_next_number", {
      p_key: "complaint",
      p_prefix: "DKC"
    });

    if (rpcError || !complaintNo) {
      console.error("Failed to generate complaint sequence:", rpcError);
      throw new Error("Grievance registration sequence error.");
    }

    // 2. Insert complaint record first to get the UUID
    const { data: newComplaint, error: insertError } = await supabase
      .from("complaints")
      .insert({
        complaint_no: complaintNo,
        user_id: userId,
        name,
        father_name: fatherName,
        gender,
        country,
        mobile,
        email,
        address,
        state,
        district,
        police_station: policeStation,
        details,
        status: "SUBMITTED"
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Complaint insertion failed:", insertError);
      throw new Error(`Failed to save complaint details: ${insertError.message}`);
    }

    const complaintId = newComplaint.id;

    // 3. Process & upload attachments if present
    for (let i = 0; i < attachments.length; i++) {
      const file = attachments[i];
      if (file && file.size > 0) {
        const fileExt = file.name.split(".").pop();
        const safeName = `${complaintId}/attachment_${i}_${Date.now()}.${fileExt}`;
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // Upload to private 'complaints' bucket
        const { error: uploadError } = await supabase.storage
          .from("complaints")
          .upload(safeName, fileBuffer, { contentType: file.type, upsert: true });

        if (uploadError) {
          console.error(`Attachment ${i} upload failed:`, uploadError);
          continue; // Continue uploading other files even if one fails
        }

        const storagePath = `complaints/${safeName}`;
        const fileSizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";

        // Create database log for attachment
        const { error: attachDbErr } = await supabase
          .from("complaint_attachments")
          .insert({
            complaint_id: complaintId,
            file_url: storagePath,
            file_name: file.name,
            file_size: fileSizeStr
          });

        if (attachDbErr) {
          console.error("Failed to log attachment inside database:", attachDbErr);
        }
      }
    }

    // 4. Log status timeline transition
    await supabase.from("status_logs").insert({
      complaint_id: complaintId,
      from_status: "NONE",
      to_status: "SUBMITTED",
      remarks: "Grievance registered. Docket number generated."
    });

    // 5. Send transaction email if email was provided
    if (email) {
      const emailSubject = `Grievance Registered: Docket ${complaintNo} - DKFFJ`;
      const emailHtml = getComplaintSubmittedTemplate(name, complaintNo);
      await sendTransactionalEmail(email, emailSubject, emailHtml);
    }

    return {
      success: true,
      complaintNo,
      message: "Grievance registered successfully."
    };

  } catch (err: any) {
    console.error("Complaint submission pipeline error:", err);
    return { success: false, error: err.message || "An unexpected error occurred during submission." };
  }
}
