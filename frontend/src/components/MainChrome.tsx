import React from 'react';
import { observer } from 'mobx-react';
import { Link as RouterLink, useParams, useLocation } from "react-router-dom";
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CampaignIcon from '@mui/icons-material/Campaign';
import Store from '../store';
import { runInAction } from 'mobx';
import { AppBar, Box, Container, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useContext } from 'react';
import { AppChromeContext } from '../models/appChromeContext';
import { MobxRouteSync } from './MobxRouteSync';

export const TopBar = observer((props: {}) => {
  const appChrome = useContext(AppChromeContext)!;

  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement|null>(null);
  const handleMenu = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => setMenuAnchor(event.currentTarget);
  const handleClose = () => setMenuAnchor(null);

  return (
    <AppBar>
    <Toolbar>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        {appChrome.siteName}
      </Typography>
      {appChrome.user && (
      <div style={{display:'inline-block'}}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={menuAnchor}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(menuAnchor)}
          onClose={handleClose}
        >
          {appChrome.user ? <MenuItem disabled>{appChrome.user.name}</MenuItem> : undefined}
          <MenuItem onClick={() => { handleClose(); appChrome.doLogout(); }}>Sign Out</MenuItem>
        </Menu>
      </div>)}
    </Toolbar>
  </AppBar>
  );
})

const BottomBar = observer(() => {
  const appChrome = useContext(AppChromeContext);
  return (
    <BottomNavigation
      showLabels
      value={appChrome?.currentSection}
    >
      <BottomNavigationAction component={RouterLink} to="/response" value='response' label="Response" icon={<DirectionsRunIcon />} />
      <BottomNavigationAction component={RouterLink} to="/events" value='events' label="Events" icon={<CampaignIcon />} />
    </BottomNavigation>
  )
})

export const MainChrome = (props: {
  children?: React.ReactNode
}) => {
  return (<>
  <MobxRouteSync />
  <TopBar />
  <Toolbar />
  <Container maxWidth="md" style={{display: 'flex', flexDirection:'column', flex: '1 1 auto', overflowY: 'auto', position: 'relative'}}>
    <Box sx={{ my: 2, display: 'flex', flexDirection:'column', flex: '1 1 auto' }}>
      {props.children}
    </Box>
  </Container>
  {/* <OTopBar store={props.store} />
  <div style={{flex:'1 1 auto'}}>
  </div> */}
  <BottomBar />
</>)
};

export default observer(MainChrome);