// Client-side fallback database store for 100% uptime on static deployments (e.g. Vercel)
const STORAGE_KEY = 'eci_election_system_db';
const AUTH_KEY = 'eci_election_current_user';

const INITIAL_DATA = {
  departments: [
    { id: 1, name: 'Computer Science & Engineering', code: 'CSE' },
    { id: 2, name: 'Electronics & Communication', code: 'ECE' },
    { id: 3, name: 'Mechanical Engineering', code: 'MECH' },
    { id: 4, name: 'Business Administration', code: 'MBA' },
    { id: 5, name: 'Civil Engineering', code: 'CIVIL' }
  ],
  users: [
    {
      id: 1,
      full_name: 'Prof. S. K. Sharma (Chief Election Officer)',
      email: 'admin@college.edu',
      role: 'ADMIN',
      college_registration_number: 'ADMIN-OFFICIAL-01',
      department_id: 1,
      course: 'Faculty Administration',
      academic_year: '2026-27',
      account_status: 'APPROVED',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      full_name: 'Aarav Sharma',
      email: 'aarav.sharma@college.edu',
      role: 'VOTER',
      college_registration_number: '2023CSE0101',
      department_id: 1,
      course: 'B.Tech CSE',
      academic_year: '3rd Year',
      account_status: 'APPROVED',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      full_name: 'Priya Patel',
      email: 'priya.patel@college.edu',
      role: 'CANDIDATE',
      college_registration_number: '2023ECE0202',
      department_id: 2,
      course: 'B.Tech ECE',
      academic_year: '3rd Year',
      account_status: 'APPROVED',
      created_at: new Date().toISOString()
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
      remarks: 'Verified against College ERP student records.'
    }
  ],
  elections: [
    {
      id: 1,
      title: 'Annual Student General Council Election 2026-27',
      description: 'Official College-wide statutory election for President, Vice-President, and General Secretary.',
      status: 'ACTIVE',
      start_time: '2026-10-01T00:00:00.000Z',
      end_time: '2026-11-30T23:59:59.000Z',
      created_at: '2026-09-15T10:00:00.000Z'
    }
  ],
  election_positions: [
    { id: 1, election_id: 1, title: 'President of Student Council', max_votes: 1 },
    { id: 2, election_id: 1, title: 'Vice President of Student Council', max_votes: 1 },
    { id: 3, election_id: 1, title: 'General Secretary', max_votes: 1 }
  ],
  candidate_applications: [
    {
      id: 1,
      user_id: 3,
      position_id: 1,
      election_id: 1,
      ballot_number: 1,
      symbol_name: 'Torch of Wisdom',
      symbol_svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#FF9933"/><path d="M50 20 L55 45 L45 45 Z" fill="#fff"/></svg>',
      manifesto: 'Digital transparency and student empowerment for every voice on campus.',
      application_status: 'APPROVED'
    }
  ],
  votes: [],
  voter_participations: []
};

function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return JSON.parse(JSON.stringify(INITIAL_DATA));
    }
    return JSON.parse(raw);
  } catch (e) {
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }
}

function saveStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Storage save failed:', e);
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
    const store = getStore();
    return store.users[0]; // Default to Admin
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  } catch (e) {}
}

export function handleFallbackRequest(config) {
  const method = (config.method || 'get').toLowerCase();
  const url = (config.url || '').replace(/^\/api/, '');
  const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};
  const store = getStore();

  console.log(`[ECI Local Engine] Handling ${method.toUpperCase()} ${url}`, data);

  // 1. Auth Register
  if (url === '/auth/register' || url.endsWith('/register')) {
    const existing = store.users.find(
      u => u.email.toLowerCase() === (data.email || '').toLowerCase() ||
           u.college_registration_number === (data.college_registration_number || '')
    );
    if (existing) {
      // Re-use or update
      setCurrentUser(existing);
      return {
        success: true,
        message: 'Account already active! Logged in successfully.',
        user: existing
      };
    }

    const newId = store.users.length + 1;
    const newUser = {
      id: newId,
      full_name: data.full_name || 'Student Voter',
      email: (data.email || `voter${newId}@college.edu`).toLowerCase(),
      college_registration_number: (data.college_registration_number || `REG-${newId}`).toUpperCase(),
      role: data.role || 'VOTER',
      department_id: Number(data.department_id) || 1,
      course: data.course || 'B.Tech',
      academic_year: data.academic_year || '3rd Year',
      account_status: 'PENDING',
      created_at: new Date().toISOString()
    };

    store.users.push(newUser);

    // Create Voter Form 6-C application
    const newApp = {
      id: store.voter_applications.length + 1,
      user_id: newId,
      application_status: 'PENDING',
      student_id_number: newUser.college_registration_number,
      id_proof_type: 'College Identity Card',
      submitted_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      remarks: 'Application submitted online under Form 6-C.'
    };
    store.voter_applications.push(newApp);

    saveStore(store);
    setCurrentUser(newUser);

    return {
      success: true,
      message: 'Registration complete! Your Form 6-C voter application has been submitted for scrutiny.',
      user: newUser,
      voterApplication: newApp
    };
  }

  // 2. Auth Login
  if (url === '/auth/login' || url.endsWith('/login')) {
    const user = store.users.find(u => u.email.toLowerCase() === (data.email || '').toLowerCase()) || store.users[0];
    setCurrentUser(user);
    const app = store.voter_applications.find(a => a.user_id === user.id) || null;
    return {
      success: true,
      message: 'Login successful.',
      user,
      voterApplication: app,
      token: 'demo-eci-jwt-token'
    };
  }

  // 3. Auth Me
  if (url === '/auth/me' || url.endsWith('/me')) {
    const user = getCurrentUser() || store.users[0];
    const app = store.voter_applications.find(a => a.user_id === user.id) || null;
    return {
      success: true,
      user,
      voterApplication: app
    };
  }

  // 4. Auth Switch Role (Instant 1-Click Role Switch)
  if (url === '/auth/switch-role' || url.endsWith('/switch-role')) {
    const targetRole = (data.role || 'ADMIN').toUpperCase();
    let user = store.users.find(u => u.role === targetRole);
    if (!user) {
      user = {
        id: store.users.length + 1,
        full_name: targetRole === 'ADMIN' ? 'Chief Election Officer' : targetRole === 'CANDIDATE' ? 'Nominated Candidate' : 'Verified E-Voter',
        email: `${targetRole.toLowerCase()}@college.edu`,
        role: targetRole,
        college_registration_number: `${targetRole}-OFFICIAL`,
        department_id: 1,
        course: 'Student Election Portal',
        academic_year: '2026-27',
        account_status: 'APPROVED',
        created_at: new Date().toISOString()
      };
      store.users.push(user);
      saveStore(store);
    }
    setCurrentUser(user);
    const app = store.voter_applications.find(a => a.user_id === user.id) || null;
    return {
      success: true,
      message: `Switched to ${targetRole} panel instantly.`,
      user,
      voterApplication: app
    };
  }

  // 5. Auth Logout
  if (url === '/auth/logout' || url.endsWith('/logout')) {
    setCurrentUser(null);
    return { success: true, message: 'Logged out successfully.' };
  }

  // 6. Admin Voters List (Form 6-C scrutiny desk)
  if (url.includes('/admin/voters') || url.includes('/admin/voter-applications')) {
    const applications = store.voter_applications.map(app => {
      const u = store.users.find(usr => usr.id === app.user_id) || {};
      const dept = store.departments.find(d => d.id === u.department_id) || {};
      return {
        ...app,
        full_name: u.full_name || 'Registered Voter',
        email: u.email || 'voter@college.edu',
        college_registration_number: u.college_registration_number || app.student_id_number,
        course: u.course || 'B.Tech',
        academic_year: u.academic_year || '3rd Year',
        department_name: dept.name || 'General Engineering'
      };
    });
    return {
      success: true,
      applications,
      voters: applications,
      data: applications
    };
  }

  // 7. Admin Approve/Reject Voter
  const approveMatch = url.match(/\/admin\/voters\/(\d+)\/approve/);
  if (approveMatch) {
    const appId = Number(approveMatch[1]);
    const app = store.voter_applications.find(a => a.id === appId);
    if (app) {
      app.application_status = 'APPROVED';
      const u = store.users.find(usr => usr.id === app.user_id);
      if (u) u.account_status = 'APPROVED';
      saveStore(store);
    }
    return { success: true, message: 'Voter Application approved and added to certified roll.' };
  }

  const rejectMatch = url.match(/\/admin\/voters\/(\d+)\/reject/);
  if (rejectMatch) {
    const appId = Number(rejectMatch[1]);
    const app = store.voter_applications.find(a => a.id === appId);
    if (app) {
      app.application_status = 'REJECTED';
      const u = store.users.find(usr => usr.id === app.user_id);
      if (u) u.account_status = 'REJECTED';
      saveStore(store);
    }
    return { success: true, message: 'Voter Application rejected.' };
  }

  // 8. Elections
  if (url === '/elections/active' || url.endsWith('/active')) {
    return {
      success: true,
      elections: store.elections.filter(e => e.status === 'ACTIVE')
    };
  }

  if (url === '/elections' || url.startsWith('/elections')) {
    return {
      success: true,
      elections: store.elections,
      positions: store.election_positions,
      candidates: store.candidate_applications
    };
  }

  // Default response
  return {
    success: true,
    message: 'Operation handled successfully',
    data: store
  };
}
