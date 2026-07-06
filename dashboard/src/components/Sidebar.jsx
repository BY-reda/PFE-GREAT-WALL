import React, { useState } from 'react';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, IconButton, Tooltip, Avatar, useTheme, alpha, Collapse
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdDashboard, MdPeople, MdAccountBalance, MdSchool, MdCardMembership,
  MdDescription, MdAnalytics, MdLightbulb, MdAssessment,
  MdSettings, MdChevronLeft, MdChevronRight, MdAutoFixHigh,
  MdExpandLess, MdExpandMore, MdDocumentScanner, MdMessage, MdCompareArrows, MdCalculate
} from 'react-icons/md';

const DRAWER_WIDTH = 280;
const DRAWER_MINI = 78;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: MdDashboard, path: '/', section: 'main' },
  { 
    label: 'Decision Tools', 
    icon: MdAutoFixHigh, 
    path: '/tools', 
    section: 'main',
    subItems: [
      { label: 'AI Candidate Matcher', path: '/tools?tab=0', icon: MdAutoFixHigh },
      { label: 'AI Vision OCR', path: '/tools?tab=1', icon: MdDocumentScanner },
      { label: 'Automated Reminder', path: '/tools?tab=2', icon: MdMessage },
      { label: 'Head-to-Head', path: '/tools?tab=3', icon: MdCompareArrows },
      { label: 'Financial Estimator', path: '/tools?tab=4', icon: MdCalculate },
    ]
  },
  { label: 'Students', icon: MdPeople, path: '/students', section: 'main' },
  { label: 'Universities', icon: MdAccountBalance, path: '/universities', section: 'main' },
  { label: 'Programs', icon: MdSchool, path: '/programs', section: 'main' },
  { label: 'Scholarships', icon: MdCardMembership, path: '/scholarships', section: 'main' },
  { label: 'Documents', icon: MdDescription, path: '/documents', section: 'analytics' },
  { label: 'Analytics', icon: MdAnalytics, path: '/analytics', section: 'analytics' },
  { label: 'Insights', icon: MdLightbulb, path: '/insights', section: 'analytics' },
  { label: 'Reports', icon: MdAssessment, path: '/reports', section: 'analytics' },
  { label: 'Settings', icon: MdSettings, path: '/settings', section: 'system' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [openItems, setOpenItems] = useState({ '/tools': location.pathname.startsWith('/tools') });
  const width = collapsed ? DRAWER_MINI : DRAWER_WIDTH;

  React.useEffect(() => {
    if (location.pathname.startsWith('/tools')) {
      setOpenItems((prev) => ({ ...prev, '/tools': true }));
    }
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' && location.search === '';
    if (path.includes('?')) {
      const currentFull = location.pathname + location.search;
      if (currentFull === path) return true;
      if (location.pathname === path.split('?')[0] && location.search === '' && path.endsWith('tab=0')) return true;
      return false;
    }
    return location.pathname.startsWith(path);
  };

  const handleItemClick = (path, hasSubItems) => {
    if (hasSubItems) {
      if (collapsed) onToggle();
      setOpenItems((prev) => ({ ...prev, [path]: !prev[path] }));
    } else {
      navigate(path);
    }
  };

  const sections = ['main', 'analytics', 'system'];
  const sectionLabels = { main: 'Core Menu', analytics: 'BI Analytics', system: 'System & Preferences' };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          overflowX: 'hidden',
          transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex',
          flexDirection: 'column',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, #0e1017 0%, #0a0c12 100%)'
            : '#ffffff',
          borderRight: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === 'light' ? '4px 0 24px rgba(0,0,0,0.02)' : 'none',
        },
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
          px: 2.25,
          py: 3,
          minHeight: 72,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 100 100"
          sx={{
            width: 40,
            height: 40,
            flexShrink: 0,
            filter: 'drop-shadow(0 4px 12px rgba(230,0,18,0.35))',
          }}
        >
          <defs>
            <linearGradient id="gw_red_sidebar" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF1E1E" />
              <stop offset="100%" stopColor="#CC0000" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="22" fill="url(#gw_red_sidebar)" />
          <g transform="rotate(18 50 50)">
            <rect x="25" y="15" width="22" height="70" rx="11" fill="#ffffff" />
            <rect x="53" y="35" width="22" height="50" rx="11" fill="#ffffff" />
          </g>
        </Box>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ lineHeight: 1.1, letterSpacing: '-0.02em', fontSize: '1.15rem' }}>
                Great Wall
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.01em', fontSize: '0.74rem', display: 'block', mt: 0.2, fontFamily: "'Inter', 'Tahoma', sans-serif" }}>
                طريقك نحو الدراسة في الصين
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Navigation List */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 2, px: 1.25 }}>
        {sections.map((sec, secIdx) => {
          const items = NAV_ITEMS.filter((n) => n.section === sec);
          return (
            <Box key={sec} sx={{ mb: secIdx < sections.length - 1 ? 2.5 : 1 }}>
              {!collapsed && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 1.75,
                    py: 0.5,
                    display: 'block',
                    color: 'text.secondary',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontSize: '0.68rem',
                  }}
                >
                  {sectionLabels[sec]}
                </Typography>
              )}
              {collapsed && secIdx > 0 && (
                <Box sx={{ mx: 2, my: 1, borderTop: `1px solid ${theme.palette.divider}` }} />
              )}
              <List dense disablePadding sx={{ mt: 0.5 }}>
                {items.map(({ label, icon: Icon, path, subItems }) => {
                  const active = isActive(path);
                  const isOpen = openItems[path];

                  return (
                    <React.Fragment key={path}>
                      <Tooltip title={collapsed ? label : ''} placement="right" arrow>
                        <ListItemButton
                          onClick={() => handleItemClick(path, !!subItems)}
                          sx={{
                            borderRadius: 3,
                            mb: 0.5,
                            minHeight: 46,
                            px: collapsed ? 1.5 : 1.75,
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            background: active
                              ? `linear-gradient(90deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
                              : 'transparent',
                            color: active ? theme.palette.primary.main : theme.palette.text.secondary,
                            borderLeft: active ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: active
                                ? alpha(theme.palette.primary.main, 0.25)
                                : alpha(theme.palette.text.primary, 0.05),
                              color: active ? theme.palette.primary.main : theme.palette.text.primary,
                              transform: 'translateX(2px)',
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: collapsed ? 0 : 38,
                              color: 'inherit',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon size={22} />
                          </ListItemIcon>
                          {!collapsed && (
                            <ListItemText
                              primary={label}
                              primaryTypographyProps={{
                                fontSize: '0.9rem',
                                fontWeight: active ? 700 : 500,
                                letterSpacing: '-0.01em',
                                whiteSpace: 'nowrap',
                              }}
                            />
                          )}
                          {!collapsed && subItems && (
                            isOpen ? <MdExpandLess size={20} color={theme.palette.text.secondary} /> : <MdExpandMore size={20} color={theme.palette.text.secondary} />
                          )}
                        </ListItemButton>
                      </Tooltip>
                      {subItems && (
                        <Collapse in={isOpen && !collapsed} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding sx={{ mb: 1 }}>
                            {subItems.map((sub) => {
                              const subActive = location.pathname + location.search === sub.path || (location.pathname === path && location.search === '' && sub.path.endsWith('tab=0'));
                              const SubIcon = sub.icon;
                              return (
                                <ListItemButton
                                  key={sub.path}
                                  onClick={() => navigate(sub.path)}
                                  sx={{
                                    pl: 4.5,
                                    pr: 1.5,
                                    py: 0.8,
                                    mb: 0.5,
                                    borderRadius: 2,
                                    mx: 1.25,
                                    color: subActive ? theme.palette.primary.main : theme.palette.text.secondary,
                                    background: subActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                    '&:hover': {
                                      background: alpha(theme.palette.primary.main, 0.12),
                                      color: theme.palette.primary.main,
                                    }
                                  }}
                                >
                                  <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                                    {SubIcon && <SubIcon size={18} />}
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={sub.label} 
                                    primaryTypographyProps={{ 
                                      fontSize: '0.82rem', 
                                      fontWeight: subActive ? 700 : 500,
                                      whiteSpace: 'nowrap',
                                    }} 
                                  />
                                </ListItemButton>
                              );
                            })}
                          </List>
                        </Collapse>
                      )}
                    </React.Fragment>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      {/* Footer Toggle */}
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          background: alpha(theme.palette.background.paper, 0.4),
        }}
      >
        {!collapsed && (
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ pl: 1, fontSize: '0.75rem' }}>
            Collapse menu
          </Typography>
        )}
        <Tooltip title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'} placement="right">
          <IconButton
            size="small"
            onClick={onToggle}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.background.paper, 0.8),
              color: 'text.primary',
              '&:hover': { bgcolor: theme.palette.background.paper },
            }}
          >
            {collapsed ? <MdChevronRight size={20} /> : <MdChevronLeft size={20} />}
          </IconButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
