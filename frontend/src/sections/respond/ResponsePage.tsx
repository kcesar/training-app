import * as React from 'react';
import { observer } from 'mobx-react';
import { Link, useNavigate } from 'react-router-dom';
import { isFuture, formatDistance } from "date-fns";
import { Button, Card, CardActions, CardContent, Divider, List, ListItem, ListItemButton, ListItemText, ListSubheader, Typography } from '@mui/material';
//import AddIcon from '@mui/icons-material/Add';

import MainChrome from '../../components/MainChrome';
import EventViewModel from '../../models/eventViewModel';
import ResponseStore from '../../store/responseStore';
import JoinDialog from './JoinPage';
import ResponderViewModel from '../../models/responderViewModel';
//import EventViewModel from './models/eventViewModel';

export const EventItemText = (props: {
  event: EventViewModel
}) => {
  const e = props.event;
  const startText = `Start${isFuture(e.startAt) ? 's' : 'ed'} ${formatDistance(e.startAt, new Date(), { addSuffix: true })}`;
  const responderText = `${e.responders.length} responder${e.responders.length === 1 ? '' : 's'}`

  return <ListItemText primary={e.name} secondary={`${startText}, ${responderText}`} />;
}

export const EventList = (props: {
  events: EventViewModel[],
  headerText?: string,
  emptyText?: string
}) => (
  (props.events.length === 0 && !props.emptyText) ? null :
  <List subheader={props.headerText ? <ListSubheader>{props.headerText}</ListSubheader> : undefined}>
    {props.events.length
      ? props.events.map(e => (
        <ListItem key={e.id} disablePadding secondaryAction={<Button variant="contained" color="primary">Join</Button>}>
          <EventItemText event={e} />
        </ListItem>
      ))
      : <ListItem><ListItemText primary={props.emptyText} /></ListItem>
    }
  </List>
);

const AvailableCard = (props: {
  event: EventViewModel,
  doJoin: (e: EventViewModel, now: boolean) => void,
}) => (
  <Card sx={{maxWidth:600}}>
    <CardContent>
    <Typography variant="h6" component="div">{props.event.name}</Typography>
    </CardContent>
    <CardActions>
      <Button variant="contained" color="primary" onClick={() => props.doJoin(props.event, true)}>Respond</Button>
      {/* <Button color="primary" onClick={() => props.doJoin(props.event, false)}>Respond Later</Button> */}
    </CardActions>
  </Card>
)

const ResponseCard = (props: {
  response: ResponderViewModel
}) => (
  <Card sx={{maxWidth:600}}>
    <CardContent>
    <Typography variant="h6" component="div">the name</Typography>
    </CardContent>
    <CardActions>
      <Button variant="contained" color="primary" onClick={() => {}/*props.doJoin(props.event, true)*/}>Respond Now</Button>
      <Button color="primary" onClick={() => {}/*props.doJoin(props.event, false)*/}>Respond Later</Button>
    </CardActions>
  </Card>
)

const MyResponses = (props: {
  responses: ResponderViewModel[],
  events: EventViewModel[]
}) => (
  <>
  {
    props.responses.length
      ? props.responses.map(response => <ResponseCard key={response.id} response={response} />)
      : undefined
  }
  </>
  // <List subheader={<ListSubheader>My Responses</ListSubheader>}>
  //   {props.responses.length
  //   ? props.responses.map(e => (
  //     <ListItem disablePadding>
        
  //     </ListItem>
  //   ))
  //   : <ListItem><ListItemText primary="Not currently responding" /></ListItem>
  //   }
  // </List>
)

export const ResponsePage = (props: {
  store: ResponseStore
}) => {
  const { store } = props;
  //const navigate = useNavigate();

  return (<MainChrome>
    {/* <EventList events={props.store.missions.filter(m => m.myUnitResponding)} headerText="Current Missions" emptyText={`${props.store.teamName} has no active missions`} />
    {otherEvents.length ? <Divider /> : undefined }
    <EventList events={otherEvents} headerText="Other Events" /> */}
    {/* <PageHeader text="Blah-dah-dee blah" /> */}
    {/* <Card>
      <CardContent>
        
      </CardContent>
      <CardActions>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card> */}

    <MyResponses responses={store.mainStore.responses} events={store.allEvents} />
    {store.availableMissions.map(m => <AvailableCard key={m.id} event={m} doJoin={store.startJoinEvent} />)}
    {store.hasOtherEvents ? <Divider /> : undefined }
    {store.availableOtherEvents.map(m => <AvailableCard key={m.id} event={m} doJoin={store.startJoinEvent} />)}


    {/* <EventList events={props.store.missions} emptyText="No active missions" />
    <EventList events={props.store.otherEvents} headerText="Other Events" />
    <Fab color="primary" size="medium" aria-label="add" style={{position:'absolute', right:'16px', bottom: '16px'}}
        onClick={() => navigate("/events/create")} >
      <AddIcon />
    </Fab> */}
    {/* {store.joinDialogOpen && store.joinStore && <JoinDialog store={store.joinStore} /> } */}
  </MainChrome>)
};

export default observer(ResponsePage);