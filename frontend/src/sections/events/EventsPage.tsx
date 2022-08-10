import * as React from 'react';
import { observer } from 'mobx-react';
import { Link, useNavigate } from 'react-router-dom';
import { isFuture, formatDistance } from "date-fns";
import { Divider, Fab, List, ListItem, ListItemButton, ListItemText, ListSubheader } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import Store from '../../store';
import MainChrome from '../../components/MainChrome';
import PageHeader from '../../components/PageHeader';
import EventViewModel from '../../models/eventViewModel';

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
        <ListItem key={e.id} disablePadding>
          <ListItemButton disabled={!e.myUnitResponding} component={Link} to={`/events/${e.id}`}>
            <EventItemText event={e} />
          </ListItemButton>
        </ListItem>
      ))
      : <ListItem><ListItemText primary={props.emptyText} /></ListItem>
    }
  </List>
);

export const EventsPage = (props: {
  store: Store
}) => {
  const navigate = useNavigate();

  return (<MainChrome>
    <PageHeader text="Recent Missions" />
    <EventList events={props.store.missions} emptyText="No active missions" />
    {props.store.otherEvents.length ? <Divider /> : undefined }
    <EventList events={props.store.otherEvents} headerText="Other Events" />
    <Fab color="primary" size="medium" aria-label="add" style={{position:'absolute', right:'16px', bottom: '16px'}}
        onClick={() => navigate("/events/create")} >
      <AddIcon />
    </Fab>
    </MainChrome>)
};

export default observer(EventsPage);