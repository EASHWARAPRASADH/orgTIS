import { Employee } from "./types";

const ENGINEERING_ROLES = [
  "Front-End Engineer",
  "Back-End Engineer",
  "Engineer Full Stack",
  "Engineer - QA",
  "Engineer DevOps"
];

export const INITIAL_EMPLOYEES: Employee[] = [
  // Executives
  {
    id: "arun",
    name: "ARUN G",
    role: "CEO",
    department: "Executives",
    photoUrl: "/assets/employees/arunsir1.png",
    managerId: null,
    color: "#FCD34D",
    displayOrder: 0,
    email: "arun@company.com",
    contact: "+91 98765 43210",
    joinDate: "2020-01-01",
  },
  {
    id: "padmavathy",
    name: "PADMAVATHY",
    role: "OPERATION HEAD",
    department: "Executives",
    photoUrl: "/assets/employees/padmavathy1.png",
    managerId: "arun",
    color: "#FCD34D",
    displayOrder: 1,
    email: "padma@company.com",
    contact: "+91 98765 43211",
    joinDate: "2020-02-15",
  },
  {
    id: "ranganadin",
    name: "RANGANADIN.C",
    role: "CHIEF OPERATING OFFICER",
    department: "Executives",
    photoUrl: "/assets/employees/ranganadin2.png",
    managerId: "arun",
    color: "#FCD34D",
    displayOrder: 2,
    bio: "Optimizing workflows to ensure that cutting-edge IT services are delivered on time and exceed expectations.",
    joinDate: "2021-01-01",
  },
  {
    id: "cyrille",
    name: "CYRILLE HELENA",
    role: "OPERATION HEAD - CENTRAL AFRICA",
    department: "Executives",
    photoUrl: "/assets/employees/ciril.jpeg",
    managerId: "arun",
    color: "#FCD34D",
    displayOrder: 3,
    bio: "Ensuring operational excellence and seamless IT service delivery across Central Africa.",
    joinDate: "2021-02-01",
  },
  {
    id: "akansha",
    name: "AKANSHA ARORA",
    role: "OPERATION HEAD - CENTRAL EUROPE",
    department: "Executives",
    photoUrl: "/assets/employees/akansha.png",
    managerId: "arun",
    color: "#FCD34D",
    displayOrder: 4,
    bio: "Driving strategic growth and operational efficiency in the Central European market.",
    joinDate: "2021-03-01",
  },
  {
    id: "priyadharshini",
    name: "PRIYADHARSHINI M",
    role: "Operation lead",
    department: "Executives",
    photoUrl: "/assets/employees/PRIYADARSHINI.jpeg",
    managerId: "padmavathy",
    color: "#FCD34D",
    displayOrder: 5,
    email: "priya@company.com",
    contact: "+91 98765 43212",
    joinDate: "2021-03-10",
  },
  {
    id: "ajay",
    name: "AJAY SUNDAR N",
    role: "CHIEF TECHNICAL OFFICER",
    department: "Executives",
    photoUrl: "/assets/employees/Ajay.jpeg",
    managerId: "arun",
    color: "#FCD34D",
    displayOrder: 6,
    bio: "Driving innovation with safe, scalable digital solutions that leverage cutting-edge technology to transform enterprises and fuel growth.",
    joinDate: "2022-01-01",
  },
  {
    id: "jagan_cso",
    name: "JAGANATHAN R",
    role: "CHIEF SECURITY OFFICER",
    department: "Executives",
    photoUrl: "/assets/employees/jagan.jpg",
    managerId: "arun",
    color: "#FCD34D",
    displayOrder: 7,
    bio: "Ensuring robust security with proactive defenses, safeguarding data, and building client trust with compliance excellence.",
    joinDate: "2022-01-01",
  },

  // IST ATHENA
  {
    id: "eashwara",
    name: "EASHWARA PRASADH",
    role: "Project Manager OF NUTECH",
    department: "IST ATHENA",
    photoUrl: "https://picsum.photos/seed/eashwara/100/100",
    managerId: "priyadharshini",
    color: "#BEF264",
    displayOrder: 3,
  },
  {
    id: "yuvaraj",
    name: "Yuvaraj",
    role: "Lead",
    department: "IST ATHENA",
    photoUrl: "/assets/employees/yuvaraj.png",
    managerId: "eashwara",
    color: "#BEF264",
    displayOrder: 4,
  },
  ...["Shrimathi", "Darshan", "Arjun", "Prasanna", "Deepshika", "Haritha", "Devasenatipathi"].map((name, i) => ({
    id: `athena-${i}`,
    name,
    role: ENGINEERING_ROLES[i % ENGINEERING_ROLES.length],
    department: "IST ATHENA",
    photoUrl: name === "Shrimathi" ? "/assets/employees/shrimathi.png" : 
              name === "Prasanna" ? "/assets/employees/prasanna venkatesh.png" : 
              name === "Arjun" ? "/assets/employees/arjun.png" : 
              name === "Deepshika" ? "/assets/employees/deepshika.png" : 
              name === "Haritha" ? "/assets/employees/hritha.png" : 
              name === "Devasenatipathi" ? "/assets/employees/devasenathipathi.png" : 
              name === "Darshan" ? "/assets/employees/darshan.png" : 
              `https://picsum.photos/seed/${name}/100/100`,
    managerId: "yuvaraj",
    color: "#BEF264",
    displayOrder: 5 + i,
  })),

  // IST PEGASUS
  {
    id: "ashwika",
    name: "Ashwika",
    role: "Project Manger OF GOTEK / KUMAR AGRO",
    department: "IST PEGASUS",
    photoUrl: "/assets/employees/ashwika.png",
    managerId: "priyadharshini",
    color: "#FCA5A5",
    displayOrder: 12,
  },
  {
    id: "harita_v",
    name: "Harita Versni",
    role: "Lead(Gotek)",
    department: "IST PEGASUS",
    photoUrl: "/assets/employees/harithavershini.jpeg",
    managerId: "ashwika",
    color: "#FCA5A5",
    displayOrder: 13,
  },
  ...["Hariharan", "Rakshana", "Fahima"].map((name, i) => ({
    id: `pegasus-g-${i}`,
    name,
    role: ENGINEERING_ROLES[(i + 1) % ENGINEERING_ROLES.length],
    department: "IST PEGASUS",
    photoUrl: name === "Hariharan" ? "/assets/employees/hariharan.png" : 
              name === "Rakshana" ? "/assets/employees/rakshana devi.png" : 
              name === "Fahima" ? "/assets/employees/faheema.png" : 
              `https://picsum.photos/seed/${name}/100/100`,
    managerId: "harita_v",
    color: "#FCA5A5",
    displayOrder: 14 + i,
  })),
  {
    id: "srivishnu",
    name: "Srivishnu",
    role: "Lead(Kumar Agro)",
    department: "IST PEGASUS",
    photoUrl: "/assets/employees/srivishnu.png",
    managerId: "ashwika",
    color: "#FCA5A5",
    displayOrder: 17,
  },
  ...["Devasri", "Arul jothi"].map((name, i) => ({
    id: `pegasus-k-${i}`,
    name,
    role: ENGINEERING_ROLES[(i + 2) % ENGINEERING_ROLES.length],
    department: "IST PEGASUS",
    photoUrl: name === "Arul jothi" ? "/assets/employees/arul jothi.png" : 
              name === "Devasri" ? "/assets/employees/devasri.png" : 
              `https://picsum.photos/seed/${name}/100/100`,
    managerId: "srivishnu",
    color: "#FCA5A5",
    displayOrder: 18 + i,
  })),

  // IST DYNAMICS
  {
    id: "sriram",
    name: "Sriram",
    role: "Project Manager OF ALAGANDRA",
    department: "IST DYNAMICS",
    photoUrl: "/assets/employees/sriram.png",
    managerId: "priyadharshini",
    color: "#93C5FD",
    displayOrder: 20,
  },
  {
    id: "maheswaran",
    name: "Maheswaran",
    role: "Lead",
    department: "IST DYNAMICS",
    photoUrl: "/assets/employees/maheshwaran.png",
    managerId: "sriram",
    color: "#93C5FD",
    displayOrder: 21,
  },
  ...["Shailendhirah", "Sithananthan", "Diya", "Sanjay", "Subiksha", "Varshini", "Jaseema"].map((name, i) => ({
    id: `dynamics-${i}`,
    name,
    role: ENGINEERING_ROLES[(i + 3) % ENGINEERING_ROLES.length],
    department: "IST DYNAMICS",
    photoUrl: name === "Shailendhirah" ? "/assets/employees/shilendra.png" : 
              name === "Diya" ? "/assets/employees/diya.png" : 
              name === "Sanjay" ? "/assets/employees/sanjay.png" : 
              name === "Subiksha" ? "/assets/employees/subkisha.png" : 
              name === "Varshini" ? "/assets/employees/varshini.png" : 
              name === "Jaseema" ? "/assets/employees/jaseema.png" : 
              name === "Sithananthan" ? "/assets/employees/sitha.jpg" : 
              `https://picsum.photos/seed/${name}/100/100`,
    managerId: "maheswaran",
    color: "#93C5FD",
    displayOrder: 22 + i,
  })),

  // IST NEXUS
  {
    id: "yusuf",
    name: "Yusuf",
    role: "Project Manager OF RATE 4 GOLD",
    department: "IST NEXUS",
    photoUrl: "/assets/employees/yusuf fayas.png",
    managerId: "priyadharshini",
    color: "#C084FC",
    displayOrder: 30,
  },
  {
    id: "dhipak",
    name: "Dhipak",
    role: "Lead",
    department: "IST NEXUS",
    photoUrl: "/assets/employees/dhipak.png",
    managerId: "yusuf",
    color: "#C084FC",
    displayOrder: 31,
  },
  ...["Arpit", "Nithish", "Manikandan", "Shivani", "Purushoth", "Nithish_2", "Swedha Sri", "Monikka"].map((name, i) => ({
    id: `nexus-${i}`,
    name: name.replace("_2", ""),
    role: ENGINEERING_ROLES[(i + 4) % ENGINEERING_ROLES.length],
    department: "IST NEXUS",
    photoUrl: name === "Purushoth" ? "/assets/employees/purushoth.png" : 
              name === "Nithish" ? "/assets/employees/nithesh s.png" : 
              name === "Nithish_2" ? "/assets/employees/niteesh s.png" : 
              name === "Swedha Sri" ? "/assets/employees/swetha sri.png" : 
              name === "Arpit" ? "/assets/employees/arpith.png" : 
              name === "Manikandan" ? "/assets/employees/manigandan.png" : 
              name === "Shivani" ? "/assets/employees/shivani.png" : 
              name === "Monikka" ? "/assets/employees/monika.png" : 
              `https://picsum.photos/seed/${name}/100/100`,
    managerId: "dhipak",
    color: "#C084FC",
    displayOrder: 32 + i,
  })),

  // IST R & D
  {
    id: "kollati",
    name: "Kollati",
    role: "Porject Manager OF GOTEK (Lanyard Designing)",
    department: "IST R & D",
    photoUrl: "/assets/employees/kollati.png",
    managerId: "priyadharshini",
    color: "#FB923C",
    displayOrder: 40,
  },
  {
    id: "praveen",
    name: "Praveen",
    role: "Lead",
    department: "IST R & D",
    photoUrl: "/assets/employees/praveen.png",
    managerId: "kollati",
    color: "#FB923C",
    displayOrder: 41,
  },
  {
    id: "vysakhi",
    name: "Vysakhi",
    role: ENGINEERING_ROLES[0],
    department: "IST R & D",
    photoUrl: "/assets/employees/vyshaki.png",
    managerId: "praveen",
    color: "#FB923C",
    displayOrder: 42,
  },

  // IST VERTEX
  ...["Madhesh", "Anjali", "Nitesh", "Harini", "Daksh", "Prasana Vengates", "Vishveshwar", "Jayasuriya"].map((name, i) => ({
    id: `vertex-${i}`,
    name,
    role: ENGINEERING_ROLES[i % ENGINEERING_ROLES.length],
    department: "IST VERTEX",
    photoUrl: name === "Madhesh" ? "/assets/employees/madhesh.png" : 
              name === "Daksh" ? "/assets/employees/daksh.png" : 
              name === "Anjali" ? "/assets/employees/ANJALI.jpg" : 
              name === "Prasana Vengates" ? "/assets/employees/prasanavengetesh.png" : 
              name === "Vishveshwar" ? "/assets/employees/vishweshwar.png" : 
              name === "Jayasuriya" ? "/assets/employees/jayasurya.png" : 
              name === "Harini" ? "/assets/employees/harini sri.png" : 
              name === "Nitesh" ? "/assets/employees/nithesh s.png" : 
              `https://picsum.photos/seed/${name}/100/100`,
    managerId: "priyadharshini",
    color: "#E5E7EB",
    displayOrder: 50 + i,
  })),
];

export const DEPARTMENTS = [
  { name: "Executives", color: "#FCD34D" },
  { name: "IST ATHENA", color: "#BEF264" },
  { name: "IST PEGASUS", color: "#FCA5A5" },
  { name: "IST DYNAMICS", color: "#93C5FD" },
  { name: "IST NEXUS", color: "#C084FC" },
  { name: "IST R & D", color: "#FB923C" },
  { name: "IST VERTEX", color: "#E5E7EB" },
];
