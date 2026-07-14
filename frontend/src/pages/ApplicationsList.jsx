import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getApplications, deleteApplication } from '../api';
import { Search, Filter, Plus, Trash2, Eye } from 'lucide-react';
import './ApplicationsList.css';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const ApplicationsList = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const res = await getApplications({ size: 100 });
      if (res.success && res.data) {
        setApps(res.data.content || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await deleteApplication(id);
      if (res.success) {
        setApps(apps.filter(app => app.id !== id));
      }
    } catch (err) {
      console.error(err);
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

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div 
      className="list-page fade-up"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      <motion.div className="page-head page-head-actions" variants={fadeUp}>
        <div>
          <h1>Applications</h1>
          <p className="sub">Manage and track all your active job applications.</p>
        </div>
        <button className="btn btn-rose" onClick={() => navigate('/applications/new')}>
          <Plus size={18} /> New Application
        </button>
      </motion.div>

      <motion.div className="controls bento" variants={fadeUp}>
        <div className="search-box">
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search company or role..." 
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={18} className="text-muted" />
          <select 
            className="input" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
            <option value="Offer">Offer</option>
            <option value="Ghosted">Ghosted</option>
          </select>
        </div>
      </motion.div>

      <motion.div className="table-container bento" variants={fadeUp}>
        <table className="apps-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Type</th>
              <th>Role</th>
              <th>Status</th>
              <th>Source</th>
              <th>Applied Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer}>
            {loading ? (
              <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
            ) : filteredApps.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No applications found.</td></tr>
            ) : (
              <AnimatePresence>
                {filteredApps.map(app => (
                  <motion.tr 
                    key={app.id} 
                    onClick={() => navigate(`/applications/${app.id}`)}
                    className="clickable-row"
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  >
                    <td><strong>{app.company}</strong></td>
                    <td><span className="text-muted">{app.companyType || '—'}</span></td>
                    <td>{app.role}</td>
                    <td>
                      <span className={getStatusClass(app.status)}>
                        {app.status}
                      </span>
                    </td>
                    <td className="text-muted text-sm" style={{ lineHeight: '1.2' }}>
                      {app.heardFrom || '—'} <br/>
                      <span style={{opacity: 0.6}}>{app.appliedThrough}</span>
                    </td>
                    <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                    <td>
                      <div className="action-cell">
                        <button className="icon-btn danger" onClick={(e) => handleDelete(app.id, e)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </motion.tbody>
        </table>
      </motion.div>
    </motion.div>
  );
};

export default ApplicationsList;
