import { observer } from "mobx-react";
import MainChrome from "../components/MainChrome";
import TraineeStore from "../store/traineeStore";

export const TraineePage = (props: {
  store: TraineeStore
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
{/* 
    <MyResponses responses={store.mainStore.responses} events={store.allEvents} />
    {store.availableMissions.map(m => <AvailableCard key={m.id} event={m} doJoin={store.startJoinEvent} />)}
    {store.hasOtherEvents ? <Divider /> : undefined }
    {store.availableOtherEvents.map(m => <AvailableCard key={m.id} event={m} doJoin={store.startJoinEvent} />)}
 */}

    {/* <EventList events={props.store.missions} emptyText="No active missions" />
    <EventList events={props.store.otherEvents} headerText="Other Events" />
    <Fab color="primary" size="medium" aria-label="add" style={{position:'absolute', right:'16px', bottom: '16px'}}
        onClick={() => navigate("/events/create")} >
      <AddIcon />
    </Fab> */}
    {/* {store.joinDialogOpen && store.joinStore && <JoinDialog store={store.joinStore} /> } */}
  </MainChrome>)
};

export default observer(TraineePage);