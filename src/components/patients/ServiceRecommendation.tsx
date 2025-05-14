"use client";

import { clinicians, facilities, services } from "@/app/lems/page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check } from "lucide-react";
import { useState } from "react";
import { patients } from "./RegisteredPatients";

function ServiceRecommendation() {
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Service Recommendation & Consent</CardTitle>
          <CardDescription>
            Select patient, recommend diagnostic/test services and collect
            consent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="selectPatient">Select Patient</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} ({patient.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="selectClinician">Referring Clinician</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select clinician" />
                </SelectTrigger>
                <SelectContent>
                  {clinicians.map((clinician) => (
                    <SelectItem key={clinician.id} value={clinician.id}>
                      {clinician.name} - {clinician.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="recommendedServices">Recommended Services</Label>
              <div className="space-y-2 mt-2">
                {services.slice(0, 3).map((service) => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox id={`service-${service.id}`} />
                    <label
                      htmlFor={`service-${service.id}`}
                      className="text-sm"
                    >
                      {service.name} - ${service.cost} (Facility:{" "}
                      {
                        facilities.find((f) => f.id === service.facilityCode)
                          ?.name
                      }
                      )
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <Label>Patient Consent</Label>
              <div className="flex gap-4 mt-2 items-center">
                <Input
                  placeholder="Enter patient phone number"
                  className="max-w-xs"
                  value="+1234567890"
                />
                <Button
                  variant="outline"
                  onClick={() => setOtpSent(true)}
                  disabled={otpSent}
                >
                  {otpSent ? "OTP Sent" : "Send OTP"}
                </Button>
              </div>

              {otpSent && (
                <div className="mt-4 flex items-center gap-4">
                  <Input placeholder="Enter OTP" className="max-w-xs" />
                  <Button onClick={() => setOtpVerified(true)}>
                    Verify OTP
                  </Button>
                </div>
              )}

              {otpVerified && (
                <Alert className="mt-4 bg-green-50">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Consent Verified</AlertTitle>
                  <AlertDescription>
                    Patient has provided consent for the selected services.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button disabled={!otpVerified}>Generate Tracking Number</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ServiceRecommendation;
