import * as React from 'react';
import { observer } from "mobx-react";
import { Routes, Route, Navigate } from "react-router-dom";
import Store from "../../store";
import AdminStore from "../../store/adminStore";
import AdminHomePage from "./AdminHomePage";
import TraineeListPage from "./TraineeListPage";
import TraineePageWrapper from './TraineePageWrapper';
import CoursePage from './CoursePage';
import CourseStore from '../../store/courseStore';
import RosterPage from './RosterPage';

class AdminFactory {
  rootStore?: Store;
  store?: AdminStore;
  courseParent?: AdminStore;
  courseStore?: CourseStore;

  get(rootStore: Store) {
    if (this.rootStore !== rootStore) {
      this.rootStore = rootStore;
      this.store = new AdminStore(rootStore);
    }
    return this.store!;
  }
}
const factory = new AdminFactory();

export const AdminRoutes = (props: {
  store: Store
}) => {
  const adminStore = factory.get(props.store);
  return (
    <Routes>
      <Route index element={<Navigate to="/admin" />} />
      <Route path="/admin">
        <Route index element={<AdminHomePage store={adminStore} />} />
        <Route path="trainees" element={<TraineeListPage store={adminStore} /> } />
        <Route path="trainees/:email" element={<TraineePageWrapper store={adminStore} />}>
          <Route index element={<></>} />
          <Route path=":courseId" element={<></>} />
        </Route>
        <Route path="courses/:course" element={<CoursePage store={adminStore} />} />
        <Route path="courses/:course/:offeringId" element={<RosterPage store={adminStore} />} />
      </Route>
    </Routes>
  );
};

export default observer(AdminRoutes);