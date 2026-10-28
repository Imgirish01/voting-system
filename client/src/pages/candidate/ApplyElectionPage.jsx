import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Award, PlusCircle, CheckCircle2, AlertCircle, Send, BookOpen } from 'lucide-react';

const ECI_SYMBOLS = [
  { name: 'Torch', icon: 'flame', desc: 'Symbol of Enlightenment & Guidance' },
  { name: 'Book', icon: 'book', desc: 'Symbol of Academic Excellence & Truth' },
  { name: 'Tree', icon: 'trees', desc: 'Symbol of Environmental Harmony & Growth' },
  { name: 'Scales', icon: 'scale', desc: 'Symbol of Justice & Student Rights' },
  { name: 'Compass', icon: 'compass', desc: 'Symbol of Navigation & Vision' },
  { name: 'Lamp', icon: 'lamp', desc: 'Symbol of Knowledge & Culture' },
  { name: 'Rising Sun', icon: 'sun', desc: 'Symbol of Hope & Renewal' },
  { name: 'Pen', icon: 'pen', desc: 'Symbol of Freedom of Expression' },
];

const ApplyElectionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    election_id: '',
    position_id: '',
    biography: '',
    manifesto: '',
    symbol_name: 'Torch',
    symbol_icon: 'flame',
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch available elections where APPLICATION_OPEN
  useEffect(() => {
    const fetchOpenElections = async () => {
      try {
        setLoading(true);
        const res = await api.get('/candidates/elections');
        if (res.success) {
          const openOnly = (res.elections || []).filter((e) => e.status === 'APPLICATION_OPEN');
          setElections(openOnly);
          if (openOnly.length > 0) {
            setSelectedElection(openOnly[0]);
            setFormData((prev) => ({
              ...prev,
              election_id: String(openOnly[0].id),
              position_id: openOnly[0].positions?.[0]?.id ? String(openOnly[0].positions[0].id) : '',
            }));
            setPositions(openOnly[0].positions || []);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOpenElections();
  }, []);

  const handleElectionChange = (e) => {
    const elId = e.target.value;
    const found = elections.find((el) => String(el.id) === String(elId));
    setSelectedElection(found || null);
    const newPositions = found?.positions || [];
    setPositions(newPositions);
    setFormData((prev) => ({
      ...prev,
      election_id: elId,
      position_id: newPositions.length > 0 ? String(newPositions[0].id) : '',
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSymbolSelect = (sym) => {
    setFormData((prev) => ({
      ...prev,
      symbol_name: sym.name,
      symbol_icon: sym.icon,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!formData.election_id || !formData.position_id) {
      return setError('Please select an active election and contested position.');
    }

    if (!formData.manifesto.trim()) {
      return setError('A campaign manifesto outlining your agenda and promises is required.');
    }

    setSubmitting(true);

    try {
      const res = await api.post('/candidates/applications', formData);
      setMessage(
        res.message ||
          'Your candidacy application has been submitted and is awaiting administrator approval.'
      );
      setTimeout(() => {
        navigate('/candidate/my-applications');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit nomination paper.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Nomination Filing Desk (Form 2-B)"
      subtitle="Statutory Nomination Paper for Campus Student Council Election"
    >
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl text-emerald-950 text-xs space-y-1">
              <div className="flex items-center space-x-2 font-bold text-emerald-800 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Nomination Transmitted to CEO Scrutiny</span>
              </div>
              <p>{message}</p>
            </div>
          )}

          {/* Section 1: Election & Post */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-2">
              1. Election & Position Contested
            </h3>

            {elections.length === 0 && !loading && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs">
                There are no elections currently accepting candidate nominations. Please monitor the election schedule on the home portal.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Active Election *
                </label>
                <select
                  name="election_id"
                  value={formData.election_id}
                  onChange={handleElectionChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                >
                  {elections.map((el) => (
                    <option key={el.id} value={el.id}>
                      {el.title} ({el.academic_year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Contested Position *
                </label>
                <select
                  name="position_id"
                  value={formData.position_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                >
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.position_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedElection && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1 font-mono">
                <p>Nomination Deadline: <strong>{new Date(selectedElection.application_deadline).toLocaleString()}</strong></p>
                <p>Scheduled Poll: <strong>{new Date(selectedElection.start_at).toLocaleDateString()} to {new Date(selectedElection.end_at).toLocaleDateString()}</strong></p>
              </div>
            )}
          </div>

          {/* Section 2: Candidate Symbol Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-2">
              2. Official Electoral Symbol Selection
            </h3>
            <p className="text-xs text-slate-500">
              Select one approved symbol to appear alongside your name on the Electronic Ballot Unit.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ECI_SYMBOLS.map((sym) => {
                const isSelected = formData.symbol_name === sym.name;
                return (
                  <button
                    key={sym.name}
                    type="button"
                    onClick={() => handleSymbolSelect(sym)}
                    className={`p-3 rounded-xl border-2 text-center transition-all flex flex-col items-center space-y-1.5 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                      <Award className={`w-6 h-6 ${isSelected ? 'text-amber-600' : 'text-slate-500'}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-900">{sym.name}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{sym.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Biography & Manifesto */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-2">
              3. Candidate Credentials & Campaign Manifesto
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Candidate Short Biography (Experience, Leadership & Honors)
              </label>
              <textarea
                rows={3}
                name="biography"
                value={formData.biography}
                onChange={handleChange}
                placeholder="Describe your student leadership background, club activities, or academic record..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Official Campaign Manifesto (Key Pledges & Student Agenda) *
              </label>
              <textarea
                rows={5}
                required
                name="manifesto"
                value={formData.manifesto}
                onChange={handleChange}
                placeholder="1. Subsidized technical certifications&#10;2. 24/7 Library access&#10;3. Transparent grievance resolution"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/candidate/dashboard')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || elections.length === 0}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-md transition-all flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Transmitting Nomination...' : 'SUBMIT FORM 2-B NOMINATION'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ApplyElectionPage;

