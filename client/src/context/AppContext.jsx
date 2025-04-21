//provider component

import { createContext } from "react"; //1
export const AppContext = createContext(); //2
import { useState } from "react";
import { useEffect } from "react";
// import { jobsData } from "../assets/assets";  
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";

//3
export const AppContextProvider = (props) => {


  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { user } = useUser()
  const {getToken}=useAuth() 


  const [searchFilter, setSearchFilter] = useState({ title: "", location: "" });
  const [isSearched, setIsSearched] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [companyToken, setCompanyToken] = useState(null);
  const [companyData, setCompanyData] = useState(null);

  // user details while login
  const [userData, setUserData] = useState(null)
  const [userApplications, setUserApplications] = useState([])


  // recuriterlogin
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false)

  //Function to fetch jobs
  const fetchJobs = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/jobs')
      if (data.success) {
        setJobs(data.jobs)
        console.log(data.jobs)
      }
      else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
    // setJobs(jobsData);   dummy data from asssets file
  };

  // function to fetch company data
  const fetchCompanyData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/company/company", { headers: { token: companyToken } })
      if (data.success) {
        setCompanyData(data.company)
        console.log(data)
      }
      else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // function to fetch user data
  const fetchUserData = async () => {
    try {
      const token = await getToken();
      console.log("retrieved Token:", token);
      const { data } = await axios.get(backendUrl+'/api/users/user',{ 
            headers: { Authorization: `Bearer ${token}` }
      });
      if(data.success){
        setUserData(data.user)
        console.log("user data",data.user)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      // toast.error(error.message)
      console.error("Fetch User Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || error.message);
    }
  }


  // function to fetch user's applied applications data 
  const fetchUserApplications = async () => { 
    try {
      const token = await getToken()
      const { data } = await axios.get(backendUrl + '/api/users/applications', { headers: { Authorization: `Bearer ${token}` } })
      if (data.success) {
        setUserApplications(data.applications)
        console.log(data.applications)
      }
      else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchJobs();

    const storedCompanyToken = localStorage.getItem("companyToken");
    if (storedCompanyToken) {
      setCompanyToken(storedCompanyToken);
    }//to check if the user is already logged in 
  }, []);

  useEffect(() => {
    if (companyToken) {
      fetchCompanyData()
    }
  }, [companyToken])
  
  useEffect(() => {
    if (user) {
      fetchUserData()
      fetchUserApplications()
    }
  }, [user])   //user get changed /loggedout 
  
  const value = {
    searchFilter,
    setSearchFilter,
    isSearched,
    setIsSearched,
    jobs,
    setJobs,
    showRecruiterLogin,
    setShowRecruiterLogin,
    companyToken, setCompanyToken,
    companyData, setCompanyData,
    backendUrl, userData, setUserData,
    userApplications, setUserApplications,
    fetchUserData,
    fetchUserApplications
  };
  // 4)
  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
