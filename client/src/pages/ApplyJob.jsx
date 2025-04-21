import React, { useContext, useEffect, useState } from "react";
import {  useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets} from "../assets/assets";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import kConvert from "k-convert";
import moment from "moment";
import JobCard from "../components/JobCard";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

const ApplyJob = () => {
  const Navigate = useNavigate();
  const { id } = useParams();

  const {getToken} = useAuth()

  const [JobData, setJobData] = useState(null);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);

  const { jobs,backendUrl,userData,userApplications,fetchUserApplications } = useContext(AppContext);

  const fetchJob = async () => {
    try {
      const { data } = await axios.get(backendUrl + `/api/jobs/${id}`)
      if (data.success) {
      setJobData(data.job)  
    }
    else {
      toast.error(data.message)
    }
    }
    catch (error) {
      toast.error(error.message)
    }
  };

  const applyHandler = async () => {
    try {
      if (!userData) {
        return toast.error("Please login to apply for the job")
      }
      if (!userData.resume) {
        Navigate("/applications")
        return toast.error("Please upload your resume to apply for the job")
      }

      const token= await getToken()
      const { data } = await axios.post(backendUrl + "/api/users/apply", { jobId: JobData._id }, { headers: { Authorization: `Bearer ${token}` } })
      
      if (data.success) {
        toast.success(data.message)
        fetchUserApplications()
      }
      else {
        toast.error(data.message)
      }
    }
    catch (error) {
      toast.error(error.message)
    }
  };

  // check already applied for the job
  const checkAlreadyApplied = () => { 
    const hasApplied = userApplications.some((item) => item.jobId._id === JobData._id)
    setIsAlreadyApplied(hasApplied)
  }


  useEffect(() => {
    fetchJob()
  }, [id]);

  useEffect(() => {
    if (userApplications.length>0 && JobData) {
      checkAlreadyApplied()
    }
  }, [JobData,userApplications,id]);

  return JobData ? (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto">
        <div className="bg-white text-black rounded-lg w-full">
          <div className="flex justify-center md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-50 border border-sky-400 rounded-xl">
            <div className="flex flex-col md:flex-row items-center">
              <img
                className="h-24 bg-white rounded-lg p-4 mr-4 max-md:mb-4 border"
                src={JobData.companyId.image}
                alt=""
              />
              <div className="text-center md:text-left text-neutral-700">
                <h1 className="text-2xl sm:text-4xl font-medium">
                  {JobData.title}
                </h1>
                <div className="flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gray-600 mt-2">
                  <span className="flex items-center gap-1">
                    <img src={assets.suitcase_icon} alt="" />
                    {JobData.companyId.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.location_icon} alt="" />
                    {JobData.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.person_icon} alt="" />
                    {JobData.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <img src={assets.money_icon} alt="" />
                    CTC: {kConvert.convertTo(JobData.salary)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center text-center text-sm max-md:mx-auto max-md:text-center">
              <button onClick={applyHandler} className="bg-blue-600 p-2.5 px-10 text-white rounded ">
                {isAlreadyApplied ? "Already Applied" : "Apply Now"}
              </button>
              <p className="mt-1 text-gray-600">
                Posted {moment(JobData.date).fromNow()}
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start">
            <div className="w-full lg:w-2/3">
              <h2 className="font-bold text-2xl mb-4 ">Job description</h2>
              <div
                className="rich-text"
                dangerouslySetInnerHTML={{ __html: JobData.description }}
              ></div>
              <button onClick={applyHandler} className="bg-blue-600 p-2.5 px-10 text-white rounded mt-10">
                {isAlreadyApplied ? "Already Applied" : "Apply Now"}
              </button>
            </div>
            {/* Right section more jobs */}
            <div className="w-full lg:w-1/3 mt-8 lg:mt-0 lg:ml-8 space-y-5">
              <h2>More jobs from {JobData.companyId.name}</h2>
              {jobs
                .filter(
                  (job) =>
                    job._id !== JobData._id &&
                    job.companyId._id === JobData.companyId._id
                )
                .filter((job) => {
                  // Set of applied jobIds
                  const appliedJobsIds = new Set(userApplications.map(app => app.jobId._id && app.jobId._id))
                  // return true if the user has not applied for this job
                  return !appliedJobsIds.has(job._id)
                })
                .slice(0, 4)
                .map((job, index) => (
                  <JobCard key={index} job={job} />
                ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default ApplyJob;
