import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import { useDispatch } from "react-redux";
import { closeModal } from "../modalSlice";
import { gql, useMutation, useQuery } from "@apollo/client";
import {GET_EMPLOYEES} from "../../../App"
import Select from "react-select"
import "../modals.css";

// Mutation to add an employee
const ADD_EMPLOYEE = gql`
  mutation($fname: String!, $lname: String!, $office: Int, $slackid: String!) {
    createEmployee(fname: $fname, lname: $lname, office1: $office, slackid: $slackid) {
      pk_employee_id
      first_name
    }
  }
`;


// Query to get offices
const GET_OFFICES = gql`
  query {
    getOffices {
      pk_office_id
      name
    }
  }
`;

// Function used to display offices in ADDEMPLOYEES modal's offices dropdown options
function DisplayOffices(props) {
  const { loading, error, data } = useQuery(GET_OFFICES);

   // If loading offices
   if (loading) {
    return (
      <Select
        placeholder="Loading offices...."
        closeMenuOnSelect={false}
      />
    )
  }

  // If failed to load offices
  if (error) {
    return (
      <Select
        placeholder="Failed to load offices...."
        closeMenuOnSelect={false}
      />
    );
  }

  // After offices loaded
  return (
    <Select
      placeholder="Select an office"
      options={data.getOffices.map((office) => ({ label: office.name, value: office.pk_office_id, key: office.pk_office_id }))}
      onChange={props.onOfficeSelected}
    />
  );
}

// The main Component of  AddEmployeeModal
function AddEmployeeForm() {
  // Initialize states used to track user's input
  const [validated, setValidated] = useState(false);
  const [firstname, setFirstname] = useState(null);
  const [slackId, setSlackId] = useState(null);
  const [lastname, setLastname] = useState(null);
  const [office, setOffice] = useState(null);
  const [officeError, setOfficeError] = useState(null)
  const dispatch = useDispatch();
  // Function as a parameter passed to DisplayOffices() function
  // Change Office state to option value selected
  function onOfficeSelected(selections) {
    setOffice(selections.value);
  }

  

  // Initialize creatEmployee used to call ADD_EMPLOYEE mutation
  const [createEmployee] = useMutation(ADD_EMPLOYEE);

  // Submit handle
  const handleSubmit = (event) => {
    const form = event.currentTarget;

    if (form.checkValidity() === false || office === null) {
      if(office === null){
        setOfficeError((<p style={{color:"#dc3545", fontSize:"80%"}}>Please select an office.</p>));
      }
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();

      createEmployee({
        variables: {
          fname: firstname,
          lname: lastname,
          office: parseInt(office),
          slackid: slackId,
        },
        update: (cache, { data: { createEmployee } }) => {
          const exisitingEmployees = cache.readQuery({ query: GET_EMPLOYEES });
          const newEmployees = [
            ...exisitingEmployees.getEmployees,
            createEmployee,
          ];
          cache.writeQuery({
            query: GET_EMPLOYEES,
            data: { getEmployees: newEmployees },
          });
        },
        refetchQueries: [{query:GET_EMPLOYEES}]
      });
      dispatch(closeModal());
    }
    setValidated(true);
  };

  return (
    <div className={"form-container add-employee"}>
      <Form
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
        className={"popup-form"}
      >
        <div className="form-title">
          <h1>Add An Employee</h1>
        </div>
        <div className="form-main">
          <Form.Row>
            <Form.Group as={Col} md="6" controlId="validationCustom01">
              <Form.Label>FIRST NAME</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="First name"
                onChange={(e) => setFirstname(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid first name.
              </Form.Control.Feedback>
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="validationCustom02">
              <Form.Label>LAST NAME</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Last name"
                onChange={(e) => setLastname(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid last name.
              </Form.Control.Feedback>
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} md="6" controlId="validationCustom03">
              <Form.Label>OFFICE</Form.Label>
              <DisplayOffices onOfficeSelected={onOfficeSelected} />
              {officeError}
            </Form.Group>
            <Form.Group as={Col} md="6" controlId="validationCustom04">
              <Form.Label>SLACK USERNAME</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="Slack username"
                onChange={(e) => setSlackId(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid slack username.
              </Form.Control.Feedback>
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Form.Row>
          <div className="buttons">
            <Button
              type="submit"
              variant="primary"
              className="mx-3 button-submit"
            >
              Submit
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

export {DisplayOffices};
// export default graphql(GET_EMPLOYEES)(AddEmployeeForm)
export default AddEmployeeForm;
