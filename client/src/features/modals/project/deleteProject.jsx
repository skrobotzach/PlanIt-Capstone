import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import { useDispatch } from "react-redux";
import { closeModal } from "../modalSlice";
import { gql, useMutation, useQuery } from "@apollo/client";
import Select from "react-select";
import {GET_EMPLOYEES} from "../../../App"
import "../modals.css";

const GET_PROJECTS = gql`
  query {
    getProjects {
      pk_project_id
      name
      sold
    }
  }
`;

const REMOVE_PROJECT = gql`
  mutation($id: Int) {
    removeProject(id: $id) {
      pk_project_id
      name
    }
  }
`;
function DisplayProjects(props) {
  const { loading, error, data } = useQuery(GET_PROJECTS);

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

  const options = data.getProjects.map((project) => ({ label: project.name, value: project.pk_project_id }))
  let defaultValue
  if(props.defaultProject === '' || props.defaultProject === null){
    defaultValue = []
  }else{
    defaultValue = options.filter(function(el){
      return el.value === props.defaultProject
    })
  }

  // After projects loaded
  return (
    <Select
      key = {props.defaultProject}
      placeholder="Select an project"
      defaultValue={defaultValue}
      options={options}
      onChange={props.onProjectSelected}
    />
  );
}



function DeleteProjectForm() {
  const [validated, setValidated] = useState(false);
  const [projectid, setProjectId] = useState(null);
  const [projValidate, setProjValidate] = useState(null)
  const dispatch = useDispatch();

  function onProjectSelected(target) {
    setProjectId(parseInt(target.value));
  }

  const [removeProject] = useMutation(REMOVE_PROJECT);
  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false || projectid === null) {
      if (projectid === null){
        setProjValidate((<p style={{color:"#dc3545", fontSize:"80%"}}>Please select a project.</p>));
      }
      event.preventDefault();
      event.stopPropagation();
    }else {
      event.preventDefault();
      removeProject({
        variables: {
          id: parseInt(projectid),
        },
        update: (cache) => {
          const exisitingProjects = cache.readQuery({ query: GET_PROJECTS });
          const newProjects = exisitingProjects.getProjects.filter(
            (e) => e.pk_project_id !== projectid
          );
          cache.writeQuery({
            query: GET_PROJECTS,
            data: { getProjects: newProjects },
          });
        },
        refetchQueries: [{query:GET_EMPLOYEES}]
      });

      dispatch(closeModal());
    }

    setValidated(true);
  };

  return (
    <div className={"form-container delete-project"}>
      <Form
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
        className={"popup-form"}
      >
        <div className="form-title">
          <h1>Delete A Project</h1>
        </div>
        <div className="form-main">
          
          <Form.Row>
            <Form.Group as={Col} md="12" controlId="validationCustom01">
              <Form.Label>PROJECT NAME</Form.Label>
              <DisplayProjects onProjectSelected={onProjectSelected}/>
              {projValidate}
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Form.Row>

          <div className="buttons">
            <Button
              type="submit"
              variant="danger"
              className="mx-3 button-submit"
            >
              Delete
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

export {DisplayProjects};
export default DeleteProjectForm;
