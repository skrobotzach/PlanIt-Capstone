import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Form, Button, } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import DatePicker from "react-datepicker";
import { updateDateHeader,filterEmployees, filterOffices,filterProjects } from "../filters/filterSlice"
import "./filters.css";
import { getCurMonday } from "../chart/chart";
import { Multiselect } from 'multiselect-react-dropdown';
import { gql, useQuery } from "@apollo/client";
import Select from 'react-select';
import {GET_OFFICES,GET_EMPLOYEES} from "../../App"
import { useEffect } from "react";



// Query to get projects
const GET_PROJECTS = gql`
  query {
    getProjects {
      pk_project_id
      name
    }
  }
`;


// Function used to display offices in filter
function DisplayOffices( props) {
  const { loading, error, data } = useQuery(GET_OFFICES);

  // If loading offices
  if (loading) {
    return (
      <Multiselect
        placeholder="Loading offices......"
        displayValue="label"
        showCheckbox={true}
        closeIcon="close"
      />
    );
  }

  // If failed to load offices
  if (error) {
    return (
      <Multiselect
        placeholder="Failed to load offices..."
        displayValue="label"
        showCheckbox={true}
        closeIcon="close"
      />
    );
  }


  // After offices loaded
  return (
    <Select
      placeholder="Select an office"
      options={data.getOffices.map((office) => ({ label: office.name, value: office.pk_office_id }))}
      className="basic-multi-select"
      onChange={props.onOfficeSelected}
      isMulti
      closeMenuOnSelect={false}
    />
  );
}

// Function used to display projects in filter
function DisplayProjects(props) {
  const { loading, error, data } = useQuery(GET_PROJECTS);

  // If loading projects
  if (loading) {
    return (
      <Multiselect
        placeholder="Loading projects......"
        displayValue="label"
        showCheckbox={true}
        closeIcon="close"
      />
    );
  }

  // If failed to load projects
  if (error) {
    return (
      <Multiselect
        placeholder="Failed to load projects..."
        displayValue="label"
        showCheckbox={true}
        closeIcon="close"
      />
    );
  }

  // After projects loaded
  return (
  <Select
      placeholder="Select a project"
      className="basic-multi-select"
      // onChange={props.onEmployeeSelected}
      isMulti
      closeMenuOnSelect={false}
      onChange = {props.onProjectSelected}
      options={data.getProjects.map((project) => ({ label: project.name, value: project.pk_project_id }))}
    />
  );
}

// Function used to display team members in filter
function DisplayEmployees(props) {
  const { loading, error, data } = useQuery(GET_EMPLOYEES);

  // If loading employees
  if (loading) {
    return (
      <Multiselect
        placeholder="Loading employees......"
        displayValue="label"
        showCheckbox={true}
        closeIcon="close"
      />
    );
  }

  // If failed to load employees
  if (error) {
    return (
      <Multiselect
        placeholder="Failed to load employees..."
        displayValue="label"
        showCheckbox={true}
        closeIcon="close"
      />
    );
  }
  let employees
  if (props.offices.length === 0){
    employees = data.getEmployees
  }else{
    employees = data.getEmployees.filter(function (el) {
      return props.offices.includes(el.fk_office_id)
    });
  }

  if (props.projects.length > 0){
    employees = employees.filter(function (el){
      return props.projects.some(item => el.tasks.map(proj => proj.fk_project_id).includes(item))
    })
  }
  //console.log("employees",employees)
  //console.log("office",props.offices)

  
  const employeesByOffice = employees.map((employee) => ({ label: employee.first_name + " " + employee.last_name, value: employee.pk_employee_id }))
  // After employees loaded
  return (
    <Select
      placeholder="Select an employee"
      className="basic-multi-select"
      onChange={props.onEmployeeSelected}
      isMulti
      closeMenuOnSelect={false}
      options={employeesByOffice}
    />
  );
}

function Filters() {
  const dispatch = useDispatch();
  // Set filter start date to current Monday
  const [startDate, setStartDate] = useState(getCurMonday())
  // Set filter end date to 15 weeks ahead
  let futureMon = getCurMonday()
  futureMon.setDate((futureMon.getDate() + (7 * 14)));
  const [endDate, setEndDate] = useState(futureMon)
  const [office, setOffice] = useState([]);
  const [projectid, setProjectId] = useState([]);
  const [empid, setEmpid] = useState([]);
  //const [filterButton, setFilterButton] = useState('Hide Filters')

  // update ui when startDate or endDate changes
  useEffect(() => {handleSubmit();}, [startDate, endDate])

  const isMonday = date => {
    const day = date.getDay();
    return day === 1;
  };
  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }
    
    // the cell to be filled will change if the start date changed
    dispatch(updateDateHeader([startDate.toISOString(), endDate.toISOString()]))
    dispatch(filterEmployees(empid))
    dispatch(filterOffices(office))
    dispatch(filterProjects(projectid))
  };


  function onOfficeSelected(selections, actions) {
    if (actions.action === "remove-value" && office.length === 1){
      setOffice([])
      dispatch(filterOffices([]))
    }else{
      if (selections != null){
      setOffice(selections.map(selection=>selection.value))
      dispatch(filterOffices(selections.map(selection=>selection.value)))
      }
    }
  }

  function onProjectSelected(selections, actions) {
    if (actions.action === "remove-value" && projectid.length === 1){
      setProjectId([])
      dispatch(filterProjects([]))
    }else{
      if (selections != null){
      setProjectId(selections.map(selection=>selection.value))
      dispatch(filterProjects(selections.map(selection=>selection.value)))
      }
    }
  }

  function onEmployeeSelected(selections,actions) {
    if (actions.action === "remove-value" && empid.length === 1){
      setEmpid([])
      dispatch(filterEmployees([]))
    }else{
      if (selections != null){
      setEmpid(selections.map(selection=>selection.value))
      dispatch(filterEmployees(selections.map(selection=>selection.value)))
      }
    }
  }
/*
  function myFunction() {
    var x = document.getElementById("filter-form");
    console.log(x)
    console.log(x)
    if (x.style.display === "none") {
      x.style.display = "block";
      setFilterButton("Hide filters")
    } else {
      setFilterButton("Display filters")
      x.style.display = "none";
    }
  }
  */
  // <Button onClick={myFunction} variant="outline-primary" className='toggle-button'>{filterButton}</Button>
  // was moved to navbar
  return (
    <div className="filters">

      <form onSubmit={handleSubmit} id="filter-form">
        <div className='form-main'>
          <Form.Row>
            <Form.Group as={Col} md="2" controlId="validationCustom01" onChange={handleSubmit}>
              <Form.Label>OFFICES</Form.Label>
              <DisplayOffices onOfficeSelected={onOfficeSelected} />
              <Form.Control.Feedback type="invalid">
                Please select an office.
          </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="2" controlId="validationCustom02" onChange={handleSubmit}>
              <Form.Label>PROJECTS</Form.Label>
              <DisplayProjects onProjectSelected={onProjectSelected} />
              <Form.Control.Feedback type="invalid">
                Please select an Project.
          </Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="2" controlId="validationCustom03" onChange={handleSubmit}>
              <Form.Label>EMPLOYEES</Form.Label>
              <DisplayEmployees onEmployeeSelected={onEmployeeSelected} offices = {office} projects = {projectid}/>
              <Form.Control.Feedback type="invalid">
                Please select an Team Member.
          </Form.Control.Feedback>

            </Form.Group>

            <Form.Group as={Col} md="2" controlId="validationFormikUsername">
              <Form.Label>FROM</Form.Label>
              <InputGroup>
                <DatePicker className="form-control"
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  filterDate={isMonday}

                />
                <Form.Control.Feedback type="invalid">
                  Please provide a valid start date.
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <Form.Group as={Col} md="2" controlId="validationFormik03">
              <Form.Label>TO</Form.Label>
              <InputGroup>
                <DatePicker className="form-control"
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  filterDate={isMonday}
                />

                <Form.Control.Feedback type="invalid">
                  Please provide a valid end date.
              </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          </Form.Row>
        </div>
      </form>
    </div>
  );
}

export default Filters;
