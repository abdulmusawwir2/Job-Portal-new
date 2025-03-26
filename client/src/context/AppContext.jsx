//provider component

import { createContext } from "react"; //1
export const AppContext = createContext(); //2
import { useState } from "react";
import { useEffect } from "react";
import { jobsData } from "../assets/assets";

//3
export const AppContextProvider = (props) => {
  const [searchFilter, setSearchFilter] = useState({ title: "", location: "" });
  const [isSearched, setIsSearched] = useState(false);
  const [jobs, setJobs] = useState([]);

  // recuriterlogin
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false)

  //Function to fetch jobs
  const fetchJobs = async () => {
    setJobs(jobsData);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const value = {
    searchFilter,
    setSearchFilter,
    isSearched,
    setIsSearched,
    jobs,
    setJobs,
    showRecruiterLogin,
    setShowRecruiterLogin
  };
  // 4)
  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
