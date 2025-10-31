"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLots } from "@/features/lots/useLots";
import { Lot } from "@/services/apiLots";
import {
  FaSearch,
  FaMicrophone,
  FaHeart,
  FaUser,
  FaUserPlus,
  FaCamera,
  FaShoppingCart,
  FaCheckCircle,
} from "react-icons/fa";
import { MdClose } from "react-icons/md";

export default function ServicesPage() {
  const router = useRouter();
  const { lots, isLoading } = useLots();

  const [searchTerm, setSearchTerm] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  // Mock patient data - replace with actual patient selection
  const mockPatient = {
    name: "James Anderson",
    age: 32,
    phone: "+254*****789",
    crNo: "CR0xxxxx89-6",
    identificationType: "NATIONAL ID",
    identificationNo: "123XXXX7",
  };

  const mockServices = [
    { name: "Diagnostic Imaging CT", cost: 11200 },
    { name: "Diagnostic Imaging MRI", cost: 11200 },
    { name: "Diagnostic Imaging Sonography", cost: 11200 },
  ];

  const handleServiceClick = (lot: Lot) => {
    router.push(`/lots/${lot.id}/services`);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Services Section */}
      <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden h-full">
        {/* Services Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Services</h2>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                showFavorites
                  ? "bg-green-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
            >
              <FaHeart className="w-4 h-4" />
              <span className="text-sm font-medium">Favorites</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaMicrophone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Service Categories/Lots */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* All Lots Card */}
            <button
              onClick={() => router.push("/lots/all")}
              className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200 text-left"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">All Lots</h3>
            </button>

            {/* Dynamic Lot Cards */}
            {lots?.map((lot) => (
              <button
                key={lot.id}
                onClick={() => handleServiceClick(lot)}
                className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow border border-gray-200 text-left"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">{lot.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Information Sidebar */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto self-start">
        {/* Patient Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaUser className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">
                Patient Information
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 bg-green-600 text-white rounded flex items-center justify-center hover:bg-green-700">
                <FaUserPlus className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 bg-orange-500 text-white rounded flex items-center justify-center hover:bg-orange-600">
                <FaCamera className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600">
                <MdClose className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Patient Selector */}
          <select className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm">
            <option>{mockPatient.name}</option>
          </select>
        </div>

        {/* Patient Details */}
        <div className="px-4 py-3 border-b border-gray-200 text-sm">
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
            <p className="text-gray-900 font-semibold mb-1">
              {mockPatient.name}
            </p>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium">
                {mockPatient.age} Years
              </span>
            </div>
            <div className="mt-2 space-y-1 text-xs">
              <p>
                <span className="font-medium">Phone:</span> {mockPatient.phone}
              </p>
              <p>
                <span className="font-medium">CR NO:</span> {mockPatient.crNo}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Services */}
        <div className="px-4 py-3">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Selected Service(s)
              <span className="float-right">COST</span>
            </h4>
          </div>

          <div className="space-y-2">
            {mockServices.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-green-50 rounded p-2 text-sm"
              >
                <div className="flex items-center gap-2 flex-1">
                  <FaCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-900">{service.name}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  KES {service.cost.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Identification Section */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">
                  Identifier:
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                  {mockPatient.identificationType}
                </span>
                <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs font-medium">
                  Eligible
                </span>
              </div>
            </div>
            <div className="text-xs">
              <span className="font-medium">Identification No.</span>{" "}
              {mockPatient.identificationNo}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">
              Payment Summary
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Facility Share</span>
                <span className="font-semibold">KES 3,600</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vendor Share</span>
                <span className="font-semibold">KES 30,000</span>
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-gray-900 text-white rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Cost</span>
              <span className="text-xl font-bold">KES 33,600</span>
            </div>
          </div>

          {/* Send to Fiance Button */}
          <button className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2">
            <FaShoppingCart className="w-5 h-5" />
            <span>Send to Fiance</span>
          </button>
        </div>
      </div>
    </div>
  );
}
