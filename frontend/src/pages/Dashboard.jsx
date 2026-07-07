import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getApplications } from '../api';
import { Briefcase, Target, Flame, CheckCircle, Activity, Star } from 'lucide-react';
import SmartUpdateModal from '../components/SmartUpdateModal';
import './Dashboard.css';

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

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0, applied: 0, interviewing: 0, offers: 0, rejected: 0, wishlist: 0, thisWeek: 0,
    platforms: {}, resumeVersions: {}
  });
  const [recent, setRecent] = useState([]);
  const [showSmartUpdate, setShowSmartUpdate] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    getApplications({ size: 100, sort: 'appliedDate,desc' })
      .then(res => {
        if (res.success) {
          const apps = res.data.content;
          const today = new Date();
          let thisWeekCount = 0;
          const plats = {};
          const resumes = {};

          apps.forEach(app => {
            if (app.appliedDate) {
              const appliedDate = new Date(app.appliedDate);
              const diffTime = Math.abs(today - appliedDate);
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays <= 7) thisWeekCount++;
            }
            if (app.platform) plats[app.platform] = (plats[app.platform] || 0) + 1;
            if (app.resumeVersion) resumes[app.resumeVersion] = (resumes[app.resumeVersion] || 0) + 1;
          });

          setStats({
            total: apps.length,
            applied: apps.filter(a => a.status === 'Applied').length,
            interviewing: apps.filter(a => a.status === 'Interviewing').length,
            offers: apps.filter(a => a.status === 'Offer').length,
            rejected: apps.filter(a => a.status === 'Rejected').length,
            wishlist: apps.filter(a => a.status === 'Wishlist').length,
            thisWeek: thisWeekCount,
            platforms: plats,
            resumeVersions: resumes
          });

          const sortedByUpdate = [...apps].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
          setRecent(sortedByUpdate.slice(0, 5));
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSmartUpdateComplete = () => {
    setShowSmartUpdate(false);
    fetchDashboardData();
  };

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>;

  return (
    <motion.div 
      className="fade-up dashboard-container"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      {showSmartUpdate && <SmartUpdateModal onComplete={handleSmartUpdateComplete} />}

      <motion.div className="page-head" variants={fadeUp}>
        <h1>Welcome back, <span className="accent">Harsh</span> 👋</h1>
        <p className="sub">Here is your career progression overview.</p>
      </motion.div>

      <motion.div className="bento-grid-dashboard" variants={staggerContainer}>
        
        {/* Stat Cards */}
        <motion.div className="bento stat-card bento-col-1" variants={fadeUp}>
          <div className="stat-icon rose-icon"><Briefcase size={22} /></div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Apps</p>
          </div>
        </motion.div>
        
        <motion.div className="bento stat-card bento-col-1" variants={fadeUp}>
          <div className="stat-icon mint-icon"><Flame size={22} /></div>
          <div className="stat-content">
            <h3>{stats.thisWeek}</h3>
            <p>This Week</p>
          </div>
        </motion.div>

        <motion.div className="bento stat-card bento-col-1" variants={fadeUp}>
          <div className="stat-icon amber-icon"><CheckCircle size={22} /></div>
          <div className="stat-content">
            <h3>{stats.offers}</h3>
            <p>Offers</p>
          </div>
        </motion.div>

        <motion.div className="bento stat-card bento-col-1" variants={fadeUp}>
          <div className="stat-icon sky-icon"><Target size={22} /></div>
          <div className="stat-content">
            <h3>{stats.interviewing}</h3>
            <p>Interviews</p>
          </div>
        </motion.div>

        {/* Platform Breakdown */}
        <motion.div className="bento platforms-card bento-col-2 bento-row-2" variants={fadeUp}>
          <div className="bento-header">
            <h3>Platform Analytics</h3>
            <Star size={18} className="text-muted" />
          </div>
          <div className="platform-list">
            {Object.entries(stats.platforms).sort((a,b) => b[1] - a[1]).map(([plat, count]) => (
              <div key={plat} className="platform-item">
                <div className="plat-info">
                  <span className="plat-name">{plat}</span>
                  <span className="plat-count">{count}</span>
                </div>
                <div className="plat-bar-bg">
                  <motion.div 
                    className="plat-bar" 
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / stats.total) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </div>
            ))}
            {Object.keys(stats.platforms).length === 0 && <p className="text-muted">No platform data yet.</p>}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div className="bento recent-activity bento-col-4" variants={fadeUp}>
          <div className="bento-header">
            <h3>Recent Updates</h3>
            <Activity size={18} className="text-muted" />
          </div>
          <div className="activity-list">
            {recent.map(app => (
              <div key={app.id} className="activity-item">
                <div className="act-dot"></div>
                <div className="act-details">
                  <p className="act-title"><strong>{app.company}</strong> — {app.role}</p>
                  <p className="act-time">{new Date(app.lastUpdated).toLocaleDateString()}</p>
                </div>
                <span className={`tag tag-${app.status?.toLowerCase()}`}>{app.status}</span>
              </div>
            ))}
            {recent.length === 0 && <p className="text-muted">No recent activity.</p>}
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
