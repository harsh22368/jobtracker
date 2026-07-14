import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Save, Plus, X, GripVertical, Calendar as CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './RoundSetupModal.css';

const RoundSetupModal = ({ company, role, onSave, onCancel }) => {
  const [rounds, setRounds] = useState([
    { id: '1', name: '', scheduledDate: '', notes: '' }
  ]);
  const [saving, setSaving] = useState(false);

  const handleAddRound = () => {
    setRounds([...rounds, { id: Date.now().toString(), name: '', scheduledDate: '', notes: '' }]);
  };

  const handleRemoveRound = (id) => {
    if (rounds.length === 1) return;
    setRounds(rounds.filter(r => r.id !== id));
  };

  const handleChange = (id, field, value) => {
    setRounds(rounds.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSave = async () => {
    // Filter out empty rounds
    const validRounds = rounds.filter(r => r.name.trim() !== '');
    if (validRounds.length === 0) {
      alert("Please add at least one round with a name.");
      return;
    }

    setSaving(true);

    // Format for backend
    const roundsToSave = validRounds.map((r, index) => ({
      roundName: r.name.trim(),
      roundOrder: index + 1,
      scheduledDate: r.scheduledDate ? new Date(r.scheduledDate).toISOString() : null,
      notes: r.notes.trim()
    }));

    await onSave(roundsToSave);
    setSaving(false);
  };

  return (
    <div className="modal-overlay">
      <motion.div
        className="bento round-setup-modal"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <div className="modal-header">
          <div>
            <h2>Hiring Process Setup</h2>
            <p className="text-muted"> <strong className="highlight-company">{company}</strong></p>
          </div>
          <button className="icon-btn" onClick={onCancel} disabled={saving}><X size={20} /></button>
        </div>

        <div className="rounds-list-container">
          <Reorder.Group axis="y" values={rounds} onReorder={setRounds} className="rounds-reorder-group">
            <AnimatePresence>
              {rounds.map((round, index) => (
                <Reorder.Item
                  key={round.id}
                  value={round}
                  className="round-setup-item"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                >
                  <div className="drag-handle"><GripVertical size={16} className="text-muted" /></div>
                  <div className="round-inputs">
                    <div className="round-input-row">
                      <div className="field round-name-field">
                        <input
                          className="input"
                          placeholder={`Rounds ${index + 1}`}
                          value={round.name}
                          onChange={(e) => handleChange(round.id, 'name', e.target.value)}
                          autoFocus={index === rounds.length - 1}
                        />
                      </div>
                      <div className="field round-date-field">
                        <div className="date-input-wrapper custom-react-datepicker-wrapper">
                          <CalendarIcon size={14} className="date-icon text-muted" />
                          <DatePicker
                            className="input date-picker-input"
                            selected={round.scheduledDate ? new Date(round.scheduledDate) : null}
                            onChange={(date) => handleChange(round.id, 'scheduledDate', date ? date.toISOString() : '')}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="MMM d, yyyy h:mm aa"
                            placeholderText="Select date & time"
                            popperClassName="theme-dark-datepicker"
                            portalId="datepicker-portal"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="icon-btn danger remove-round-btn"
                    onClick={() => handleRemoveRound(round.id)}
                    disabled={rounds.length === 1}
                  >
                    <X size={16} />
                  </button>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost add-round-btn" onClick={handleAddRound}>
            <Plus size={16} /> Add Another Round
          </button>

          <div className="action-buttons">
            <button className="btn btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
            <button className="btn btn-rose" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : <><Save size={16} /> Save Rounds</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoundSetupModal;
