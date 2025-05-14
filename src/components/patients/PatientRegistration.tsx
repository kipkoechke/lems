import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";

function PatientRegistration() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Patient Registration</CardTitle>
          <CardDescription>
            Register new patients and collect consent for services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientName">Full Name</Label>
              <Input id="patientName" placeholder="Enter patient name" />
            </div>
            <div>
              <Label htmlFor="patientDob">Date of Birth</Label>
              <Input id="patientDob" type="date" />
            </div>
            <div>
              <Label htmlFor="patientContact">Contact Number</Label>
              <Input id="patientContact" placeholder="Enter contact number" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="patientAddress">Address</Label>
              <Input id="patientAddress" placeholder="Enter patient address" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Register Patient</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default PatientRegistration;
