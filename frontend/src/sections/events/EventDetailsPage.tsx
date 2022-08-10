import * as React from 'react';
import { observer } from 'mobx-react';
import { format as formatDate } from 'date-fns';
import MainChrome from '../../components/MainChrome';
import PageHeader from '../../components/PageHeader';
import EventDetailStore from '../../store/eventDetailStore';
import { Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ResponderViewModel from '../../models/responderViewModel';

const PageSkeleton = () => (
  <>
    <PageHeader text="Loading..." backUrl="/events" backAriaText="back to events" />
    <Skeleton />
  </>
)

function RosterRow(props: { row: ResponderViewModel}) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} onClick={() => setOpen(!open)}>
        <TableCell sx={{padding: 0, backgroundColor: row.timeOut ? '#3b3b3b' : row.responding ? '#eaea7c' : '#83de59'}}></TableCell>
        <TableCell align="center">{row.responding ? formatDate(row.responding, 'HHmm') : undefined}</TableCell>
        <TableCell>{row.name}</TableCell>
        <TableCell sx={{display: { xs:'none', sm:'table-cell'}}} align="center">{row.timeOut ? formatDate(row.timeOut, 'HHmm') : undefined}</TableCell>
        <TableCell sx={{display: { xs:'none', sm:'table-cell'}}} align="center">{row.hours}</TableCell>
        <TableCell sx={{display: { xs:'none', sm:'table-cell'}}} align="right">{row.miles}</TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export const EventDetailsPage = (props: {
  store: EventDetailStore
}) => {
  React.useEffect(() => { props.store.start() }, [props.store]);

  let content: React.ReactNode|undefined = undefined;
  if (!props.store.name) {
    content = <PageSkeleton />
  } else {
    content = <>
      <PageHeader text={props.store.name} backUrl="/events" backAriaText="back to events" />
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell sx={{width:'3%', padding: 0}} />
              <TableCell sx={{width:'15%'}} align="center">Time In</TableCell>
              <TableCell sx={{width:'40%'}}>Name</TableCell>
              <TableCell sx={{width:'15%', display: { xs: 'none', sm:'table-cell'}}} align="center">Time Out</TableCell>
              <TableCell sx={{width:'12%', display: { xs: 'none', sm:'table-cell'}}} align="center">Hours</TableCell>
              <TableCell sx={{width: '11%', display: { xs: 'none', sm:'table-cell'}}} align="right">Miles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.store.responders.map(r => 
              <RosterRow key={r.id} row={r} />
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  }
  return (<MainChrome>{content}</MainChrome>)
};

export default observer(EventDetailsPage);