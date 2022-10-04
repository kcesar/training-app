import React, { Suspense } from 'react';
import { observer } from 'mobx-react';
import { Route, Routes } from "react-router-dom";
import './App.css';
import Store from './store';
import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '@mui/material';
import TraineePage from './sections/TraineePage';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CustomRouter from './components/CustomRouter';
import { AppChromeContext } from './models/appChromeContext';

const AdminRoutes = React.lazy(() => import('./sections/admin/AdminRoutes' /* webpackChunkName: "admin" */));

const LoginPage = (props: {
  login:(response?: CredentialResponse) => Promise<void>
}) => (
  <div style={{flex:'1 1 auto', display: 'flex', flexDirection:'column'}}>
    <div className="login-block" style={{flex: '1 1 auto'}}>
      <h1>King County ESAR - Basic Training</h1>
      <GoogleLogin
        onSuccess={res => props.login(res)}
        onError={() => props.login()}
      />
    </div>
  </div>
);

const AppBody = observer(({store}: {store: Store}) => {
  if (!store.started) return (<div>Loading ...</div>);
  if (!store.user) return (<LoginPage login={store.doLogin} />);

  if (store.user.isTrainee) {
    return (
      <CustomRouter history={store.history}>
        <Routes>
          <Route element={<TraineePage store={store.getTraineeStore(true)} />}>
            <Route index element={<></>} />
            <Route path=":courseId" element={<></>} />
          </Route>
        </Routes>
      </CustomRouter>
    );
  }

  return (
    <CustomRouter history={store.history}>
      <Suspense fallback={<div>Loading admin pages ...</div>}>
        <AdminRoutes store={store} />
      </Suspense>
    </CustomRouter>
  )

});

function App({store}: {store: Store}) {
  let body;
  if (!store.started || !store.config?.clientId) {
    body = (<div>Loading ...</div>);
  } else if (!store.user) {
    body = (<LoginPage login={store.doLogin} />);
  } else {
    body = (<AppBody store={store} />);
  }

  return (
    <ThemeProvider theme={store.theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <GoogleOAuthProvider clientId={store.config.clientId}>
          <AppChromeContext.Provider value={store}>
            {body}
          </AppChromeContext.Provider>
        </GoogleOAuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default observer(App);
