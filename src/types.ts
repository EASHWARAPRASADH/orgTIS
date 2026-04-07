export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  photoUrl: string;
  managerId: string | null;
  color?: string;
  displayOrder?: number;
  contact?: string;
  email?: string;
  joinDate?: string;
  bio?: string;
}

export type OrgData = Employee[];
