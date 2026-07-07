import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApplications, updateApplication } from '../api';
import { Trophy, ArrowRight } from 'lucide-react';
import './ShortlistedPipeline.css';

const STAGES = [
  'Shortlisted',
  'Coding Round',
  'Technical Round 1',
  'Technical Round 2',
  'Technical Round 3',
  'HR Round',
  'Scheduled Interview',
  'Offer'
];

const ShortlistedPipeline = () => {
  const [activeApps, setActiveApps] = useState([]);
  const [offerApps, setOfferApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      const res = await getApplications({ size: 100 });
      if (res.success && res.data && res.data.content) {
        const apps = res.data.content;
        
        // Filter out those that are still 'Applied' or 'Rejected' or 'Ghosted' or 'Wishlist'
        const pipelineApps = apps.filter(app => 
          STAGES.includes(app.status) || app.status === 'Interviewing'
        );

        const active = [];
        const offers = [];

        pipelineApps.forEach(app => {
          if (app.status === 'Offer') {
            offers.push(app);
          } else {
            active.push(app);
          }
        });

        setActiveApps(active);
        setOfferApps(offers);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageUpdate = async (app, newStageIndex) => {
    const newStage = STAGES[newStageIndex];
    if (app.status === newStage) return; // no change

    try {
      await updateApplication(app.id, { ...app, status: newStage });
      fetchPipeline();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="pipeline-loading">Loading Pipeline...</div>;

  return (
    <div className="pipeline-page">
      <div className="pipeline-header">
        <h1>Shortlisted Pipeline</h1>
        <p>Track your active interviews and secure those offers</p>
      </div>

      <div className="pipeline-section">
        <h2>Active Interviews</h2>
        <div className="pipeline-grid">
          {activeApps.length === 0 ? (
            <div className="empty-pipeline">No active pipeline right now.</div>
          ) : (
            activeApps.map(app => {
              // Standardize status for the slider (handle 'Interviewing' as 'Shortlisted' or just index 0)
              let currentIdx = STAGES.indexOf(app.status);
              if (currentIdx === -1) currentIdx = 0; // fallback

              return (
                <motion.div 
                  key={app.id}
                  className="pipeline-card"
                  layout
                >
                  <div className="card-content">
                    <h3 className="highlight-company">{app.company}</h3>
                    <p className="job-title highlight-role">{app.role}</p>
                    <div className="current-stage">
                      Current Stage: <span>{app.status === 'Interviewing' ? 'Shortlisted' : app.status}</span>
                    </div>
                  </div>

                  {/* Interactive Timeline Hover Area */}
                  <div className="timeline-container">
                    <div className="timeline-label">
                      Drag to update stage <ArrowRight size={14} />
                    </div>
                    
                    <input 
                      type="range" 
                      min="0" 
                      max={STAGES.length - 1} 
                      defaultValue={currentIdx}
                      className="stage-slider"
                      onChange={(e) => {
                         const tempStage = STAGES[e.target.value];
                         e.target.previousElementSibling.innerHTML = `Drag to update stage: <span class="temp-stage">${tempStage}</span>`;
                      }}
                      onMouseUp={(e) => handleStageUpdate(app, parseInt(e.target.value))}
                      onTouchEnd={(e) => handleStageUpdate(app, parseInt(e.target.value))}
                    />
                    
                    <div className="timeline-ticks">
                      {STAGES.map((s, i) => (
                        <div key={s} className={`tick ${i <= currentIdx ? 'active-tick' : ''}`}></div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Offers Folder */}
      <div className="pipeline-section offers-section">
        <h2 className="offers-title"><Trophy className="trophy-icon" /> Secured Offers</h2>
        <div className="pipeline-grid offers-grid">
          {offerApps.length === 0 ? (
            <div className="empty-offers">No offers yet. Keep grinding!</div>
          ) : (
            offerApps.map(app => (
              <motion.div 
                key={app.id}
                className="offer-card"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <div className="offer-glow"></div>
                <div className="card-content">
                  <h3 className="highlight-company">{app.company}</h3>
                  <p className="job-title highlight-role">{app.role}</p>
                  <div className="offer-status">
                    Status: <span className="text-gold">OFFER ACCEPTED!</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortlistedPipeline;
