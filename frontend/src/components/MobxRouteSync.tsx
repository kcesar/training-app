import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { AppChromeContext } from "../models/appChromeContext";

export const MobxRouteSync = () => {
  const appChrome = React.useContext(AppChromeContext);
  const p = useParams();
  const l = useLocation();
  React.useEffect(() => {
    appChrome?.syncRoute(l, p);
  }, [appChrome, l, p])
  return (<></>);
}