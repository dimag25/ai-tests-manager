import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const TabNavigation = () => {
  const location = useLocation();

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs value={location.pathname}>
        <Tab label="Test Table" component={Link} to="/table" value="/table" />
        <Tab label="Test Generator" component={Link} to="/generator" value="/generator" />
      </Tabs>
    </Box>
  );
};

export default TabNavigation;
