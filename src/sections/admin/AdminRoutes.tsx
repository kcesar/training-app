import * as React from 'react';
import { observer } from "mobx-react";
import { Routes, Route, Navigate } from "react-router-dom";
import Store from "../../store";
import AdminStore from "../../store/adminStore";
import AdminHomePage from "./AdminHomePage";
import TraineeListPage from "./TraineeListPage";
import TraineePageWrapper from './TraineePageWrapper';

export const AdminRoutes = (props: {
  store: Store
}) => {
  const { store } = props;
  const adminStore = new AdminStore(store);

  return (
    <Routes>
        <Route index element={<Navigate to="/admin" />} />
        <Route path="/admin">
          <Route index element={<AdminHomePage />} />
          <Route path="trainees" element={<TraineeListPage store={adminStore} /> } />
          <Route path="trainees/:email" element={<TraineePageWrapper store={adminStore} />}>
            <Route index element={<></>} />
            <Route path=":courseId" element={<></>} />
          </Route>
        </Route>
    </Routes>
  );
};

export default observer(AdminRoutes);