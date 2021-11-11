import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import { useDispatch } from "react-redux";
import { closeModal } from "../modalSlice";
import { gql, useMutation, useQuery } from "@apollo/client";
import InputGroup from "react-bootstrap/InputGroup";
import CreateableSelect from "react-select/creatable"
import "../modals.css";
import { ChromePicker } from 'react-color';
import {GET_EMPLOYEES} from '../../../App'

const CREATE_CLIENT = gql`
  mutation($cname: String!){
    createClient(cname: $cname) {
      pk_client_id
    }
  }
`;

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
      sold
    }
  }
`;

const ADD_PROJECT = gql`
  mutation($name1: String!, $color: String!, $sold1: Boolean, $cid: Int) {
    createProject(name1: $name1, color: $color, sold1: $sold1, cid: $cid) {
      pk_project_id
      fk_client_id
      name
      project_color
      sold
    }
  }
`;


function DisplayClients(props) {
  const { loading, error, data } = useQuery(GET_CLIENTS);

  // If loading clients
  if (loading) {
    return (
      <CreateableSelect
        placeholder="Loading clients...."
        closeMenuOnSelect={false}
      />
    )
  }

  // If failed to load clients
  if (error) {
    return (
      <CreateableSelect
        placeholder="Failed to load clients...."
        closeMenuOnSelect={false}
      />
    );
  }

  // After clients loaded
  return (
    <CreateableSelect
      isClearable
      placeholder="Select an clients"
      options={data.getClients.map((client) => ({ label: client.name, value: client.pk_client_id, key: client.pk_client_id }))}
      onChange={props.onClientSelected}
      onCreateOption={props.onClientCreated}
    />
  );
}



function AddProjectForm() {
  const [validated, setValidated] = useState(false);
  const dispatch = useDispatch();
  const [clientid, setClientid] = useState(null);
  const [sold, setSold] = useState(false);
  const [color, setColor] = useState('#ff0000');
  const [project, setProject] = useState(null)
  const [clientValidate, setClientValidate] = useState(null)
  function onClientSelected( target ) {
    if (target == null) {
      return;
    }
    if (target.value !== null){
      setClientid(target.value);
      console.log(target.value)
    }
  }
  async function onClientCreated(target) {
    try{
      const {data} = await createClient({
        variables: {
          cname: target
        },
        update: (cache, { data: {createClient }}) => {
          const exisitingClients = cache.readQuery({ query: GET_CLIENTS });
          const newClients = [
            ...exisitingClients.getClients,
            createClient,
          ];
          cache.writeQuery({
            query: GET_CLIENTS,
            data: { getClients: newClients}
          })
        }
      })
      setClientid(data.createClient.pk_client_id);
    }
    catch(e){
      console.log(e)
    }
    
  }

  const [createClient] = useMutation(CREATE_CLIENT);

  function checkClicked({target}){
    setSold(!sold);
  }

  const [createProject] = useMutation(ADD_PROJECT);
  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false || clientid === null) {
      if(clientid === null){
        setClientValidate((<p style={{color:"#dc3545", fontSize:"80%"}}>Please select a client.</p>));
      }
      event.preventDefault();
      event.stopPropagation();
    }else{
      event.preventDefault();

    // The last form element had its id as validationCustom04. I changed it to 05.
    createProject({
      variables: {
        name1: project,
        color: String(color),
        sold1: sold,
        cid: parseInt(clientid)
      },
      update: (cache, { data: {createProject }}) => {
        const exisitingProjects = cache.readQuery({ query: GET_PROJECTS });
        const newProjects = [
          ...exisitingProjects.getProjects,
          createProject,
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
    setValidated(true);

    
  };

  return (
    <div className={"form-container add-project"}>
      <Form
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
        className={"popup-form"}
      >
        <div className="form-title">
          <h1>Add A Project</h1>
        </div>
        <div className="form-main">
          <Form.Row>

            <Form.Group as={Col} md="6" controlId="validationCustom01">
              <Form.Label>PROJECT NAME</Form.Label>
              <Form.Control required type="text" placeholder="Project name" onChange={(e) => setProject(e.target.value)}/>
              <Form.Control.Feedback type="invalid">
                Please provide a valid project name.
              </Form.Control.Feedback>
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>

            <Form.Group as={Col} md="6" controlId="validationCustom02">
              <Form.Label>CLIENT</Form.Label>
              <DisplayClients onClientSelected= {onClientSelected} onClientCreated={onClientCreated}/>
              {clientValidate}
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>

            
            
          </Form.Row>

          <Form.Row>

            <Form.Group as={Col} md="6" controlId="validationCustom03">
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

            <Form.Group as={Col} md="4" controlId="validationCustom04">
              <Form.Label></Form.Label>
              <Form.Check type="checkbox" label="PROJECT SOLD"
              onChange={checkClicked}>

              </Form.Check>
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

export { DisplayClients };
export {CREATE_CLIENT};
export default AddProjectForm;

