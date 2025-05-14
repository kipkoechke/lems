"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Placeholder data
export const patients = [
  {
    id: "P001",
    name: "John Smith",
    dob: "1985-04-12",
    contact: "+1234567890",
    status: "Active",
  },
  {
    id: "P002",
    name: "Maria Garcia",
    dob: "1990-08-25",
    contact: "+1987654321",
    status: "Pending Consent",
  },
  {
    id: "P003",
    name: "Robert Chen",
    dob: "1978-11-03",
    contact: "+1122334455",
    status: "Inactive",
  },
];

function RegisteredPatients() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Registered Patients</CardTitle>
          <CardDescription>Manage existing patient records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.id}</TableCell>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.dob}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        patient.status === "Active"
                          ? "default"
                          : patient.status === "Pending Consent"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisteredPatients;
