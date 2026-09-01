import { Fragment } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker } from 'react-leaflet';
import { Corridor, ProblemReport } from '@/types/railway';
import { useUIStore } from '@/store/uiStore';

interface RailwayMapProps {
  corridors?: Corridor[];
  reports?: ProblemReport[];
  activeCorridorId?: string;
  selectedReportId?: string | null;
  height?: string;
  className?: string;
}

// =============================================================================
// COMPREHENSIVE INDIAN RAILWAY NETWORK TRUNK ROUTES & CORRIDORS
// =============================================================================
interface RailwayRoute {
  id: string;
  name: string;
  category: 'quadrilateral' | 'diagonal' | 'trunk' | 'coastal' | 'feeder';
  color: string;
  glowColor: string;
  coordinates: [number, number][];
}

const INDIAN_RAILWAY_ROUTES: RailwayRoute[] = [
  // 1. Delhi - Mumbai Western Trunk Route (via Mathura, Kota, Ratlam, Vadodara, Surat)
  {
    id: 'DEL-MUM',
    name: 'Delhi - Mumbai Western Corridor',
    category: 'quadrilateral',
    color: '#38BDF8', // Sky Blue
    glowColor: '#0284C7',
    coordinates: [
      [28.6448, 77.2167], // New Delhi
      [28.1487, 77.3260], // Palwal
      [27.4924, 77.6737], // Mathura
      [27.2152, 77.4920], // Bharatpur
      [26.9855, 76.5714], // Gangapur City
      [25.9928, 76.3529], // Sawai Madhopur
      [25.1800, 75.8300], // Kota Jn
      [24.5364, 75.8362], // Ramganj Mandi
      [24.1500, 75.2300], // Shamgarh
      [23.8340, 75.0550], // Nagda Jn
      [23.3315, 75.0367], // Ratlam Jn
      [22.8300, 74.2500], // Dahod
      [22.7758, 73.6149], // Godhra Jn
      [22.3072, 73.1812], // Vadodara Jn
      [21.7051, 72.9959], // Bharuch Jn
      [21.1702, 72.8311], // Surat
      [20.9467, 72.9520], // Navsari
      [20.5992, 72.9342], // Valsad
      [20.3852, 72.9106], // Vapi
      [19.6967, 72.7699], // Palghar
      [19.3919, 72.8397], // Vasai Road
      [19.1982, 72.9568], // Thane
      [18.9696, 72.8193], // Mumbai Central
    ],
  },

  // 2. Delhi - Howrah Eastern Trunk Route (via Kanpur, Prayagraj, Pt. Deen Dayal Upadhyaya, Gaya, Asansol)
  {
    id: 'DEL-HWH',
    name: 'Delhi - Howrah Eastern Trunk Route',
    category: 'quadrilateral',
    color: '#34D399', // Emerald
    glowColor: '#059669',
    coordinates: [
      [28.6448, 77.2167], // New Delhi
      [28.6692, 77.4538], // Ghaziabad
      [28.2045, 77.9472], // Aligarh Jn
      [27.8974, 78.0880], // Tundla Jn
      [27.1767, 78.0081], // Agra
      [26.7606, 79.0315], // Etawah
      [26.4499, 80.3319], // Kanpur Central
      [25.9284, 80.8128], // Fatehpur
      [25.4358, 81.8463], // Prayagraj Jn (Allahabad)
      [25.1462, 82.5690], // Mirzapur
      [25.2818, 83.1186], // Pt. Deen Dayal Upadhyaya Jn (Mughalsarai)
      [25.5647, 83.9777], // Buxar
      [25.6093, 85.1235], // Patna Jn
      [24.7914, 85.0002], // Gaya Jn
      [24.4674, 85.5938], // Koderma
      [23.7957, 86.4304], // Dhanbad Jn
      [23.6889, 86.9661], // Asansol Jn
      [23.5204, 87.3119], // Durgapur
      [23.2324, 87.8615], // Bardhaman Jn
      [22.5830, 88.3426], // Howrah Jn
    ],
  },

  // 3. Howrah - Chennai East Coast Corridor (via Kharagpur, Bhubaneswar, Visakhapatnam, Vijayawada)
  {
    id: 'HWH-MAS',
    name: 'Howrah - Chennai East Coast Trunk',
    category: 'quadrilateral',
    color: '#FBBF24', // Amber
    glowColor: '#D97706',
    coordinates: [
      [22.5830, 88.3426], // Howrah
      [22.5851, 88.2930], // Santragachi
      [22.3400, 87.3200], // Kharagpur Jn
      [21.4934, 86.9135], // Balasore
      [21.0574, 86.4955], // Bhadrak
      [20.8520, 86.1360], // Jajpur Keonjhar Road
      [20.4625, 85.8828], // Cuttack Jn
      [20.2706, 85.8334], // Bhubaneswar
      [20.1800, 85.6200], // Khurda Road Jn
      [19.3149, 84.7941], // Brahmapur
      [18.7750, 84.4170], // Palasa
      [18.2969, 83.8967], // Srikakulam Road
      [18.1130, 83.4140], // Vizianagaram Jn
      [17.7215, 83.2986], // Visakhapatnam Jn
      [17.0005, 82.2360], // Samalkot Jn
      [17.0000, 81.8040], // Rajahmundry
      [16.7107, 81.0952], // Eluru
      [16.5186, 80.6200], // Vijayawada Jn
      [15.5057, 80.0499], // Ongole
      [14.4426, 79.9865], // Nellore
      [14.1460, 79.8500], // Gudur Jn
      [13.0827, 80.2755], // Chennai Central
    ],
  },

  // 4. Mumbai - Chennai South-Western Trunk (via Pune, Solapur, Wadi, Guntakal, Renigunta)
  {
    id: 'MUM-MAS',
    name: 'Mumbai - Chennai South-Western Trunk',
    category: 'quadrilateral',
    color: '#A78BFA', // Purple
    glowColor: '#7C3AED',
    coordinates: [
      [18.9696, 72.8193], // Mumbai Central
      [19.0330, 73.0297], // Navi Mumbai / Panvel
      [18.7500, 73.4100], // Lonavala
      [18.5284, 73.8739], // Pune Jn
      [18.4600, 74.5800], // Daund Jn
      [18.0800, 75.3300], // Kurduvadi Jn
      [17.6599, 75.9064], // Solapur
      [17.3297, 76.8343], // Kalaburagi (Gulbarga)
      [17.0500, 76.9900], // Wadi Jn
      [16.2076, 77.3556], // Raichur
      [15.1667, 77.3667], // Guntakal Jn
      [15.1167, 77.6333], // Gooty Jn
      [14.9080, 78.0100], // Tadipatri
      [14.4673, 78.8242], // Kadapa (Cuddapah)
      [13.6288, 79.4192], // Renigunta / Tirupati
      [13.0783, 79.6686], // Arakkonam Jn
      [13.0827, 80.2755], // Chennai Central
    ],
  },

  // 5. Delhi - Chennai Grand Trunk Diagonal (via Agra, Gwalior, Jhansi, Bhopal, Nagpur, Balharshah, Vijayawada)
  {
    id: 'DEL-MAS',
    name: 'Grand Trunk Diagonal Corridor',
    category: 'diagonal',
    color: '#F472B6', // Pink
    glowColor: '#DB2777',
    coordinates: [
      [28.6448, 77.2167], // New Delhi
      [27.4924, 77.6737], // Mathura Jn
      [27.1767, 78.0081], // Agra Cantt
      [26.2183, 78.1828], // Gwalior Jn
      [25.4484, 78.5685], // Jhansi Jn (Virangana Lakshmibai)
      [24.6850, 78.4100], // Lalitpur
      [24.1800, 78.1800], // Bina Jn
      [23.2599, 77.4126], // Bhopal Jn
      [22.6100, 77.7600], // Itarsi Jn
      [21.9040, 77.9000], // Betul
      [21.1524, 79.0888], // Nagpur Jn
      [20.7453, 78.6022], // Sevagram / Wardha
      [19.9500, 79.3000], // Chandrapur
      [19.3500, 79.3500], // Balharshah Jn
      [18.7600, 79.5100], // Ramagundam
      [17.9689, 79.5941], // Warangal / Kazipet Jn
      [17.2500, 80.1500], // Khammam
      [16.5186, 80.6200], // Vijayawada Jn
      [13.0827, 80.2755], // Chennai Central
    ],
  },

  // 6. Mumbai - Howrah Central / SE Diagonal (via Bhusawal, Nagpur, Raipur, Bilaspur, Rourkela, Tatanagar)
  {
    id: 'MUM-HWH',
    name: 'Mumbai - Howrah Central Trunk',
    category: 'diagonal',
    color: '#60A5FA', // Blue
    glowColor: '#2563EB',
    coordinates: [
      [18.9696, 72.8193], // Mumbai Central
      [19.2437, 73.1355], // Kalyan Jn
      [19.7000, 73.6000], // Igatpuri
      [19.9975, 73.7898], // Nashik Road
      [20.2500, 74.4500], // Manmad Jn
      [20.9000, 75.3000], // Jalgaon Jn
      [21.0500, 75.7800], // Bhusawal Jn
      [20.7000, 77.0000], // Akola Jn
      [20.9300, 77.7500], // Badnera (Amravati)
      [20.7453, 78.6022], // Wardha Jn
      [21.1524, 79.0888], // Nagpur Jn
      [21.4600, 80.2000], // Gondia Jn
      [21.1900, 81.2800], // Durg Jn
      [21.2514, 81.6296], // Raipur Jn
      [22.0797, 82.1409], // Bilaspur Jn
      [21.8900, 83.4000], // Raigarh
      [21.8500, 84.0000], // Jharsuguda Jn
      [22.2492, 84.8828], // Rourkela Jn
      [22.6800, 85.6300], // Chakradharpur
      [22.8046, 86.2029], // Tatanagar Jn (Jamshedpur)
      [22.3400, 87.3200], // Kharagpur Jn
      [22.5830, 88.3426], // Howrah Jn
    ],
  },

  // 7. Bengaluru - Chennai Corridor (via Bangarapet, Jolarpettai, Katpadi, Arakkonam)
  {
    id: 'SBC-MAS',
    name: 'Bengaluru - Chennai Express Corridor',
    category: 'trunk',
    color: '#2DD4BF', // Teal
    glowColor: '#0D9488',
    coordinates: [
      [12.9781, 77.5694], // KSR Bengaluru (Bangalore)
      [12.9960, 77.6970], // Krishnarajapuram
      [12.9800, 78.1800], // Bangarapet Jn
      [12.5800, 78.5800], // Jolarpettai Jn
      [12.9790, 79.1370], // Katpadi Jn (Vellore)
      [13.0783, 79.6686], // Arakkonam Jn
      [13.0827, 80.2755], // Chennai Central
    ],
  },

  // 8. Bengaluru - Hyderabad Corridor (via Dharmavaram, Anantapur, Kurnool, Mahbubnagar)
  {
    id: 'SBC-HYB',
    name: 'Bengaluru - Hyderabad Corridor',
    category: 'trunk',
    color: '#F87171', // Red/Coral
    glowColor: '#DC2626',
    coordinates: [
      [12.9781, 77.5694], // KSR Bengaluru
      [13.1000, 77.5900], // Yelahanka Jn
      [13.8300, 77.4900], // Hindupur
      [14.4100, 77.7200], // Dharmavaram Jn
      [14.6800, 77.6000], // Anantapur
      [15.1167, 77.6333], // Gooty Jn
      [15.3900, 77.8700], // Dhone Jn
      [15.8281, 78.0373], // Kurnool City
      [16.2300, 77.8000], // Gadwal
      [16.7400, 78.0000], // Mahbubnagar
      [17.3600, 78.4700], // Kacheguda
      [17.4334, 78.5015], // Secunderabad Jn
    ],
  },

  // 9. Konkan Railway Coastal Route (Mumbai -> Ratnagiri -> Goa -> Karwar -> Mangaluru)
  {
    id: 'KR-COAST',
    name: 'Konkan Railway Coastal Route',
    category: 'coastal',
    color: '#38BDF8', // Cyan/Sky
    glowColor: '#0284C7',
    coordinates: [
      [18.9696, 72.8193], // Mumbai
      [18.9900, 73.1200], // Panvel
      [18.2300, 73.1200], // Roha
      [17.5300, 73.5200], // Chiplun
      [16.9800, 73.3000], // Ratnagiri
      [16.1600, 73.7000], // Kankavli
      [15.2750, 73.9780], // Madgaon Jn (Goa)
      [14.8100, 74.1300], // Karwar
      [14.2800, 74.4500], // Kumta
      [13.8800, 74.6000], // Bhatkal
      [13.3400, 74.7400], // Udupi
      [12.8700, 74.8800], // Mangaluru Jn
    ],
  },

  // 10. Southern Kerala Trunk (Mangaluru -> Kozhikode -> Shoranur -> Kochi -> Thiruvananthapuram -> Kanyakumari)
  {
    id: 'KER-TRUNK',
    name: 'Kerala Southern Trunk Corridor',
    category: 'coastal',
    color: '#34D399', // Emerald
    glowColor: '#059669',
    coordinates: [
      [12.8700, 74.8800], // Mangaluru Jn
      [12.5100, 74.9800], // Kasaragod
      [11.8700, 75.3700], // Kannur
      [11.2588, 75.7804], // Kozhikode (Calicut)
      [10.7600, 76.2700], // Shoranur Jn
      [10.5276, 76.2144], // Thrissur
      [9.9699, 76.2866], // Ernakulam Jn (Kochi)
      [9.4981, 76.3388], // Alappuzha (Alleppey)
      [8.8932, 76.6141], // Kollam Jn (Quilon)
      [8.4875, 76.9525], // Thiruvananthapuram Central (Trivandrum)
      [8.1800, 77.4300], // Nagercoil Jn
      [8.0883, 77.5385], // Kanyakumari
    ],
  },

  // 11. Northern Jammu & Kashmir Route (Delhi -> Ambala -> Ludhiana -> Jalandhar -> Jammu -> Katra)
  {
    id: 'NR-JAT',
    name: 'Northern Jammu & Kashmir Route',
    category: 'trunk',
    color: '#FBBF24', // Amber
    glowColor: '#D97706',
    coordinates: [
      [28.6448, 77.2167], // New Delhi
      [29.3909, 76.9635], // Panipat
      [29.9695, 76.8783], // Kurukshetra
      [30.3752, 76.7821], // Ambala Cantt
      [30.9010, 75.8573], // Ludhiana Jn
      [31.3260, 75.5762], // Jalandhar Cantt
      [31.6340, 74.8723], // Amritsar Jn
      [31.3260, 75.5762], // (branch back to Jalandhar)
      [32.2680, 75.6520], // Pathankot Cantt
      [32.3800, 75.5200], // Kathua
      [32.7060, 74.8789], // Jammu Tawi
      [32.9200, 75.1400], // Udhampur
      [32.9934, 74.9317], // Shri Mata Vaishno Devi Katra
    ],
  },

  // 12. Western Rajasthan / Gujarat Link (Delhi -> Jaipur -> Ajmer -> Ahmedabad)
  {
    id: 'NWR-AII',
    name: 'Delhi - Jaipur - Ahmedabad Corridor',
    category: 'trunk',
    color: '#A78BFA', // Purple
    glowColor: '#7C3AED',
    coordinates: [
      [28.6448, 77.2167], // New Delhi
      [28.4595, 77.0266], // Gurgaon
      [28.1920, 76.6190], // Rewari Jn
      [27.5530, 76.6346], // Alwar Jn
      [27.0500, 76.5700], // Bandikui Jn
      [26.9196, 75.7878], // Jaipur Jn
      [26.4499, 74.6399], // Ajmer Jn
      [26.1000, 74.3200], // Beawar
      [25.6800, 73.6000], // Marwar Jn
      [25.2200, 73.2300], // Falna
      [24.4800, 72.7800], // Abu Road
      [24.1700, 72.4300], // Palanpur Jn
      [23.6000, 72.4000], // Mahesana Jn
      [23.0225, 72.5714], // Ahmedabad Jn
    ],
  },

  // 13. Northeast Frontier Corridor (Katihar -> NJP -> Guwahati -> Dibrugarh)
  {
    id: 'NFR-GHY',
    name: 'Northeast Frontier Gateway',
    category: 'trunk',
    color: '#38BDF8', // Cyan
    glowColor: '#0284C7',
    coordinates: [
      [25.6093, 85.1235], // Patna
      [25.5394, 87.5714], // Katihar Jn
      [26.1000, 87.9500], // Kishanganj
      [26.6800, 88.4400], // New Jalpaiguri (NJP / Siliguri)
      [26.3300, 89.4700], // New Cooch Behar
      [26.5000, 90.5400], // New Bongaigaon Jn
      [26.4500, 91.6000], // Rangiya Jn
      [26.1824, 91.7505], // Guwahati
      [25.7500, 92.9500], // Lumding Jn
      [25.9000, 93.7300], // Dimapur (Nagaland)
      [26.7500, 94.2200], // Mariani Jn (Jorhat)
      [27.4728, 94.9120], // Dibrugarh
    ],
  },

  // 14. Central MP - UP Connector (Indore -> Bhopal -> Jabalpur -> Prayagraj)
  {
    id: 'WCR-JBP',
    name: 'Central East-West Connector',
    category: 'feeder',
    color: '#F472B6', // Pink
    glowColor: '#DB2777',
    coordinates: [
      [22.7196, 75.8577], // Indore Jn
      [23.1765, 75.7885], // Ujjain Jn
      [23.2599, 77.4126], // Bhopal Jn
      [22.6100, 77.7600], // Itarsi Jn
      [22.9000, 78.7800], // Pipariya
      [23.1815, 79.9864], // Jabalpur Jn
      [23.8300, 80.4000], // Katni Jn
      [24.5800, 80.8300], // Satna Jn
      [25.4358, 81.8463], // Prayagraj Jn
    ],
  },

  // 15. South Central Telangana - AP Link (Secunderabad -> Kazipet -> Vijayawada -> Visakhapatnam)
  {
    id: 'SCR-VSKP',
    name: 'Secunderabad - Coastal AP Link',
    category: 'trunk',
    color: '#34D399', // Emerald
    glowColor: '#059669',
    coordinates: [
      [17.4334, 78.5015], // Secunderabad Jn
      [17.9689, 79.5941], // Kazipet Jn
      [17.2500, 80.1500], // Khammam
      [16.5186, 80.6200], // Vijayawada Jn
      [17.0000, 81.8040], // Rajahmundry
      [17.7215, 83.2986], // Visakhapatnam Jn
    ],
  },

  // 16. Tamil Nadu Southern Spine (Chennai -> Tiruchirappalli -> Madurai -> Tirunelveli -> Kanyakumari)
  {
    id: 'SR-MDU',
    name: 'Tamil Nadu Southern Spine',
    category: 'trunk',
    color: '#FBBF24', // Amber
    glowColor: '#D97706',
    coordinates: [
      [13.0827, 80.2755], // Chennai Central / Egmore
      [12.6800, 79.9800], // Chengalpattu Jn
      [11.9400, 79.4900], // Villupuram Jn
      [11.5300, 79.3300], // Vriddhachalam Jn
      [10.7905, 78.7047], // Tiruchirappalli Jn (Trichy)
      [10.3600, 77.9800], // Dindigul Jn
      [9.9195, 78.1118], // Madurai Jn
      [9.5800, 77.9500], // Virudhunagar Jn
      [8.7139, 77.7567], // Tirunelveli Jn
      [8.0883, 77.5385], // Kanyakumari
    ],
  },
];

// Major Indian Railway Junctions / Telemetry Nodes
interface RailwayHub {
  id: string;
  name: string;
  code: string;
  coords: [number, number];
  isMajor: boolean;
}

const INDIAN_RAILWAY_HUBS: RailwayHub[] = [
  { id: 'NDLS', name: 'New Delhi', code: 'NDLS', coords: [28.6448, 77.2167], isMajor: true },
  { id: 'MMCT', name: 'Mumbai Central', code: 'MMCT', coords: [18.9696, 72.8193], isMajor: true },
  { id: 'HWH', name: 'Howrah (Kolkata)', code: 'HWH', coords: [22.5830, 88.3426], isMajor: true },
  { id: 'MAS', name: 'Chennai Central', code: 'MAS', coords: [13.0827, 80.2755], isMajor: true },
  { id: 'SBC', name: 'KSR Bengaluru', code: 'SBC', coords: [12.9781, 77.5694], isMajor: true },
  { id: 'SC', name: 'Secunderabad', code: 'SC', coords: [17.4334, 78.5015], isMajor: true },
  { id: 'ADI', name: 'Ahmedabad', code: 'ADI', coords: [23.0225, 72.5714], isMajor: true },
  { id: 'NGP', name: 'Nagpur Jn', code: 'NGP', coords: [21.1524, 79.0888], isMajor: true },
  { id: 'CNB', name: 'Kanpur Central', code: 'CNB', coords: [26.4499, 80.3319], isMajor: false },
  { id: 'PRYJ', name: 'Prayagraj Jn', code: 'PRYJ', coords: [25.4358, 81.8463], isMajor: false },
  { id: 'DDU', name: 'Pt. Deen Dayal Upadhyaya', code: 'DDU', coords: [25.2818, 83.1186], isMajor: false },
  { id: 'PNBE', name: 'Patna Jn', code: 'PNBE', coords: [25.6093, 85.1235], isMajor: false },
  { id: 'GHY', name: 'Guwahati', code: 'GHY', coords: [26.1824, 91.7505], isMajor: true },
  { id: 'BBS', name: 'Bhubaneswar', code: 'BBS', coords: [20.2706, 85.8334], isMajor: false },
  { id: 'VSKP', name: 'Visakhapatnam', code: 'VSKP', coords: [17.7215, 83.2986], isMajor: false },
  { id: 'BZA', name: 'Vijayawada Jn', code: 'BZA', coords: [16.5186, 80.6200], isMajor: false },
  { id: 'PUNE', name: 'Pune Jn', code: 'PUNE', coords: [18.5284, 73.8739], isMajor: false },
  { id: 'BPL', name: 'Bhopal Jn', code: 'BPL', coords: [23.2599, 77.4126], isMajor: false },
  { id: 'JP', name: 'Jaipur Jn', code: 'JP', coords: [26.9196, 75.7878], isMajor: false },
  { id: 'LKO', name: 'Lucknow Jn', code: 'LKO', coords: [26.8322, 80.9230], isMajor: false },
  { id: 'JAT', name: 'Jammu Tawi', code: 'JAT', coords: [32.7060, 74.8789], isMajor: false },
  { id: 'SVDK', name: 'Shri Mata Vaishno Devi Katra', code: 'SVDK', coords: [32.9934, 74.9317], isMajor: false },
  { id: 'MAO', name: 'Madgaon (Goa)', code: 'MAO', coords: [15.2750, 73.9780], isMajor: false },
  { id: 'TVC', name: 'Thiruvananthapuram', code: 'TVC', coords: [8.4875, 76.9525], isMajor: false },
  { id: 'ERS', name: 'Ernakulam (Kochi)', code: 'ERS', coords: [9.9699, 76.2866], isMajor: false },
  { id: 'MDU', name: 'Madurai Jn', code: 'MDU', coords: [9.9195, 78.1118], isMajor: false },
  { id: 'CAPE', name: 'Kanyakumari', code: 'CAPE', coords: [8.0883, 77.5385], isMajor: false },
  { id: 'DBRG', name: 'Dibrugarh', code: 'DBRG', coords: [27.4728, 94.9120], isMajor: false },
];

export function RailwayMap({
  height = '380px',
  className = '',
}: RailwayMapProps) {
  const { theme } = useUIStore();

  // Map Tile URL based on dark dashboard theme
  const tileUrl =
    theme === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'; // Keep dark theme consistent

  return (
    <div
      style={{ height }}
      className={`relative w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0B0F19] overflow-hidden select-none ${className}`}
    >
      {/* Telemetry Status Badge in Top-Right Corner */}
      <div className="absolute top-2.5 right-2.5 z-[500] bg-slate-900/85 dark:bg-[#111827]/90 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded text-[10px] font-mono text-slate-300 pointer-events-none flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse inline-block" />
        <span className="tracking-wide">GIS TELEMETRY &bull; COMING SOON</span>
      </div>

      {/* ========================================================================= */}
      {/* 1. BLURRED MAP LAYER (Focused only on India with realistic Railway lines) */}
      {/* ========================================================================= */}
      <div
        className="w-full h-full pointer-events-none transition-all duration-300"
        style={{
          filter: 'blur(2.2px)',
          opacity: 0.82,
          transform: 'scale(1.02)',
        }}
      >
        <MapContainer
          center={[22.8, 79.6]}
          zoom={4.8}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          boxZoom={false}
          keyboard={false}
          maxBounds={[
            [6.0, 67.0],
            [37.5, 98.0],
          ]}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%', background: '#0B0F19' }}
        >
          <TileLayer
            key={theme}
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url={tileUrl}
            maxZoom={19}
          />

          {/* Render Realistic Indian Railway Network Vector Polylines */}
          {INDIAN_RAILWAY_ROUTES.map((route) => (
            <Fragment key={route.id}>
              {/* Outer Ambient Glow Line */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: route.glowColor,
                  weight: route.category === 'quadrilateral' ? 6 : 4,
                  opacity: 0.4,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              {/* Core Vector Railway Line */}
              <Polyline
                positions={route.coordinates}
                pathOptions={{
                  color: route.color,
                  weight: route.category === 'quadrilateral' ? 2.5 : 1.8,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            </Fragment>
          ))}

          {/* Render Railway Junction Hub Nodes */}
          {INDIAN_RAILWAY_HUBS.map((hub) => (
            <CircleMarker
              key={hub.id}
              center={hub.coords}
              radius={hub.isMajor ? 4.5 : 3}
              pathOptions={{
                color: '#ffffff',
                fillColor: hub.isMajor ? '#38BDF8' : '#34D399',
                fillOpacity: 0.95,
                weight: hub.isMajor ? 1.5 : 1,
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* ========================================================================= */}
      {/* 2. CRISP "COMING SOON" WATERMARK OVERLAY (Semi-transparent & Centered)    */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-[450] flex flex-col items-center justify-center pointer-events-none bg-slate-950/25">
        <div className="flex flex-col items-center text-center px-4 py-3">
          {/* Subtle sub-header */}
          <span className="font-mono text-[10px] sm:text-xs font-semibold tracking-[0.35em] text-cyan-400/90 uppercase mb-1 drop-shadow-md">
            INDIAN RAILWAYS GEOSPATIAL NETWORK
          </span>

          {/* Watermark Coming Soon Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-[0.25em] text-white/85 dark:text-white/90 uppercase drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] select-none">
            COMING SOON
          </h2>

          {/* Telemetry integration badge */}
          <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 dark:bg-[#0B0F19]/85 border border-white/10 backdrop-blur-md shadow-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-wider text-slate-300">
              Real-Time GIS Telemetry & Vector Stress Index Under Integration
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
