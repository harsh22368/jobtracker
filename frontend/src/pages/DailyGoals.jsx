import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import './DailyGoals.css';

const DEFAULT_GOALS = [
  { id: 1, text: 'Apply to 20 companies', target: 20, done: 0 },
  { id: 2, text: 'Solve 3 DSA problems', target: 3, done: 0 },
  { id: 3, text: 'Review 1 system design topic', target: 1, done: 0 },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const DailyGoals = () => {
  const todayKey = new Date().toISOString().split('T')[0];

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem(`goals-${todayKey}`);
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });

  const [newGoal, setNewGoal] = useState('');
  const [newTarget, setNewTarget] = useState(1);

  useEffect(() => {
    localStorage.setItem(`goals-${todayKey}`, JSON.stringify(goals));
  }, [goals, todayKey]);

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals([...goals, { id: Date.now(), text: newGoal, target: Number(newTarget), done: 0 }]);
    setNewGoal('');
    setNewTarget(1);
  };

  const increment = (id) => {
    setGoals(goals.map(g => g.id === id ? { ...g, done: Math.min(g.done + 1, g.target) } : g));
  };

  const decrement = (id) => {
    setGoals(goals.map(g => g.id === id ? { ...g, done: Math.max(g.done - 1, 0) } : g));
  };

  const remove = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + (g.done / g.target), 0) / goals.length * 100)
    : 0;

  return (
    <motion.div 
      className="goals-page fade-up"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      <motion.div className="page-head" style={{ textAlign: 'center' }} variants={fadeUp}>
        <h1>Daily Goals</h1>
        <p className="sub">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </motion.div>

      <motion.div className="bento progress-bento" variants={fadeUp}>
        <div className="progress-ring-wrap">
          <svg viewBox="0 0 120 120" className="progress-ring">
            <circle cx="60" cy="60" r="52" className="ring-bg" />
            <motion.circle 
              cx="60" cy="60" r="52" className="ring-fill" 
              initial={{ strokeDashoffset: 327 }}
              animate={{ strokeDashoffset: 327 - (327 * totalProgress) / 100 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <span className="progress-text">{totalProgress}%</span>
        </div>
        <div className="progress-info">
          <h3>Today's Progress</h3>
          <p className="text-muted">{goals.filter(g => g.done >= g.target).length} of {goals.length} goals completed</p>
        </div>
      </motion.div>

      <motion.div className="goals-list" variants={staggerContainer}>
        <AnimatePresence>
          {goals.map(goal => {
            const completed = goal.done >= goal.target;
            const percent = Math.round((goal.done / goal.target) * 100);
            return (
              <motion.div 
                key={goal.id} 
                className={`bento goal-item ${completed ? 'completed' : ''}`}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, height: 0, marginBottom: 0, padding: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="goal-check" onClick={() => increment(goal.id)}>
                  {completed ? <CheckCircle size={22} color="var(--mint)" /> : <Circle size={22} color="var(--text-muted)" />}
                </div>
                <div className="goal-content">
                  <span className="goal-text">{goal.text}</span>
                  <div className="goal-bar-bg">
                    <motion.div 
                      className="goal-bar" 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                <div className="goal-counter">
                  <button className="counter-btn" onClick={() => decrement(goal.id)}>−</button>
                  <span className="counter-value">{goal.done}/{goal.target}</span>
                  <button className="counter-btn" onClick={() => increment(goal.id)}>+</button>
                </div>
                <button className="icon-btn danger" onClick={() => remove(goal.id)}><Trash2 size={16} /></button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <motion.div className="bento add-goal-bar" variants={fadeUp}>
        <Plus size={18} className="text-muted" />
        <input
          className="input"
          placeholder="Add a new goal..."
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: '0.5rem' }}
        />
        <input
          type="number"
          className="input target-input"
          min="1"
          value={newTarget}
          onChange={(e) => setNewTarget(e.target.value)}
          style={{ border: 'none', background: 'rgba(255,255,255,0.05)', width: '70px', textAlign: 'center' }}
        />
        <button className="btn btn-rose" onClick={addGoal}>Add</button>
      </motion.div>
    </motion.div>
  );
};

export default DailyGoals;
