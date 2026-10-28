import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';
import {
  UserPlus,
  Shield,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Hash,
  Eye,
  EyeOff,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Simple 4 core inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Optional extra details (collapsed by default)
  const [showExtra, setShowExtra] = useState(false);
  const [departmentId, setDepartmentId] = useState('1');
  const [course, setCourse] = useState('B.Tech CSE');
  const [academicYear, setAcademicYear] = useState('3rd Year');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 1-Click Demo Fill for instant testing
  const handleAutoFill = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFullName(`Student ${randomNum}`);
    setRegNo(`2024CS${randomNum}`);
    setEmail(`student${randomNum}@college.edu`);
    setPassword('Password@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!fullName.trim() || !email.trim() || !regNo.trim() || !password) {
      return setError('Please fill in Name, College Email, Roll Number, and Password.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);

    try {
      const res = await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        college_registration_number: regNo.trim().toUpperCase(),
        role: 'VOTER',
        department_id: Number(departmentId) || 1,
        course,
        academic_year: academicYear,
      });

      setSuccessMessage(
        res.message ||
          'Registration complete! Your Form 6-C voter application has been submitted for scrutiny.'
      );

      setTimeout(() => {
        navigate('/voter/verification');
      }, 1800);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-md mx-auto my-6">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden">
          {/* ECI Tricolor Bar */}
          <div className="eci-tricolor-bar w-full"></div>

          {/* Clean Header */}
          <div className="bg-[#082545] text-white p-5 text-center border-b-2 border-amber-500">
            <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg mx-auto shadow-md mb-2">
              6-C
            </div>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              महाविद्यालय निर्वाचन आयोग
            </p>
            <h2 className="text-xl font-extrabold tracking-tight">
              QUICK ELECTOR REGISTRATION
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Enter 4 basic details to register for campus voting
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Quick 1-Click Auto Fill Button */}
            <div className="flex items-center justify-between bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 text-xs">
              <span className="text-amber-900 font-semibold flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Want to test fast?
              </span>
              <button
                type="button"
                onClick={handleAutoFill}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] shadow-xs active:scale-95 transition-all"
              >
                1-Click Auto-Fill Sample Data
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Registration Successful!</span>
                </div>
                <p className="text-[11px]">{successMessage}</p>
                <p className="text-[10px] text-emerald-700 italic">Redirecting to status desk...</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                </div>
              </div>

              {/* 2. College Roll / Reg No */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  College Roll / Registration No. *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="e.g. 2024CS042"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none uppercase font-mono"
                  />
                </div>
              </div>

              {/* 3. College Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  College Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                </div>
              </div>

              {/* 4. Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Optional Department / Year Dropdown (Expandable) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowExtra(!showExtra)}
                  className="text-xs font-semibold text-blue-900 hover:text-amber-600 flex items-center space-x-1"
                >
                  <span>{showExtra ? '− Hide Academic Details' : '+ Change Department or Year (Optional)'}</span>
                </button>

                {showExtra && (
                  <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs animate-in fade-in">
                    <div>
                      <label className="block font-bold text-slate-600 mb-0.5">Department</label>
                      <select
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-md"
                      >
                        <option value="1">Computer Science & Engineering</option>
                        <option value="2">Electronics & Communication</option>
                        <option value="3">Mechanical Engineering</option>
                        <option value="4">Business Administration</option>
                        <option value="5">Civil Engineering</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-600 mb-0.5">Course</label>
                        <input
                          type="text"
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-600 mb-0.5">Year</label>
                        <select
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-md"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="Final Year">Final Year</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-xs pt-3"
              >
                {loading ? (
                  <span>Registering Elector...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>REGISTER AS VOTER (FORM 6-C)</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-600">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-blue-900 hover:text-amber-600 underline">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;
