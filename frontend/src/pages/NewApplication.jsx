import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createApplication, uploadResume } from '../api';
import { Save, ArrowLeft, Upload, File } from 'lucide-react';
import './NewApplication.css';

const EMPLOYMENT = ['Full-time', 'Internship', 'Contract', 'Part-time', 'Freelance'];
const COMPANY_TYPES = ['Service Based', 'Product Based', 'Startup', 'Small Startup'];

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
  
  const [form, setForm] = useState({
    company: '', role: '', status: 'Applied', currentStage: 'Applied',
    platform: '', companyType: 'Product Based', appliedDate: today, resumeVersion: '',
    jobDescription: '', jobUrl: '', location: '', employmentType: 'Full-time'
  });

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createApplication(form);
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

  return (
    <motion.div 
      className="new-app-page"
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
          
          <div className="row-3 mt-4">
            <div className="field">
              <label>Platform</label>
              <input name="platform" value={form.platform} onChange={set} className="input" placeholder="e.g. LinkedIn, Career Page..." />
            </div>
            <div className="field">
              <label>Company Type</label>
              <select name="companyType" value={form.companyType} onChange={set} className="input">
                {COMPANY_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Employment Type</label>
              <select name="employmentType" value={form.employmentType} onChange={set} className="input">
                {EMPLOYMENT.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div className="bento bento-form-section" variants={fadeUp}>
          <h3 className="section-title">Job & Resume Details</h3>
          <div className="row-2">
            <div className="field">
              <label>Job URL</label>
              <input name="jobUrl" value={form.jobUrl} onChange={set} className="input" placeholder="https://..." />
            </div>
            <div className="field">
              <label>Location</label>
              <input name="location" value={form.location} onChange={set} className="input" placeholder="e.g. Bangalore, Remote" />
            </div>
          </div>
          
          <div className="row-2 mt-4">
            <div className="field">
              <label>Resume Version</label>
              <input name="resumeVersion" value={form.resumeVersion} onChange={set} className="input" placeholder="e.g. v5 – SDE Focus" />
            </div>
            <div className="field">
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
          </div>
          
          <div className="field mt-4">
            <label>Job Description</label>
            <textarea name="jobDescription" value={form.jobDescription} onChange={set} className="input" placeholder="Paste the JD here..." />
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
