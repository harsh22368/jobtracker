import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Edit2, MessageSquare } from 'lucide-react';
import './RoundTimeline.css';

const RoundTimeline = ({ rounds, onCompleteRound, onUpdateNotes }) => {
  const [activeFeedbackId, setActiveFeedbackId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  const handleCompleteClick = (roundId) => {
    setActiveFeedbackId(roundId);
    setFeedbackText('');
  };

  const submitCompletion = async (roundId) => {
    await onCompleteRound(roundId, feedbackText);
    setActiveFeedbackId(null);
  };

  if (!rounds || rounds.length === 0) return null;

  // Calculate progress
  const completedCount = rounds.filter(r => r.status === 'COMPLETED').length;
  const progressPercent = (completedCount / rounds.length) * 100;

  return (
    <div className="round-timeline-container">
      <div className="timeline-progress-header">
        <div className="progress-text">
          <span>Interview Progress</span>
          <span className="mint-text">{completedCount} / {rounds.length} Completed</span>
        </div>
        <div className="progress-bar-bg">
          <motion.div 
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="timeline">
        {rounds.map((round, index) => {
          const isCompleted = round.status === 'COMPLETED';
          const isLast = index === rounds.length - 1;
          const showFeedback = activeFeedbackId === round.id;

          return (
            <div key={round.id} className={`timeline-item ${isCompleted ? 'completed' : 'pending'}`}>
              
              {/* Connector Line */}
              {!isLast && (
                <div className="timeline-connector">
                  <motion.div 
                    className="timeline-connector-fill"
                    initial={{ height: 0 }}
                    animate={{ height: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </div>
              )}

              {/* Node Indicator */}
              <div className="timeline-node">
                {isCompleted ? <Check size={14} /> : <div className="dot" />}
              </div>

              {/* Content */}
              <div className="timeline-content">
                <div className="timeline-header">
                  <div>
                    <h4 className={`round-name ${isCompleted ? 'strikethrough' : ''}`}>
                      {round.roundName}
                    </h4>
                    {round.scheduledDate && (
                      <div className="round-date">
                        <Clock size={12} />
                        {new Date(round.scheduledDate).toLocaleString([], { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </div>
                    )}
                  </div>

                  {!isCompleted && !showFeedback && (
                    <button 
                      className="btn btn-sm btn-ghost mark-complete-btn"
                      onClick={() => handleCompleteClick(round.id)}
                    >
                      <Check size={14} /> Mark Complete
                    </button>
                  )}
                </div>

                {/* Feedback Prompt */}
                <AnimatePresence>
                  {showFeedback && (
                    <motion.div 
                      className="feedback-prompt bento"
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    >
                      <label className="text-muted text-sm flex items-center gap-2 mb-2">
                        <MessageSquare size={14}/> How did it go? (Optional)
                      </label>
                      <textarea 
                        className="input" 
                        rows="2"
                        placeholder="Add notes, questions asked, or general vibe..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        autoFocus
                      />
                      <div className="feedback-actions mt-2">
                        <button className="btn btn-sm btn-ghost" onClick={() => setActiveFeedbackId(null)}>Cancel</button>
                        <button className="btn btn-sm btn-mint" onClick={() => submitCompletion(round.id)}>
                          Done
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Display Notes if completed and notes exist */}
                {isCompleted && round.notes && (
                  <div className="round-notes">
                    <Edit2 size={12} className="text-muted" />
                    <p>{round.notes}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoundTimeline;
