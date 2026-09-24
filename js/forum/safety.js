/**
 * MTMC26 — Content Safety & Anti-Doxxing Screening Engine
 */


    // ================= SAFETY RAILS: ANTI-SPAM & ANTI-DOXXING =================
    const POST_COOLDOWN_MS = 60 * 1000; // 60 seconds
    const COMMENT_COOLDOWN_MS = 10 * 1000; // 10 seconds
    let lastPostTimestamp = 0;
    let lastCommentTimestamp = 0;
    let lastSubmittedPostSignature = '';

    function containsIndianPhoneNumber(text) {
      if (!text) return false;
      // Matches standard 10-digit Indian numbers with optional country code (+91) or 0 prefix, including space/dash separators
      const phoneRegex = /(?:(?:\+?91[\s-]?)?|0)?[6-9]\d{2}[\s-]?\d{3}[\s-]?\d{4}\b/;
      return phoneRegex.test(text);
    }

    // ================= 100% AUTOMATED SAFETY SCREENING ENGINE =================
    function normalizeSafetyText(text) {
      if (!text) return '';
      let str = text.toLowerCase();
      try {
        str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      } catch (e) {}
      // Normalize common leetspeak substitutions
      str = str.replace(/@/g, 'a')
               .replace(/\$/g, 's')
               .replace(/0/g, 'o')
               .replace(/1/g, 'i')
               .replace(/!/g, 'i')
               .replace(/3/g, 'e')
               .replace(/5/g, 's')
               .replace(/7/g, 't')
               .replace(/8/g, 'b');
      return str;
    }

    function evaluateContentSafety(text, title = '', board = '') {
      const combined = ((title ? title + ' ' : '') + (text || '')).trim();
      if (!combined) return { safe: true };

      const norm = normalizeSafetyText(combined);
      const collapsed = norm.replace(/\s+/g, '');

      // 1. NMC Medical Ethics & Patient Confidentiality (Strict NMC Compliance)
      const nmcPatterns = [
        /\b(?:patient|pt)\s+name\b/i,
        /\b(?:bed|room)\s*(?:no\.?|#|\d+)\b/i,
        /\b(?:opd|ipd|mrn|uhid|cr)\s*(?:no\.?|#|\d{3,})\b/i,
        /\bcase\s*sheet\b/i,
        /\bpatient\s*(?:history|file|diagnosis|photo|pic|records?)\b/i,
        /\btmh\s*(?:ward|icu|ccu|casualty|patient)\b/i,
        /\bpatient\s+(?:died|death)\b/i
      ];
      for (const pattern of nmcPatterns) {
        if (pattern.test(norm)) {
          return {
            safe: false,
            category: 'NMC Medical Ethics & Patient Privacy',
            reason: 'Contains terms relating to patient identification, bed/ward numbers, or clinical hospital records strictly prohibited under NMC guidelines.'
          };
        }
      }

      // 2. Exam Malpractice & E-Pad Leak Shield
      const examPatterns = [
        /\b(?:e-?pad|paper|exam|question\s*paper|internal)\s*(?:leak|leaked|hacking|hack)\b/i,
        /\bleak\s*(?:e-?pad|paper|exam|question)\b/i,
        /\b(?:buy|sell)\s*(?:exam|paper|question\s*paper)\b/i
      ];
      for (const pattern of examPatterns) {
        if (pattern.test(norm)) {
          return {
            safe: false,
            category: 'Exam Malpractice Shield',
            reason: 'Contains references to university/internal exam question paper leaks or academic dishonesty.'
          };
        }
      }

      // 3. Anti-Ragging & Physical Threats
      const raggingPatterns = [
        /\bragging\b/i,
        /\bragged\b/i,
        /\b(?:beat\s*up|pitoonga|marunga|hit\s*you|kill\s*you)\b/i,
        /\bphysical\s*(?:harm|assault|violence)\b/i,
        /\b(?:threaten|destroy\s*you)\b/i
      ];
      for (const pattern of raggingPatterns) {
        if (pattern.test(norm)) {
          return {
            safe: false,
            category: 'Anti-Ragging & Threat Shield',
            reason: 'Contains language related to ragging, physical intimidation, or threats.'
          };
        }
      }

      // 4. Faculty Defamation & Targeting
      const facultyKeywords = /(?:prof(?:essor)?|hod|dean|warden|faculty|principal|director|superintendent|management|teacher|sir|ma'?am)/;
      const derogatoryTerms = /(?:corrupt|fraud|scam|worst|idiot|harass|bribe|incompetent|stupid|chutiya|madarchod|behenchod|kamina|saala|mental|psycho|dog|kutta|loot|useless|asshole|bastard)/;
      if (facultyKeywords.test(norm) && derogatoryTerms.test(norm)) {
        return {
          safe: false,
          category: 'Faculty Defamation Shield',
          reason: 'Contains derogatory remarks or targeted allegations concerning college faculty or administration.'
        };
      }

      // 5. Severe Profanity, Cyber-Bullying & Abuse (English & Hinglish)
      const abusivePatterns = [
        /\b(?:chutiya|chutiye|madarchod|bhenchod|behenchod|bhosdike|bsdk|gandu|gaand|lodu|lauda|harami|randi|kamine|jhant|bitch|asshole|cunt|nigger|faggot|retard|slut|whore)\b/i,
        /\b(?:kill\s*yourself|go\s*die)\b/i
      ];
      for (const pattern of abusivePatterns) {
        if (pattern.test(norm)) {
          return {
            safe: false,
            category: 'Campus Bullying & Abuse Shield',
            reason: 'Contains prohibited abusive language, slurs, or harassment.'
          };
        }
      }

      // Spaceless evasion check (e.g. b h e n c h o d, c h u t i y a)
      const severeSpaceless = /(?:chutiya|madarchod|bhenchod|behenchod|bhosdike|gandu|lodu|lauda|randi|asshole|bitch)/i;
      if (severeSpaceless.test(collapsed)) {
        return {
          safe: false,
          category: 'Campus Bullying & Abuse Shield',
          reason: 'Contains prohibited abusive language or slurs.'
        };
      }

      // 6. Anti-Doxxing on Anonymous Wall
      if (board === 'anonymous' && containsIndianPhoneNumber(combined)) {
        return {
          safe: false,
          category: 'Anti-Doxxing Protection',
          reason: 'Sharing personal phone numbers or contact details on the Anonymous Wall is prohibited.'
        };
      }

      return { safe: true };
    }
