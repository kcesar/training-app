import React from 'react';
import { observer } from 'mobx-react';
import { AppBar, Box, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useContext } from 'react';
import { AppChromeContext } from '../models/appChromeContext';
import { MobxRouteSync } from './MobxRouteSync';

export const TopBar = observer(() => {
  const appChrome = useContext(AppChromeContext)!;

  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement|null>(null);
  const handleMenu = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => setMenuAnchor(event.currentTarget);
  const handleClose = () => setMenuAnchor(null);

  return (
    <AppBar>
    <Toolbar>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
        KCESAR Basic Training
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


export const MainChrome = (props: {
  children?: React.ReactNode
}) => {
  return (<>
  <MobxRouteSync />
  <TopBar />
  <Toolbar />
  <Box style={{overflowY: 'auto', display:'flex', flexDirection: 'column', flex: '1 1 auto', position: 'relative'}}>
    {props.children}
  </Box>
</>)
};

export default observer(MainChrome);