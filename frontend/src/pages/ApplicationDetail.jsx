import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getApplicationById, updateApplication, deleteApplication, getResumeDownloadUrl } from '../api';
import axios from 'axios';
import { ArrowLeft, Trash2, ExternalLink, Upload, Download, Edit3, Save, X } from 'lucide-react';
import './ApplicationDetail.css';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    getApplicationById(id)
      .then((res) => {
        if (res.success) {
          setApp(res.data);
          setForm(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleParseJD = async () => {
    if (!rawJd.trim()) return;
    setParsing(true);
    try {
      const res = await parseJobDescription(rawJd);
      if (res.success && res.data) {
        setApp(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setParsing(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Applied': return 'tag tag-applied';
      case 'Shortlisted': return 'tag tag-offer';
      case 'Rejected': return 'tag tag-rejected';
      case 'Offer': return 'tag tag-offer';
      default: return 'tag tag-ghosted';
    }
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };
      const res = await updateApplication(id, payload);
      if (res.success) {
        setApp(res.data);
        setEditing(false);
      }
    } catch (err) {
      alert('Failed to save: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    await deleteApplication(id);
    navigate('/applications');
  };

  const handleUploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`http://localhost:8080/applications/${id}/resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setApp(res.data.data);
        alert('Resume uploaded!');
      }
    } catch (err) {
      alert('Upload failed');
    }
  };

  const handleDownloadResume = () => {
    window.open(getResumeDownloadUrl(id), '_blank');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;
  if (!app) return <div className="loading-center">Application not found.</div>;

  const skillsList = (app.skills || '').split(',').map(s => s.trim()).filter(Boolean);

  return (
    <motion.div 
      className="fade-up detail-page"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      <motion.div className="detail-top-bar" variants={fadeUp}>
        <button className="btn btn-ghost" onClick={() => navigate('/applications')}><ArrowLeft size={16} /> Back</button>
        <div className="detail-actions">
          {editing ? (
            <>
              <button className="btn btn-ghost" onClick={() => { setForm(app); setEditing(false); }}><X size={16} /> Cancel</button>
              <button className="btn btn-mint" onClick={handleSave}><Save size={16} /> Save</button>
            </>
          ) : (
            <button className="btn btn-ghost" onClick={() => setEditing(true)}><Edit3 size={16} /> Edit</button>
          )}
          <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={16} /> Delete</button>
        </div>
      </motion.div>

      <motion.div className="bento detail-header" variants={fadeUp}>
        <div className="header-main">
          <h1 className="detail-company">{app.company}</h1>
          <p className="detail-role">{app.role}</p>
        </div>
        <div className="header-meta">
          <span className={getStatusClass(app.status)} style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem' }}>{app.status}</span>
          <span className="meta-badge">{app.currentStage || '—'}</span>
          {app.priority && <span className="meta-badge">⭐ Priority {app.priority}/5</span>}
        </div>
      </motion.div>

      <motion.div className="detail-grid" variants={staggerContainer}>
        <motion.div className="bento detail-section" variants={fadeUp}>
          <h3 className="section-title">Application Details</h3>
          <div className="info-list">
            <InfoRow label="Source" value={editing ? <input name="heardFrom" value={form.heardFrom || ''} onChange={set} className="input" placeholder="Heard from..." /> : app.heardFrom} />
            <InfoRow label="Method" value={editing ? <input name="appliedThrough" value={form.appliedThrough || ''} onChange={set} className="input" placeholder="Applied through..." /> : app.appliedThrough} />
            <InfoRow label="Applied" value={formatDate(app.appliedDate)} />
            <InfoRow label="Location" value={editing ? <input name="location" value={form.location || ''} onChange={set} className="input" /> : app.location} />
            <InfoRow label="Type" value={app.employmentType} />
            <InfoRow label="Resume" value={app.resumeVersion} />
          </div>
          {app.jobUrl && (
            <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-4" style={{ width: '100%', justifyContent: 'center' }}>
              <ExternalLink size={14} /> Open Job Posting
            </a>
          )}
        </motion.div>

        <motion.div className="bento detail-section" variants={fadeUp}>
          <h3 className="section-title">Resume</h3>
          <div className="resume-actions">
            <input type="file" ref={fileRef} accept=".pdf" onChange={handleUploadResume} style={{ display: 'none' }} />
            <button className="btn btn-ghost" onClick={() => fileRef.current.click()}>
              <Upload size={16} /> Upload PDF
            </button>
            {app.hasResume && (
              <button className="btn btn-rose" onClick={handleDownloadResume}>
                <Download size={16} /> Download {app.resumeFileName || 'Resume'}
              </button>
            )}
          </div>
          {!app.hasResume && <p className="empty-state-text mt-4">No resume uploaded yet.</p>}
        </motion.div>
      </motion.div>

      {/* JD Extracted Details */}
      {(skillsList.length > 0 || app.qualifications || app.requirements || app.responsibilities || app.aboutCompany || editing) && (
        <motion.div className="detail-grid mt-4" variants={staggerContainer}>
          
          {(skillsList.length > 0 || editing) && (
            <motion.div className="bento detail-section full-width" variants={fadeUp}>
              <h3 className="section-title">Skills</h3>
              {editing ? (
                <input name="skills" value={form.skills || ''} onChange={set} className="input" placeholder="Comma separated skills..." />
              ) : (
                <div className="skills-container mt-2">
                  {skillsList.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          <TextSection title="Requirements" value={editing ? form.requirements : app.requirements} name="requirements" editing={editing} onChange={set} variants={fadeUp} />
          <TextSection title="Qualifications" value={editing ? form.qualifications : app.qualifications} name="qualifications" editing={editing} onChange={set} variants={fadeUp} />
          <TextSection title="Responsibilities" value={editing ? form.responsibilities : app.responsibilities} name="responsibilities" editing={editing} onChange={set} variants={fadeUp} />
          <TextSection title="About Company" value={editing ? form.aboutCompany : app.aboutCompany} name="aboutCompany" editing={editing} onChange={set} variants={fadeUp} />
        </motion.div>
      )}

      {/* Interview / Progress Details */}
      <motion.div className="detail-grid mt-4" variants={staggerContainer}>
        <TextSection title="OA Details" value={editing ? form.oaDetails : app.oaDetails} name="oaDetails" editing={editing} onChange={set} variants={fadeUp} />
        <TextSection title="Interview Questions" value={editing ? form.interviewQuestions : app.interviewQuestions} name="interviewQuestions" editing={editing} onChange={set} variants={fadeUp} />
        <TextSection title="Mistakes" value={editing ? form.mistakes : app.mistakes} name="mistakes" editing={editing} onChange={set} variants={fadeUp} />
        <TextSection title="Improvements" value={editing ? form.improvements : app.improvements} name="improvements" editing={editing} onChange={set} variants={fadeUp} />
      </motion.div>

      {app.jobDescription && (
        <motion.div className="bento detail-section full-width mt-4" variants={fadeUp}>
          <h3 className="section-title">Raw Job Description</h3>
          <pre className="jd-content">{app.jobDescription}</pre>
        </motion.div>
      )}

    </motion.div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value">{value || '—'}</span>
  </div>
);

const TextSection = ({ title, value, name, editing, onChange, variants }) => {
  if (!editing && !value) return null;
  
  return (
    <motion.div className="bento detail-section" variants={variants}>
      <h3 className="section-title">{title}</h3>
      {editing ? (
        <textarea name={name} value={value || ''} onChange={onChange} className="input mt-2" rows="4" />
      ) : (
        <p className="section-text mt-2">{value}</p>
      )}
    </motion.div>
  );
};

export default ApplicationDetail;
