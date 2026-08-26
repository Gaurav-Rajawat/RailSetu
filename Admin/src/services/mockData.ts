import { Corridor, Asset, ProblemReport, MaintenanceTask, Block, WorkOrder, CrewTeam, ComponentWearTelemetry, VibrationTelemetryPoint, ZoneDivision } from '../types/railway';

// ==========================================
// 1. CORRIDORS (Indian Railways Major Routes)
// ==========================================
export const initialCorridors: Corridor[] = [
  {
    id: "C12",
    name: "Delhi – Kanpur Mainline",
    section: "Northern Railway (DLI-CNB)",
    healthStatus: "WARNING",
  },
  {
    id: "C04",
    name: "Mumbai – Surat Express Corridor",
    section: "Western Railway (BCT-ST)",
    healthStatus: "CRITICAL",
  },
  {
    id: "C08",
    name: "Howrah – Kharagpur Section",
    section: "South Eastern Railway (HWH-KGP)",
    healthStatus: "HEALTHY",
  },
  {
    id: "C19",
    name: "Chennai – Arakkonam Trunk",
    section: "Southern Railway (MAS-AJJ)",
    healthStatus: "WARNING",
  },
  {
    id: "C23",
    name: "Nagpur – Wardha Junction",
    section: "Central Railway (NGP-WR)",
    healthStatus: "HEALTHY",
  },
];

// Corridor Coordinates for Mapping (Center & Track Segments)
export const corridorCoordinates: Record<string, { center: [number, number]; coordinates: [number, number][] }> = {
  "C12": {
    center: [28.6139, 77.2090], // Delhi -> Kanpur
    coordinates: [
      [28.6448, 77.2167], // New Delhi
      [28.2045, 77.9472], // Aligarh
      [27.8974, 78.0880], // Tundla
      [27.1767, 78.0081], // Agra
      [26.7606, 79.0315], // Etawah
      [26.4499, 80.3319], // Kanpur Central
    ],
  },
  "C04": {
    center: [19.0760, 72.8777], // Mumbai -> Surat
    coordinates: [
      [18.9696, 72.8193], // Mumbai Central
      [19.1982, 72.9568], // Thane
      [19.3919, 72.8397], // Vasai Road
      [19.6967, 72.7699], // Palghar
      [20.3852, 72.9106], // Vapi
      [20.5992, 72.9342], // Valsad
      [21.1702, 72.8311], // Surat
    ],
  },
  "C08": {
    center: [22.5726, 88.3639], // Howrah -> Kharagpur
    coordinates: [
      [22.5830, 88.3426], // Howrah
      [22.5851, 88.2930], // Santragachi
      [22.4837, 88.0833], // Uluberia
      [22.3833, 87.9167], // Mecheda
      [22.3986, 87.7289], // Panskura
      [22.3400, 87.3200], // Kharagpur
    ],
  },
  "C19": {
    center: [13.0827, 80.2707], // Chennai -> Arakkonam
    coordinates: [
      [13.0827, 80.2755], // Chennai Central
      [13.0850, 80.2100], // Perambur
      [13.1189, 80.1472], // Ambattur
      [13.1230, 79.9870], // Tiruvallur
      [13.0783, 79.6686], // Arakkonam Jn
    ],
  },
  "C23": {
    center: [21.1458, 79.0882], // Nagpur -> Wardha
    coordinates: [
      [21.1524, 79.0888], // Nagpur Jn
      [21.0500, 79.0100], // Butibori
      [20.8900, 78.8500], // Sindi
      [20.7453, 78.6022], // Wardha Jn
    ],
  },
};

// ==========================================
// 2. ASSETS
// ==========================================
export const initialAssets: Asset[] = [
  // Corridor C12 Assets
  { id: "AST-C12-01", corridorId: "C12", type: "TRACK", name: "Switch Point 14A Up Line (KM 412/10)", status: "CRITICAL" },
  { id: "AST-C12-02", corridorId: "C12", type: "SIGNAL", name: "Signal Post S-42 Home Interlock (Tundla)", status: "WARNING" },
  { id: "AST-C12-03", corridorId: "C12", type: "OHE", name: "Tension Mast 104/18 Catenary Wire", status: "CRITICAL" },
  { id: "AST-C12-04", corridorId: "C12", type: "TRACK", name: "Aluminothermic Weld Joint W-89 (Aligarh)", status: "HEALTHY" },

  // Corridor C04 Assets
  { id: "AST-C04-01", corridorId: "C04", type: "TRACK", name: "Diamond Crossover 102 (Vasai Yard)", status: "CRITICAL" },
  { id: "AST-C04-02", corridorId: "C04", type: "SIGNAL", name: "Digital Axle Counter DAC-08 (Palghar)", status: "CRITICAL" },
  { id: "AST-C04-03", corridorId: "C04", type: "OHE", name: "Cantilever Assembly Span 44/2 (Vapi)", status: "WARNING" },
  { id: "AST-C04-04", corridorId: "C04", type: "TRACK", name: "Expansion Joint SEJ-45 (Valsad Section)", status: "HEALTHY" },

  // Corridor C08 Assets
  { id: "AST-C08-01", corridorId: "C08", type: "TRACK", name: "Check Rail Joint Curve 18 (Santragachi)", status: "HEALTHY" },
  { id: "AST-C08-02", corridorId: "C08", type: "SIGNAL", name: "Point Machine PM-24B (Mecheda)", status: "WARNING" },
  { id: "AST-C08-03", corridorId: "C08", type: "OHE", name: "Section Insulator Mast 78/14 (Panskura)", status: "HEALTHY" },

  // Corridor C19 Assets
  { id: "AST-C19-01", corridorId: "C19", type: "TRACK", name: "PSC Sleeper Bed Fasteners (Ambattur)", status: "WARNING" },
  { id: "AST-C19-02", corridorId: "C19", type: "SIGNAL", name: "Automatic Block Signal ABS-112 (Tiruvallur)", status: "CRITICAL" },
  { id: "AST-C19-03", corridorId: "C19", type: "OHE", name: "Neutral Section Assembly (Arakkonam Jn)", status: "WARNING" },

  // Corridor C23 Assets
  { id: "AST-C23-01", corridorId: "C23", type: "TRACK", name: "Turnout 108 1:12 Curved Switch (Butibori)", status: "HEALTHY" },
  { id: "AST-C23-02", corridorId: "C23", type: "SIGNAL", name: "Track Circuit TC-880 Relay Unit (Sindi)", status: "HEALTHY" },
  { id: "AST-C23-03", corridorId: "C23", type: "OHE", name: "Dropper Wire Set Span 32/1 (Wardha)", status: "HEALTHY" },
];

// ==========================================
// 3. PROBLEM REPORTS (With accurate GPS & AI Severity)
// ==========================================
export const initialReports: ProblemReport[] = [
  // C12 Reports
  {
    id: "REP-1001",
    assetId: "AST-C12-01",
    corridorId: "C12",
    description: "Hairline transverse rail fracture observed on tongue rail at switch point 14A. Potential derailment risk under heavy freight axle load.",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 27.8980, lng: 78.0890 },
    aiSeverity: "CRITICAL",
    aiConfidence: 0.96,
    confirmedSeverity: null,
    status: "NEW",
    reportedAt: "2026-08-24T18:45:00.000Z",
  },
  {
    id: "REP-1002",
    assetId: "AST-C12-02",
    corridorId: "C12",
    description: "Signal aspect flickering to Danger intermittently due to voltage fluctuation on home signal interlock circuit.",
    photoUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 27.9010, lng: 78.0920 },
    aiSeverity: "HIGH",
    aiConfidence: 0.88,
    confirmedSeverity: "HIGH",
    status: "REVIEWED",
    reportedAt: "2026-08-24T17:15:00.000Z",
  },
  {
    id: "REP-1003",
    assetId: "AST-C12-03",
    corridorId: "C12",
    description: "Contact wire cross-sectional wear exceeds 28% limit near tension mast 104/18. Arcing observed on high-speed Rajdhani pantograph pass.",
    photoUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 27.8950, lng: 78.0840 },
    aiSeverity: "CRITICAL",
    aiConfidence: 0.94,
    confirmedSeverity: "CRITICAL",
    status: "CONVERTED",
    reportedAt: "2026-08-24T16:30:00.000Z",
  },
  {
    id: "REP-1004",
    assetId: "AST-C12-04",
    corridorId: "C12",
    description: "Slight surface corrugation detected on weld joint W-89. Recommend routine ultrasonic flaw detection testing.",
    photoUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 28.2045, lng: 77.9472 },
    aiSeverity: "LOW",
    aiConfidence: 0.82,
    confirmedSeverity: null,
    status: "NEW",
    reportedAt: "2026-08-24T14:10:00.000Z",
  },

  // C04 Reports
  {
    id: "REP-2001",
    assetId: "AST-C04-01",
    corridorId: "C04",
    description: "Severe nose wear and cracked check block on Diamond Crossover 102. Temporary speed restriction (TSR 30 km/h) imposed.",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 19.3920, lng: 72.8400 },
    aiSeverity: "CRITICAL",
    aiConfidence: 0.98,
    confirmedSeverity: "CRITICAL",
    status: "CONVERTED",
    reportedAt: "2026-08-24T19:10:00.000Z",
  },
  {
    id: "REP-2002",
    assetId: "AST-C04-02",
    corridorId: "C04",
    description: "Digital Axle Counter reset fails to verify clear block section after monsoon heavy rainfall water ingress.",
    photoUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 19.6970, lng: 72.7710 },
    aiSeverity: "CRITICAL",
    aiConfidence: 0.92,
    confirmedSeverity: null,
    status: "NEW",
    reportedAt: "2026-08-24T18:05:00.000Z",
  },
  {
    id: "REP-2003",
    assetId: "AST-C04-03",
    corridorId: "C04",
    description: "Cantilever bracket insulator flashing and loose bracket clamp detected during tower wagon inspection.",
    photoUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 20.3860, lng: 72.9120 },
    aiSeverity: "HIGH",
    aiConfidence: 0.89,
    confirmedSeverity: "HIGH",
    status: "REVIEWED",
    reportedAt: "2026-08-24T15:20:00.000Z",
  },
  {
    id: "REP-2004",
    assetId: "AST-C04-04",
    corridorId: "C04",
    description: "Switch expansion joint gap variation within tolerance (45mm). Lubrication required before thermal cycle.",
    photoUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 20.5992, lng: 72.9342 },
    aiSeverity: "LOW",
    aiConfidence: 0.91,
    confirmedSeverity: "LOW",
    status: "REVIEWED",
    reportedAt: "2026-08-24T12:00:00.000Z",
  },

  // C08 Reports
  {
    id: "REP-3001",
    assetId: "AST-C08-02",
    corridorId: "C08",
    description: "Point Machine 24B throwing circuit drawing 4.2A (threshold 3.0A). Obstruction in slide chair or gear grease hardening.",
    photoUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 22.3840, lng: 87.9180 },
    aiSeverity: "MEDIUM",
    aiConfidence: 0.86,
    confirmedSeverity: "MEDIUM",
    status: "REVIEWED",
    reportedAt: "2026-08-24T16:40:00.000Z",
  },
  {
    id: "REP-3002",
    assetId: "AST-C08-01",
    corridorId: "C08",
    description: "Check rail clearance widened by 4mm on inner curve. Requires gauge tightening and fastener replacement.",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 22.5851, lng: 88.2930 },
    aiSeverity: "MEDIUM",
    aiConfidence: 0.84,
    confirmedSeverity: null,
    status: "NEW",
    reportedAt: "2026-08-24T13:15:00.000Z",
  },

  // C19 Reports
  {
    id: "REP-4001",
    assetId: "AST-C19-02",
    corridorId: "C19",
    description: "Automatic Block Signal ABS-112 bulb filament open circuit and lamp failure relay triggered on down main line.",
    photoUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 13.1235, lng: 79.9880 },
    aiSeverity: "CRITICAL",
    aiConfidence: 0.97,
    confirmedSeverity: "CRITICAL",
    status: "CONVERTED",
    reportedAt: "2026-08-24T19:30:00.000Z",
  },
  {
    id: "REP-4002",
    assetId: "AST-C19-01",
    corridorId: "C19",
    description: "Elastic Rail Clips (ERC) missing on 12 consecutive sleepers due to vibration loosening.",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 13.1190, lng: 80.1480 },
    aiSeverity: "HIGH",
    aiConfidence: 0.91,
    confirmedSeverity: "HIGH",
    status: "REVIEWED",
    reportedAt: "2026-08-24T17:45:00.000Z",
  },
  {
    id: "REP-4003",
    assetId: "AST-C19-03",
    corridorId: "C19",
    description: "Neutral section PTFE runner displaced at Arakkonam approach. Electric locos must coast with DJ open.",
    photoUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 13.0790, lng: 79.6690 },
    aiSeverity: "HIGH",
    aiConfidence: 0.89,
    confirmedSeverity: null,
    status: "NEW",
    reportedAt: "2026-08-24T16:00:00.000Z",
  },

  // C23 Reports
  {
    id: "REP-5001",
    assetId: "AST-C23-01",
    corridorId: "C23",
    description: "Turnout 108 switch rail gap 2mm off alignment under trailing movement. Requires point tie bar adjustment.",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 21.0510, lng: 79.0110 },
    aiSeverity: "MEDIUM",
    aiConfidence: 0.87,
    confirmedSeverity: "MEDIUM",
    status: "REVIEWED",
    reportedAt: "2026-08-24T15:00:00.000Z",
  },
  {
    id: "REP-5002",
    assetId: "AST-C23-03",
    corridorId: "C23",
    description: "Dropper wire loop loose at span 32/1. Minor contact wire sag of 8mm recorded during inspection.",
    photoUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80",
    gps: { lat: 20.7460, lng: 78.6030 },
    aiSeverity: "LOW",
    aiConfidence: 0.83,
    confirmedSeverity: null,
    status: "NEW",
    reportedAt: "2026-08-24T11:30:00.000Z",
  },
];

// ==========================================
// 4. MAINTENANCE TASKS (Multi-Departmental)
// ==========================================
export const initialTasks: MaintenanceTask[] = [
  // Corridor C12 Tasks (Eligible for Multi-Dept Coordination!)
  {
    id: "TSK-C12-101",
    reportId: "REP-1001",
    department: "TRACK",
    corridorId: "C12",
    durationMinutes: 90,
    priority: 95,
    status: "PENDING",
  },
  {
    id: "TSK-C12-102",
    reportId: "REP-1002",
    department: "SIGNAL",
    corridorId: "C12",
    durationMinutes: 45,
    priority: 85,
    status: "PENDING",
  },
  {
    id: "TSK-C12-103",
    reportId: "REP-1003",
    department: "OHE",
    corridorId: "C12",
    durationMinutes: 120,
    priority: 92,
    status: "PENDING",
  },
  {
    id: "TSK-C12-104",
    reportId: "REP-1004",
    department: "TRACK",
    corridorId: "C12",
    durationMinutes: 60,
    priority: 40,
    status: "SCHEDULED",
  },

  // Corridor C04 Tasks (Eligible for Multi-Dept Coordination!)
  {
    id: "TSK-C04-201",
    reportId: "REP-2001",
    department: "TRACK",
    corridorId: "C04",
    durationMinutes: 150,
    priority: 98,
    status: "PENDING",
  },
  {
    id: "TSK-C04-202",
    reportId: "REP-2002",
    department: "SIGNAL",
    corridorId: "C04",
    durationMinutes: 60,
    priority: 94,
    status: "PENDING",
  },
  {
    id: "TSK-C04-203",
    reportId: "REP-2003",
    department: "OHE",
    corridorId: "C04",
    durationMinutes: 75,
    priority: 82,
    status: "PENDING",
  },

  // Corridor C19 Tasks (Eligible for Coordination)
  {
    id: "TSK-C19-301",
    reportId: "REP-4001",
    department: "SIGNAL",
    corridorId: "C19",
    durationMinutes: 60,
    priority: 96,
    status: "PENDING",
  },
  {
    id: "TSK-C19-302",
    reportId: "REP-4002",
    department: "TRACK",
    corridorId: "C19",
    durationMinutes: 80,
    priority: 88,
    status: "PENDING",
  },
  {
    id: "TSK-C19-303",
    reportId: "REP-4003",
    department: "OHE",
    corridorId: "C19",
    durationMinutes: 90,
    priority: 84,
    status: "PENDING",
  },

  // Corridor C08 & C23 Scheduled / Coordinated Tasks
  {
    id: "TSK-C08-401",
    reportId: "REP-3001",
    department: "SIGNAL",
    corridorId: "C08",
    durationMinutes: 45,
    priority: 65,
    status: "COORDINATED",
  },
  {
    id: "TSK-C08-402",
    reportId: "REP-3002",
    department: "TRACK",
    corridorId: "C08",
    durationMinutes: 60,
    priority: 55,
    status: "COORDINATED",
  },
  {
    id: "TSK-C23-501",
    reportId: "REP-5001",
    department: "TRACK",
    corridorId: "C23",
    durationMinutes: 40,
    priority: 60,
    status: "SCHEDULED",
  },
  {
    id: "TSK-C23-502",
    reportId: "REP-5002",
    department: "OHE",
    corridorId: "C23",
    durationMinutes: 30,
    priority: 35,
    status: "DONE",
  },
];

// ==========================================
// 5. SCHEDULED BLOCKS
// ==========================================
export const initialBlocks: Block[] = [
  {
    id: "BLK-901",
    corridorId: "C12",
    taskIds: ["TSK-C12-104"],
    startTime: "2026-08-25T01:30:00.000Z",
    endTime: "2026-08-25T03:00:00.000Z",
    status: "APPROVED",
    departmentsInvolved: ["TRACK"],
  },
  {
    id: "BLK-902",
    corridorId: "C08",
    taskIds: ["TSK-C08-401", "TSK-C08-402"],
    startTime: "2026-08-25T02:00:00.000Z",
    endTime: "2026-08-25T03:30:00.000Z",
    status: "RECOMMENDED",
    departmentsInvolved: ["TRACK", "SIGNAL"],
  },
  {
    id: "BLK-903",
    corridorId: "C04",
    taskIds: ["TSK-C04-201", "TSK-C04-202", "TSK-C04-203"],
    startTime: "2026-08-25T23:30:00.000Z",
    endTime: "2026-08-26T02:30:00.000Z",
    status: "RECOMMENDED",
    departmentsInvolved: ["TRACK", "SIGNAL", "OHE"],
  },
  {
    id: "BLK-904",
    corridorId: "C19",
    taskIds: ["TSK-C19-301", "TSK-C19-302"],
    startTime: "2026-08-26T01:00:00.000Z",
    endTime: "2026-08-26T02:45:00.000Z",
    status: "RECOMMENDED",
    departmentsInvolved: ["TRACK", "SIGNAL"],
  },
  {
    id: "BLK-905",
    corridorId: "C23",
    taskIds: ["TSK-C23-501"],
    startTime: "2026-08-24T02:00:00.000Z",
    endTime: "2026-08-24T03:00:00.000Z",
    status: "APPROVED",
    departmentsInvolved: ["TRACK"],
  },
  {
    id: "BLK-906",
    corridorId: "C12",
    taskIds: ["TSK-C12-101", "TSK-C12-102", "TSK-C12-103"],
    startTime: "2026-08-26T01:15:00.000Z",
    endTime: "2026-08-26T03:30:00.000Z",
    status: "RECOMMENDED",
    departmentsInvolved: ["TRACK", "SIGNAL", "OHE"],
  },
  {
    id: "BLK-907",
    corridorId: "C04",
    taskIds: [],
    startTime: "2026-08-23T01:00:00.000Z",
    endTime: "2026-08-23T02:30:00.000Z",
    status: "REJECTED",
    departmentsInvolved: ["OHE"],
  },
  {
    id: "BLK-908",
    corridorId: "C19",
    taskIds: ["TSK-C19-303"],
    startTime: "2026-08-27T02:00:00.000Z",
    endTime: "2026-08-27T03:45:00.000Z",
    status: "MODIFIED",
    departmentsInvolved: ["OHE"],
  },
];

// ==========================================
// 6. WORK ORDERS (Industrial Grid Dataset)
// ==========================================
export const initialWorkOrders: WorkOrder[] = [
  {
    id: "WO-8492",
    assetTrack: "TRK-C12-KM104",
    corridorId: "C12",
    issueType: "Rail Head Spalling & Micro-fissures",
    department: "TRACK",
    priority: "CRITICAL",
    assignedCrew: "Gang 14 (P-Way Fast Action)",
    status: "IN_PROGRESS",
    reportedAt: "2026-08-25T11:20:00.000Z",
    estimatedDurationHours: 3.5,
    progressPercent: 65,
    actionRequired: "Ultrasonic weld grind & fishplate reinforcement",
    zone: "Northern Railway (NR)",
  },
  {
    id: "WO-8493",
    assetTrack: "OHE-C04-MAST88",
    corridorId: "C04",
    issueType: "Dropper Wire Tension Loss & Sag",
    department: "OHE",
    priority: "CRITICAL",
    assignedCrew: "Traction Flying Squad 2",
    status: "DISPATCHED",
    reportedAt: "2026-08-25T13:45:00.000Z",
    estimatedDurationHours: 2.0,
    progressPercent: 30,
    actionRequired: "Contact wire re-tensioning and dropper replacement",
    zone: "Western Railway (WR)",
  },
  {
    id: "WO-8494",
    assetTrack: "SIG-C12-SW402",
    corridorId: "C12",
    issueType: "Point Machine Actuator Jitter (120ms)",
    department: "SIGNAL",
    priority: "HIGH",
    assignedCrew: "S&T Rapid Response Alpha",
    status: "IN_PROGRESS",
    reportedAt: "2026-08-25T09:10:00.000Z",
    estimatedDurationHours: 2.5,
    progressPercent: 45,
    actionRequired: "Clean switch rail slides & recalibrate stroke detector",
    zone: "Northern Railway (NR)",
  },
  {
    id: "WO-8495",
    assetTrack: "TRK-C19-KM32",
    corridorId: "C19",
    issueType: "Fishplate Bolt Torque Loosening",
    department: "TRACK",
    priority: "HIGH",
    assignedCrew: "Gang 08 (Southern Track Section)",
    status: "PENDING_PARTS",
    reportedAt: "2026-08-25T07:30:00.000Z",
    estimatedDurationHours: 1.5,
    progressPercent: 15,
    actionRequired: "Torque check all 4 bolts with pneumatic torque wrench",
    zone: "Southern Railway (SR)",
  },
  {
    id: "WO-8496",
    assetTrack: "OHE-C08-SEC03",
    corridorId: "C08",
    issueType: "Cantilever Insulator Flashover Dusting",
    department: "OHE",
    priority: "MEDIUM",
    assignedCrew: "Depot Line Maintenance 4",
    status: "SCHEDULED",
    reportedAt: "2026-08-24T16:00:00.000Z",
    estimatedDurationHours: 4.0,
    progressPercent: 0,
    actionRequired: "Wash porcelain insulator strings & inspect grounding bond",
    zone: "South Eastern Railway (SER)",
  },
  {
    id: "WO-8497",
    assetTrack: "TRK-C23-BRG12",
    corridorId: "C23",
    issueType: "Bridge Bearing Elastic Pad Displacement",
    department: "TRACK",
    priority: "MEDIUM",
    assignedCrew: "Central Engineering Wing 3",
    status: "IN_PROGRESS",
    reportedAt: "2026-08-24T14:15:00.000Z",
    estimatedDurationHours: 5.0,
    progressPercent: 80,
    actionRequired: "Hydraulic jacking of girder end & pad replacement",
    zone: "Central Railway (CR)",
  },
  {
    id: "WO-8498",
    assetTrack: "SIG-C04-TC11",
    corridorId: "C04",
    issueType: "Track Circuit Audio Frequency Relay Noise",
    department: "SIGNAL",
    priority: "HIGH",
    assignedCrew: "S&T Signal Techs Unit 02",
    status: "DISPATCHED",
    reportedAt: "2026-08-25T14:30:00.000Z",
    estimatedDurationHours: 1.8,
    progressPercent: 20,
    actionRequired: "Oscilloscope impedance test and bond wire renewal",
    zone: "Western Railway (WR)",
  },
  {
    id: "WO-8499",
    assetTrack: "TRK-C12-SLP99",
    corridorId: "C12",
    issueType: "Prestressed Concrete Sleeper Hairline Crack",
    department: "TRACK",
    priority: "LOW",
    assignedCrew: "P-Way Heavy Tamping Squad",
    status: "COMPLETED",
    reportedAt: "2026-08-24T08:00:00.000Z",
    estimatedDurationHours: 2.0,
    progressPercent: 100,
    actionRequired: "Replace sleeper & mechanical ballast tamper pass",
    zone: "Northern Railway (NR)",
  },
];

// ==========================================
// 7. CREW TEAMS (Dispatch Roster)
// ==========================================
export const initialCrewTeams: CrewTeam[] = [
  {
    id: "CREW-01",
    name: "Gang 14 (P-Way Fast Action)",
    department: "TRACK",
    leadName: "R. K. Meena (PWI-1)",
    membersCount: 8,
    contactNumber: "+91 98712-44321",
    status: "DISPATCHED",
    currentLocation: "Delhi–Kanpur KM 104",
    activeWorkOrderId: "WO-8492",
    etaMinutes: 12,
  },
  {
    id: "CREW-02",
    name: "Traction Flying Squad 2",
    department: "OHE",
    leadName: "A. Sengupta (ADE/TRD)",
    membersCount: 6,
    contactNumber: "+91 98201-88942",
    status: "DISPATCHED",
    currentLocation: "Mumbai–Surat Mast 88",
    activeWorkOrderId: "WO-8493",
    etaMinutes: 18,
  },
  {
    id: "CREW-03",
    name: "S&T Rapid Response Alpha",
    department: "SIGNAL",
    leadName: "V. Pillai (SSE/Sig)",
    membersCount: 4,
    contactNumber: "+91 97410-12894",
    status: "DISPATCHED",
    currentLocation: "Kanpur Central Yard Point 402",
    activeWorkOrderId: "WO-8494",
    etaMinutes: 8,
  },
  {
    id: "CREW-04",
    name: "Gang 08 (Heavy Track Section)",
    department: "TRACK",
    leadName: "S. Yadav (SSE/P-Way)",
    membersCount: 12,
    contactNumber: "+91 94150-77821",
    status: "AVAILABLE",
    currentLocation: "Ghaziabad Maintenance Yard",
  },
  {
    id: "CREW-05",
    name: "OHE Emergency Power Unit",
    department: "OHE",
    leadName: "T. Narayanan (TRD Engr)",
    membersCount: 5,
    contactNumber: "+91 98400-55120",
    status: "ON_STANDBY",
    currentLocation: "Palghar Traction Substation",
  },
  {
    id: "CREW-06",
    name: "Signal & Interlocking Gang 3",
    department: "SIGNAL",
    leadName: "H. Patel (JE/Sig)",
    membersCount: 6,
    contactNumber: "+91 98250-99411",
    status: "AVAILABLE",
    currentLocation: "Vadodara Division Depot",
  },
];

// ==========================================
// 8. PREDICTIVE COMPONENT WEAR TELEMETRY
// ==========================================
export const initialComponentWear: ComponentWearTelemetry = {
  brakePadsWear: 74,
  wheelProfileWear: 58,
  pantographStripWear: 82,
  brakePadKmRemaining: 12400,
  wheelProfileKmRemaining: 34200,
  pantographKmRemaining: 4800,
  monitoredUnitsCount: 142,
  criticalUnitsCount: 7,
};

// ==========================================
// 9. 24-HOUR VIBRATION & ACOUSTIC TIME SERIES
// ==========================================
export const initialVibrationSeries: VibrationTelemetryPoint[] = [
  { time: "00:00", trackVibration: 0.32, stressFrequency: 32, acousticAnomaly: 46, baselineVibration: 0.35 },
  { time: "02:00", trackVibration: 0.29, stressFrequency: 30, acousticAnomaly: 44, baselineVibration: 0.35 },
  { time: "04:00", trackVibration: 0.38, stressFrequency: 35, acousticAnomaly: 48, baselineVibration: 0.35 },
  { time: "06:00", trackVibration: 0.62, stressFrequency: 44, acousticAnomaly: 58, baselineVibration: 0.35 },
  { time: "08:00", trackVibration: 0.88, stressFrequency: 52, acousticAnomaly: 71, baselineVibration: 0.35 },
  { time: "10:00", trackVibration: 1.14, stressFrequency: 62, acousticAnomaly: 86, baselineVibration: 0.35 },
  { time: "12:00", trackVibration: 0.95, stressFrequency: 56, acousticAnomaly: 74, baselineVibration: 0.35 },
  { time: "14:00", trackVibration: 1.08, stressFrequency: 59, acousticAnomaly: 82, baselineVibration: 0.35 },
  { time: "16:00", trackVibration: 1.18, stressFrequency: 66, acousticAnomaly: 91, baselineVibration: 0.35 },
  { time: "18:00", trackVibration: 0.85, stressFrequency: 50, acousticAnomaly: 68, baselineVibration: 0.35 },
  { time: "20:00", trackVibration: 0.72, stressFrequency: 42, acousticAnomaly: 62, baselineVibration: 0.35 },
  { time: "22:00", trackVibration: 0.45, stressFrequency: 36, acousticAnomaly: 52, baselineVibration: 0.35 },
];

// ==========================================
// 10. ZONE DIVISIONS
// ==========================================
export const zoneDivisions: ZoneDivision[] = [
  { id: "NR", name: "Northern Railway", code: "NR", headquarters: "New Delhi (NDLS)", activeCorridors: ["C12"] },
  { id: "WR", name: "Western Railway", code: "WR", headquarters: "Mumbai (MMCT)", activeCorridors: ["C04"] },
  { id: "CR", name: "Central Railway", code: "CR", headquarters: "Mumbai CSMT", activeCorridors: ["C23"] },
  { id: "ER", name: "Eastern Railway", code: "ER", headquarters: "Kolkata (Fairlie)", activeCorridors: ["C08"] },
  { id: "SR", name: "Southern Railway", code: "SR", headquarters: "Chennai (MAS)", activeCorridors: ["C19"] },
];

// ==========================================
// In-Memory Mutable State Store for Session
// ==========================================
class MockDatabase {
  private corridors: Corridor[] = [...initialCorridors];
  private assets: Asset[] = [...initialAssets];
  private reports: ProblemReport[] = [...initialReports];
  private tasks: MaintenanceTask[] = [...initialTasks];
  private blocks: Block[] = [...initialBlocks];
  private workOrders: WorkOrder[] = [...initialWorkOrders];
  private crewTeams: CrewTeam[] = [...initialCrewTeams];
  private componentWear: ComponentWearTelemetry = { ...initialComponentWear };
  private vibrationSeries: VibrationTelemetryPoint[] = [...initialVibrationSeries];

  getCorridors(): Corridor[] {
    return [...this.corridors];
  }

  getAssets(): Asset[] {
    return [...this.assets];
  }

  getReports(): ProblemReport[] {
    return [...this.reports];
  }

  getTasks(): MaintenanceTask[] {
    return [...this.tasks];
  }

  getBlocks(): Block[] {
    return [...this.blocks];
  }

  getWorkOrders(): WorkOrder[] {
    return [...this.workOrders];
  }

  getCrewTeams(): CrewTeam[] {
    return [...this.crewTeams];
  }

  getComponentWear(): ComponentWearTelemetry {
    return { ...this.componentWear };
  }

  getVibrationSeries(): VibrationTelemetryPoint[] {
    return [...this.vibrationSeries];
  }

  getReportById(id: string): ProblemReport | undefined {
    return this.reports.find(r => r.id === id);
  }

  updateReportSeverity(id: string, confirmedSeverity: ProblemReport["confirmedSeverity"]): ProblemReport {
    const report = this.reports.find(r => r.id === id);
    if (!report) throw new Error(`Report ${id} not found`);
    report.confirmedSeverity = confirmedSeverity;
    report.status = "REVIEWED";
    return { ...report };
  }

  convertReportToTask(reportId: string, department: "TRACK" | "SIGNAL" | "OHE", durationMinutes: number): MaintenanceTask {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) throw new Error(`Report ${reportId} not found`);
    report.status = "CONVERTED";

    const newTask: MaintenanceTask = {
      id: `TSK-GEN-${Math.floor(100 + Math.random() * 900)}`,
      reportId: report.id,
      department,
      corridorId: report.corridorId,
      durationMinutes,
      priority: report.confirmedSeverity === "CRITICAL" || report.aiSeverity === "CRITICAL" ? 95 : 75,
      status: "PENDING",
    };
    this.tasks.unshift(newTask);
    return newTask;
  }

  dispatchCrewToAlert(alertId: string, crewId: string, notes?: string): WorkOrder {
    const report = this.reports.find(r => r.id === alertId);
    const crew = this.crewTeams.find(c => c.id === crewId);

    if (crew) {
      crew.status = "DISPATCHED";
      crew.etaMinutes = 15;
    }

    if (report) {
      report.status = "REVIEWED";
    }

    const newWO: WorkOrder = {
      id: `WO-${Math.floor(8500 + Math.random() * 500)}`,
      assetTrack: report?.assetId || `TRK-${report?.corridorId || 'C12'}-GEN`,
      corridorId: report?.corridorId || "C12",
      issueType: report?.description || "Urgent Track Anomaly",
      department: "TRACK",
      priority: (report?.confirmedSeverity || report?.aiSeverity || "HIGH") as WorkOrder["priority"],
      assignedCrew: crew?.name || "Emergency Rapid Gang",
      status: "DISPATCHED",
      reportedAt: new Date().toISOString(),
      estimatedDurationHours: 2.5,
      progressPercent: 10,
      actionRequired: notes || "Immediate physical inspection and containment",
      zone: "Northern Railway (NR)",
    };

    this.workOrders.unshift(newWO);
    return newWO;
  }

  updateWorkOrderStatus(workOrderId: string, status: WorkOrder["status"], progressPercent?: number): WorkOrder {
    const wo = this.workOrders.find(w => w.id === workOrderId);
    if (!wo) throw new Error(`Work order ${workOrderId} not found`);
    wo.status = status;
    if (progressPercent !== undefined) {
      wo.progressPercent = progressPercent;
    }
    return { ...wo };
  }

  proposeBlock(data: { corridorId: string; taskIds: string[]; startTime: string; endTime: string }): Block {
    const matchedTasks = this.tasks.filter(t => data.taskIds.includes(t.id));
    const depts = Array.from(new Set(matchedTasks.map(t => t.department)));

    // Mark tasks as coordinated
    this.tasks.forEach(t => {
      if (data.taskIds.includes(t.id)) {
        t.status = "COORDINATED";
      }
    });

    const newBlock: Block = {
      id: `BLK-${Math.floor(1000 + Math.random() * 9000)}`,
      corridorId: data.corridorId,
      taskIds: data.taskIds,
      startTime: data.startTime,
      endTime: data.endTime,
      status: "RECOMMENDED",
      departmentsInvolved: depts.length > 0 ? depts : ["TRACK"],
    };
    this.blocks.unshift(newBlock);
    return newBlock;
  }

  updateBlockStatus(blockId: string, status: Block["status"]): Block {
    const block = this.blocks.find(b => b.id === blockId);
    if (!block) throw new Error(`Block ${blockId} not found`);
    block.status = status;
    return { ...block };
  }

  updateBlockTime(blockId: string, startTime: string, endTime: string): Block {
    const block = this.blocks.find(b => b.id === blockId);
    if (!block) throw new Error(`Block ${blockId} not found`);
    block.startTime = startTime;
    block.endTime = endTime;
    block.status = "MODIFIED";
    return { ...block };
  }
}

export const mockDb = new MockDatabase();
