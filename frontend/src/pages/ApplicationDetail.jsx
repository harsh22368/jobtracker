import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationById, updateApplication, deleteApplication, getResumeDownloadUrl } from '../api';
import axios from 'axios';
import { ArrowLeft, Trash2, ExternalLink, Upload, Download, Edit3, Save, X } from 'lucide-react';
import './ApplicationDetail.css';

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

  const handleSave = async () => {
    try {
      const payload = {
        company: form.company, role: form.role, status: form.status,
        currentStage: form.currentStage, platform: form.platform,
        appliedDate: form.appliedDate, resumeVersion: form.resumeVersion,
        jobDescription: form.jobDescription, jobUrl: form.jobUrl,
        location: form.location, employmentType: form.employmentType,
        oaDetails: form.oaDetails,
        interviewQuestions: form.interviewQuestions,
        mistakes: form.mistakes, improvements: form.improvements,
        priority: form.priority,
      };
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

  return (
    <div className="fade-up detail-page">
      <div className="detail-top-bar">
        <button className="btn btn-ghost" onClick={() => navigate('/applications')}><ArrowLeft size={16} /> Back</button>
        <div className="detail-actions">
          {editing ? (
            <>
              <button className="btn btn-ghost" onClick={() => { setForm(app); setEditing(false); }}><X size={16} /> Cancel</button>
              <button className="btn btn-rose" onClick={handleSave}><Save size={16} /> Save</button>
            </>
          ) : (
            <button className="btn btn-ghost" onClick={() => setEditing(true)}><Edit3 size={16} /> Edit</button>
          )}
          <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={16} /> Delete</button>
        </div>
      </div>

      <div className="bento detail-header">
        <div className="header-main">
          <h1 className="detail-company">{app.company}</h1>
          <p className="detail-role">{app.role}</p>
        </div>
        <div className="header-meta">
          <span className={`tag tag-${app.status?.toLowerCase()}`}>{app.status}</span>
          <span className="meta-badge">{app.currentStage || '—'}</span>
          {app.priority && <span className="meta-badge">⭐ Priority {app.priority}/5</span>}
        </div>
      </div>

      <div className="detail-grid">
        <div className="bento detail-section">
          <h3 className="section-title">Application Details</h3>
          <div className="info-list">
            <InfoRow label="Platform" value={editing ? <input name="platform" value={form.platform || ''} onChange={set} className="input" /> : app.platform} />
            <InfoRow label="Applied" value={formatDate(app.appliedDate)} />
            <InfoRow label="Location" value={editing ? <input name="location" value={form.location || ''} onChange={set} className="input" /> : app.location} />
            <InfoRow label="Type" value={app.employmentType} />
            <InfoRow label="Resume" value={app.resumeVersion} />
            <InfoRow label="Created" value={formatDateTime(app.createdAt)} />
            <InfoRow label="Updated" value={formatDateTime(app.lastUpdated)} />
          </div>
          {app.jobUrl && (
            <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}>
              <ExternalLink size={14} /> Open Job Posting
            </a>
          )}
        </div>

        <div className="bento detail-section">
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
        </div>
      </div>

      {app.jobDescription && (
        <div className="bento detail-section full-width">
          <h3 className="section-title">Job Description</h3>
          <pre className="jd-content">{app.jobDescription}</pre>
        </div>
      )}

      <div className="detail-grid">
        <TextSection title="OA Details" value={editing ? form.oaDetails : app.oaDetails} name="oaDetails" editing={editing} onChange={set} />
        <TextSection title="Interview Questions" value={editing ? form.interviewQuestions : app.interviewQuestions} name="interviewQuestions" editing={editing} onChange={set} />
        <TextSection title="Mistakes" value={editing ? form.mistakes : app.mistakes} name="mistakes" editing={editing} onChange={set} />
        <TextSection title="Improvements" value={editing ? form.improvements : app.improvements} name="improvements" editing={editing} onChange={set} />
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="info-row">
    <span className="info-label">{label}</span>
    <span className="info-value">{value || '—'}</span>
  </div>
);

const TextSection = ({ title, value, name, editing, onChange }) => (
  <div className="bento detail-section">
    <h3 className="section-title">{title}</h3>
    {editing ? (
      <textarea name={name} value={value || ''} onChange={onChange} className="input" rows="4" />
    ) : (
      <p className="section-text">{value || <span className="empty-state-text">Nothing recorded yet.</span>}</p>
    )}
  </div>
);

export default ApplicationDetail;
