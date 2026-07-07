import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApplications, deleteApplication } from '../api';
import { Search, Plus, Trash2, Filter, Building2 } from 'lucide-react';
import './ApplicationsList.css';

const STATUSES = ['All', 'Wishlist', 'Applied', 'Interviewing', 'Shortlisted', 'Offer', 'Rejected', 'Ghosted'];
const COMPANY_TYPES = ['All Types', 'Service Based', 'Product Based', 'Startup', 'Small Startup'];

const ApplicationsList = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const navigate = useNavigate();

  const fetchApps = () => {
    setLoading(true);
    let params = { size: 100, sort: 'appliedDate,desc' };
    if (search) params.company = search;
    if (statusFilter !== 'All') params.status = statusFilter;

    getApplications(params)
      .then(res => {
        if (res.success) {
          let data = res.data.content;
          if (typeFilter !== 'All Types') {
            data = data.filter(a => a.companyType === typeFilter);
          }
          setApps(data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => fetchApps(), 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, typeFilter]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this application?')) return;
    await deleteApplication(id);
    fetchApps();
  };

  return (
    <div className="fade-up">
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Applications</h1>
          <p className="sub">Manage and track your job applications.</p>
        </div>
        <button className="btn btn-rose" onClick={() => navigate('/applications/new')}>
          <Plus size={18} /> New Application
        </button>
      </div>

      <div className="bento list-toolbar">
        <div className="search-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="input search-input"
            placeholder="Search company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-wrap">
          <Filter size={18} className="filter-icon" />
          <select className="input filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filter-wrap">
          <Building2 size={18} className="filter-icon" />
          <select className="input filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="bento table-container">
        {loading ? (
          <div className="loading-center"><div className="spinner"></div></div>
        ) : apps.length === 0 ? (
          <div className="empty-state">No applications found.</div>
        ) : (
          <table className="app-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Type</th>
                <th>Role</th>
                <th>Status</th>
                <th>Platform</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {apps.map(app => (
                <tr key={app.id} onClick={() => navigate(`/applications/${app.id}`)}>
                  <td><strong>{app.company}</strong></td>
                  <td>{app.companyType || '—'}</td>
                  <td>{app.role}</td>
                  <td><span className={`tag tag-${app.status?.toLowerCase()}`}>{app.status}</span></td>
                  <td>{app.platform || '—'}</td>
                  <td>{app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : '—'}</td>
                  <td className="actions-cell">
                    <button className="icon-btn danger" onClick={(e) => handleDelete(e, app.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ApplicationsList;
