import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createApplication, uploadResume, parseJobDescription } from '../api';
import { Save, ArrowLeft, Upload, File, Search, Sparkles, X } from 'lucide-react';
import './NewApplication.css';

const EMPLOYMENT = ['Full-time', 'Internship', 'Contract', 'Part-time', 'Freelance'];
const HEARD_FROM_OPTIONS = ['LinkedIn', 'Naukri', 'Indeed', 'Glassdoor', 'Wellfound', 'Referral', 'Other'];
const APPLIED_THROUGH_OPTIONS = ['LinkedIn Easy Apply', 'Company Career Page', 'Naukri Apply', 'Indeed Apply', 'Email', 'Referral', 'Other'];
const COMPANY_TYPES = ['Service Based', 'Product Based', 'Startup', 'Small Startup', 'Other'];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const NewApplication = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);

  const [rawJd, setRawJd] = useState('');
  const [parsing, setParsing] = useState(false);

  const [form, setForm] = useState({
    company: '', role: '', status: 'Applied', currentStage: 'Applied',
    platform: '', companyType: 'Product Based', appliedDate: today, resumeVersion: '',
    jobDescription: '', jobUrl: '', location: '', employmentType: 'Full-time',
    heardFrom: 'LinkedIn', heardFromCustom: '',
    appliedThrough: 'Company Career Page', appliedThroughCustom: '',
    qualifications: '', requirements: '', responsibilities: '', aboutCompany: '', skills: ''
  });

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleParseJD = async () => {
    if (!rawJd.trim()) return;
    setParsing(true);
    try {
      const res = await parseJobDescription(rawJd);
      if (res.success && res.data) {
        const d = res.data;
        setForm(prev => ({
          ...prev,
          company: d.company || prev.company,
          role: d.role || prev.role,
          location: d.location || prev.location,
          employmentType: d.employmentType || prev.employmentType,
          qualifications: d.qualifications || prev.qualifications,
          requirements: d.requirements || prev.requirements,
          responsibilities: d.responsibilities || prev.responsibilities,
          aboutCompany: d.aboutCompany || prev.aboutCompany,
          skills: d.skills ? d.skills.join(', ') : prev.skills,
          jobDescription: rawJd
        }));
      }
    } catch (err) {
      console.error("Failed to parse JD:", err);
    } finally {
      setParsing(false);
    }
  };

  const removeSkill = (skillToRemove) => {
    const currentSkills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
    const newSkills = currentSkills.filter(s => s !== skillToRemove);
    setForm({ ...form, skills: newSkills.join(', ') });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form };
      if (payload.heardFrom === 'Other') payload.heardFrom = payload.heardFromCustom;
      if (payload.appliedThrough === 'Other') payload.appliedThrough = payload.appliedThroughCustom;

      const res = await createApplication(payload);
      if (res.success) {
        if (resumeFile && res.data?.id) {
          await uploadResume(res.data.id, resumeFile);
        }
        navigate('/applications');
      }
    } catch (err) {
      setError(err.response?.data?.errors || err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const currentSkillsList = form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <motion.div
      className="new-app-page fade-up"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      <motion.div className="page-head" variants={fadeUp}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1>New Application</h1>
        <p className="sub">Track a new job opportunity. Defaults to 'Applied' today.</p>
      </motion.div>

      {error && (
        <motion.div className="error-banner bento" variants={fadeUp}>
          {typeof error === 'object' ? Object.entries(error).map(([k, v]) => <p key={k}><strong>{k}:</strong> {v}</p>) : <p>{error}</p>}
        </motion.div>
      )}

      {/* JD Parse Section */}
      <motion.div className="bento jd-parse-bento" variants={fadeUp}>
        <div className="jd-parse-header">
          <div>
            <h3 className="section-title" style={{ marginBottom: '0.2rem' }}>Smart JD Extraction</h3>
          </div>
          <button
            type="button"
            className={`btn btn-rose extract-btn ${parsing ? 'parsing' : ''}`}
            onClick={handleParseJD}
            disabled={parsing || !rawJd.trim()}
          >
            {parsing ? <><div className="spinner-small" /> Extracting...</> : <><Search size={16} /> Extract Details</>}
          </button>
        </div>
        <textarea
          className="input jd-textarea"
          placeholder="Paste full job description here..."
          value={rawJd}
          onChange={(e) => setRawJd(e.target.value)}
        />
      </motion.div>

      <form onSubmit={handleSubmit} className="app-form">
        <motion.div className="bento bento-form-section" variants={fadeUp}>
          <h3 className="section-title">Core Information</h3>
          <div className="row-2">
            <div className="field">
              <label>Company *</label>
              <input name="company" value={form.company} onChange={set} className="input" placeholder="e.g. Google" required />
            </div>
            <div className="field">
              <label>Role *</label>
              <input name="role" value={form.role} onChange={set} className="input" placeholder="e.g. SDE Intern" required />
            </div>
          </div>

          <div className="row-2 mt-4">
            <div className="field">
              <label>Location</label>
              <input name="location" value={form.location} onChange={set} className="input" placeholder="e.g. Bangalore, Remote" />
            </div>
            <div className="field">
              <label>Employment Type</label>
              <select name="employmentType" value={form.employmentType} onChange={set} className="input">
                {EMPLOYMENT.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
          <div className="field mt-4">
            <label>Company Type</label>
            <select name="companyType" value={form.companyType} onChange={set} className="input">
              {COMPANY_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </motion.div>

        <motion.div className="bento bento-form-section" variants={fadeUp}>
          <h3 className="section-title">Source Tracking</h3>
          <div className="row-2">
            <div className="field">
              <label>Heard From</label>
              <select name="heardFrom" value={form.heardFrom} onChange={set} className="input">
                {HEARD_FROM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <AnimatePresence>
                {form.heardFrom === 'Other' && (
                  <motion.input
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: '0.5rem' }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    name="heardFromCustom"
                    value={form.heardFromCustom}
                    onChange={set}
                    className="input"
                    placeholder="Specify where..."
                    required
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="field">
              <label>Applied Through</label>
              <select name="appliedThrough" value={form.appliedThrough} onChange={set} className="input">
                {APPLIED_THROUGH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <AnimatePresence>
                {form.appliedThrough === 'Other' && (
                  <motion.input
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: '0.5rem' }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    name="appliedThroughCustom"
                    value={form.appliedThroughCustom}
                    onChange={set}
                    className="input"
                    placeholder="Specify how..."
                    required
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <motion.div className="bento bento-form-section" variants={fadeUp}>
          <h3 className="section-title">Job Details (Extracted)</h3>

          {currentSkillsList.length > 0 && (
            <div className="field mb-4">
              <label>Skills</label>
              <div className="skills-container">
                <AnimatePresence>
                  {currentSkillsList.map(skill => (
                    <motion.span
                      key={skill}
                      className="skill-tag"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0, width: 0, margin: 0, padding: 0 }}
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}><X size={12} /></button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <input
                name="skills"
                value={form.skills}
                onChange={set}
                className="input mt-2"
                placeholder="Comma separated skills..."
              />
            </div>
          )}

          <div className="row-2">
            <div className="field">
              <label>Qualifications</label>
              <textarea name="qualifications" value={form.qualifications} onChange={set} className="input extracted-textarea" placeholder="Required qualifications..." rows="4" />
            </div>
            <div className="field">
              <label>Requirements</label>
              <textarea name="requirements" value={form.requirements} onChange={set} className="input extracted-textarea" placeholder="Job requirements..." rows="4" />
            </div>
          </div>

          <div className="row-2 mt-4">
            <div className="field">
              <label>Responsibilities</label>
              <textarea name="responsibilities" value={form.responsibilities} onChange={set} className="input extracted-textarea" placeholder="What you'll do..." rows="4" />
            </div>
            <div className="field">
              <label>About Company</label>
              <textarea name="aboutCompany" value={form.aboutCompany} onChange={set} className="input extracted-textarea" placeholder="Company overview..." rows="4" />
            </div>
          </div>
        </motion.div>

        <motion.div className="bento bento-form-section" variants={fadeUp}>
          <h3 className="section-title">Application Attachments</h3>
          <div className="row-2">
            <div className="field">
              <label>Job URL</label>
              <input name="jobUrl" value={form.jobUrl} onChange={set} className="input" placeholder="https://..." />
            </div>
            <div className="field">
              <label>Resume Version</label>
              <input name="resumeVersion" value={form.resumeVersion} onChange={set} className="input" placeholder="e.g. v5 – SDE Focus" />
            </div>
          </div>

          <div className="field mt-4">
            <label>Upload Resume (PDF)</label>
            <div className="file-input-wrapper">
              <div className="file-upload-btn">
                {resumeFile ? (
                  <><File size={16} className="mint-text" /> {resumeFile.name}</>
                ) : (
                  <><Upload size={16} /> Choose PDF File</>
                )}
              </div>
              <input type="file" accept="application/pdf" onChange={handleFileChange} />
            </div>
          </div>
        </motion.div>

        <motion.div className="form-actions" variants={fadeUp}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-rose" disabled={loading}>
            <Save size={16} /> {loading ? 'Saving...' : 'Save Application'}
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default NewApplication;
