-- ====================================================================
-- COLLEGE ELECTION VOTING SYSTEM (ECI THEMED) - SEED DATA (MySQL)
-- ====================================================================

USE college_voting_db;

-- 1. INSERT DEPARTMENTS
INSERT INTO departments (id, name, code, description) VALUES
(1, 'Computer Science & Engineering', 'CSE', 'Department of Computer Science and Information Technology'),
(2, 'Electronics & Communication', 'ECE', 'Department of Electronics and Communications Engineering'),
(3, 'Mechanical Engineering', 'MECH', 'Department of Mechanical and Industrial Engineering'),
(4, 'Business Administration', 'MBA', 'Department of Management and Business Studies'),
(5, 'Civil Engineering', 'CIVIL', 'Department of Civil and Environmental Engineering')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. INSERT DEMO USERS
-- Default Demo Passwords:
-- Admin: Admin@123
-- Voters: Voter@123
-- Candidates: Candidate@123
-- Standard bcrypt hashes ($2a$10$...) will be updated/synchronized by the server seed initializer.
INSERT INTO users (id, full_name, email, password_hash, role, college_registration_number, department_id, course, academic_year, account_status) VALUES
(1, 'Prof. S. K. Sharma (Chief Election Officer)', 'admin@college.edu', '$2a$10$X0e/O1j0ZeqKvh9q6qH5j.vRzSkgY4a2C1p8sT7vU6wY9zO3q1wZa', 'ADMIN', 'ADMIN-OFFICIAL-01', 1, 'Faculty Administration', '2026-27', 'APPROVED'),
(2, 'Aarav Sharma', 'aarav.sharma@college.edu', '$2a$10$X0e/O1j0ZeqKvh9q6qH5j.vRzSkgY4a2C1p8sT7vU6wY9zO3q1wZa', 'VOTER', '2023CSE0101', 1, 'B.Tech CSE', '3rd Year', 'APPROVED'),
(3, 'Diya Patel', 'diya.patel@college.edu', '$2a$10$X0e/O1j0ZeqKvh9q6qH5j.vRzSkgY4a2C1p8sT7vU6wY9zO3q1wZa', 'VOTER', '2023ECE0204', 2, 'B.Tech ECE', '3rd Year', 'APPROVED'),
(4, 'Rohan Gupta', 'rohan.gupta@college.edu', '$2a$10$X0e/O1j0ZeqKvh9q6qH5j.vRzSkgY4a2C1p8sT7vU6wY9zO3q1wZa', 'VOTER', '2024ME0305', 3, 'B.Tech ME', '2nd Year', 'PENDING'),
(5, 'Ananya Singh', 'ananya.singh@college.edu', '$2a$10$X0e/O1j0ZeqKvh9q6qH5j.vRzSkgY4a2C1p8sT7vU6wY9zO3q1wZa', 'VOTER', '2022MBA0401', 4, 'MBA', 'Final Year', 'REJECTED'),
(6, 'Vikramaditya Roy', 'vikram.roy@college.edu', '$2a$10$X0e/O1j0ZeqKvh9q6qH5j.vRzSkgY4a2C1p8sT7vU6wY9zO3q1wZa', 'CANDIDATE', '2022CSE0050', 1, 'B.Tech CSE', 'Final Year', 'APPROVED'),
(7, 'Pooja Verma', 'pooja.verma@college.edu', '$2a$10$X0e/O1j0ZeqKvh9q6qH5j.vRzSkgY4a2C1p8sT7vU6wY9zO3q1wZa', 'CANDIDATE', '2022ECE0082', 2, 'B.Tech ECE', 'Final Year', 'APPROVED'),
(8, 'Karan Malhotra', 'karan.malhotra@college.edu', '$2a$10$X0e/O1j0ZeqKvh9q6qH5j.vRzSkgY4a2C1p8sT7vU6wY9zO3q1wZa', 'CANDIDATE', '2023ME0099', 3, 'B.Tech ME', '3rd Year', 'APPROVED')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 3. INSERT VOTER APPLICATIONS
INSERT INTO voter_applications (id, user_id, application_status, student_id_number, submitted_at, reviewed_by, reviewed_at, rejection_reason, remarks) VALUES
(1, 2, 'APPROVED', '2023CSE0101', '2026-10-01 10:00:00', 1, '2026-10-02 11:30:00', NULL, 'Verified with College Registrar database.'),
(2, 3, 'APPROVED', '2023ECE0204', '2026-10-02 14:15:00', 1, '2026-10-03 09:45:00', NULL, 'All credentials verified.'),
(3, 4, 'PENDING', '2024ME0305', '2026-10-25 16:20:00', NULL, NULL, NULL, 'Awaiting document scrutiny by CEO.'),
(4, 5, 'REJECTED', '2022MBA0401', '2026-10-20 12:00:00', 1, '2026-10-22 15:10:00', 'Uploaded College ID copy is illegible and unverified. Please upload a clear color scan of your current Semester ID card.', 'Document rejected.')
ON DUPLICATE KEY UPDATE application_status=VALUES(application_status);

-- 4. INSERT ELECTIONS
INSERT INTO elections (id, title, description, election_type, academic_year, scope, department_id, start_at, end_at, application_deadline, status, eligibility_criteria, max_winners, is_results_published, created_by) VALUES
(1, 'Campus General Council Election 2026-27', 'Annual election of the Student Executive Council representing all faculties and departments of the College.', 'Student Council President', '2026-27', 'COLLEGE_WIDE', NULL, '2026-10-28 08:00:00', '2026-10-31 18:00:00', '2026-10-26 23:59:59', 'ACTIVE', 'All registered bona fide undergraduate and postgraduate students with no disciplinary arrears.', 1, FALSE, 1),
(2, 'Department Representative Election - CSE', 'Election for Departmental Representative to voice academic and laboratory infrastructure requirements.', 'Department Representative', '2026-27', 'DEPARTMENTAL', 1, '2026-11-05 09:00:00', '2026-11-07 17:00:00', '2026-11-02 23:59:59', 'APPLICATION_OPEN', 'B.Tech CSE 2nd, 3rd, and 4th Year students only.', 1, FALSE, 1),
(3, 'Sports & Athletics Council Election 2025-26', 'Official election for Sports Secretary and Inter-College Tournament Coordinator.', 'Sports Secretary', '2025-26', 'COLLEGE_WIDE', NULL, '2026-09-10 09:00:00', '2026-09-12 17:00:00', '2026-09-05 23:59:59', 'COMPLETED', 'Active sports council members with minimum 75% sports attendance.', 1, TRUE, 1)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 5. INSERT ELECTION POSITIONS
INSERT INTO election_positions (id, election_id, position_name, description, winners_allowed, tie_policy) VALUES
(1, 1, 'Student Council President', 'Supreme student representative in College Academic & Disciplinary Senate', 1, 'ADMIN_DECISION'),
(2, 1, 'General Secretary', 'Oversees student welfare, cultural affairs, and club associations', 1, 'ADMIN_DECISION'),
(3, 2, 'CSE Department Representative', 'Liaison between faculty and CSE undergraduate cohorts', 1, 'ADMIN_DECISION'),
(4, 3, 'Sports Secretary', 'Heads College Sports Board and Inter-University delegations', 1, 'ADMIN_DECISION')
ON DUPLICATE KEY UPDATE position_name=VALUES(position_name);

-- 6. INSERT CANDIDATE APPLICATIONS
INSERT INTO candidate_applications (id, user_id, election_id, position_id, biography, manifesto, symbol_name, symbol_icon, application_status, submitted_at, reviewed_by, reviewed_at) VALUES
(1, 6, 1, 1, 'Senior CSE student, Lead Organizer of Hackathon 2025, passionate about student lab resources and 24/7 library access.', '1. 24/7 Library and high-speed Wi-Fi across campus.\n2. Subsidized technical certifications and AI workshops.\n3. Transparent grievance redressal mechanism.\n4. Clean and hygienic cafeteria food audit committee.', 'Torch', 'Flame', 'APPROVED', '2026-10-15 10:00:00', 1, '2026-10-16 11:00:00'),
(2, 7, 1, 1, 'Final year ECE student, Class Representative for 2 consecutive years, IEEE Student Branch Secretary.', '1. Merit-based student innovation funding pool of Rs. 10 Lakhs.\n2. Mental wellness lounge and dedicated counselor on campus.\n3. Better inter-department sports facilities and annual college fest revival.\n4. Placement bootcamps with industry leaders.', 'Book', 'BookOpen', 'APPROVED', '2026-10-15 11:30:00', 1, '2026-10-16 11:15:00'),
(3, 8, 1, 2, '3rd Year Mechanical Engineering, Captain of SAE Baja Formula Racing Team.', '1. State-of-the-art makerspace and 3D printing access for all departments.\n2. Equal budget allocation for cultural and technical clubs.\n3. Electric shuttle service inside campus grounds.', 'Tree', 'Trees', 'APPROVED', '2026-10-16 14:00:00', 1, '2026-10-17 10:00:00')
ON DUPLICATE KEY UPDATE biography=VALUES(biography);

-- 7. INSERT NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, notification_type, created_at) VALUES
(1, 2, 'Voter Verification Approved', 'Your Form 6-C Voter Verification has been approved by the Chief Election Officer. You are eligible to vote in active elections.', 'STATUS_CHANGE', '2026-10-02 11:30:00'),
(2, 2, 'Campus General Council Election 2026-27 is LIVE', 'Voting for the Campus General Council Election 2026-27 is now ACTIVE. Cast your secret vote before 31-Oct-2026.', 'ELECTION_ALERT', '2026-10-28 08:00:00'),
(3, 6, 'Candidacy Approved', 'Congratulations! Your candidacy for Student Council President has been approved with election symbol Torch.', 'STATUS_CHANGE', '2026-10-16 11:00:00'),
(4, 5, 'Voter Application Rejected', 'Your voter application was rejected due to an unverified ID proof. Please review the reason and resubmit.', 'STATUS_CHANGE', '2026-10-22 15:10:00')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 8. INSERT AUDIT LOGS
INSERT INTO audit_logs (id, actor_user_id, action, entity_type, entity_id, details) VALUES
(1, 1, 'SYSTEM_INIT', 'SYSTEM', 1, 'Campus Election Commission Portal initialized with official parameters.'),
(2, 1, 'ELECTION_CREATED', 'ELECTIONS', 1, 'Created election: Campus General Council Election 2026-27'),
(3, 1, 'VOTER_APPROVED', 'VOTER_APPLICATIONS', 1, 'Approved voter registration for Aarav Sharma (2023CSE0101)'),
(4, 1, 'CANDIDATE_APPROVED', 'CANDIDATE_APPLICATIONS', 1, 'Approved candidate Vikramaditya Roy for position Student Council President'),
(5, 1, 'ELECTION_STARTED', 'ELECTIONS', 1, 'Election poll opened for Campus General Council Election 2026-27')
ON DUPLICATE KEY UPDATE action=VALUES(action);

