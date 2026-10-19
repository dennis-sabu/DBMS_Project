/**
 * filter-config.ts — Single source of truth for academic hierarchy.
 *
 * Structure:  Level → Program → Semester → Subjects
 *
 * Every page (upload, browse, admin, signup) imports from here
 * so there is never a mismatch between dropdown options.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SemesterEntry {
  sem_id: number;
  subjects: string[];
}

export interface ProgramEntry {
  code: string;
  name: string;
  semesters: SemesterEntry[];
}

export interface LevelEntry {
  id: string;
  label: string;
  programs: ProgramEntry[];
}

export interface FilterConfig {
  levels: LevelEntry[];
}

// ─────────────────────────────────────────────────────────────────────────────
// The canonical filter configuration
// ─────────────────────────────────────────────────────────────────────────────

export const FILTER_CONFIG: FilterConfig = {
  levels: [
    {
      id: "UG",
      label: "Undergraduate (B.Tech)",
      programs: [
        {
          code: "CSE",
          name: "Computer Science & Engineering",
          semesters: [
            { sem_id: 1, subjects: ["Linear Algebra & Calculus", "Engineering Physics A", "Engineering Chemistry", "Engineering Graphics", "Basics of Civil & Mech. Engg", "Life Skills"] },
            { sem_id: 2, subjects: ["Vector Calculus & Diff. Equations", "Engineering Mechanics", "Basics of Electrical & Electronics", "Programming in C", "Professional Communication"] },
            { sem_id: 3, subjects: ["Discrete Mathematical Structures", "Data Structures", "Logic System Design", "Object Oriented Programming using Java", "Design & Engineering"] },
            { sem_id: 4, subjects: ["Graph Theory", "Computer Organization & Architecture", "Operating Systems", "Design & Analysis of Algorithms", "Database Management Systems"] },
            { sem_id: 5, subjects: ["Formal Languages & Automata Theory", "Computer Networks", "System Software", "Microprocessors & Microcontrollers", "Management of Software Systems"] },
            { sem_id: 6, subjects: ["Compiler Design", "Computer Graphics", "Algorithm Analysis & Design", "Machine Learning", "Comprehensive Course Work"] },
            { sem_id: 7, subjects: ["Artificial Intelligence", "Information Security", "Program Elective II", "Open Elective", "Project Phase I"] },
            { sem_id: 8, subjects: ["Data Analytics", "Program Elective III", "Program Elective IV", "Project Phase II"] },
          ],
        },
        {
          code: "AD",
          name: "Artificial Intelligence & Data Science",
          semesters: [
            { sem_id: 1, subjects: ["Linear Algebra & Calculus", "Engineering Physics B", "Engineering Graphics", "Basics of Civil & Mech. Engg"] },
            { sem_id: 2, subjects: ["Vector Calculus & Diff. Equations", "Engineering Chemistry", "Basics of Electrical & Electronics", "Programming in C"] },
            { sem_id: 3, subjects: ["Discrete Mathematics", "Data Structures", "Digital Logic Design", "Python for Data Science", "Design & Engineering"] },
            { sem_id: 4, subjects: ["Statistics for Data Science", "Computer Organization", "Database Management Systems", "Operating Systems", "Constitution of India"] },
            { sem_id: 5, subjects: ["Formal Languages & Automata", "Computer Networks", "Machine Learning", "AI Principles", "Disaster Management"] },
            { sem_id: 6, subjects: ["Deep Learning", "Data Mining & Warehousing", "Big Data Analytics", "Cloud Computing", "Comprehensive Course Work"] },
            { sem_id: 7, subjects: ["Natural Language Processing", "Information Security", "Reinforcement Learning", "Project Phase I"] },
            { sem_id: 8, subjects: ["Computer Vision", "Program Elective", "Project Phase II"] },
          ],
        },
        {
          code: "ER",
          name: "Electronics & Computer Engineering",
          semesters: [
            { sem_id: 1, subjects: ["Linear Algebra & Calculus", "Engineering Physics A", "Engineering Graphics", "Basics of Civil & Mech. Engg"] },
            { sem_id: 2, subjects: ["Vector Calculus & Diff. Equations", "Engineering Chemistry", "Programming in C", "Professional Communication"] },
            { sem_id: 3, subjects: ["Electronic Circuits", "Digital Electronics", "Data Structures", "Signals & Systems", "Sustainable Engineering"] },
            { sem_id: 4, subjects: ["Computer Org. & Architecture", "Analog Circuits", "Object Oriented Programming", "Microprocessors"] },
            { sem_id: 5, subjects: ["Embedded Systems", "Digital Signal Processing", "Computer Networks", "System Software"] },
            { sem_id: 6, subjects: ["VLSI Design", "Machine Learning", "Control Systems", "Comprehensive Course Work"] },
            { sem_id: 7, subjects: ["Internet of Things", "Information Security", "Real Time Operating Systems", "Project Phase I"] },
            { sem_id: 8, subjects: ["Robotics", "Program Elective", "Project Phase II"] },
          ],
        },
        {
          code: "ECE",
          name: "Electronics & Communication Engineering",
          semesters: [
            { sem_id: 3, subjects: ["Partial Diff. Equations", "Solid State Devices", "Logic Circuit Design", "Network Theory", "Sustainable Engineering"] },
            { sem_id: 4, subjects: ["Prob. & Random Processes", "Analog Circuits", "Signals & Systems", "Digital Communication", "Constitution of India"] },
            { sem_id: 5, subjects: ["Digital Signal Processing", "Microprocessors & Microcontrollers", "Applied Electromagnetics", "Power Electronics"] },
            { sem_id: 6, subjects: ["VLSI Circuit Design", "Information Theory & Coding", "Control Systems", "Comprehensive Course Work"] },
            { sem_id: 7, subjects: ["Microwave Engineering", "Optical Communication", "Embedded Systems", "Project Phase I"] },
            { sem_id: 8, subjects: ["Wireless Communication", "Program Elective", "Project Phase II"] },
          ],
        },
        {
          code: "CE",
          name: "Civil Engineering",
          semesters: [
            { sem_id: 3, subjects: ["Mechanics of Solids", "Fluid Mechanics I", "Surveying", "Construction Technology"] },
            { sem_id: 4, subjects: ["Structural Analysis I", "Fluid Mechanics II", "Geotechnical Engineering I", "Concrete Technology"] },
            { sem_id: 5, subjects: ["Structural Analysis II", "Geotechnical Engineering II", "Design of Concrete Structures I", "Transportation Engineering I"] },
            { sem_id: 6, subjects: ["Design of Concrete Structures II", "Transportation Engineering II", "Hydrology & Water Resources", "Comprehensive Course Work"] },
            { sem_id: 7, subjects: ["Design of Steel Structures", "Environmental Engineering I", "Project Phase I"] },
            { sem_id: 8, subjects: ["Quantity Surveying & Valuation", "Environmental Engineering II", "Project Phase II"] },
          ],
        },
        {
          code: "CS-CY",
          name: "CSE (Cyber Security)",
          semesters: [
            { sem_id: 3, subjects: ["Discrete Mathematical Structures", "Data Structures", "Digital Logic Design", "Python Programming"] },
            { sem_id: 4, subjects: ["Computer Organization", "Operating Systems", "Cryptography Fundamentals", "Computer Networks"] },
            { sem_id: 5, subjects: ["Network Security", "Ethical Hacking", "Database Security", "Cyber Laws & Ethics"] },
            { sem_id: 6, subjects: ["Digital Forensics", "Secure Coding", "Cloud Security", "Comprehensive Course Work"] },
            { sem_id: 7, subjects: ["Malware Analysis", "Blockchain Technology", "Project Phase I"] },
            { sem_id: 8, subjects: ["Security Governance", "Project Phase II"] },
          ],
        },
        {
          code: "CS-AI",
          name: "CSE (Artificial Intelligence)",
          semesters: [
            { sem_id: 3, subjects: ["Discrete Mathematics", "Data Structures", "Logic System Design", "AI Principles"] },
            { sem_id: 4, subjects: ["Probability & Statistics", "Computer Org.", "Operating Systems", "Knowledge Representation"] },
            { sem_id: 5, subjects: ["Machine Learning", "Neural Networks", "Python for AI", "Database Management"] },
            { sem_id: 6, subjects: ["Deep Learning", "Natural Language Processing", "Computer Vision", "Comprehensive Course Work"] },
            { sem_id: 7, subjects: ["Robotics & Automation", "Reinforcement Learning", "Project Phase I"] },
            { sem_id: 8, subjects: ["AI Ethics", "Project Phase II"] },
          ],
        },
      ],
    },
    {
      id: "PG",
      label: "Postgraduate",
      programs: [
        {
          code: "MTECH-SECM",
          name: "M.Tech Structural Eng. & Const. Mgmt",
          semesters: [
            { sem_id: 1, subjects: ["Advanced Structural Analysis", "Theory of Elasticity", "Construction Management", "Research Methodology"] },
            { sem_id: 2, subjects: ["Structural Dynamics", "Finite Element Analysis", "Advanced Concrete Technology", "Mini Project"] },
            { sem_id: 3, subjects: ["Earthquake Resistant Design", "Elective V", "Seminar", "Project Phase I"] },
            { sem_id: 4, subjects: ["Project Phase II"] },
          ],
        },
        {
          code: "MTECH-VLSI",
          name: "M.Tech VLSI & Embedded Systems",
          semesters: [
            { sem_id: 1, subjects: ["CMOS VLSI Design", "Embedded System Design", "Digital Design with FPGA", "Research Methodology"] },
            { sem_id: 2, subjects: ["Analog Integrated Circuits", "Real Time Operating Systems", "Testing & Verification", "Mini Project"] },
            { sem_id: 3, subjects: ["Low Power VLSI", "SoC Design", "Seminar", "Project Phase I"] },
            { sem_id: 4, subjects: ["Project Phase II"] },
          ],
        },
        {
          code: "MTECH-CSE",
          name: "M.Tech Computer Science & Engineering",
          semesters: [
            { sem_id: 1, subjects: ["Mathematical Foundations of CS", "Advanced Data Structures", "Topics in Database Systems", "Research Methodology"] },
            { sem_id: 2, subjects: ["Advanced Algorithms", "Operating System Design", "Machine Learning", "Mini Project"] },
            { sem_id: 3, subjects: ["Network Security", "Data Mining", "Seminar", "Project Phase I"] },
            { sem_id: 4, subjects: ["Project Phase II"] },
          ],
        },
        {
          code: "MBA",
          name: "Master of Business Administration",
          semesters: [
            { sem_id: 1, subjects: ["Accounting for Managers", "Organizational Behaviour", "Managerial Economics", "Legal Systems in Business", "Business Communication"] },
            { sem_id: 2, subjects: ["Financial Management", "Marketing Management", "Human Resource Management", "Operations Management", "Operations Research"] },
            { sem_id: 3, subjects: ["Strategic Management", "International Business", "Elective: Finance/Marketing/HR", "Internship"] },
            { sem_id: 4, subjects: ["Project Work", "Comprehensive Viva Voce", "Elective: Systems/Operations"] },
          ],
        },
        {
          code: "MCA",
          name: "Master of Computer Applications (2 Year)",
          semesters: [
            { sem_id: 1, subjects: ["Discrete Mathematics", "Digital Systems & Logic", "Advanced C Programming", "Web Technologies", "Software Engineering"] },
            { sem_id: 2, subjects: ["Data Structures", "Operating Systems", "Java Programming", "Database Management Systems", "Computer Networks"] },
            { sem_id: 3, subjects: ["Machine Learning", "Mobile Computing", "Cloud Computing", "Mini Project"] },
            { sem_id: 4, subjects: ["Main Project", "Comprehensive Viva"] },
          ],
        },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Derived helper lists (computed once at module load)
// ─────────────────────────────────────────────────────────────────────────────

/** All programs across all levels, flattened. */
export const ALL_PROGRAMS: ProgramEntry[] = FILTER_CONFIG.levels.flatMap((l) => l.programs);

/** All unique program display names, sorted. Use as the "Department" dropdown. */
export const ALL_DEPARTMENTS: string[] = ALL_PROGRAMS.map((p) => p.name).sort();

/** Map from program name → program code (for DB storage). */
export const DEPARTMENT_TO_CODE: Record<string, string> = Object.fromEntries(
  ALL_PROGRAMS.map((p) => [p.name, p.code])
);

/** Map from program code → program name (for display). */
export const CODE_TO_DEPARTMENT: Record<string, string> = Object.fromEntries(
  ALL_PROGRAMS.map((p) => [p.code, p.name])
);

/** All unique level labels, e.g. ["Undergraduate (B.Tech)", "Postgraduate"]. Use as the "Course" dropdown. */
export const ALL_COURSES: string[] = FILTER_CONFIG.levels.map((l) => l.label);

/** Map from level label → level id. */
export const COURSE_TO_LEVEL_ID: Record<string, string> = Object.fromEntries(
  FILTER_CONFIG.levels.map((l) => [l.label, l.id])
);

/** Map from level id → level label. */
export const LEVEL_ID_TO_COURSE: Record<string, string> = Object.fromEntries(
  FILTER_CONFIG.levels.map((l) => [l.id, l.label])
);

/** All possible semester labels: "Semester 1" through "Semester 8". */
export const ALL_SEMESTERS: string[] = Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`);

/** Get the semesters available for a specific program (by name). */
export function getSemestersForProgram(programName: string): string[] {
  const program = ALL_PROGRAMS.find((p) => p.name === programName);
  if (!program) return [];
  return program.semesters.map((s) => `Semester ${s.sem_id}`);
}

/** Get subjects for a specific program + semester. */
export function getSubjectsForProgramSemester(
  programName: string,
  semesterLabel: string
): string[] {
  const program = ALL_PROGRAMS.find((p) => p.name === programName);
  if (!program) return [];
  const semId = parseInt(semesterLabel.replace(/\D/g, ""), 10);
  const sem = program.semesters.find((s) => s.sem_id === semId);
  return sem ? [...sem.subjects].sort() : [];
}

/** Get the level (course) label for a given program name. */
export function getLevelForProgram(programName: string): string {
  for (const level of FILTER_CONFIG.levels) {
    if (level.programs.some((p) => p.name === programName)) {
      return level.label;
    }
  }
  return "";
}

/** Get all programs under a specific level/course label. */
export function getProgramsForLevel(levelLabel: string): ProgramEntry[] {
  const level = FILTER_CONFIG.levels.find((l) => l.label === levelLabel);
  return level ? level.programs : [];
}

/** Flat list of every unique subject name across all programs. */
export const ALL_SUBJECTS_FLAT: string[] = [
  ...new Set(ALL_PROGRAMS.flatMap((p) => p.semesters.flatMap((s) => s.subjects))),
].sort();
