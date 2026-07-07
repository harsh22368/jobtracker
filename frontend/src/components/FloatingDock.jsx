import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, PlusCircle, Target, UserCheck } from 'lucide-react';
import './FloatingDock.css';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/applications', icon: Briefcase, label: 'Apps' },
  { to: '/applications/new', icon: PlusCircle, label: 'Add' },
  { to: '/shortlisted', icon: UserCheck, label: 'Pipeline' },
  { to: '/daily-goals', icon: Target, label: 'Goals' },
];

const FloatingDock = () => {
  const location = useLocation();

  return (
    <nav className="dock">
      <div className="dock-inner">
        {links.map(({ to, icon: Icon, label }) => {
          const active = to === '/' 
            ? location.pathname === '/' 
            : to === '/applications' 
              ? location.pathname === '/applications'
              : location.pathname.startsWith(to);
          return (
            <NavLink key={to} to={to} className={`dock-item ${active ? 'active' : ''}`}>
              <div className="dock-icon-wrap">
                <Icon size={20} />
                {active && <div className="dock-glow" />}
              </div>
              <span className="dock-label">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default FloatingDock;
