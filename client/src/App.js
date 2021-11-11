import React from "react";
import "./App.css";
import Topnav from "./features/topnav/topnav";
import Filters from "./features/filters/filters";
import Modal from "./features/modals/modal";
import Chart from "./features/chart/chart";
import { gql, useQuery } from "@apollo/client";
import Alert from 'react-bootstrap/Alert'

// import Filter from './features/filters/filters'
// Query to get employees
const GET_EMPLOYEES = gql`
  query($offices: [Int], $people: [Int]) {
    getEmployees(offices: $offices, people: $people) {
      pk_employee_id
      first_name
      last_name
      fk_office_id
      slack_userid
      tasks {
        start_date
        end_date
        hours
        fk_project_id
        project {
          pk_project_id
          name
          project_color
          sold
        }
      }
    }
  }
`;

const GET_OFFICES = gql`
  query {
    getOffices {
      pk_office_id
      name
    }
  }
`;

const GET_PROJECTS = gql`
  query {
    getProjects {
      pk_project_id
      name
      sold
      project_color
      client {
        name
      }
    }
  }
`;

function App() {
  const {loading, error} = useQuery(GET_EMPLOYEES);
  const { loading: loadingO} = useQuery(GET_OFFICES)
  const { loading: loadingP} = useQuery(GET_PROJECTS)
  



  // initialize redux state filter.employees by store a list of all employees object
  // const dispatch = useDispatch();




  if (loading || loadingO || loadingP) {
    return (
      <div className="App">
        <Topnav />
        {/* <Filters /> */}

        {/* loading animation */}
        <div className="spinner">
          <div className="rect1"></div>
          <div className="rect2"></div>
          <div className="rect3"></div>
          <div className="rect4"></div>
          <div className="rect5"></div>
        </div>
      </div>
    );
    }
  if(error) {
    return (
      <div className="App">
        <Alert variant="danger" >
      <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
      <p>
        Make sure you have internet connection and server is running. 
      </p>
      </Alert>
      </div>
    )
  }

  // const employees = [...data.getEmployees]
  // dispatch(updateEmployees([...employees]));
  return (
    <div className="App">
      <Topnav />
      <Filters />
      <Chart />
      <Modal />
    </div>
    )
  }


export { GET_EMPLOYEES, GET_PROJECTS, GET_OFFICES};
export default App;
