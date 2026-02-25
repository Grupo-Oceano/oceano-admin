export interface Guest {
  id: number;
  macAddress: string;
  fname: string;
  lname: string;
  email: string;
  createdAt: Date | string; // Assuming createdAt can be a Date or string
  updatedAt: Date | string; // Assuming updatedAt can be a Date or string
}

export const LeadsTableHeaders = [
  { key: "id", label: "ID" },
  { key: "fname", label: "First Name" },
  { key: "lname", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "macAddress", label: "MAC Address" },
  { key: "createdAt", label: "Created At" },
  { key: "updatedAt", label: "Updated At" },
];
