import * as React from 'react';
import { Router } from 'react-router-dom';
import { History } from 'history';

export interface CustomRouterProps {
  basename?: string,
  children?: React.ReactNode,
  history: History,
}

const CustomRouter = ({
  basename,
  children,
  history,
}: CustomRouterProps) => {
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });

  React.useLayoutEffect(() => history.listen(setState), [history]);

  return (
    <Router
      basename={basename}
      children={children}
      location={state.location}
      navigationType={state.action}
      navigator={history}
    />
  );
};

export default CustomRouter;