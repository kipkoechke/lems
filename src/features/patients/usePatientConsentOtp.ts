// import {
//   setGeneratedOtp,
//   setOtpSent,
//   setShowOTP,
// } from "@/context/workflowSlice";
// import { useAppDispatch } from "@/hooks/hooks";
// import toast from "react-hot-toast";
// import { usePatientConsent } from "./usePatientConsent";

// export function usePatientConsentOtp() {
//   const { requestPatientConsentOtp } = usePatientConsent();
//   const dispatch = useAppDispatch();

//   const handleSendOTP = (bookingId: string) => {
//     console.log("handleSendOTP called with bookingId:", bookingId);

//     if (!bookingId) {
//       toast.error("Booking information is missing.");
//       return;
//     }

//     // Set otpSent to true immediately to prevent multiple calls
//     console.log("Setting otpSent to true");
//     dispatch(setOtpSent(true));

//     requestPatientConsentOtp(
//       { booking_id: bookingId },
//       {
//         onSuccess: (data) => {
//           console.log("OTP request successful:", data);

//           if (data.otp_code) {
//             dispatch(setGeneratedOtp(data.otp_code));
//             toast.success(`OTP Code: ${data.otp_code}`);

//             // Set showOTP to true after a short delay
//             console.log("Setting showOTP to true");
//             setTimeout(() => {
//               dispatch(setShowOTP(true));
//             }, 1000);
//           } else {
//             console.error("No OTP code in response");
//             toast.error("No OTP code returned from server.");
//             // Reset otpSent if no OTP was received
//             dispatch(setOtpSent(false));
//           }
//         },
//         onError: (error) => {
//           console.error("OTP request failed:", error);
//           toast.error("Failed to send OTP. Please try again.");
//           // Reset otpSent on error
//           dispatch(setOtpSent(false));
//         },
//       }
//     );
//   };

//   return { handleSendOTP };
// }
