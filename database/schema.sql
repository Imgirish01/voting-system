-- ====================================================================
-- COLLEGE ELECTION VOTING SYSTEM (ECI THEMED) - DATABASE SCHEMA (MySQL)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS college_voting_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE college_voting_db;

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'VOTER', 'CANDIDATE') NOT NULL DEFAULT 'VOTER',
    college_registration_number VARCHAR(50) UNIQUE,
    department_id INT NULL,
    course VARCHAR(100) NULL,
    academic_year VARCHAR(20) NULL,
    account_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
    avatar_url VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_status (account_status),
    INDEX idx_user_reg_num (college_registration_number),
    CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. VOTER APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS voter_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    application_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
    college_id_card_url VARCHAR(255) NULL,
    student_id_number VARCHAR(50) NOT NULL,
    id_proof_type VARCHAR(50) DEFAULT 'College Identity Card',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    rejection_reason TEXT NULL,
    remarks TEXT NULL,
    INDEX idx_voter_app_status (application_status),
    CONSTRAINT fk_voter_app_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_voter_app_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ELECTIONS TABLE
CREATE TABLE IF NOT EXISTS elections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    election_type VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    scope ENUM('COLLEGE_WIDE', 'DEPARTMENTAL') NOT NULL DEFAULT 'COLLEGE_WIDE',
    department_id INT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    application_deadline DATETIME NOT NULL,
    status ENUM('DRAFT', 'UPCOMING', 'APPLICATION_OPEN', 'APPLICATION_CLOSED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    eligibility_criteria TEXT,
    max_winners INT NOT NULL DEFAULT 1,
    is_results_published BOOLEAN NOT NULL DEFAULT FALSE,
    results_published_at DATETIME NULL,
    results_published_by INT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_election_status (status),
    INDEX idx_election_timing (start_at, end_at),
    CONSTRAINT fk_elections_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    CONSTRAINT fk_elections_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_elections_publisher FOREIGN KEY (results_published_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ELECTION POSITIONS TABLE
CREATE TABLE IF NOT EXISTS election_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    election_id INT NOT NULL,
    position_name VARCHAR(100) NOT NULL,
    description TEXT,
    winners_allowed INT NOT NULL DEFAULT 1,
    tie_policy ENUM('COUNCIL_VOTE', 'RE_ELECTION', 'LOTTERY', 'ADMIN_DECISION') NOT NULL DEFAULT 'ADMIN_DECISION',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pos_election (election_id),
    CONSTRAINT fk_pos_election FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. CANDIDATE APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS candidate_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    election_id INT NOT NULL,
    position_id INT NOT NULL,
    biography TEXT,
    manifesto TEXT NOT NULL,
    photo_path VARCHAR(255) NULL,
    symbol_name VARCHAR(100) DEFAULT 'Torch',
    symbol_icon VARCHAR(50) DEFAULT 'flame',
    application_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN') NOT NULL DEFAULT 'PENDING',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    rejection_reason TEXT NULL,
    INDEX idx_cand_app_status (application_status),
    UNIQUE KEY unique_cand_election_pos (user_id, election_id, position_id),
    CONSTRAINT fk_cand_app_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cand_app_election FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
    CONSTRAINT fk_cand_app_pos FOREIGN KEY (position_id) REFERENCES election_positions(id) ON DELETE CASCADE,
    CONSTRAINT fk_cand_app_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. VOTER PARTICIPATION (Audit trail for who casted vote, separate from secret ballot choice)
CREATE TABLE IF NOT EXISTS voter_participations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    election_id INT NOT NULL,
    position_id INT NOT NULL,
    user_id INT NOT NULL,
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_voter_election_pos (election_id, position_id, user_id),
    INDEX idx_voter_part_user (user_id),
    CONSTRAINT fk_vpart_election FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
    CONSTRAINT fk_vpart_pos FOREIGN KEY (position_id) REFERENCES election_positions(id) ON DELETE CASCADE,
    CONSTRAINT fk_vpart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. VOTES TABLE (SECRET BALLOT: No direct reference to user_id, uses cryptographically generated voter_token)
CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    election_id INT NOT NULL,
    position_id INT NOT NULL,
    candidate_application_id INT NOT NULL,
    voter_token VARCHAR(64) NOT NULL,
    cast_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_token_election_pos (election_id, position_id, voter_token),
    INDEX idx_vote_cand (candidate_application_id),
    CONSTRAINT fk_votes_election FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
    CONSTRAINT fk_votes_pos FOREIGN KEY (position_id) REFERENCES election_positions(id) ON DELETE CASCADE,
    CONSTRAINT fk_votes_candidate FOREIGN KEY (candidate_application_id) REFERENCES candidate_applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. ELECTION RESULTS TABLE
CREATE TABLE IF NOT EXISTS election_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    election_id INT NOT NULL,
    position_id INT NOT NULL,
    candidate_application_id INT NOT NULL,
    vote_count INT NOT NULL DEFAULT 0,
    vote_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    outcome ENUM('WON', 'LOST', 'TIED') NOT NULL,
    published_at DATETIME NOT NULL,
    published_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_results_election (election_id),
    CONSTRAINT fk_results_election FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
    CONSTRAINT fk_results_pos FOREIGN KEY (position_id) REFERENCES election_positions(id) ON DELETE CASCADE,
    CONSTRAINT fk_results_candidate FOREIGN KEY (candidate_application_id) REFERENCES candidate_applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_results_publisher FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'INFO',
    read_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_user (user_id, read_at),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    actor_user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INT NULL,
    details TEXT,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_actor (actor_user_id),
    INDEX idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

