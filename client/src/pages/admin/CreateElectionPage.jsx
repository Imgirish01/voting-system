import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';
import { PlusCircle, Trash2, Calendar, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

const CreateElectionPage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Default dates helper
  const getTomorrowISO = (daysAhead = 1, hours = 9) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hours, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    election_type: 'Student Council President',
    academic_year: '2026-27',
    scope: 'COLLEGE_WIDE',
    department_id: '',
    application_deadline: getTomorrowISO(2, 23),
    start_at: getTomorrowISO(3, 9),
    end_at: getTomorrowISO(5, 17),
    status: 'APPLICATION_OPEN',
    eligibility_criteria: 'Bona fide college students with minimum 75% attendance and no disciplinary arrears.',
    max_winners: 1,
    positions: [
      {
        position_name: 'President',
        description: 'Supreme representative for general student body in university senate.',
        winners_allowed: 1,
        tie_policy: 'ADMIN_DECISION',
      },
    ],
  });

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/admin/departments');
        if (res.success && res.departments) {
          setDepartments(res.departments);
        }
      } catch (err) {
        // Fallback
      }
    };
    fetchDepts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePositionChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.positions];
      updated[idx][field] = value;
      return { ...prev, positions: updated };
    });
  };

  const addPosition = () => {
    setFormData((prev) => ({
      ...prev,
      positions: [
        ...prev.positions,
        {
          position_name: '',
          description: '',
          winners_allowed: 1,
          tie_policy: 'ADMIN_DECISION',
        },
      ],
    }));
  };

  const removePosition = (idx) => {
    if (formData.positions.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      positions: prev.positions.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Date validations
    const start = new Date(formData.start_at);
    const end = new Date(formData.end_at);
    const deadline = new Date(formData.application_deadline);

    if (end <= start) {
      return setError('Voting End Date/Time must be strictly after the Start Date/Time.');
    }

    if (deadline > start) {
      return setError('Candidate Application Deadline must close before or at voting start time.');
    }

    setLoading(true);

    try {
      const res = await api.post('/admin/elections', formData);
      setSuccess('Election registered successfully! Redirecting to Election Registry...');
      setTimeout(() => {
        navigate('/admin/elections');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create election.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Create New Election (निर्वाचन अधिसूचना)"
      subtitle="Issue Official Election Notification & Configure Ballot Parameters"
    >
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-6 p-6 sm:p-8">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-2">
              1. Statutory Election Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Election Official Title
              </label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Student Council Presidential Election 2026-27"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Election Description & Notification Text
              </label>
              <textarea
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed objectives and scope of the election..."
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Election Type
                </label>
                <select
                  name="election_type"
                  value={formData.election_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                >
                  <option value="Student Council President">Student Council President</option>
                  <option value="Vice President">Vice President</option>
                  <option value="General Secretary">General Secretary</option>
                  <option value="Department Representative">Department Representative</option>
                  <option value="Class Representative">Class Representative</option>
                  <option value="Sports Secretary">Sports Secretary</option>
                  <option value="Cultural Secretary">Cultural Secretary</option>
                  <option value="Custom Election">Custom Election</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  required
                  name="academic_year"
                  value={formData.academic_year}
                  onChange={handleChange}
                  placeholder="2026-27"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Electoral Scope
                </label>
                <select
                  name="scope"
                  value={formData.scope}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                >
                  <option value="COLLEGE_WIDE">College-Wide (All Faculties)</option>
                  <option value="DEPARTMENTAL">Departmental Only</option>
                </select>
              </div>
            </div>

            {formData.scope === 'DEPARTMENTAL' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Department
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                >
                  <option value="">-- Choose Eligible Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Section 2: Statutory Timetable */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-2">
              2. Official Timetable & Deadlines
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nomination Deadline
                </label>
                <input
                  type="datetime-local"
                  required
                  name="application_deadline"
                  value={formData.application_deadline}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Voting Poll Opens
                </label>
                <input
                  type="datetime-local"
                  required
                  name="start_at"
                  value={formData.start_at}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Voting Poll Closes
                </label>
                <input
                  type="datetime-local"
                  required
                  name="end_at"
                  value={formData.end_at}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Initial Notification Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                >
                  <option value="DRAFT">DRAFT (Save as internal draft)</option>
                  <option value="APPLICATION_OPEN">APPLICATION_OPEN (Open candidate nominations)</option>
                  <option value="UPCOMING">UPCOMING (Scheduled for future date)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Eligibility Criteria Note
                </label>
                <input
                  type="text"
                  name="eligibility_criteria"
                  value={formData.eligibility_criteria}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Positions Contested */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider">
                3. Contested Positions & Ballot Units
              </h3>
              <button
                type="button"
                onClick={addPosition}
                className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-bold flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.positions.map((pos, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                  {formData.positions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePosition(idx)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                      title="Remove Position"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Position Title #{idx + 1}
                      </label>
                      <input
                        type="text"
                        required
                        value={pos.position_name}
                        onChange={(e) => handlePositionChange(idx, 'position_name', e.target.value)}
                        placeholder="e.g. President / Vice President"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Winners Allowed
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={pos.winners_allowed}
                        onChange={(e) => handlePositionChange(idx, 'winners_allowed', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Position Role Description
                    </label>
                    <input
                      type="text"
                      value={pos.description}
                      onChange={(e) => handlePositionChange(idx, 'description', e.target.value)}
                      placeholder="Duties and mandate..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/elections')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all flex items-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Publishing Notification...' : 'ISSUE ELECTION NOTIFICATION'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateElectionPage;

