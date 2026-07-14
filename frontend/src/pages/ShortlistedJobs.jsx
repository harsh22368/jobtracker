import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApplications, getRounds, addRounds, updateRound, updateApplication } from '../api';
import RoundSetupModal from '../components/RoundSetupModal';
import RoundTimeline from '../components/RoundTimeline';
import { Briefcase, Building2, Calendar, Trophy, ChevronRight, MoreVertical, Trash2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import './ShortlistedJobs.css';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const ShortlistedJobs = () => {
  const [apps, setApps] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & detail view state
  const [setupModalApp, setSetupModalApp] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [roundsCache, setRoundsCache] = useState({}); // { appId: [rounds] }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resShortlist = await getApplications({ status: 'Shortlisted' });
      const resOffer = await getApplications({ status: 'Offer' });
      if (resShortlist.success && resShortlist.data) setApps(resShortlist.data.content || []);
      if (resOffer.success && resOffer.data) setOffers(resOffer.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRounds = async (appId) => {
    try {
      const res = await getRounds(appId);
      if (res.success) {
        setRoundsCache(prev => ({ ...prev, [appId]: res.data }));
        return res.data;
      }
    } catch (err) {
      console.error("Failed to load rounds", err);
    }
    return [];
  };

  const handleCardClick = async (app) => {
    const rds = roundsCache[app.id] || await loadRounds(app.id);
    if (rds.length === 0) {
      setSetupModalApp(app);
    } else {
      setSelectedApp(app);
    }
  };

  const handleSaveRounds = async (roundsToSave) => {
    if (!setupModalApp) return;
    try {
      const res = await addRounds(setupModalApp.id, roundsToSave);
      if (res.success) {
        setRoundsCache(prev => ({ ...prev, [setupModalApp.id]: res.data }));
        setSetupModalApp(null);
        setSelectedApp(setupModalApp);
      }
    } catch (err) {
      console.error("Failed to save rounds", err);
      alert("Failed to save rounds");
    }
  };

  const handleCompleteRound = async (roundId, notes) => {
    if (!selectedApp) return;
    try {
      const res = await updateRound(selectedApp.id, roundId, { status: 'COMPLETED', notes });
      if (res.success) {
        // Update cache locally
        const updatedRounds = roundsCache[selectedApp.id].map(r => r.id === roundId ? res.data : r);
        setRoundsCache(prev => ({ ...prev, [selectedApp.id]: updatedRounds }));

        // Check if all completed
        const allCompleted = updatedRounds.every(r => r.status === 'COMPLETED');
        if (allCompleted) {
          triggerCelebration(selectedApp);
        }
      }
    } catch (err) {
      console.error("Failed to complete round", err);
    }
  };

  const triggerCelebration = (app) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#34d399', '#10b981', '#fb7185', '#f43f5e']
    });

    // Close detail view, move app to offers
    setTimeout(() => {
      setSelectedApp(null);
      setApps(prev => prev.filter(a => a.id !== app.id));
      setOffers(prev => [...prev, { ...app, status: 'Offer' }]);
    }, 2000);
  };

  const handleRemoveShortlist = async (e, app) => {
    e.stopPropagation();
    if (!window.confirm(`Move ${app.company} back to Applied?`)) return;
    try {
      await updateApplication(app.id, { ...app, status: 'Applied', currentStage: 'Applied' });
      setApps(prev => prev.filter(a => a.id !== app.id));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '100px auto' }} />;

  return (
    <div className="shortlisted-page">
      <motion.div className="page-head fade-up" initial="hidden" animate="show" variants={staggerContainer}>
        <motion.h1 variants={fadeUp}>Shortlisted Jobs</motion.h1>
        <motion.p className="sub" variants={fadeUp}>Track your active interview pipelines.</motion.p>
      </motion.div>

      {/* Main Grid */}
      <motion.div className="shortlist-grid" variants={staggerContainer} initial="hidden" animate="show">
        <AnimatePresence>
          {apps.map(app => {
            const rds = roundsCache[app.id];
            const completedCount = rds ? rds.filter(r => r.status === 'COMPLETED').length : 0;
            const totalCount = rds ? rds.length : 0;
            const hasRounds = totalCount > 0;

            return (
              <motion.div
                key={app.id}
                layoutId={`app-card-${app.id}`}
                className="bento shortlist-card hover-glow"
                variants={fadeUp}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => handleCardClick(app)}
              >
                <div className="card-header">
                  <div className="company-info">
                    <div className="company-logo-placeholder">
                      {app.company.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="company-name">{app.company}</h3>
                      <p className="role-name">{app.role}</p>
                    </div>
                  </div>

                  <div className="card-menu">
                    <button className="icon-btn remove-btn" onClick={(e) => handleRemoveShortlist(e, app)} title="Remove from Shortlist">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="card-meta">
                  <div className={`rounds-badge ${hasRounds ? 'has-rounds' : 'no-rounds'}`}>
                    {hasRounds
                      ? `${completedCount} / ${totalCount} Rounds Completed`
                      : `Set up interview rounds`}
                    <ChevronRight size={14} className="badge-icon" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {apps.length === 0 && (
          <motion.div className="bento empty-state" variants={fadeUp}>
            <Briefcase size={40} className="text-muted" style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p className="text-muted">No shortlisted jobs right now.<br />Keep applying!</p>
          </motion.div>
        )}
      </motion.div>

      {/* Offers Section */}
      {offers.length > 0 && (
        <motion.div
          className="offers-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="offers-header">
            <h2>🏆 Secured Offers</h2>
            <div className="offers-line"></div>
          </div>

          <div className="offers-grid">
            <AnimatePresence>
              {offers.map(offer => (
                <motion.div
                  key={offer.id}
                  layoutId={`app-card-${offer.id}`}
                  className="bento offer-card"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="offer-glow-bg"></div>
                  <div className="offer-content">
                    <Trophy size={24} className="offer-icon" />
                    <div>
                      <h3 className="company-name">{offer.company}</h3>
                      <p className="role-name">{offer.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {setupModalApp && (
          <RoundSetupModal
            company={setupModalApp.company}
            role={setupModalApp.role}
            onSave={handleSaveRounds}
            onCancel={() => setSetupModalApp(null)}
          />
        )}
      </AnimatePresence>

      {/* Side Panel for Round Timeline */}
      <AnimatePresence>
        {selectedApp && (
          <div className="timeline-overlay" onClick={() => setSelectedApp(null)}>
            <motion.div
              className="bento timeline-panel"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="panel-header">
                <div>
                  <h2 className="company-name">{selectedApp.company}</h2>
                  <p className="role-name text-muted">{selectedApp.role}</p>
                </div>
                <button className="icon-btn" onClick={() => setSelectedApp(null)}><X size={20} /></button>
              </div>

              <div className="panel-content">
                <RoundTimeline
                  rounds={roundsCache[selectedApp.id] || []}
                  onCompleteRound={handleCompleteRound}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ShortlistedJobs;
