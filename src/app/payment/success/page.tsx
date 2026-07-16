"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, ArrowRight, Home, Download, FileText, Printer, Check } from "lucide-react";

type Status = "verifying" | "success" | "failed" | "pending";

interface ReceiptDetails {
  customerName: string;
  fatherName: string;
  customerMobile: string;
  customerEmail: string;
  amount: number;
  date: string;
  gatewayTransactionId: string;
  ackOrEnrollmentNo: string;
  paymentType: string;
  description: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId") || "";

  const [status, setStatus] = useState<Status>("verifying");
  const [paymentType, setPaymentType] = useState<string>("");
  const [refId, setRefId] = useState<string>("");
  const [attempts, setAttempts] = useState(0);
  const [receiptDetails, setReceiptDetails] = useState<ReceiptDetails | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }

    let tries = 0;
    const MAX_TRIES = 12;
    const INTERVAL = 3000; // poll every 3 seconds

    const poll = async () => {
      try {
        const res = await fetch(`/api/phonepe/verify?orderId=${encodeURIComponent(orderId)}`);
        const data = await res.json();

        if (data.success && data.status === "COMPLETED") {
          setStatus("success");
          setRefId(orderId);
          if (data.details) {
            setReceiptDetails(data.details);
            setPaymentType(data.details.paymentType);
          } else {
            // Fallbacks if details not returned
            if (orderId.startsWith("MBR")) setPaymentType("membership");
            else if (orderId.startsWith("DKD") || orderId.startsWith("DON")) setPaymentType("donation");
            else if (orderId.startsWith("CRS")) setPaymentType("enrollment");
            else if (orderId.startsWith("APR")) setPaymentType("appreciation");
          }
          clearInterval(timer);
        } else if (data.status === "FAILED" || data.status === "PAYMENT_ERROR") {
          setStatus("failed");
          clearInterval(timer);
        } else {
          tries++;
          setAttempts(tries);
          if (tries >= MAX_TRIES) {
            setStatus("pending");
            clearInterval(timer);
          }
        }
      } catch {
        tries++;
        if (tries >= MAX_TRIES) {
          setStatus("failed");
          clearInterval(timer);
        }
      }
    };

    poll(); // immediate first check
    const timer = setInterval(poll, INTERVAL);
    return () => clearInterval(timer);
  }, [orderId]);

  const downloadPNG = async () => {
    if (!refId) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const element = document.getElementById("official-receipt");
      if (!element) return;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `Receipt_${refId}.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error("Error generating PNG:", err);
    }
  };

  const downloadPDF = async () => {
    if (!refId) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const element = document.getElementById("official-receipt");
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      
      // Calculate sizes for A4 page width = 210mm
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Receipt_${refId}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    }
  };

  const trackUrl =
    paymentType === "membership"
      ? `/track/membership?id=${refId}`
      : paymentType === "enrollment" || paymentType === "course"
      ? `/track/course?id=${refId}`
      : paymentType === "appreciation"
      ? `/track/appreciation?id=${refId}`
      : `/track`;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 md:p-12 font-sans">
      <div className="max-w-4xl w-full flex flex-col gap-8">
        
        {/* Status Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 md:p-8 text-center">
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Verifying Payment Status…</h2>
              <p className="text-xs text-slate-500">
                Please wait while we confirm your transaction with PhonePe. ({attempts}/12)
              </p>
            </div>
          )}

          {status === "failed" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Payment Failed</h2>
              <p className="text-xs text-slate-500 max-w-md">
                We couldn&apos;t verify your payment. If any amount was deducted, it will be refunded back to your account automatically within 3-5 business days.
              </p>
              <button
                onClick={() => router.back()}
                className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Go Back & Try Again
              </button>
            </div>
          )}

          {status === "pending" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Payment Verification Pending</h2>
              <p className="text-xs text-slate-500 max-w-md">
                Your transaction verification is taking longer than expected. Do not worry, we will process your application once the status updates. You can track it using tracking portal.
              </p>
              <Link
                href={trackUrl}
                className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Go to Tracking Portal
              </Link>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Payment Successful! 🎉</h2>
              <p className="text-xs text-slate-500 max-w-md">
                Your payment has been successfully verified. An official digital receipt is generated below and sent to your email.
              </p>

              {/* Download Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Download PDF Receipt
                </button>
                <button
                  onClick={downloadPNG}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition-all border border-slate-300 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Save as Image
                </button>
                <Link
                  href={trackUrl}
                  className="flex items-center gap-1.5 bg-[#C00000] hover:bg-[#990000] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  Track Application <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Official Receipt Block */}
        {status === "success" && receiptDetails && (
          <div className="flex justify-center w-full">
            {/* Outer Frame with print margins */}
            <div 
              id="official-receipt" 
              className="w-full max-w-[760px] bg-white border-8 border-double border-[#001C55] p-8 md:p-10 relative overflow-hidden font-serif select-none shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-left"
              style={{ minHeight: "950px" }}
            >
              
              {/* PAID Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] z-0 select-none">
                <div className="text-[130px] font-black border-[20px] border-green-700 text-green-700 px-10 py-5 rounded-3xl transform -rotate-12 tracking-widest font-sans">
                  PAID
                </div>
              </div>

              {/* Watermark Logo Center */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
                <img src="/logo.png" className="w-[300px] h-[300px] object-contain" alt="" />
              </div>

              {/* Receipt Content */}
              <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
                
                {/* 1. Header with Government/MCA Seal details */}
                <div className="flex flex-col items-center text-center pb-6 border-b-2 border-slate-200">
                  <div className="flex items-center gap-4 justify-center mb-4">
                    <img src="/logo.png" className="w-16 h-16 object-contain" alt="DKFFJ Logo" />
                    <div className="text-left font-serif">
                      <h1 className="text-xl md:text-2xl font-black text-[#001C55] tracking-wide uppercase leading-tight">
                        DK Foundation of Freedom & Justice
                      </h1>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans mt-0.5">
                        Incorporated under Section 8 of the Companies Act, 2013, Govt. of India
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                        CIN: U74999DL2018NPL334888 • Reg No: N-334888
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-[#001C55]/5 py-1.5 rounded-lg border border-[#001C55]/15 mt-1">
                    <span className="text-xs uppercase tracking-[0.2em] font-sans font-bold text-[#001C55]">
                      Official Payment Acknowledgement Receipt
                    </span>
                  </div>
                </div>

                {/* 2. Transaction Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                    <h3 className="text-[11px] font-bold text-[#001C55] uppercase tracking-wider">Receipt Information</h3>
                    <div className="text-xs space-y-1.5 text-slate-700">
                      <p><span className="font-semibold text-slate-500">Receipt No:</span> <span className="font-mono font-bold text-slate-800">{refId}</span></p>
                      <p><span className="font-semibold text-slate-500">Date & Time:</span> <span className="font-bold text-slate-800">{formatDate(receiptDetails.date)}</span></p>
                      <p><span className="font-semibold text-slate-500">Reference No:</span> <span className="font-mono font-bold text-slate-800">{receiptDetails.ackOrEnrollmentNo}</span></p>
                      <p>
                        <span className="font-semibold text-slate-500">Payment Status:</span> 
                        <span className="ml-1 inline-flex items-center gap-1 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-sans border border-green-200">
                          <Check className="w-3 h-3" /> Successful
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                    <h3 className="text-[11px] font-bold text-[#001C55] uppercase tracking-wider">Payment Details</h3>
                    <div className="text-xs space-y-1.5 text-slate-700">
                      <p><span className="font-semibold text-slate-500">Gateway Provider:</span> <span className="font-bold text-slate-800">PhonePe UPI</span></p>
                      <p><span className="font-semibold text-slate-500">Transaction ID:</span> <span className="font-mono font-bold text-slate-800 break-all">{receiptDetails.gatewayTransactionId}</span></p>
                      <p><span className="font-semibold text-slate-500">Currency Code:</span> <span className="font-bold text-slate-800">INR (₹)</span></p>
                      <p><span className="font-semibold text-slate-500">Amount Charged:</span> <span className="text-sm font-bold text-green-700 font-mono">₹{receiptDetails.amount.toLocaleString("en-IN")}.00</span></p>
                    </div>
                  </div>
                </div>

                {/* 3. Official Structured Receipt Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden font-sans mt-4">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#001C55] text-white font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3">S.No.</th>
                        <th className="p-3">Particulars / Head of Account</th>
                        <th className="p-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold">01</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800 uppercase">{receiptDetails.description}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Official registration & processing charges for DKFFJ membership/enrollment</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800">₹{receiptDetails.amount.toLocaleString("en-IN")}.00</td>
                      </tr>
                      {/* Subtotal row */}
                      <tr className="bg-slate-50/30">
                        <td colSpan={2} className="p-3 font-bold text-right text-[#001C55]">Subtotal:</td>
                        <td className="p-3 font-mono font-bold text-slate-800">₹{receiptDetails.amount.toLocaleString("en-IN")}.00</td>
                      </tr>
                      {/* Taxes row */}
                      <tr>
                        <td colSpan={2} className="p-3 text-slate-500 text-right">CGST (0%) + SGST (0%):</td>
                        <td className="p-3 font-mono text-slate-400">₹0.00</td>
                      </tr>
                      {/* Grand Total row */}
                      <tr className="bg-[#001C55]/5 border-t-2 border-[#001C55]/20 font-bold">
                        <td colSpan={2} className="p-3 text-right text-[#001C55] text-sm uppercase">Total Amount Paid (INR):</td>
                        <td className="p-3 font-mono text-[#001C55] text-sm font-black">₹{receiptDetails.amount.toLocaleString("en-IN")}.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4. Payee Details Section */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 font-sans space-y-3">
                  <h3 className="text-[11px] font-bold text-[#001C55] uppercase tracking-wider border-b pb-1">Candidate / Payee Credentials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                    <div className="space-y-1.5">
                      <p><span className="font-semibold text-slate-500">Applicant Name:</span> <strong className="text-slate-800 uppercase">{receiptDetails.customerName}</strong></p>
                      <p><span className="font-semibold text-slate-500">Father&apos;s Name:</span> <strong className="text-slate-800 uppercase">{receiptDetails.fatherName}</strong></p>
                    </div>
                    <div className="space-y-1.5">
                      <p><span className="font-semibold text-slate-500">Contact Number:</span> <span className="font-mono text-slate-800">{receiptDetails.customerMobile}</span></p>
                      <p><span className="font-semibold text-slate-500">Registered Email:</span> <span className="font-mono text-slate-800">{receiptDetails.customerEmail}</span></p>
                    </div>
                  </div>
                </div>

                {/* 5. Stamp, Seal & Authenticity Declarations */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-200/80 gap-6 font-sans">
                  <div className="max-w-[400px] text-[10px] text-slate-400 leading-relaxed font-sans text-center md:text-left">
                    <p className="font-semibold text-slate-500">Electronic Verification Audit:</p>
                    <p>This document is a computer-generated official payment receipt issued under the authority of DK Foundation of Freedom & Justice. No signature is legally required for digital validation. System transaction references have been recorded securely in the audit trails.</p>
                  </div>
                  
                  {/* Official Blue Stamp and Signature */}
                  <div className="flex items-center gap-4">
                    {/* Stamp */}
                    <div className="w-20 h-20 rounded-full border-4 border-dashed border-[#1565C0]/40 flex flex-col items-center justify-center p-1 text-center transform -rotate-6 scale-90 select-none">
                      <span className="text-[6px] font-bold text-[#1565C0]/60 uppercase tracking-widest leading-none">DK FOUNDATION</span>
                      <span className="text-[9px] font-black text-[#1565C0]/80 leading-none my-0.5">OFFICIAL</span>
                      <span className="text-[7px] font-bold text-[#1565C0]/70 uppercase leading-none">SEAL</span>
                    </div>
                    
                    {/* Signature block */}
                    <div className="text-center font-sans">
                      <div className="h-10 flex items-center justify-center">
                        <span className="font-serif italic text-slate-500 text-lg select-none opacity-80">Ashwani Baghel</span>
                      </div>
                      <div className="border-t border-slate-300 w-36 pt-1 text-center">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Authorized Officer</p>
                        <p className="text-[8px] text-slate-400">DK Foundation of Freedom & Justice</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1565C0]" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
