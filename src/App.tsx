import React, { Suspense } from 'react';
import { observer } from 'mobx-react';
import { Route, Routes } from "react-router-dom";
import './App.css';
import Store from './store';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { ThemeProvider } from '@mui/material';
import TraineePage from './sections/TraineePage';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CustomRouter from './components/CustomRouter';
import { AppChromeContext } from './models/appChromeContext';

const AdminRoutes = React.lazy(() => import('./sections/admin/AdminRoutes' /* webpackChunkName: "admin" */));

const LoginPage = (props: {
  clientId: string,
  login:(response:GoogleLoginResponse|GoogleLoginResponseOffline) => Promise<void>
}) => (
  <div style={{flex:'1 1 auto', display: 'flex', flexDirection:'column'}}>
    <div className="login-block" style={{flex: '1 1 auto'}}>
      <h1>King County ESAR - Basic Training</h1>
      <GoogleLogin
          clientId={props.clientId}
          buttonText="Log in with Google"
          onSuccess={props.login}
          onFailure={props.login}
          cookiePolicy={'single_host_origin'}
        />
    </div>
  </div>
);

const AppBody = observer(({store}: {store: Store}) => {
  if (!store.started) return (<div>Loading ...</div>);
  if (!store.user) return (<LoginPage clientId={store.config.clientId} login={store.doLogin} />);

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
  if (!store.started) {
    body = (<div>Loading ...</div>);
  } else if (!store.user) {
    body = (<LoginPage clientId={store.config.clientId} login={store.doLogin} />);
  } else {
    body = (<AppBody store={store} />);
  }

  return (
    <ThemeProvider theme={store.theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AppChromeContext.Provider value={store}>
          {body}
        </AppChromeContext.Provider>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default observer(App);
