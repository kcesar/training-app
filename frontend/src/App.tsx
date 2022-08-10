import React from 'react';
import { observer } from 'mobx-react';
import { Route, Navigate, Routes, useParams } from "react-router-dom";
import './App.css';
import Store from './store';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { ThemeProvider } from '@mui/material';
import EventsPage from './sections/events/EventsPage';
import EventDetailsPage from './sections/events/EventDetailsPage';
import ResponsePage from './sections/respond/ResponsePage';
import EventEditPage from './sections/events/EventEditPage';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import CustomRouter from './components/CustomRouter';
import { AppChromeContext } from './models/appChromeContext';
import JoinPage from './sections/respond/JoinPage';
import { JoinPageStore } from './sections/respond/joinPageStore';

const LoginPage = (props: {
  clientId: string,
  name: string,
  login:(response:GoogleLoginResponse|GoogleLoginResponseOffline) => Promise<void>
}) => (
  <div style={{flex:'1 1 auto', display: 'flex', flexDirection:'column'}}>
    <div className="login-block" style={{flex: '1 1 auto'}}>
      <h1>{props.name} Check In</h1>
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

const EventDetailsPageWithId = (props: { store: Store }) => {
  const p = useParams();
  return (
    <EventDetailsPage store={props.store.getEventStore(parseInt(p.eventId!))} />
  );
}

const AppBody = observer(({store}: {store: Store}) => {
  if (!store.started) return (<div>Loading ...</div>);
  if (!store.user) return (<LoginPage clientId={store.config.clientId} login={store.doLogin} name={store.teamName} />);

  return (
    <CustomRouter history={store.history}>
      <Routes>
        <Route index element={<Navigate replace to="/response" />} />
        <Route path="/response" element={<ResponsePage store={store.getResponseStore()} />} />
        <Route path="/response/:eventId" element={<JoinPage store={new JoinPageStore(store)} />} />
        <Route path="/events" element={<EventsPage store={store} />} />
        <Route path="/events/create" element={<EventEditPage store={store.getEditEventStore()} />} />
        <Route path="/events/:eventId" element={<EventDetailsPageWithId store={store} />} />
      </Routes>
    </CustomRouter>
  );
});

function App({store}: {store: Store}) {
  React.useEffect(() => {
    document.title = store.siteName;
  }, [store.siteName]);
  
  let body;
  if (!store.started) {
    body = (<div>Loading ...</div>);
  } else if (!store.user) {
    body = (<LoginPage clientId={store.config.clientId} login={store.doLogin} name={store.teamName} />);
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
