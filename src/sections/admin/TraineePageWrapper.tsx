import * as React from 'react';
import { observer } from 'mobx-react';
import { useParams } from 'react-router-dom';
import AdminStore from '../../store/adminStore';
import TraineePage from '../TraineePage';

export const TraineePageWrapper = (props: {
  store: AdminStore
}) => {
  const params = useParams<{email:string}>();
  const traineeStore = props.store.getTraineeStore(params);
  return (
    <>
    {<div>{JSON.stringify(params)}</div>}
      <TraineePage store={traineeStore} />
    </>
  )
}

export default observer(TraineePageWrapper);