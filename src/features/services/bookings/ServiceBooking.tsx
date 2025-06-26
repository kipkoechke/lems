// "use client";

// import { goToPreviousStep } from "@/context/workflowSlice";
// import { useAppSelector } from "@/hooks/hooks";
// import { ServiceBookingForm } from "@/services/apiBooking";
// import React from "react";
// import { useForm } from "react-hook-form";
// import StatusCard from "../../../components/StatusCard";
// import { useCreateBooking } from "./useCreateBooking";

// const ServiceBooking: React.FC = () => {
//   const {
//     selectedService,
//     patient,
//     selectedEquipment,
//     selectedFacility,
//     selectedPaymentMode,
//   } = useAppSelector((store) => store.workflow);

//   const { createBooking, isCreating } = useCreateBooking();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ServiceBookingForm>();

//   // Get current date for min date value
//   const today = new Date().toISOString().split("T")[0];

//   const onSubmit = (data: ServiceBookingForm) => {
//     if (
//       !selectedService ||
//       !patient ||
//       !selectedEquipment ||
//       !selectedFacility ||
//       !selectedPaymentMode
//     ) {
//       return;
//     }

//     const bookingData: ServiceBookingForm = {
//       patient_id: patient.id,
//       service_id: selectedService.serviceId,
//       equipment_id: selectedEquipment.equipmentId,
//       facility_id: selectedFacility.id,
//       payment_mode_id: data.payment_mode_id,
//       booking_date: new Date(data.booking_date),
//       status: "pending",
//       notes: data.notes || "",
//       cost: selectedService.shaRate,
//     };
//     console.log("Booking Data:", bookingData);

//     createBooking(bookingData);
//   };

//   const handlePreviousStep = () => {
//     return goToPreviousStep();
//   };

//   if (!selectedService) {
//     return (
//       <div className="max-w-2xl mx-auto">
//         <StatusCard
//           title="No Service Selected"
//           status="error"
//           message="No diagnostic service has been selected."
//           details="Please go back and select a service to continue."
//         />
//         <div className="mt-4">
//           <button
//             onClick={handlePreviousStep}
//             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             Back to Service Selection
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-2xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-2xl font-bold">Service Booking</h2>
//         <div>
//           <span className="text-gray-600 mr-2">Patient:</span>
//           <span className="font-medium">{patient?.name}</span>
//         </div>
//       </div>

//       <div className="bg-white shadow-md rounded-lg p-6 mb-6">
//         <h3 className="text-lg font-medium text-gray-900 mb-4">
//           Selected Service Details
//         </h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <p className="text-sm text-gray-500">Service Name</p>
//             <p className="font-medium">{selectedService.description}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">Service ID</p>
//             <p className="font-medium">{selectedService.serviceId}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">Equipment</p>
//             <p className="font-medium">
//               {selectedEquipment?.equipmentName || "Not specified"}
//             </p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-500">Facility</p>
//             <p className="font-medium">
//               {selectedFacility?.name || "Not specified"}
//             </p>
//           </div>
//           <div className="md:col-span-2">
//             <p className="text-sm text-gray-500">Cost</p>
//             <p className="font-medium text-lg">
//               Ksh{selectedService.shaRate.toLocaleString()}
//             </p>
//           </div>
//         </div>
//       </div>

//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="bg-white shadow-md rounded-lg p-6"
//       >
//         <h3 className="text-lg font-medium text-gray-900 mb-4">
//           Schedule Appointment
//         </h3>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//           <div>
//             <label
//               htmlFor="bookingDate"
//               className="block text-gray-700 font-medium mb-2"
//             >
//               Appointment Date
//             </label>
//             <input
//               {...register("booking_date", {
//                 required: "Appointment date is required",
//               })}
//               id="booking_date"
//               type="datetime-local"
//               min={today}
//               className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             {errors.booking_date && (
//               <p className="text-red-500 text-sm mt-1">
//                 {errors.booking_date.message}
//               </p>
//             )}
//           </div>
//         </div>

//         <div className="mb-4">
//           <label
//             htmlFor="notes"
//             className="block text-gray-700 font-medium mb-2"
//           >
//             Special Instructions (Optional)
//           </label>
//           <textarea
//             {...register("notes")}
//             id="notes"
//             rows={3}
//             className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Enter any special instructions or requirements"
//           ></textarea>
//         </div>

//         {/* Hidden fields */}
//         <input type="hidden" {...register("patient_id")} />
//         <input type="hidden" {...register("service_id")} />
//         <input type="hidden" {...register("equipment_id")} />
//         <input type="hidden" {...register("facility_id")} />
//         <input type="hidden" {...register("payment_mode_id")} />
//         {/* <input type="hidden" {...register("startTime")} /> */}
//         {/* <input type="hidden" {...register("endTime")} /> */}
//         <input type="hidden" {...register("status")} />
//         <input type="hidden" {...register("cost")} />

//         <div className="flex justify-between">
//           <button
//             type="button"
//             onClick={handlePreviousStep}
//             className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
//           >
//             Back
//           </button>
//           <button
//             type="submit"
//             disabled={isCreating}
//             className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
//           >
//             {isCreating ? "Processing..." : "Book Service"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ServiceBooking;
