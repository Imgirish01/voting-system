const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

let pool = null;
let isUsingFallback = false;
let fileStore = null;

const getStorePath = () => {
  if (process.env.VERCEL) {
    const tmpPath = path.join('/tmp', 'data_store.json');
    if (!fs.existsSync(tmpPath)) {
      try {
        const localCandidates = [
          path.resolve(__dirname, '../../../database/data_store.json'),
          path.resolve(__dirname, '../../database/data_store.json'),
          path.resolve(__dirname, '../database/data_store.json'),
          path.resolve(process.cwd(), 'database/data_store.json'),
        ];
        let copied = false;
        for (const cand of localCandidates) {
          if (fs.existsSync(cand)) {
            fs.writeFileSync(tmpPath, fs.readFileSync(cand, 'utf-8'), 'utf-8');
            copied = true;
            break;
          }
        }
        if (!copied) {
          fs.writeFileSync(tmpPath, JSON.stringify(getDefaultSeedData(), null, 2), 'utf-8');
        }
      } catch (e) {
        logger.warn('Could not initialize /tmp/data_store.json:', e.message);
      }
    }
    return tmpPath;
  }
  return path.resolve(__dirname, '../../../database/data_store.json');
};

const STORE_PATH = getStorePath();

// Initial default seed dataset
const getDefaultSeedData = () => {
  const defaultPasswordHash = bcrypt.hashSync('Password@123', 10);
  const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);

  return {
    departments: [
      { id: 1, name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computer Science & IT' },
      { id: 2, name: 'Electronics & Communication', code: 'ECE', description: 'Department of Electronics & Communication' },
      { id: 3, name: 'Mechanical Engineering', code: 'MECH', description: 'Department of Mechanical Engineering' },
      { id: 4, name: 'Business Administration', code: 'MBA', description: 'Department of Management Studies' },
      { id: 5, name: 'Civil Engineering', code: 'CIVIL', description: 'Department of Civil Engineering' }
    ],
    users: [
      {
        id: 1,
        full_name: 'Prof. S. K. Sharma (Chief Election Officer)',
        email: 'admin@college.edu',
        password_hash: adminPasswordHash,
        role: 'ADMIN',
        college_registration_number: 'ADMIN-OFFICIAL-01',
        department_id: 1,
        course: 'Faculty Administration',
        academic_year: '2026-27',
        account_status: 'APPROVED',
        avatar_url: null,
        created_at: new Date('2026-09-01T10:00:00Z').toISOString()
      },
      {
        id: 2,
        full_name: 'Aarav Sharma',
        email: 'aarav.sharma@college.edu',
        password_hash: defaultPasswordHash,
        role: 'VOTER',
        college_registration_number: '2023CSE0101',
        department_id: 1,
        course: 'B.Tech CSE',
        academic_year: '3rd Year',
        account_status: 'APPROVED',
        avatar_url: null,
        created_at: new Date('2026-10-01T10:00:00Z').toISOString()
      },
      {
        id: 3,
        full_name: 'Diya Patel',
        email: 'diya.patel@college.edu',
        password_hash: defaultPasswordHash,
        role: 'VOTER',
        college_registration_number: '2023ECE0204',
        department_id: 2,
        course: 'B.Tech ECE',
        academic_year: '3rd Year',
        account_status: 'APPROVED',
        avatar_url: null,
        created_at: new Date('2026-10-02T11:00:00Z').toISOString()
      },
      {
        id: 4,
        full_name: 'Rohan Gupta',
        email: 'rohan.gupta@college.edu',
        password_hash: defaultPasswordHash,
        role: 'VOTER',
        college_registration_number: '2024ME0305',
        department_id: 3,
        course: 'B.Tech ME',
        academic_year: '2nd Year',
        account_status: 'PENDING',
        avatar_url: null,
        created_at: new Date('2026-10-25T14:00:00Z').toISOString()
      },
      {
        id: 5,
        full_name: 'Ananya Singh',
        email: 'ananya.singh@college.edu',
        password_hash: defaultPasswordHash,
        role: 'VOTER',
        college_registration_number: '2022MBA0401',
        department_id: 4,
        course: 'MBA',
        academic_year: 'Final Year',
        account_status: 'REJECTED',
        avatar_url: null,
        created_at: new Date('2026-10-20T12:00:00Z').toISOString()
      },
      {
        id: 6,
        full_name: 'Vikramaditya Roy',
        email: 'vikram.roy@college.edu',
        password_hash: defaultPasswordHash,
        role: 'CANDIDATE',
        college_registration_number: '2022CSE0050',
        department_id: 1,
        course: 'B.Tech CSE',
        academic_year: 'Final Year',
        account_status: 'APPROVED',
        avatar_url: null,
        created_at: new Date('2026-10-10T09:00:00Z').toISOString()
      },
      {
        id: 7,
        full_name: 'Pooja Verma',
        email: 'pooja.verma@college.edu',
        password_hash: defaultPasswordHash,
        role: 'CANDIDATE',
        college_registration_number: '2022ECE0082',
        department_id: 2,
        course: 'B.Tech ECE',
        academic_year: 'Final Year',
        account_status: 'APPROVED',
        avatar_url: null,
        created_at: new Date('2026-10-10T10:30:00Z').toISOString()
      },
      {
        id: 8,
        full_name: 'Karan Malhotra',
        email: 'karan.malhotra@college.edu',
        password_hash: defaultPasswordHash,
        role: 'CANDIDATE',
        college_registration_number: '2023ME0099',
        department_id: 3,
        course: 'B.Tech ME',
        academic_year: '3rd Year',
        account_status: 'APPROVED',
        avatar_url: null,
        created_at: new Date('2026-10-12T14:00:00Z').toISOString()
      }
    ],
    voter_applications: [
      {
        id: 1,
        user_id: 2,
        application_status: 'APPROVED',
        student_id_number: '2023CSE0101',
        id_proof_type: 'College Identity Card',
        submitted_at: '2026-10-01 10:00:00',
        reviewed_by: 1,
        reviewed_at: '2026-10-02 11:30:00',
        rejection_reason: null,
        remarks: 'Verified against College ERP student records.'
      },
      {
        id: 2,
        user_id: 3,
        application_status: 'APPROVED',
        student_id_number: '2023ECE0204',
        id_proof_type: 'College Identity Card',
        submitted_at: '2026-10-02 14:15:00',
        reviewed_by: 1,
        reviewed_at: '2026-10-03 09:45:00',
        rejection_reason: null,
        remarks: 'All credentials verified.'
      },
      {
        id: 3,
        user_id: 4,
        application_status: 'PENDING',
        student_id_number: '2024ME0305',
        id_proof_type: 'College Identity Card',
        submitted_at: '2026-10-25 16:20:00',
        reviewed_by: null,
        reviewed_at: null,
        rejection_reason: null,
        remarks: 'Scrutiny pending before Election Observer.'
      },
      {
        id: 4,
        user_id: 5,
        application_status: 'REJECTED',
        student_id_number: '2022MBA0401',
        id_proof_type: 'College Identity Card',
        submitted_at: '2026-10-20 12:00:00',
        reviewed_by: 1,
        reviewed_at: '2026-10-22 15:10:00',
        rejection_reason: 'Uploaded ID card image is blurred and unreadable. Please upload a clear photo scan.',
        remarks: 'Rejected under ECI verification guidelines Rule 4.2.'
      }
    ],
    elections: [
      {
        id: 1,
        title: 'Campus General Council Election 2026-27',
        description: 'Annual election for Executive Office Bearers of the University Student Council under the supervision of the Chief Election Officer.',
        election_type: 'Student Council President',
        academic_year: '2026-27',
        scope: 'COLLEGE_WIDE',
        department_id: null,
        start_at: new Date(Date.now() - 3600000).toISOString(), // started 1 hr ago
        end_at: new Date(Date.now() + 86400000 * 2).toISOString(), // ends in 2 days
        application_deadline: new Date(Date.now() - 86400000).toISOString(),
        status: 'ACTIVE',
        eligibility_criteria: 'Bona fide undergraduate & postgraduate students with minimum 75% attendance and no active disciplinary penalties.',
        max_winners: 1,
        is_results_published: 0,
        results_published_at: null,
        results_published_by: null,
        created_by: 1,
        created_at: new Date('2026-10-01T08:00:00Z').toISOString()
      },
      {
        id: 2,
        title: 'Department Representative Election - CSE 2026-27',
        description: 'Election for Departmental Student Representative to represent computer engineering cohorts in the Academic Board.',
        election_type: 'Department Representative',
        academic_year: '2026-27',
        scope: 'DEPARTMENTAL',
        department_id: 1,
        start_at: new Date(Date.now() + 86400000 * 3).toISOString(),
        end_at: new Date(Date.now() + 86400000 * 5).toISOString(),
        application_deadline: new Date(Date.now() + 86400000 * 1).toISOString(),
        status: 'APPLICATION_OPEN',
        eligibility_criteria: 'Enrolled B.Tech / M.Tech Computer Science and Engineering students.',
        max_winners: 1,
        is_results_published: 0,
        results_published_at: null,
        results_published_by: null,
        created_by: 1,
        created_at: new Date('2026-10-15T10:00:00Z').toISOString()
      },
      {
        id: 3,
        title: 'Annual Sports Council General Election 2025-26',
        description: 'Completed election for Sports Secretary and Inter-College Varsity Captaincy.',
        election_type: 'Sports Secretary',
        academic_year: '2025-26',
        scope: 'COLLEGE_WIDE',
        department_id: null,
        start_at: new Date('2026-09-10T09:00:00Z').toISOString(),
        end_at: new Date('2026-09-12T17:00:00Z').toISOString(),
        application_deadline: new Date('2026-09-05T23:59:59Z').toISOString(),
        status: 'COMPLETED',
        eligibility_criteria: 'All college athletes and general students.',
        max_winners: 1,
        is_results_published: 1,
        results_published_at: new Date('2026-09-13T10:00:00Z').toISOString(),
        results_published_by: 1,
        created_by: 1,
        created_at: new Date('2026-08-20T08:00:00Z').toISOString()
      }
    ],
    election_positions: [
      {
        id: 1,
        election_id: 1,
        position_name: 'Student Council President',
        description: 'Presidential position presiding over General Student Council and Senate meetings.',
        winners_allowed: 1,
        tie_policy: 'ADMIN_DECISION'
      },
      {
        id: 2,
        election_id: 1,
        position_name: 'General Secretary',
        description: 'Chief administrator of Student Activities, Clubs, and Inter-College delegations.',
        winners_allowed: 1,
        tie_policy: 'ADMIN_DECISION'
      },
      {
        id: 3,
        election_id: 2,
        position_name: 'CSE Department Representative',
        description: 'Departmental student voice for academic lab resources and timetable coordination.',
        winners_allowed: 1,
        tie_policy: 'ADMIN_DECISION'
      },
      {
        id: 4,
        election_id: 3,
        position_name: 'Sports Secretary',
        description: 'Coordinator for athletic meets and varsity tournaments.',
        winners_allowed: 1,
        tie_policy: 'ADMIN_DECISION'
      }
    ],
    candidate_applications: [
      {
        id: 1,
        user_id: 6,
        election_id: 1,
        position_id: 1,
        biography: 'Senior CSE student, Lead Organizer of College Hackathon 2025, passionate about student lab resources and 24/7 library access.',
        manifesto: "1. 24/7 Library and high-speed campus Wi-Fi infrastructure.\n2. Subsidized technical certifications and AI workshops.\n3. Transparent grievance redressal portal with 48-hour resolution SLA.\n4. Clean and hygienic cafeteria food quality audit committee.",
        photo_path: null,
        symbol_name: 'Torch',
        symbol_icon: 'flame',
        application_status: 'APPROVED',
        submitted_at: '2026-10-15 10:00:00',
        reviewed_by: 1,
        reviewed_at: '2026-10-16 11:00:00',
        rejection_reason: null
      },
      {
        id: 2,
        user_id: 7,
        election_id: 1,
        position_id: 1,
        biography: 'Final year ECE student, Class Representative for 2 consecutive years, IEEE Student Branch Secretary.',
        manifesto: "1. Merit-based student innovation funding pool of Rs. 10 Lakhs.\n2. Mental wellness lounge and dedicated counselor on campus.\n3. Better inter-department sports facilities and annual college fest revival.\n4. Placement bootcamps with industry leaders.",
        photo_path: null,
        symbol_name: 'Book',
        symbol_icon: 'book',
        application_status: 'APPROVED',
        submitted_at: '2026-10-15 11:30:00',
        reviewed_by: 1,
        reviewed_at: '2026-10-16 11:15:00',
        rejection_reason: null
      },
      {
        id: 3,
        user_id: 8,
        election_id: 1,
        position_id: 2,
        biography: '3rd Year Mechanical Engineering, Captain of SAE Formula Racing Team.',
        manifesto: "1. State-of-the-art makerspace and 3D printing access for all departments.\n2. Equal budget allocation for cultural and technical clubs.\n3. Electric shuttle service inside campus grounds.",
        photo_path: null,
        symbol_name: 'Tree',
        symbol_icon: 'tree',
        application_status: 'APPROVED',
        submitted_at: '2026-10-16 14:00:00',
        reviewed_by: 1,
        reviewed_at: '2026-10-17 10:00:00',
        rejection_reason: null
      }
    ],
    voter_participations: [],
    votes: [],
    election_results: [
      {
        id: 1,
        election_id: 3,
        position_id: 4,
        candidate_application_id: 1,
        vote_count: 342,
        vote_percentage: 64.53,
        outcome: 'WON',
        published_at: '2026-09-13 10:00:00',
        published_by: 1
      },
      {
        id: 2,
        election_id: 3,
        position_id: 4,
        candidate_application_id: 2,
        vote_count: 188,
        vote_percentage: 35.47,
        outcome: 'LOST',
        published_at: '2026-09-13 10:00:00',
        published_by: 1
      }
    ],
    notifications: [
      {
        id: 1,
        user_id: 2,
        title: 'Voter Verification Form 6-C Approved',
        message: 'Your voter verification has been approved by Chief Election Officer. You can now cast your ballot in active elections.',
        notification_type: 'STATUS_CHANGE',
        read_at: null,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        user_id: 2,
        title: 'Campus General Council Election 2026-27 is LIVE',
        message: 'Voting is now open for the Student Council President & General Secretary positions. Exercise your democratic right!',
        notification_type: 'ELECTION_ALERT',
        read_at: null,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        user_id: 6,
        title: 'Nomination Form 2-B Scrutiny Complete',
        message: 'Your nomination for Student Council President has been APPROVED with election symbol "Torch".',
        notification_type: 'STATUS_CHANGE',
        read_at: null,
        created_at: new Date().toISOString()
      }
    ],
    audit_logs: [
      {
        id: 1,
        actor_user_id: 1,
        action: 'SYSTEM_BOOT',
        entity_type: 'SYSTEM',
        entity_id: 1,
        details: 'E-Voters Commission Portal initialized under standard governance rules.',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        actor_user_id: 1,
        action: 'ELECTION_ACTIVE',
        entity_type: 'ELECTIONS',
        entity_id: 1,
        details: 'Polls activated for Campus General Council Election 2026-27.',
        created_at: new Date().toISOString()
      }
    ]
  };
};

// Load or initialize store from disk
const loadFileStore = () => {
  try {
    const storePath = getStorePath();
    const dir = path.dirname(storePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(storePath)) {
      const content = fs.readFileSync(storePath, 'utf-8');
      fileStore = JSON.parse(content);
      logger.info('Loaded existing database store from', storePath);
    } else {
      fileStore = getDefaultSeedData();
      try {
        fs.writeFileSync(storePath, JSON.stringify(fileStore, null, 2), 'utf-8');
      } catch (e) {
        logger.warn('Could not write seed data to storePath, using in-memory store:', e.message);
      }
      logger.info('Initialized fresh database store with default ECI seed data at', storePath);
    }
  } catch (err) {
    logger.error('Error loading fallback data store:', err.message);
    fileStore = getDefaultSeedData();
  }
};

const saveFileStore = () => {
  try {
    if (fileStore) {
      const storePath = getStorePath();
      const dir = path.dirname(storePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(storePath, JSON.stringify(fileStore, null, 2), 'utf-8');
    }
  } catch (err) {
    logger.error('Error saving data store:', err.message);
  }
};

/**
 * Universal Query Engine for local fallback
 * Translates and executes SQL operations on in-memory collections
 */
const executeFallbackQuery = async (sql, params = []) => {
  try {
    const storePath = getStorePath();
    if (fs.existsSync(storePath)) {
      const content = fs.readFileSync(storePath, 'utf-8');
      fileStore = JSON.parse(content);
    } else if (!fileStore) {
      loadFileStore();
    }
  } catch (e) {
    if (!fileStore) loadFileStore();
  }

  const cleanSql = sql.trim().replace(/\s+/g, ' ');

  // SELECT queries
  if (/^SELECT/i.test(cleanSql)) {
    // 1. SELECT * FROM users WHERE email = ?
    if (/FROM users/i.test(cleanSql)) {
      let results = [...fileStore.users];
      if (/WHERE (u\.)?email = \?/i.test(cleanSql)) {
        results = results.filter(u => u.email.toLowerCase() === String(params[0]).toLowerCase());
      } else if (/WHERE (u\.)?id = \?/i.test(cleanSql)) {
        results = results.filter(u => u.id === Number(params[0]));
      } else if (/WHERE (u\.)?college_registration_number = \?/i.test(cleanSql)) {
        results = results.filter(u => u.college_registration_number === String(params[0]));
      } else if (/WHERE (u\.)?role = \?/i.test(cleanSql)) {
        results = results.filter(u => u.role === String(params[0]));
      } else if (/role = 'ADMIN'/i.test(cleanSql)) {
        results = results.filter(u => u.role === 'ADMIN');
      } else if (/role = 'CANDIDATE'/i.test(cleanSql)) {
        results = results.filter(u => u.role === 'CANDIDATE');
      } else if (/role = 'VOTER'/i.test(cleanSql)) {
        results = results.filter(u => u.role === 'VOTER');
        if (/account_status = 'APPROVED'/i.test(cleanSql)) {
          results = results.filter(u => u.account_status === 'APPROVED');
        }
      }
      results.sort((a, b) => (b.id || 0) - (a.id || 0));
      return [results];
    }

    // 2. SELECT * FROM departments
    if (/FROM departments/i.test(cleanSql)) {
      return [[...fileStore.departments]];
    }

    // 3. SELECT * FROM voter_applications
    if (/FROM voter_applications/i.test(cleanSql)) {
      let results = fileStore.voter_applications.map(app => {
        const user = fileStore.users.find(u => u.id === app.user_id) || {};
        const reviewer = app.reviewed_by ? fileStore.users.find(u => u.id === app.reviewed_by) : null;
        const dept = fileStore.departments.find(d => d.id === user.department_id) || {};
        return {
          ...app,
          full_name: user.full_name || 'Elector',
          email: user.email || 'N/A',
          college_registration_number: user.college_registration_number || app.student_id_number || 'N/A',
          department_name: dept.name || 'General',
          course: user.course || 'Undergraduate',
          academic_year: user.academic_year || '3rd Year',
          reviewer_name: reviewer ? reviewer.full_name : null,
        };
      });

      if (/WHERE user_id = \?/i.test(cleanSql) || /WHERE va\.user_id = \?/i.test(cleanSql)) {
        results = results.filter(a => a.user_id === Number(params[0]));
      } else if (/WHERE id = \?/i.test(cleanSql) || /WHERE va\.id = \?/i.test(cleanSql)) {
        results = results.filter(a => a.id === Number(params[0]));
      } else if (/WHERE application_status = \?/i.test(cleanSql)) {
        results = results.filter(a => a.application_status === String(params[0]));
      }
      // Newest applications first
      results.sort((a, b) => (b.id || 0) - (a.id || 0));
      return [results];
    }

    // 4. SELECT * FROM elections
    if (/FROM elections/i.test(cleanSql)) {
      let results = fileStore.elections.map(el => {
        const creator = fileStore.users.find(u => u.id === el.created_by);
        const dept = el.department_id ? fileStore.departments.find(d => d.id === el.department_id) : null;
        const positions = fileStore.election_positions.filter(p => p.election_id === el.id);
        const approvedCandidates = fileStore.candidate_applications.filter(
          c => c.election_id === el.id && c.application_status === 'APPROVED'
        );
        const totalVotes = fileStore.votes.filter(v => v.election_id === el.id).length;

        return {
          ...el,
          creator_name: creator ? creator.full_name : 'Election Commission',
          department_name: dept ? dept.name : 'College-Wide',
          positions_count: positions.length,
          candidates_count: approvedCandidates.length,
          total_votes: totalVotes,
          positions,
        };
      });

      if (/WHERE id = \?/i.test(cleanSql) || /WHERE e\.id = \?/i.test(cleanSql)) {
        results = results.filter(e => e.id === Number(params[0]));
      } else if (/status = 'APPLICATION_OPEN'/i.test(cleanSql) && /application_deadline <= \?/i.test(cleanSql)) {
        const deadline = new Date(params[0]).getTime();
        results = results.filter(e => e.status === 'APPLICATION_OPEN' && e.application_deadline && new Date(e.application_deadline).getTime() <= deadline);
      } else if (/status = 'UPCOMING'/i.test(cleanSql) && /start_at <= \?/i.test(cleanSql)) {
        const nowStart = new Date(params[0]).getTime();
        const nowEnd = new Date(params[1]).getTime();
        results = results.filter(e => e.status === 'UPCOMING' && e.start_at && new Date(e.start_at).getTime() <= nowStart && (!e.end_at || new Date(e.end_at).getTime() > nowEnd));
      } else if ((/status = 'ACTIVE' OR status = 'PAUSED'/i.test(cleanSql) || /status = 'ACTIVE'/i.test(cleanSql)) && /end_at <= \?/i.test(cleanSql)) {
        const nowEnd = new Date(params[0]).getTime();
        results = results.filter(e => (e.status === 'ACTIVE' || e.status === 'PAUSED') && e.end_at && new Date(e.end_at).getTime() <= nowEnd);
      } else if (/WHERE status = \?/i.test(cleanSql)) {
        results = results.filter(e => e.status === String(params[0]));
      }
      return [results];
    }

    // 5. SELECT * FROM election_positions
    if (/FROM election_positions/i.test(cleanSql)) {
      let results = [...fileStore.election_positions];
      if (/WHERE election_id = \?/i.test(cleanSql)) {
        results = results.filter(p => p.election_id === Number(params[0]));
      } else if (/WHERE id = \?/i.test(cleanSql)) {
        results = results.filter(p => p.id === Number(params[0]));
      }
      return [results];
    }

    // 6. SELECT * FROM candidate_applications
    if (/FROM candidate_applications/i.test(cleanSql)) {
      let results = fileStore.candidate_applications.map(app => {
        const user = fileStore.users.find(u => u.id === app.user_id) || {};
        const election = fileStore.elections.find(e => e.id === app.election_id) || {};
        const position = fileStore.election_positions.find(p => p.id === app.position_id) || {};
        const reviewer = app.reviewed_by ? fileStore.users.find(u => u.id === app.reviewed_by) : null;
        const dept = fileStore.departments.find(d => d.id === user.department_id) || {};

        return {
          ...app,
          candidate_name: user.full_name,
          email: user.email,
          college_registration_number: user.college_registration_number,
          department_name: dept.name || 'General',
          course: user.course,
          academic_year: user.academic_year,
          election_title: election.title,
          election_status: election.status,
          position_name: position.position_name,
          reviewer_name: reviewer ? reviewer.full_name : null,
        };
      });

      if (/WHERE id = \?/i.test(cleanSql) || /WHERE ca\.id = \?/i.test(cleanSql)) {
        results = results.filter(c => c.id === Number(params[0]));
      } else if (/WHERE user_id = \?/i.test(cleanSql) || /WHERE ca\.user_id = \?/i.test(cleanSql)) {
        results = results.filter(c => c.user_id === Number(params[0]));
      } else if (/WHERE election_id = \?/i.test(cleanSql) || /WHERE ca\.election_id = \?/i.test(cleanSql)) {
        results = results.filter(c => c.election_id === Number(params[0]));
      } else if (/WHERE application_status = \?/i.test(cleanSql)) {
        results = results.filter(c => c.application_status === String(params[0]));
      }
      return [results];
    }

    // 7. SELECT * FROM voter_participations
    if (/FROM voter_participations/i.test(cleanSql)) {
      let results = [...fileStore.voter_participations];
      if (/WHERE election_id = \? AND position_id = \? AND user_id = \?/i.test(cleanSql)) {
        results = results.filter(
          vp => vp.election_id === Number(params[0]) && vp.position_id === Number(params[1]) && vp.user_id === Number(params[2])
        );
      } else if (/WHERE election_id = \? AND user_id = \?/i.test(cleanSql)) {
        results = results.filter(vp => vp.election_id === Number(params[0]) && vp.user_id === Number(params[1]));
      } else if (/WHERE user_id = \?/i.test(cleanSql)) {
        results = results.filter(vp => vp.user_id === Number(params[0]));
      }
      return [results];
    }

    // 8. SELECT * FROM votes
    if (/FROM votes/i.test(cleanSql)) {
      let results = [...fileStore.votes];
      if (/WHERE election_id = \? AND position_id = \? AND voter_token = \?/i.test(cleanSql)) {
        results = results.filter(
          v => v.election_id === Number(params[0]) && v.position_id === Number(params[1]) && v.voter_token === String(params[2])
        );
      } else if (/WHERE election_id = \? AND position_id = \?/i.test(cleanSql)) {
        results = results.filter(
          v => v.election_id === Number(params[0]) && v.position_id === Number(params[1])
        );
      } else if (/WHERE election_id = \?/i.test(cleanSql)) {
        results = results.filter(v => v.election_id === Number(params[0]));
      }
      return [results];
    }

    // 9. SELECT * FROM election_results
    if (/FROM election_results/i.test(cleanSql)) {
      let results = fileStore.election_results.map(res => {
        const candidateApp = fileStore.candidate_applications.find(c => c.id === res.candidate_application_id) || {};
        const user = fileStore.users.find(u => u.id === candidateApp.user_id) || {};
        const position = fileStore.election_positions.find(p => p.id === res.position_id) || {};
        return {
          ...res,
          candidate_name: user.full_name,
          candidate_photo: candidateApp.photo_path,
          symbol_name: candidateApp.symbol_name,
          symbol_icon: candidateApp.symbol_icon,
          position_name: position.position_name,
        };
      });

      if (/WHERE election_id = \?/i.test(cleanSql)) {
        results = results.filter(r => r.election_id === Number(params[0]));
      }
      return [results];
    }

    // 10. SELECT * FROM notifications
    if (/FROM notifications/i.test(cleanSql)) {
      let results = [...fileStore.notifications];
      if (/WHERE user_id = \?/i.test(cleanSql)) {
        results = results.filter(n => n.user_id === Number(params[0]));
      }
      results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [results];
    }

    // 11. SELECT * FROM audit_logs
    if (/FROM audit_logs/i.test(cleanSql)) {
      let results = fileStore.audit_logs.map(log => {
        const actor = log.actor_user_id ? fileStore.users.find(u => u.id === log.actor_user_id) : null;
        return {
          ...log,
          actor_name: actor ? actor.full_name : 'System Automated / Anonymous',
        };
      });
      results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [results];
    }

    // Default empty
    return [[]];
  }

  // INSERT queries
  if (/^INSERT INTO/i.test(cleanSql)) {
    if (/INSERT INTO users/i.test(cleanSql)) {
      const newId = (fileStore.users.length ? Math.max(...fileStore.users.map(u => u.id)) : 0) + 1;
      const [full_name, email, password_hash, role, reg_no, dept_id, course, acad_year, status] = params;
      const newUser = {
        id: newId,
        full_name,
        email,
        password_hash,
        role: role || 'VOTER',
        college_registration_number: reg_no,
        department_id: dept_id ? Number(dept_id) : null,
        course,
        academic_year: acad_year,
        account_status: status || 'PENDING',
        avatar_url: null,
        created_at: new Date().toISOString()
      };
      fileStore.users.push(newUser);
      saveFileStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (/INSERT INTO voter_applications/i.test(cleanSql)) {
      const newId = (fileStore.voter_applications.length ? Math.max(...fileStore.voter_applications.map(v => v.id)) : 0) + 1;
      const [user_id, status, card_url, student_id_number, id_proof_type, remarks] = params;
      const newApp = {
        id: newId,
        user_id: Number(user_id),
        application_status: status || 'PENDING',
        college_id_card_url: card_url || null,
        student_id_number,
        id_proof_type: id_proof_type || 'College Identity Card',
        submitted_at: new Date().toISOString(),
        reviewed_by: null,
        reviewed_at: null,
        rejection_reason: null,
        remarks: remarks || null
      };
      fileStore.voter_applications.push(newApp);
      saveFileStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (/INSERT INTO elections/i.test(cleanSql)) {
      const newId = (fileStore.elections.length ? Math.max(...fileStore.elections.map(e => e.id)) : 0) + 1;
      const [title, desc, type, acad_year, scope, dept_id, start_at, end_at, app_deadline, status, eligibility, max_win, created_by] = params;
      const newElection = {
        id: newId,
        title,
        description: desc,
        election_type: type,
        academic_year: acad_year,
        scope: scope || 'COLLEGE_WIDE',
        department_id: dept_id ? Number(dept_id) : null,
        start_at: new Date(start_at).toISOString(),
        end_at: new Date(end_at).toISOString(),
        application_deadline: new Date(app_deadline).toISOString(),
        status: status || 'DRAFT',
        eligibility_criteria: eligibility,
        max_winners: max_win ? Number(max_win) : 1,
        is_results_published: 0,
        results_published_at: null,
        results_published_by: null,
        created_by: Number(created_by),
        created_at: new Date().toISOString()
      };
      fileStore.elections.push(newElection);
      saveFileStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (/INSERT INTO election_positions/i.test(cleanSql)) {
      const newId = (fileStore.election_positions.length ? Math.max(...fileStore.election_positions.map(p => p.id)) : 0) + 1;
      const [election_id, position_name, description, winners_allowed, tie_policy] = params;
      const newPos = {
        id: newId,
        election_id: Number(election_id),
        position_name,
        description,
        winners_allowed: winners_allowed ? Number(winners_allowed) : 1,
        tie_policy: tie_policy || 'ADMIN_DECISION'
      };
      fileStore.election_positions.push(newPos);
      saveFileStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (/INSERT INTO candidate_applications/i.test(cleanSql)) {
      const newId = (fileStore.candidate_applications.length ? Math.max(...fileStore.candidate_applications.map(c => c.id)) : 0) + 1;
      const [user_id, election_id, position_id, biography, manifesto, photo_path, symbol_name, symbol_icon] = params;
      const newCand = {
        id: newId,
        user_id: Number(user_id),
        election_id: Number(election_id),
        position_id: Number(position_id),
        biography,
        manifesto,
        photo_path: photo_path || null,
        symbol_name: symbol_name || 'Torch',
        symbol_icon: symbol_icon || 'flame',
        application_status: 'PENDING',
        submitted_at: new Date().toISOString(),
        reviewed_by: null,
        reviewed_at: null,
        rejection_reason: null
      };
      fileStore.candidate_applications.push(newCand);
      saveFileStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (/INSERT INTO voter_participations/i.test(cleanSql)) {
      const newId = (fileStore.voter_participations.length ? Math.max(...fileStore.voter_participations.map(vp => vp.id)) : 0) + 1;
      const [election_id, position_id, user_id] = params;
      // Check duplicate
      const exists = fileStore.voter_participations.some(
        vp => vp.election_id === Number(election_id) && vp.position_id === Number(position_id) && vp.user_id === Number(user_id)
      );
      if (exists) {
        const err = new Error('ER_DUP_ENTRY: Duplicate participation recorded');
        err.code = 'ER_DUP_ENTRY';
        throw err;
      }
      fileStore.voter_participations.push({
        id: newId,
        election_id: Number(election_id),
        position_id: Number(position_id),
        user_id: Number(user_id),
        voted_at: new Date().toISOString()
      });
      saveFileStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (/INSERT INTO votes/i.test(cleanSql)) {
      const newId = (fileStore.votes.length ? Math.max(...fileStore.votes.map(v => v.id)) : 0) + 1;
      const [election_id, position_id, candidate_application_id, voter_token] = params;
      // Secret ballot unique token check
      const duplicateToken = fileStore.votes.some(
        v => v.election_id === Number(election_id) && v.position_id === Number(position_id) && v.voter_token === String(voter_token)
      );
      if (duplicateToken) {
        const err = new Error('ER_DUP_ENTRY: Duplicate vote ballot detected');
        err.code = 'ER_DUP_ENTRY';
        throw err;
      }
      fileStore.votes.push({
        id: newId,
        election_id: Number(election_id),
        position_id: Number(position_id),
        candidate_application_id: Number(candidate_application_id),
        voter_token: String(voter_token),
        cast_at: new Date().toISOString()
      });
      saveFileStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (/INSERT INTO election_results/i.test(cleanSql)) {
      const newId = (fileStore.election_results.length ? Math.max(...fileStore.election_results.map(r => r.id)) : 0) + 1;
      const [election_id, position_id, candidate_id, count, percentage, outcome, pub_date, pub_by] = params;
      fileStore.election_results.push({
        id: newId,
        election_id: Number(election_id),
        position_id: Number(position_id),
        candidate_application_id: Number(candidate_id),
        vote_count: Number(count),
        vote_percentage: Number(percentage),
        outcome,
        published_at: pub_date || new Date().toISOString(),
        published_by: Number(pub_by)
      });
      saveFileStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (/INSERT INTO notifications/i.test(cleanSql)) {
      const newId = (fileStore.notifications.length ? Math.max(...fileStore.notifications.map(n => n.id)) : 0) + 1;
      const [user_id, title, message, type] = params;
      fileStore.notifications.push({
        id: newId,
        user_id: Number(user_id),
        title,
        message,
        notification_type: type || 'INFO',
        read_at: null,
        created_at: new Date().toISOString()
      });
      saveFileStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }

    if (/INSERT INTO audit_logs/i.test(cleanSql)) {
      const newId = (fileStore.audit_logs.length ? Math.max(...fileStore.audit_logs.map(a => a.id)) : 0) + 1;
      const [actor_id, action, entity_type, entity_id, details, ip] = params;
      fileStore.audit_logs.push({
        id: newId,
        actor_user_id: actor_id ? Number(actor_id) : null,
        action,
        entity_type,
        entity_id: entity_id ? Number(entity_id) : null,
        details: typeof details === 'object' ? JSON.stringify(details) : String(details),
        ip_address: ip || '127.0.0.1',
        created_at: new Date().toISOString()
      });
      saveFileStore();
      return [{ insertId: newId, affectedRows: 1 }];
    }
  }

  // UPDATE queries
  if (/^UPDATE/i.test(cleanSql)) {
    if (/UPDATE users/i.test(cleanSql)) {
      if (/account_status = \?/i.test(cleanSql)) {
        const [status, id] = params;
        const user = fileStore.users.find(u => u.id === Number(id));
        if (user) user.account_status = status;
      }
      saveFileStore();
      return [{ affectedRows: 1 }];
    }

    if (/UPDATE voter_applications/i.test(cleanSql)) {
      const [status, reviewer, reviewed_at, reason, id] = params;
      const app = fileStore.voter_applications.find(a => a.id === Number(id));
      if (app) {
        app.application_status = status;
        app.reviewed_by = reviewer ? Number(reviewer) : app.reviewed_by;
        app.reviewed_at = reviewed_at || new Date().toISOString();
        if (reason !== undefined) app.rejection_reason = reason;

        // Also sync user account_status
        const user = fileStore.users.find(u => u.id === app.user_id);
        if (user) {
          user.account_status = status;
        }
      }
      saveFileStore();
      return [{ affectedRows: 1 }];
    }

    if (/UPDATE candidate_applications/i.test(cleanSql)) {
      if (/application_status = \?.*WHERE id = \?/i.test(cleanSql)) {
        const [status, reviewer, reviewed_at, reason, id] = params;
        const cand = fileStore.candidate_applications.find(c => c.id === Number(id));
        if (cand) {
          cand.application_status = status;
          cand.reviewed_by = reviewer ? Number(reviewer) : cand.reviewed_by;
          cand.reviewed_at = reviewed_at || new Date().toISOString();
          if (reason !== undefined) cand.rejection_reason = reason;
        }
      }
      saveFileStore();
      return [{ affectedRows: 1 }];
    }

    if (/UPDATE elections/i.test(cleanSql)) {
      if (/status = \?.*WHERE id = \?/i.test(cleanSql)) {
        const [status, id] = params;
        const election = fileStore.elections.find(e => e.id === Number(id));
        if (election) election.status = status;
      } else if (/is_results_published = 1.*WHERE id = \?/i.test(cleanSql)) {
        const [pub_by, pub_at, id] = params;
        const election = fileStore.elections.find(e => e.id === Number(id));
        if (election) {
          election.is_results_published = 1;
          election.results_published_by = Number(pub_by);
          election.results_published_at = pub_at || new Date().toISOString();
        }
      }
      saveFileStore();
      return [{ affectedRows: 1 }];
    }

    if (/UPDATE notifications/i.test(cleanSql)) {
      if (/read_at = CURRENT_TIMESTAMP.*WHERE user_id = \?/i.test(cleanSql)) {
        const [user_id] = params;
        fileStore.notifications.filter(n => n.user_id === Number(user_id)).forEach(n => {
          n.read_at = new Date().toISOString();
        });
      }
      saveFileStore();
      return [{ affectedRows: 1 }];
    }
  }

  // DELETE queries
  if (/^DELETE/i.test(cleanSql)) {
    if (/DELETE FROM election_results WHERE election_id = \?/i.test(cleanSql)) {
      fileStore.election_results = fileStore.election_results.filter(r => r.election_id !== Number(params[0]));
      saveFileStore();
      return [{ affectedRows: 1 }];
    }
  }

  return [{ affectedRows: 0 }];
};

/**
 * Fallback connection object to mock MySQL transaction interface
 */
class FallbackConnection {
  async beginTransaction() {
    // Save snapshot of fileStore for rollback
    this._snapshot = JSON.stringify(fileStore);
  }
  async commit() {
    this._snapshot = null;
    saveFileStore();
  }
  async rollback() {
    if (this._snapshot) {
      fileStore = JSON.parse(this._snapshot);
      saveFileStore();
      this._snapshot = null;
    }
  }
  async query(sql, params) {
    return executeFallbackQuery(sql, params);
  }
  async execute(sql, params) {
    return executeFallbackQuery(sql, params);
  }
  release() {
    // No-op
  }
}

/**
 * Initialize Database Connection
 */
const initDatabase = async () => {
  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'college_voting_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };

  try {
    logger.info(`Attempting MySQL connection to ${dbConfig.host}:${dbConfig.port}...`);
    // Create pool with shorter connect timeout so we don't hang if MySQL isn't running
    const testPool = mysql.createPool({
      ...dbConfig,
      connectTimeout: 2000,
    });

    const conn = await testPool.getConnection();
    await conn.ping();
    conn.release();

    pool = testPool;
    isUsingFallback = false;
    logger.info('Connected successfully to MySQL database engine.');
  } catch (err) {
    logger.warn(`MySQL connection unavailable (${err.message}). Activating zero-config storage engine.`);
    isUsingFallback = true;
    loadFileStore();
  }
};

/**
 * Universal query function
 */
const query = async (sql, params = []) => {
  if (isUsingFallback || !pool) {
    return executeFallbackQuery(sql, params);
  }
  try {
    return await pool.query(sql, params);
  } catch (err) {
    logger.error(`MySQL query failed: ${err.message}. SQL: ${sql}`);
    throw err;
  }
};

/**
 * Universal execute function
 */
const execute = async (sql, params = []) => {
  if (isUsingFallback || !pool) {
    return executeFallbackQuery(sql, params);
  }
  return await pool.execute(sql, params);
};

/**
 * Universal transaction connection getter
 */
const getConnection = async () => {
  if (isUsingFallback || !pool) {
    return new FallbackConnection();
  }
  return await pool.getConnection();
};

module.exports = {
  initDatabase,
  query,
  execute,
  getConnection,
  isFallback: () => isUsingFallback,
};
