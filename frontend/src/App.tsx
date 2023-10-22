import { useCallback, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Main from "./pages/Main";
import Auth from "./pages/Auth";
import "./App.css";

import { useAppDispatch, useAppSelector } from "./hooks/useRedux";
import { refreshData } from "./redux-store/dataRefresher";

export default function App() {  
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(state => state.loading.main);
  
  const refreshDataHandler = useCallback(() => {
    refreshData(dispatch); // THUNK: dispatch(refreshData());
  }, [dispatch]);

  // --- fetch data when app starts --- //
  useEffect(() => {
    refreshDataHandler();
  }, [refreshDataHandler]);

  if (isLoading) {
    return <div>
      <h1 className="loading-text">LOADING...</h1>
    </div>
  }

  return (
    // FLEX CONTAINER
    <div className="flex-container">

      <Layout>
        {/* NAV IS IN LAYOUT */}

        {/* MAIN BODY */}
        <div className="flex-main-body">

          {/* ROUTES "/posts" and "/account" */}
          <Routes>
            <Route path="/posts/*" element={<Main />} />
            <Route path="/account" element={<Auth onRefreshData={refreshDataHandler} />} />
            <Route path="/*" element={<Navigate to="/posts" />} />
          </Routes>

        </div>

      {/* FOOTER IS IN LAYOUT */}
      </Layout>

    </div>
  );
}