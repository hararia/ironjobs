import React, { Fragment, useState, useEffect } from "react";
import actions from "../../services/actions.js";
import { NotificationManager } from 'react-notifications';

const SearchResults = (props) => {
  let [jobs, setJobs] = useState([]);
  let [originalJobsArray, setOriginalJobsArray] = useState([]);
  let [moreResultsLoading, setMoreResultsLoading] = useState(false)
  let [loading,setLoading] = useState(true)

  useEffect(() => {
    function getJobs(aid) {
      actions
        .getIndeedJobs(
          props.match.params.location,
          props.match.params.searchTerm
        )
        .then((response) => {
          aid = response.data
          setJobs(response.data);
          setOriginalJobsArray(response.data)
          setLoading(false)
          setMoreResultsLoading(true)
          if (response.data.length === 0) {
            NotificationManager.warning("No Jobs found")
            props.history.push('/search')
          }
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
      actions
        .getLinkedinJobs(
          props.match.params.location,
          props.match.params.searchTerm
        )
        .then((response) => {
          let temp = [...aid]
          temp = temp.concat(response.data)
          setJobs(temp);
          setOriginalJobsArray(temp)
          setMoreResultsLoading(false)
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    }
    getJobs();
  }, []);

  const addJob = (i) => {
    if (!props.user.email) {
      NotificationManager.warning("Please sign in to add a listing!")
    }
    else {
      actions.addJob(jobs[i])
        .then((res) => {
          NotificationManager.success("Added Job!")
          console.log(res)
        })
        .catch((error) => {
          console.error(error)
        })
    }
  }

  const sortByDate = () =>{
    let jobsCopy=[...jobs]
    jobsCopy.sort((a,b)=>new Date(b.date) - new Date(a.date))
    setJobs(jobsCopy)
    printJobs()
  }

  const filterByDate = () =>{
    let today = new Date()
    let month = today.getMonth().toString()
    if(month.length==1){
      month="0"+month
    }
    let day = today.getDate().toString()
    let year = today.getFullYear().toString()
    let fToday = year+month+day
    let jobsFilteredByDate = []
    jobs.map((job)=>{
      let jobDate = new Date(job.date)
      let jobMonth = jobDate.getMonth().toString()
      if(jobMonth.length==1){
        jobMonth = "0"+jobMonth
      }
      let jobDay = jobDate.getDate().toString()
      let jobYear = jobDate.getFullYear().toString()
      let fJobDate = jobYear+jobMonth+jobDay
      if(Number(fToday) - Number(fJobDate) < 15){
        jobsFilteredByDate.push(job)
      }
    })
    setJobs(jobsFilteredByDate)
    printJobs()
  }

  const filterBySeniorityLevel = () =>{
    let jobsFilteredBySeniorityLevel = []

    jobs.map((job)=>{
      if (job.senorityLevel ==='Entry level'){
        jobsFilteredBySeniorityLevel.push(job)
      }
    })
    setJobs(jobsFilteredBySeniorityLevel)
    printJobs()
  }

  const printJobs = () => {
    return jobs.map((job,i) => {
      return (
        <Fragment key={i}>
          {job.title} {new Date(job.date).toDateString()} {job.senorityLevel}<button onClick={() => {addJob(i)}}> Add </button> <br/> 
        </Fragment>
      )
    })
  }

  return (
    <Fragment>
      <h4>Showing Results for '{props.match.params.searchTerm}' in {props.match.params.location}</h4>
      <button onClick={sortByDate}>Sort by date</button>
      <button onClick={filterByDate}>Filter by date xx</button>
      <button onClick={filterBySeniorityLevel}>Filter by seniority level xx</button>
      <br/>
      {loading ? 
      ( <Fragment>Loading...</Fragment> )
        :
      ( printJobs() ) }

      {moreResultsLoading ? 
      ( <Fragment>Loading more results...</Fragment> )
        :
      ( null ) }
    </Fragment>
  )
};

export default SearchResults;