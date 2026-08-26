"use client";

import { useState, useEffect } from "react";

export type NoteStatus = "Pending" | "Approved" | "Rejected";

export interface AcademicNote {
  id: string;
  title: string;
  description: string;
  academicYear: string;
  course: string;
  department: string;
  semester: string;
  subject: string;
  uploaderId: string;
  uploaderName: string;
  uploadDate: string;
  downloadCount: number;
  rating: number;
  status: NoteStatus;
  rejectionReason?: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileUrl?: string;
  isDeleted?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  department: string;
  academicYear: string;
  course: string;
  role: "user" | "admin";
  status?: "Active" | "Suspended";
  joinDate?: string;
}

export interface SiteSettings {
  announcementBanner: string;
  heroTitle: string;
  heroDescription: string;
  uploadsEnabled: boolean;
  collegeName: string;
}

export interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  type: "note" | "user" | "academic" | "settings";
}

const DEFAULT_USER: UserProfile = {
  id: "user-1",
  name: "Alex Kumar",
  email: "alex.k@college.edu",
  department: "Computer Science & Engineering",
  academicYear: "3rd Year",
  course: "B.Tech",
  role: "user",
  status: "Active",
  joinDate: "2025-01-10",
};

const DEFAULT_ADMIN: UserProfile = {
  id: "admin-1",
  name: "Administrator Alex",
  email: "admin@college.edu",
  department: "Computer Science & Engineering",
  academicYear: "4th Year",
  course: "B.Tech",
  role: "admin",
  status: "Active",
  joinDate: "2024-09-01",
};

const INITIAL_USERS: UserProfile[] = [
  DEFAULT_USER,
  DEFAULT_ADMIN,
  {
    id: "user-2",
    name: "Maya Rivera",
    email: "maya.r@college.edu",
    department: "Computer Science & Engineering",
    academicYear: "2nd Year",
    course: "B.Tech",
    role: "user",
    status: "Active",
    joinDate: "2025-02-14",
  },
  {
    id: "user-3",
    name: "Olivia Martinez",
    email: "olivia.m@college.edu",
    department: "Information Technology",
    academicYear: "3rd Year",
    course: "B.Tech",
    role: "user",
    status: "Active",
    joinDate: "2025-03-01",
  },
  {
    id: "user-4",
    name: "Daniel Patel",
    email: "daniel.p@college.edu",
    department: "Electrical Engineering",
    academicYear: "2nd Year",
    course: "B.Tech",
    role: "user",
    status: "Active",
    joinDate: "2025-03-12",
  },
  {
    id: "user-5",
    name: "Priya Sharma",
    email: "priya.s@college.edu",
    department: "Information Technology",
    academicYear: "1st Year",
    course: "B.Tech",
    role: "user",
    status: "Active",
    joinDate: "2025-04-05",
  },
];

const INITIAL_ACADEMIC_YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const INITIAL_COURSES = ["B.Tech", "B.Sc", "B.CA", "M.Tech", "M.Sc"];

const INITIAL_DEPARTMENTS = [
  "Computer Science & Engineering",
  "Information Technology",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Basic Sciences & Humanities",
];

const INITIAL_SEMESTERS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
  "Semester 7",
  "Semester 8",
];

const INITIAL_SUBJECTS = [
  "Applied Mathematics II",
  "Database Management Systems",
  "Data Structures & Algorithms",
  "Digital Logic Design",
  "Linear Algebra",
  "Operating Systems",
  "Computer Networks",
  "Software Engineering",
  "Object Oriented Programming",
];

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcementBanner: "Over 12k notes shared this week",
  heroTitle: "The best notes from\nthe smartest minds on campus.",
  heroDescription: "Upload, share, and discover top-quality study materials\nfrom students across your university.",
  uploadsEnabled: true,
  collegeName: "NotesHub College",
};

const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: "log-1",
    actor: "Administrator Alex",
    action: "Approved Note",
    target: "Calculus II — Comprehensive Integration Techniques",
    timestamp: "2025-08-25 14:30",
    type: "note",
  },
  {
    id: "log-2",
    actor: "Alex Kumar",
    action: "Submitted Note for Review",
    target: "Operating Systems — Process Scheduling & Synchronization",
    timestamp: "2025-08-25 11:15",
    type: "note",
  },
  {
    id: "log-3",
    actor: "Administrator Alex",
    action: "Rejected Note",
    target: "Computer Networks — TCP/IP & OSI Model Lecture Notes",
    timestamp: "2025-08-22 09:45",
    type: "note",
  },
  {
    id: "log-4",
    actor: "System Administrator",
    action: "Added Department",
    target: "Basic Sciences & Humanities",
    timestamp: "2025-08-20 16:00",
    type: "academic",
  },
];

const INITIAL_NOTES: AcademicNote[] = [
  {
    id: "note-1",
    title: "Calculus II — Comprehensive Integration Techniques",
    description: "Handwritten class notes covering integration by parts, trigonometric substitution, and partial fractions with step-by-step solved examples.",
    academicYear: "1st Year",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "Semester 2",
    subject: "Applied Mathematics II",
    uploaderId: "user-2",
    uploaderName: "Maya Rivera",
    uploadDate: "2025-08-15",
    downloadCount: 1240,
    rating: 4.9,
    status: "Approved",
    fileName: "Calculus_II_Integration_Notes.pdf",
    fileSize: "4.2 MB",
    fileType: "PDF Document",
  },
  {
    id: "note-2",
    title: "Database Management Systems — ER Diagrams & SQL Cheatsheet",
    description: "Complete summary of relational algebra, ER diagram conversions, 1NF to BCNF normalization rules, and essential SQL queries.",
    academicYear: "2nd Year",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "Semester 4",
    subject: "Database Management Systems",
    uploaderId: "user-1",
    uploaderName: "Alex Kumar",
    uploadDate: "2025-08-18",
    downloadCount: 948,
    rating: 4.8,
    status: "Approved",
    fileName: "DBMS_SQL_Cheatsheet.pdf",
    fileSize: "2.8 MB",
    fileType: "PDF Document",
  },
  {
    id: "note-3",
    title: "Data Structures & Algorithms — Graphs & Trees Summary",
    description: "In-depth breakdown of BFS, DFS, Dijkstra's algorithm, AVL trees, and Red-Black tree rotations with Java implementation snippets.",
    academicYear: "2nd Year",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "Semester 3",
    subject: "Data Structures & Algorithms",
    uploaderId: "user-3",
    uploaderName: "Olivia Martinez",
    uploadDate: "2025-08-20",
    downloadCount: 2150,
    rating: 4.9,
    status: "Approved",
    fileName: "DSA_Trees_Graphs.pdf",
    fileSize: "5.1 MB",
    fileType: "PDF Document",
  },
  {
    id: "note-4",
    title: "Digital Logic Design — Karnaugh Maps & Sequential Circuits",
    description: "Boolean algebra simplification, K-map minimizations, flip-flops, counters, and state transition diagram lecture walkthroughs.",
    academicYear: "2nd Year",
    course: "B.Tech",
    department: "Electrical Engineering",
    semester: "Semester 3",
    subject: "Digital Logic Design",
    uploaderId: "user-4",
    uploaderName: "Daniel Patel",
    uploadDate: "2025-08-22",
    downloadCount: 612,
    rating: 4.7,
    status: "Approved",
    fileName: "DLD_Kmap_Notes.pdf",
    fileSize: "3.5 MB",
    fileType: "PDF Document",
  },
  {
    id: "note-5",
    title: "Linear Algebra & Matrix Computation Quick Review",
    description: "Eigenvalues, eigenvectors, Gram-Schmidt orthogonalization, and Singular Value Decomposition (SVD) exam preparation guide.",
    academicYear: "1st Year",
    course: "B.Tech",
    department: "Information Technology",
    semester: "Semester 1",
    subject: "Linear Algebra",
    uploaderId: "user-5",
    uploaderName: "Priya Sharma",
    uploadDate: "2025-08-23",
    downloadCount: 734,
    rating: 4.8,
    status: "Approved",
    fileName: "Linear_Algebra_Summary.pdf",
    fileSize: "1.9 MB",
    fileType: "PDF Document",
  },
  {
    id: "note-6",
    title: "Operating Systems — Process Scheduling & Synchronization",
    description: "Detailed notes on CPU scheduling algorithms, Semaphore implementation, Deadlock handling, and Bankers Algorithm.",
    academicYear: "3rd Year",
    course: "B.Tech",
    department: "Computer Science & Engineering",
    semester: "Semester 5",
    subject: "Operating Systems",
    uploaderId: "user-1",
    uploaderName: "Alex Kumar",
    uploadDate: "2025-08-25",
    downloadCount: 45,
    rating: 4.9,
    status: "Pending",
    fileName: "OS_Scheduling_Notes.pdf",
    fileSize: "3.8 MB",
    fileType: "PDF Document",
  },
  {
    id: "note-7",
    title: "Computer Networks — TCP/IP & OSI Model Lecture Notes",
    description: "Layer by layer breakdown of protocol suites, subnetting calculations, routing protocols (OSPF, BGP), and socket programming fundamentals.",
    academicYear: "3rd Year",
    course: "B.Tech",
    department: "Information Technology",
    semester: "Semester 5",
    subject: "Computer Networks",
    uploaderId: "user-1",
    uploaderName: "Alex Kumar",
    uploadDate: "2025-08-21",
    downloadCount: 0,
    rating: 0,
    status: "Rejected",
    rejectionReason: "Incomplete document. Pages 4 through 8 were missing or corrupted. Please re-upload with all lecture pages intact.",
    fileName: "CN_Protocols_Draft.pdf",
    fileSize: "2.1 MB",
    fileType: "PDF Document",
  },
];

const LOCAL_STORAGE_KEY_NOTES = "noteshub_notes_v4";
const LOCAL_STORAGE_KEY_AUTH = "noteshub_auth_v4";
const LOCAL_STORAGE_KEY_BOOKMARKS = "noteshub_bookmarks_v4";
const LOCAL_STORAGE_KEY_SETTINGS = "noteshub_settings_v4";
const LOCAL_STORAGE_KEY_USERS = "noteshub_users_v4";
const LOCAL_STORAGE_KEY_YEARS = "noteshub_years_v4";
const LOCAL_STORAGE_KEY_COURSES = "noteshub_courses_v4";
const LOCAL_STORAGE_KEY_DEPTS = "noteshub_depts_v4";
const LOCAL_STORAGE_KEY_SEMS = "noteshub_sems_v4";
const LOCAL_STORAGE_KEY_SUBJECTS = "noteshub_subjects_v4";
const LOCAL_STORAGE_KEY_LOGS = "noteshub_logs_v4";

export function useNotesStore() {
  const [notes, setNotes] = useState<AcademicNote[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [coursesList, setCoursesList] = useState<string[]>([]);
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const [semestersList, setSemestersList] = useState<string[]>([]);
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load notes
    const storedNotes = localStorage.getItem(LOCAL_STORAGE_KEY_NOTES);
    if (storedNotes) {
      try { setNotes(JSON.parse(storedNotes)); } catch (e) { setNotes(INITIAL_NOTES); }
    } else {
      setNotes(INITIAL_NOTES);
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTES, JSON.stringify(INITIAL_NOTES));
    }

    // Load auth
    const storedAuth = localStorage.getItem(LOCAL_STORAGE_KEY_AUTH);
    if (storedAuth) {
      try { setCurrentUser(JSON.parse(storedAuth)); } catch (e) { setCurrentUser(DEFAULT_USER); }
    } else {
      setCurrentUser(DEFAULT_USER);
    }

    // Load users
    const storedUsers = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
    if (storedUsers) {
      try { setUsersList(JSON.parse(storedUsers)); } catch (e) { setUsersList(INITIAL_USERS); }
    } else {
      setUsersList(INITIAL_USERS);
      localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
    }

    // Load academic structures
    const storedYears = localStorage.getItem(LOCAL_STORAGE_KEY_YEARS);
    setAcademicYears(storedYears ? JSON.parse(storedYears) : INITIAL_ACADEMIC_YEARS);

    const storedCourses = localStorage.getItem(LOCAL_STORAGE_KEY_COURSES);
    setCoursesList(storedCourses ? JSON.parse(storedCourses) : INITIAL_COURSES);

    const storedDepts = localStorage.getItem(LOCAL_STORAGE_KEY_DEPTS);
    setDepartmentsList(storedDepts ? JSON.parse(storedDepts) : INITIAL_DEPARTMENTS);

    const storedSems = localStorage.getItem(LOCAL_STORAGE_KEY_SEMS);
    setSemestersList(storedSems ? JSON.parse(storedSems) : INITIAL_SEMESTERS);

    const storedSubjects = localStorage.getItem(LOCAL_STORAGE_KEY_SUBJECTS);
    setSubjectsList(storedSubjects ? JSON.parse(storedSubjects) : INITIAL_SUBJECTS);

    // Load settings
    const storedSettings = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
    setSiteSettings(storedSettings ? JSON.parse(storedSettings) : DEFAULT_SITE_SETTINGS);

    // Load activity logs
    const storedLogs = localStorage.getItem(LOCAL_STORAGE_KEY_LOGS);
    setActivityLogs(storedLogs ? JSON.parse(storedLogs) : INITIAL_ACTIVITY_LOGS);

    // Load bookmarks
    const storedBookmarks = localStorage.getItem(LOCAL_STORAGE_KEY_BOOKMARKS);
    setBookmarks(storedBookmarks ? JSON.parse(storedBookmarks) : ["note-2"]);

    setIsLoaded(true);
  }, []);

  /* Save Helpers */
  const saveNotes = (updated: AcademicNote[]) => {
    setNotes(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTES, JSON.stringify(updated));
  };

  const saveUsers = (updated: UserProfile[]) => {
    setUsersList(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(updated));
  };

  const saveLogs = (updated: ActivityLog[]) => {
    setActivityLogs(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_LOGS, JSON.stringify(updated));
  };

  const saveAuth = (user: UserProfile | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH);
    }
  };

  const saveBookmarks = (updated: string[]) => {
    setBookmarks(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_BOOKMARKS, JSON.stringify(updated));
  };

  const addActivityLog = (action: string, target: string, type: ActivityLog["type"]) => {
    const actorName = currentUser ? currentUser.name : "System Administrator";
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      actor: actorName,
      action,
      target,
      timestamp,
      type,
    };

    const updated = [newLog, ...activityLogs];
    saveLogs(updated);
  };

  /* Filter Helpers */
  const approvedNotes = notes.filter((n) => n.status === "Approved" && !n.isDeleted);
  const pendingNotes = notes.filter((n) => n.status === "Pending" && !n.isDeleted);
  const rejectedNotes = notes.filter((n) => n.status === "Rejected" && !n.isDeleted);

  const getMyNotes = () => {
    if (!currentUser) return [];
    return notes.filter((n) => n.uploaderId === currentUser.id && !n.isDeleted);
  };

  /* Note Actions */
  const addNote = (newNoteData: Omit<AcademicNote, "id" | "uploadDate" | "downloadCount" | "rating" | "status">) => {
    const newNote: AcademicNote = {
      ...newNoteData,
      id: `note-${Date.now()}`,
      uploadDate: new Date().toISOString().split("T")[0],
      downloadCount: 0,
      rating: 5.0,
      status: "Pending",
    };

    const updated = [newNote, ...notes];
    saveNotes(updated);
    addActivityLog("Submitted Note for Review", newNote.title, "note");
    return newNote;
  };

  const updateNote = (id: string, updatedData: Partial<AcademicNote>) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, ...updatedData } : n));
    saveNotes(updated);
    const note = notes.find((n) => n.id === id);
    if (note) addActivityLog("Updated Note Metadata", note.title, "note");
  };

  const deleteNote = (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, isDeleted: true } : n));
    saveNotes(updated);
    const note = notes.find((n) => n.id === id);
    if (note) addActivityLog("Deleted Note", note.title, "note");
  };

  const adminApproveNote = (id: string) => {
    const note = notes.find((n) => n.id === id);
    const updated = notes.map((n) => (n.id === id ? { ...n, status: "Approved" as const, rejectionReason: undefined } : n));
    saveNotes(updated);
    if (note) addActivityLog("Approved Note", note.title, "note");
  };

  const adminBatchApprovePending = () => {
    const count = pendingNotes.length;
    const updated = notes.map((n) => (n.status === "Pending" ? { ...n, status: "Approved" as const, rejectionReason: undefined } : n));
    saveNotes(updated);
    addActivityLog("Batch Approved Pending Notes", `${count} pending notes approved`, "note");
  };

  const adminRejectNote = (id: string, reason: string) => {
    const note = notes.find((n) => n.id === id);
    const updated = notes.map((n) => (n.id === id ? { ...n, status: "Rejected" as const, rejectionReason: reason } : n));
    saveNotes(updated);
    if (note) addActivityLog("Rejected Note", note.title, "note");
  };

  const adminRestoreNote = (id: string) => {
    const note = notes.find((n) => n.id === id);
    const updated = notes.map((n) => (n.id === id ? { ...n, isDeleted: false } : n));
    saveNotes(updated);
    if (note) addActivityLog("Restored Note", note.title, "note");
  };

  const toggleBookmark = (id: string) => {
    const updated = bookmarks.includes(id) ? bookmarks.filter((b) => b !== id) : [...bookmarks, id];
    saveBookmarks(updated);
  };

  /* User Profile Updates */
  const updateUserProfile = (userId: string, updates: Partial<UserProfile>) => {
    const updatedUsers = usersList.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    saveUsers(updatedUsers);

    if (currentUser && currentUser.id === userId) {
      const updatedCurrent = { ...currentUser, ...updates };
      saveAuth(updatedCurrent);
    }
    addActivityLog("Updated User Profile", updates.name || "Student Profile", "user");
  };

  const toggleUserStatus = (userId: string) => {
    const user = usersList.find((u) => u.id === userId);
    const updated = usersList.map((u) => {
      if (u.id === userId) {
        const nextStatus = u.status === "Suspended" ? ("Active" as const) : ("Suspended" as const);
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveUsers(updated);
    if (user) addActivityLog(`Toggled User Status (${user.status === "Suspended" ? "Activated" : "Suspended"})`, user.email, "user");
  };

  const toggleUserRole = (userId: string) => {
    const user = usersList.find((u) => u.id === userId);
    const updated = usersList.map((u) => {
      if (u.id === userId) {
        const nextRole = u.role === "admin" ? ("user" as const) : ("admin" as const);
        return { ...u, role: nextRole };
      }
      return u;
    });
    saveUsers(updated);
    if (user) addActivityLog(`Changed User Role (${user.role === "admin" ? "Demoted to Student" : "Promoted to Admin"})`, user.email, "user");
  };

  /* Academic Management Actions */
  const addAcademicItem = (category: "years" | "courses" | "departments" | "semesters" | "subjects", item: string) => {
    const val = item.trim();
    if (!val) return;

    if (category === "years" && !academicYears.includes(val)) {
      const updated = [...academicYears, val];
      setAcademicYears(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY_YEARS, JSON.stringify(updated));
    } else if (category === "courses" && !coursesList.includes(val)) {
      const updated = [...coursesList, val];
      setCoursesList(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY_COURSES, JSON.stringify(updated));
    } else if (category === "departments" && !departmentsList.includes(val)) {
      const updated = [...departmentsList, val];
      setDepartmentsList(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY_DEPTS, JSON.stringify(updated));
    } else if (category === "semesters" && !semestersList.includes(val)) {
      const updated = [...semestersList, val];
      setSemestersList(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY_SEMS, JSON.stringify(updated));
    } else if (category === "subjects" && !subjectsList.includes(val)) {
      const updated = [...subjectsList, val];
      setSubjectsList(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY_SUBJECTS, JSON.stringify(updated));
    }
    addActivityLog(`Added Academic ${category.slice(0, -1)}`, val, "academic");
  };

  const deleteAcademicItem = (category: "years" | "courses" | "departments" | "semesters" | "subjects", item: string) => {
    if (category === "years") {
      const updated = academicYears.filter((i) => i !== item);
      setAcademicYears(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY_YEARS, JSON.stringify(updated));
    } else if (category === "courses") {
      const updated = coursesList.filter((i) => i !== item);
      setCoursesList(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY_COURSES, JSON.stringify(updated));
    } else if (category === "departments") {
      const updated = departmentsList.filter((i) => i !== item);
      setDepartmentsList(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY_DEPTS, JSON.stringify(updated));
    } else if (category === "semesters") {
      const updated = semestersList.filter((i) => i !== item);
      setSemestersList(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY_SEMS, JSON.stringify(updated));
    } else if (category === "subjects") {
      const updated = subjectsList.filter((i) => i !== item);
      setSubjectsList(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY_SUBJECTS, JSON.stringify(updated));
    }
    addActivityLog(`Deleted Academic ${category.slice(0, -1)}`, item, "academic");
  };

  /* Settings */
  const updateSiteSettings = (partial: Partial<SiteSettings>) => {
    const updated = { ...siteSettings, ...partial };
    setSiteSettings(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    addActivityLog("Updated Platform Settings", "Site Configuration", "settings");
  };

  /* Auth Abstraction */
  const signupUser = (data: Omit<UserProfile, "id" | "role">) => {
    const newUser: UserProfile = {
      ...data,
      id: `user-${Date.now()}`,
      role: "user", // Strictly forced to "user"
      status: "Active",
      joinDate: new Date().toISOString().split("T")[0],
    };

    saveUsers([...usersList, newUser]);
    saveAuth(newUser);
    addActivityLog("Registered New Student Account", newUser.email, "user");
    return newUser;
  };

  const loginUser = (email: string) => {
    const existing = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      saveAuth(existing);
      return existing;
    }
    // Fallback login
    const user: UserProfile = {
      id: `user-${Date.now()}`,
      name: email.split("@")[0] || "Student User",
      email: email,
      department: "Computer Science & Engineering",
      academicYear: "1st Year",
      course: "B.Tech",
      role: email.includes("admin") ? "admin" : "user",
      status: "Active",
    };
    saveAuth(user);
    return user;
  };

  const loginAsAdmin = () => {
    saveAuth(DEFAULT_ADMIN);
  };

  const loginAsStudent = () => {
    saveAuth(DEFAULT_USER);
  };

  const logout = () => {
    saveAuth(null);
  };

  return {
    isLoaded,
    notes,
    approvedNotes,
    pendingNotes,
    rejectedNotes,
    myNotes: getMyNotes(),
    currentUser,
    usersList,
    academicYears,
    coursesList,
    departmentsList,
    semestersList,
    subjectsList,
    siteSettings,
    activityLogs,
    bookmarks,
    addNote,
    updateNote,
    deleteNote,
    adminApproveNote,
    adminBatchApprovePending,
    adminRejectNote,
    adminRestoreNote,
    toggleBookmark,
    updateUserProfile,
    toggleUserStatus,
    toggleUserRole,
    addAcademicItem,
    deleteAcademicItem,
    updateSiteSettings,
    signupUser,
    loginUser,
    loginAsAdmin,
    loginAsStudent,
    logout,
  };
}
