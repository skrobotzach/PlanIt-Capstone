import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import { useDispatch } from "react-redux";
import { closeModal } from "../modalSlice";
import { gql, useMutation, useQuery } from "@apollo/client";
import InputGroup from "react-bootstrap/InputGroup";
import "../modals.css";
import { ChromePicker} from 'react-color';
import { GET_EMPLOYEES } from "../../../App";
import Select from "react-select"
import {client } from "../../../index"


// Query to get offices
const GET_CLIENTS = gql`
  query {
    getClients {
      pk_client_id
      name
    }
  }
`;

const GET_PROJECTS = gql`
  query {
    getProjects {
      pk_project_id
      name
      fk_client_id
      sold
      project_color
    }
  }
`;

const EDIT_PROJECT = gql`
  mutation($id: Int, $name1: String!, $color: String!, $sold1: Boolean, $cid: Int) {
    editProject(id: $id, name1: $name1, color: $color, sold1: $sold1, cid: $cid) {
      pk_project_id
      fk_client_id
      name
      project_color
      sold
    }
  }
`;
var metaEmployees;
function MetaData(props) {
  var employeeNames;
  var header;
  if (props.employees == null) {
    employeeNames = []
    header = ""
  } else {
    employeeNames = []
    header = "Employees"
    props.employees.forEach(employee => {
      console.log(employee)
      var name = (<div>{employee.first_name + " " + employee.last_name}</div>);
      employeeNames.push(name)
    })
  }
  
  return (
    <div>
      <h6>{header}</h6>
      {employeeNames}
    </div>
  )
}

function DisplayProjects(props) {
  const { loading, error, data } = useQuery(GET_PROJECTS);
  const employees = client.readQuery({query:GET_EMPLOYEES}).getEmployees;
  
  metaEmployees = null;
  function onProjectSelected(target){
    const projectSelected = data.getProjects.find(project => project.pk_project_id === target.value)
    metaEmployees = employees.filter(employee => employee.tasks.find(task => task.project.pk_project_id === target.value))
    props.onProjectSelected(projectSelected)
  }
  // If loading projects
  if (loading) {
    return (
      <Select
        placeholder="Loading projects...."
        closeMenuOnSelect={false}
      />
    )
  }

  // If failed to load projects
  if (error) {
    return (
      <Select
        placeholder="Failed to load projects...."
        closeMenuOnSelect={false}
      />
    );
  }

  // After projects loaded
  return (
    <Select
      placeholder="Select an project"
      options={data.getProjects.map((project) => ({ label: project.name, value: project.pk_project_id }))}
      onChange={onProjectSelected}
    />
  );
}

function DisplayClients(props) {
  const { loading, error, data } = useQuery(GET_CLIENTS);

  // If loading clients
  if (loading) {
    return (
      <Select
        placeholder="Loading clients...."
        closeMenuOnSelect={false}
      />
    )
  }

  // If failed to load clients
  if (error) {
    return (
      <Select
        placeholder="Failed to load clients...."
        closeMenuOnSelect={false}
      />
    );
  }

  const options = data.getClients.map((client) => ({ label: client.name, value: client.pk_client_id, key: client.pk_client_id }));
  let defaultValue
  if(props.defaultClient === ''){
    defaultValue = []
  }
  else{
    defaultValue = options.filter(function(el){
      return el.value === props.defaultClient
    })
  }
  // After clients loaded
  return (
    <Select
      isClearable
      key={defaultValue}
      defaultValue={defaultValue}
      placeholder="Select an clients"
      options={options}
      onChange={props.onClientSelected}
      required
    />
  );
}

function EditProjectForm() {
  const dispatch = useDispatch();
  const [validated, setValidated] = useState(false);
  const [clientid, setClientid] = useState('');
  const [sold, setSold] = useState(false);
  const [color, setColor] = useState('#ff0000');
  const [projectid, setProjectId] = useState(null);
  const [projectname, setProjectName] = useState(null);
  const [clientValidate, setClientValidate] = useState(null)
  const [projValidate, setProjValidate] = useState(null)

  function onClientSelected(target) {
    if (target == null) {
      return;
    }
    if(target.value !== null && target.value !== undefined)
    setClientid(target.value);
  }

  function onProjectSelected(project) {
    setProjectId(project.pk_project_id);
    setProjectName(project.name);
    setClientid(project.fk_client_id)
    setColor(project.project_color)
    setSold(project.sold)
  }


  function checkClicked({target}){
    setSold(!sold);
  }

  const [editProject] = useMutation(EDIT_PROJECT);
  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false || !projectid || clientid === '') {
      if(!projectid){
        setProjValidate((<p style={{color:"#dc3545", fontSize:"80%"}}>Please select a project.</p>));
      }
      if(clientid === ''){
        setClientValidate((<p style={{color:"#dc3545", fontSize:"80%"}}>Please select a client.</p>));
      }
      event.preventDefault();
      event.stopPropagation();
    }else{
      event.preventDefault();
    
      editProject({
        variables: {
          id: parseInt(projectid),
          name1: String(projectname),
          color: String(color),
          sold1: sold,
          cid: parseInt(clientid)
        },
        update: (cache, { data: {editProject }}) => {
          const exisitingProjects = cache.readQuery({ query: GET_PROJECTS });
          const newProjects = [
            ...exisitingProjects.getProjects,
            editProject,
          ];
          cache.writeQuery({
            query: GET_PROJECTS,
            data: { getProjects: newProjects}
          })
        },
        refetchQueries: [{query:GET_EMPLOYEES}]
      });
      dispatch(closeModal());
    }
    
    // The last form element had its id as validationCustom04. I changed it to 05.
    setValidated(true);
   
    
  };

  return (
    <div className={"form-container edit-project"}>
      <Form
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
        className={"popup-form"}
      >
        <div className="form-title">
          <h1>Edit A Project</h1>
        </div>
        <div className="form-main">
          <Form.Row>

            <Form.Group as={Col} md="6" controlId="validationCustom01">
              <Form.Label>PROJECT NAME</Form.Label>
              <DisplayProjects onProjectSelected= {onProjectSelected} />
              {projValidate}
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md="6" controlId="validationCustom02">
              <Form.Label>CLIENT</Form.Label>
              <DisplayClients onClientSelected= {onClientSelected} defaultClient = {clientid} />
              {clientValidate}
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>

            
            
          </Form.Row>

          <Form.Row>
            <Form.Group as={Col} md="6" controlId="validationCustom03">
              <Form.Label>EDIT NAME</Form.Label>
              <Form.Control
                required
                type="text"
                value = {projectname}
                placeholder = "Name"
                onChange={(e) => setProjectName(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid name.
              </Form.Control.Feedback>
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Form.Row>

          <Form.Row>

            <Form.Group as={Col} md="6" controlId="validationCustom05">
              <Form.Label>PROJECT COLOR</Form.Label>
                <InputGroup>
                  <ChromePicker 
                    color={color}
                    onChange={ (color) => {setColor(color.hex)}}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid start date.
                  </Form.Control.Feedback>
                </InputGroup>
            </Form.Group>

            <Form.Group as={Col} md="4" controlId="validationCustom06">
              <Form.Label></Form.Label>
              <Form.Check type="checkbox" label="PROJECT SOLD" checked={sold}
              onChange={checkClicked}>

              </Form.Check>
              <MetaData employees={metaEmployees} />
            </Form.Group>
          </Form.Row>

          <div className="buttons">
            <Button
              type="submit"
              variant="primary"
              className="mx-3 button-submit"
            >
              Confirm
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="mx-3 button-submit"
              onClick={() => dispatch(closeModal())}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}

export default EditProjectForm;
