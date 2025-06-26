import toast from "react-hot-toast";

// This hook is deprecated - OTP is now sent directly with booking creation
export function usePatientConsent() {
  const requestPatientConsentOtp = () => {
    toast.error(
      "This function is deprecated. OTP is sent with booking creation."
    );
  };

  return {
    isRegistering: false,
    requestPatientConsentOtp,
  };
}
