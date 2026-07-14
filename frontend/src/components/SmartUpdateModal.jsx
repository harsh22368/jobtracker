import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, AnimatePresence } from 'framer-motion';
import { getApplications, updateApplication } from '../api';
import './SmartUpdateModal.css';

const SmartUpdateModal = ({ onComplete }) => {
  const [pendingApps, setPendingApps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [bubblePos, setBubblePos] = useState({ top: '80%', left: '80%' });
  
  // Undo state
  const [undoState, setUndoState] = useState(null); // { app, oldStatus, newStatus }
  const [showUndo, setShowUndo] = useState(false);
  const [undoTimer, setUndoTimer] = useState(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  useEffect(() => {
    return () => {
      if (undoTimer) clearTimeout(undoTimer);
    };
  }, [undoTimer]);

  useEffect(() => {
    // Generate random position for the hover bubble, 
    // bounded between 20% and 80% of screen to avoid edges
    const rTop = Math.floor(Math.random() * 60) + 20;
    const rLeft = Math.floor(Math.random() * 60) + 20;
    setBubblePos({ top: `${rTop}%`, left: `${rLeft}%` });
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await getApplications({ size: 100 });
      if (res.success && res.data && res.data.content) {
        // Filter only 'Applied' for random smart updates
        const apps = res.data.content.filter(a => a.status === 'Applied');
        // Shuffle array to simulate random checks
        const shuffled = apps.sort(() => 0.5 - Math.random());
        setPendingApps(shuffled.slice(0, 5));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event, info) => {
    const threshold = 100;
    const { offset } = info;
    let newStatus = null;

    if (offset.y < -threshold) newStatus = 'Shortlisted';
    else if (offset.y > threshold) newStatus = 'Applied'; // No change
    else if (offset.x < -threshold) newStatus = 'Rejected';
    else if (offset.x > threshold) newStatus = 'Ghosted';

    if (newStatus) {
      controls.set({ x: 0, y: 0 });
      
      const app = pendingApps[currentIndex];
      
      if (newStatus !== 'Applied') {
        // Save old state for undo
        setUndoState({ app, oldStatus: app.status, newStatus });
        await updateApplication(app.id, { ...app, status: newStatus });
        
        // Show toast and auto-hide
        setShowUndo(true);
        if (undoTimer) clearTimeout(undoTimer);
        setUndoTimer(setTimeout(() => setShowUndo(false), 3000));
      }
      
      if (currentIndex + 1 < pendingApps.length) {
        setCurrentIndex(currentIndex + 1);
        setExpanded(false); // Collapse to bubble for the next one
        const rTop = Math.floor(Math.random() * 60) + 20;
        const rLeft = Math.floor(Math.random() * 60) + 20;
        setBubblePos({ top: `${rTop}%`, left: `${rLeft}%` });
      } else {
        onComplete && onComplete(); // Finished
      }
    } else {
      controls.start({ x: 0, y: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    }
  };

  const handleUndo = async () => {
    if (undoState) {
      const { app, oldStatus } = undoState;
      await updateApplication(app.id, { ...app, status: oldStatus });
      setShowUndo(false);
      if (undoTimer) clearTimeout(undoTimer);
      // We don't change currentIndex back, the undo just reverts the DB state silently
    }
  };

  const handleSkip = () => {
    if (currentIndex + 1 < pendingApps.length) {
      setCurrentIndex(currentIndex + 1);
      setExpanded(false);
      const rTop = Math.floor(Math.random() * 60) + 20;
      const rLeft = Math.floor(Math.random() * 60) + 20;
      setBubblePos({ top: `${rTop}%`, left: `${rLeft}%` });
    } else {
      onComplete && onComplete();
    }
  };

  if (loading || pendingApps.length === 0 || currentIndex >= pendingApps.length) {
    return null;
  }

  const app = pendingApps[currentIndex];

  return (
    <AnimatePresence>
      {!expanded && (
        <motion.div
          className="random-hover-bubble"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          style={{ top: bubblePos.top, left: bubblePos.left }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setExpanded(true)}
        >
          <span className="bubble-icon">💬</span> Update {app.company}?
        </motion.div>
      )}

      {expanded && (
        <motion.div 
          className="smart-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="smart-modal-content">
            <h2>Quick Status Update</h2>
            <p>You applied to <strong className="highlight-company">{app.company}</strong> for <strong className="highlight-role">{app.role}</strong> recently.</p>
            <p className="subtitle">Drag the bubble to update its current status:</p>

            <div className="drag-arena">
              <div className="drop-zone top">Shortlisted</div>
              <div className="drop-zone bottom">Keep Applied</div>
              <div className="drop-zone left">Rejected</div>
              <div className="drop-zone right">Ghosted</div>

              <motion.div
                className="drag-thumb"
                drag
                dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x, y }}
                whileHover={{ scale: 1.1 }}
                whileDrag={{ scale: 1.2, boxShadow: '0 0 20px rgba(255, 62, 165, 0.5)' }}
              >
                Drag Me
              </motion.div>
            </div>

            <button className="skip-btn" onClick={handleSkip}>Skip</button>
          </div>
        </motion.div>
      )}

      {/* Undo Toast */}
      {showUndo && undoState && (
        <motion.div 
          className="undo-toast"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
        >
          <div className="toast-content">
            <span className="toast-icon">✅</span>
            <span>
              <strong>{undoState.app.company}</strong> moved to {undoState.newStatus}
            </span>
            <button className="undo-btn" onClick={handleUndo}>Undo</button>
          </div>
          <div className="toast-progress-bar"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartUpdateModal;
