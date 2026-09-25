/**
 * MTMC26 — Hostel Rules & Regulations Component
 * High-yield interactive summary, 16-point verbatim regulations,
 * and high-resolution document viewer with HD Lightbox integration.
 */

const HOSTEL_RULES_DATA = [
  {
    id: 1,
    category: 'Curfew & Biometric Attendance',
    icon: 'clock',
    badgeColor: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    keyTakeaway: 'Campus gates close at 11:00 PM · Biometric attendance compulsory by 11:30 PM (late punch incurs fine).',
    text: 'All senior students will return to the hostel by 11:30 PM and at 11:00 PM the campus gates will be closed. Punching biometric attendance is compulsory for students. Fine will be levied to those who do not punch within stipulated time.'
  },
  {
    id: 2,
    category: 'College ID Card',
    icon: 'id-card',
    badgeColor: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    keyTakeaway: 'Must carry college ID card at all times when entering/leaving campus; present to authorities on request.',
    text: 'Students must carry their college ID card at all times when entering or leaving the campus. They are required to present a college ID card to authorities whenever requested.'
  },
  {
    id: 3,
    category: 'Strict Anti-Ragging Policy',
    icon: 'shield-alert',
    badgeColor: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20',
    keyTakeaway: 'Zero tolerance for ragging on or off campus. Strict disciplinary action under University norms with no leniency.',
    text: 'Ragging in any form is strictly prohibited both within and outside the campus. Disciplinary action will be taken against those found guilty as per the University norms, and no leniency will be shown to the offenders.'
  },
  {
    id: 4,
    category: 'Substance & Weapons Ban',
    icon: 'slash',
    badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    keyTakeaway: 'Liquor, narcotics, cigarettes, weapons & pornographic material strictly banned. Violators placed on Debarred list for hostel allotment.',
    text: 'Liquor, narcotics, cigarettes, lethal weapons, pornographic material are banned in the hostel premises. Disciplinary action will also be initiated and will be put in the Debarred list for the next year hostel allotment.'
  },
  {
    id: 5,
    category: 'Property Damage & Fines',
    icon: 'alert-triangle',
    badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    keyTakeaway: 'Damage to hostel property charged to occupants with fine + risk of debarment for next year hostel allotment.',
    text: 'Any damage/breakage to hostel property will be charged to the occupants of the room/block with a fine. Disciplinary action will also be initiated and will be put in the Debarred list for the next year hostel allotment.'
  },
  {
    id: 6,
    category: 'Partying & Room Etiquette',
    icon: 'users',
    badgeColor: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border-purple-500/20',
    keyTakeaway: 'No parties in rooms/corridors. Residents must not enter others\' rooms to cause disturbance.',
    text: 'Partying in the rooms/corridors or anywhere in the hostel will not be permitted whatever be the occasion. Residents must not go to another\'s room and disturb the inmates. Complaints from other residents will be investigated and action taken accordingly.'
  },
  {
    id: 7,
    category: 'Silence Hours & Noise Control',
    icon: 'volume-x',
    badgeColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    keyTakeaway: 'Silence Hours strictly observed from 10:00 PM to 06:00 AM daily. Loud music systems will be confiscated. No corridor games.',
    text: 'Playing of loud music or disturbing fellow hostel inmates will not be permitted. Music system if played loudly will be confiscated. Playing outdoor games inside the hostels/corridors is not permitted. Silence Hours will be observed from 10 p.m. to 06 a.m. on all days. No noise of any sort will be permitted during the Silence Hours.'
  },
  {
    id: 8,
    category: 'Fire Hazards & Crackers Ban',
    icon: 'flame',
    badgeColor: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    keyTakeaway: 'Candles, incense, crackers, gasoline, thinners & oil lamps strictly prohibited in and around hostels at all times.',
    text: 'Candles and incense are a fire hazard and are not permitted in the hostels. Combustible materials such as gasoline, paint thinner and oil lamps are not permitted as well. BURSTING CRACKERS, CARRYING CRACKERS TO THE ROOMS AND LIGHTING OF LAMPS/CANDLES ARE STRICTLY PROHIBITED IN AND AROUND THE HOSTEL PREMISES AT ALL TIMES.'
  },
  {
    id: 9,
    category: 'Outsiders & Guest Policy',
    icon: 'user-x',
    badgeColor: 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20',
    keyTakeaway: 'No outsiders or students staying outside (day scholars/guests) permitted to stay in hostel rooms.',
    text: 'No student is permitted to allow outsiders/ students staying outside to stay in his/her room.'
  },
  {
    id: 10,
    category: 'Energy Conservation',
    icon: 'zap',
    badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    keyTakeaway: 'Must switch off all lights, fans, and electrical appliances (including mosquito repellent machines) before leaving.',
    text: 'Residents must switch off all lights and fans, and electrical appliances including mosquito repelling machines, if any, before leaving their rooms.'
  },
  {
    id: 11,
    category: 'Pet Prohibition',
    icon: 'heart-crack',
    badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
    keyTakeaway: 'Pets of all kinds prohibited inside hostel. Feeding stray dogs or cats in hostel premises strictly barred.',
    text: 'Pets of all kinds are prohibited inside the hostel. Feeding stray dogs or cats in the hostel premises is not permitted'
  },
  {
    id: 12,
    category: 'Cash & Valuables Safekeeping',
    icon: 'lock',
    badgeColor: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
    keyTakeaway: 'Advised not to keep large cash amounts. Students are solely responsible for safe custody of costly items & mobile phones.',
    text: 'The students are advised not to keep large amount of cash or valuables in the room. Students are responsible for safe custody of their costly items, mobile phones and cash.'
  },
  {
    id: 13,
    category: 'Campus Vehicle Ban',
    icon: 'ban',
    badgeColor: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
    keyTakeaway: 'Two-wheelers and four-wheelers are strictly banned on campus for all students.',
    text: 'Two wheelers or 4 wheelers are banned in the campus for all students.'
  },
  {
    id: 14,
    category: 'Visitor Lounge Only',
    icon: 'building-2',
    badgeColor: 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20',
    keyTakeaway: 'Visitors not permitted to enter hostel living areas; must be entertained exclusively in the reception lounge.',
    text: 'Visitors are not allowed to enter the hostel and must be entertained in the reception lounge only.'
  },
  {
    id: 15,
    category: 'Malpe Beach Safety Clause',
    icon: 'waves',
    badgeColor: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    keyTakeaway: 'Malpe beach strictly out of bounds June–August. No sea swimming. Inform Warden/Teacher Guardian before visits.',
    text: 'Malpe beach is out of bounds for the students during the month of June, July and August. During other month they will not enter the sea for swimming etc. Before visiting such places they should inform Warden/Teacher Guardian.'
  },
  {
    id: 16,
    category: 'Emergency Room Inspection',
    icon: 'key',
    badgeColor: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20',
    keyTakeaway: 'Management reserves the right to break open rooms for rule violations, unlawful activity suspicion, or prolonged unexplained absence.',
    text: 'The management reserves the right to break open the rooms in case of violation of hostel rules, suspected unlawful activities and security risk cases or where the student is absent from his room for a long period without prior information or any valid reasons.'
  }
];

function renderHostelRulesThreadHTML() {
  return `
    <div id="hostel-rules-thread-container" class="space-y-6">

      <!-- TOP OFFICIAL DIRECTIVE BANNER -->
      <div class="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-indigo-900/40 via-slate-900/60 to-slate-950 border border-indigo-500/30 text-white shadow-lg backdrop-blur-md">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0 text-indigo-400">
              <i data-lucide="shield-check" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[11px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Batch Resident Guidelines</span>
                <span class="text-[11px] text-slate-400">Batch 2026 Hostel Residents</span>
              </div>
              <h3 class="text-sm sm:text-base font-extrabold text-white mt-0.5">Hostel Rules and Regulations</h3>
            </div>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button onclick="openLightbox('./hostel_rules_clean.png')" class="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow flex items-center justify-center gap-1.5">
              <i data-lucide="zoom-in" class="w-3.5 h-3.5"></i>
              <span>Inspect HD Doc</span>
            </button>
            <a href="./hostel_rules_clean.png" download="MTMC_Hostel_Rules_and_Regulations.png" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5" title="Download 300 DPI Document">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span class="hidden sm:inline">Save</span>
            </a>
          </div>
        </div>
      </div>

      <!-- SECTION 1: INTERACTIVE HIGH-YIELD SUMMARY -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
            <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="zap" class="w-4 h-4 text-brand-orange"></i>
              <span>Interactive High-Yield Summary (Daily Rules)</span>
            </h4>
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400">Crucial timings & bans</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <!-- Card 1: Gates & Biometrics -->
          <div class="p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <i data-lucide="clock" class="w-4 h-4"></i> Gates & Punching
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300">Rule 1</span>
            </div>
            <p class="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-snug">
              Campus Gates Close: <span class="text-rose-600 dark:text-rose-400 font-extrabold">11:00 PM</span><br>
              Biometric Punch Deadline: <span class="text-rose-600 dark:text-rose-400 font-extrabold">11:30 PM</span>
            </p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Late punch attracts official fine. College ID mandatory at entry/exit gates.
            </p>
          </div>

          <!-- Card 2: Silence Hours -->
          <div class="p-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-950/20 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <i data-lucide="volume-x" class="w-4 h-4"></i> Silence Hours
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">Rule 7</span>
            </div>
            <p class="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-snug">
              Strict Silence: <span class="text-indigo-600 dark:text-indigo-400 font-extrabold">10 PM – 06 AM</span><br>
              Music Systems: <span class="text-indigo-600 dark:text-indigo-400 font-extrabold">Confiscated</span>
            </p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              No loud music, corridor gatherings, or outdoor games inside residential blocks.
            </p>
          </div>

          <!-- Card 3: Vehicles Banned -->
          <div class="p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/20 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <i data-lucide="ban" class="w-4 h-4"></i> Campus Vehicles
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300">Rule 13</span>
            </div>
            <p class="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-snug">
              2-Wheelers & 4-Wheelers: <span class="text-amber-600 dark:text-amber-400 font-extrabold">100% BANNED</span>
            </p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Motorized vehicles strictly prohibited on campus for all undergraduate students.
            </p>
          </div>

          <!-- Card 4: Fire Hazards & Crackers -->
          <div class="p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <i data-lucide="flame" class="w-4 h-4"></i> Fire Safety
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300">Rule 8</span>
            </div>
            <p class="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-snug">
              Crackers & Candles: <span class="text-rose-600 dark:text-rose-400 font-extrabold">STRICTLY PROHIBITED</span>
            </p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              No bursting crackers, carrying crackers, lighting incense, gasoline, or oil lamps.
            </p>
          </div>

          <!-- Card 5: Anti-Ragging & Substances -->
          <div class="p-3.5 rounded-2xl border border-red-500/20 bg-red-500/5 dark:bg-red-950/20 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <i data-lucide="shield-alert" class="w-4 h-4"></i> Ragging & Narcotics
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-600 dark:text-red-300">Rules 3 & 4</span>
            </div>
            <p class="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-snug">
              Zero Tolerance: <span class="text-red-600 dark:text-red-400 font-extrabold">Debarred List</span>
            </p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Liquor, narcotics, cigarettes, weapons banned. Offenses bar next year\'s hostel allotment.
            </p>
          </div>

          <!-- Card 6: Room Inspections & Guests -->
          <div class="p-3.5 rounded-2xl border border-purple-500/20 bg-purple-500/5 dark:bg-purple-950/20 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <i data-lucide="user-x" class="w-4 h-4"></i> Outsiders & Rooms
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300">Rules 9 & 16</span>
            </div>
            <p class="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-snug">
              Outsiders in Rooms: <span class="text-purple-600 dark:text-purple-400 font-extrabold">BARRED</span>
            </p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Visitors in reception only. Management reserves right to break open rooms for security checks.
            </p>
          </div>

          <!-- Card 7: Energy & Pets -->
          <div class="p-3.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <i data-lucide="zap" class="w-4 h-4"></i> Power & Pets
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">Rules 10 & 11</span>
            </div>
            <p class="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-snug">
              Switch Off Before Leaving: <span class="text-emerald-600 dark:text-emerald-400 font-extrabold">Lights & Repellents</span>
            </p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Zero pets allowed inside hostel. Feeding stray animals on campus strictly barred.
            </p>
          </div>

          <!-- Card 8: Beach & Outings -->
          <div class="p-3.5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 dark:bg-cyan-950/20 space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-extrabold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                <i data-lucide="waves" class="w-4 h-4"></i> Water Outings
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-300">Rule 15</span>
            </div>
            <p class="text-xs text-slate-800 dark:text-slate-200 font-semibold leading-snug">
              Malpe Beach: <span class="text-cyan-600 dark:text-cyan-400 font-extrabold">Out of Bounds</span> (Jun–Aug)
            </p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              No sea swimming without permission. Inform Warden/Teacher Guardian before planning trips.
            </p>
          </div>
        </div>
      </div>

      <!-- SECTION 2: CLEAN DOCUMENT ATTACHMENT CARD -->
      <div class="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <i data-lucide="file-text" class="w-4 h-4 text-indigo-500"></i>
            <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">Clean 300 DPI Document Recreation</h4>
          </div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400">Tap image or button to launch interactive zoom</span>
        </div>

        <div class="relative group cursor-zoom-in rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white" onclick="openLightbox('./hostel_rules_clean.png')">
          <img src="./hostel_rules_clean.png" alt="Hostel Rules and Regulations Document" class="w-full max-h-72 object-contain mx-auto group-hover:scale-[1.01] transition duration-300" loading="lazy">
          <div class="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-[2px]">
            <span class="px-4 py-2 rounded-xl bg-slate-900/90 text-white font-bold text-xs shadow-xl flex items-center gap-2 border border-white/20">
              <i data-lucide="zoom-in" class="w-4 h-4 text-brand-orange"></i> Tap to open in 500% Lightbox Viewer
            </span>
          </div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          <span>Resolution: 2480 × 3508 px (A4 @ 300 DPI)</span>
          <button onclick="openLightbox('./hostel_rules_clean.png')" class="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1">
            <span>Open HD Viewer</span> <i data-lucide="external-link" class="w-3 h-3"></i>
          </button>
        </div>
      </div>

      <!-- SECTION 3: COMPLETE 16-POINT VERBATIM REGULATIONS -->
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <i data-lucide="list-ordered" class="w-4 h-4 text-indigo-500"></i>
              <span>Complete 16-Point Verbatim Regulations</span>
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Verbatim clauses transcribed directly from the official residence policy</p>
          </div>

          <!-- Quick Search Filter -->
          <div class="relative w-full sm:w-64">
            <input 
              type="text" 
              id="hostel-rules-search" 
              oninput="filterHostelRules(this.value)" 
              placeholder="Search rules (e.g. biometric, music)..." 
              class="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-indigo-500 transition shadow-xs"
            >
            <i data-lucide="search" class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"></i>
          </div>
        </div>

        <!-- Rules Accordion / Cards List -->
        <div id="hostel-rules-list" class="space-y-2.5">
          ${renderHostelRulesListHTML(HOSTEL_RULES_DATA)}
        </div>
      </div>

      <!-- FOOTER NOTE -->
      <div class="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
        <i data-lucide="info" class="w-4 h-4 text-indigo-500 shrink-0 mt-0.5"></i>
        <div>
          <span class="font-semibold text-slate-700 dark:text-slate-300">Batch Resident Note:</span>
          Shared for batch awareness and resident reference. For hostel queries or room assistance, contact your Class Representative (CR) or Batch Moderator.
        </div>
      </div>

    </div>
  `;
}

function renderHostelRulesListHTML(rules) {
  if (!rules || rules.length === 0) {
    return `
      <div class="p-8 text-center text-slate-500 text-xs">
        No regulations match your search query. Clear search to view all 16 rules.
      </div>
    `;
  }

  return rules.map(rule => `
    <div class="rule-card p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-indigo-500/30 transition shadow-xs space-y-2" data-rule-id="${rule.id}">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center border border-indigo-500/20 shrink-0">
            ${String(rule.id).padStart(2, '0')}
          </span>
          <span class="text-xs font-bold text-slate-900 dark:text-white">${rule.category}</span>
        </div>
        <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border ${rule.badgeColor}">
          Clause #${rule.id}
        </span>
      </div>

      <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
        ${rule.text}
      </p>

      <div class="pt-1 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-500 shrink-0"></i>
        <span class="italic font-medium">${rule.keyTakeaway}</span>
      </div>
    </div>
  `).join('');
}

function filterHostelRules(query) {
  const cleanQ = (query || '').toLowerCase().trim();
  const filtered = HOSTEL_RULES_DATA.filter(r => {
    return r.text.toLowerCase().includes(cleanQ) ||
           r.category.toLowerCase().includes(cleanQ) ||
           r.keyTakeaway.toLowerCase().includes(cleanQ) ||
           String(r.id) === cleanQ;
  });

  const listContainer = document.getElementById('hostel-rules-list');
  if (listContainer) {
    listContainer.innerHTML = renderHostelRulesListHTML(filtered);
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
}

// Global window exposure
window.renderHostelRulesThreadHTML = renderHostelRulesThreadHTML;
window.filterHostelRules = filterHostelRules;
window.HOSTEL_RULES_DATA = HOSTEL_RULES_DATA;
