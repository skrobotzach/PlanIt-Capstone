import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import { useDispatch } from "react-redux";
import { gql, useMutation, useQuery} from "@apollo/client";
import { closeModal } from "../modalSlice";
import Select from "react-select"; 
import {GET_EMPLOYEES} from "../../../App"
import "../modals.css";

const REMOVE_EMPLOYEE = gql`
  mutation($eid: Int) {
    removeEmployee(id: $eid) {
      pk_employee_id
      first_name
    }
  }
`;


// Function used to display employees in DELETE EMPLOYEES modal's employee dropdown options
function DisplayEmployees(props) {
  const { loading, error, data } = useQuery(GET_EMPLOYEES);

  // If loading employees
  if (loading) {
    return (
      <Select
        placeholder="Loading employees...."
        closeMenuOnSelect={false}
      />
    )
  }

  // If failed to load employees
  if (error) {
    return (
      <Select
        placeholder="Failed to load employees...."
        closeMenuOnSelect={false}
      />
    );
  }
  const options = data.getEmployees.map((employee) => ({ label: employee.first_name + " " + employee.last_name, value: employee.pk_employee_id }))
  let defaultValue
  if(props.defaultEmployee === '' || props.defaultEmployee === null){
    defaultValue = []
  }else{
    defaultValue = options.filter(function(el){
      return el.value === props.defaultEmployee
    })
  }
  // After employees loaded
  return (
    <Select
      placeholder="Select an employee"
      key = {props.defaultEmployee}
      defaultValue={defaultValue}
      options={options}
      onChange={props.onEmployeeSelected}
    />
  );
}

function DeleteEmployeeForm() {
  const [validated, setValidated] = useState(false);
  const [empid, setEmpID] = useState(null);
  const [empValidate, setEmpValidate] = useState(null)
  const dispatch = useDispatch();

  function onEmployeeSelected(target) {
    setEmpID(parseInt(target.value));
  }

  const [removeEmployee] = useMutation(REMOVE_EMPLOYEE);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false || empid === null) {
      if(empid === null){
        setEmpValidate((<p style={{color:"#dc3545", fontSize:"80%"}}>Please select an employee.</p>));
      }
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      removeEmployee({
        variables: {
          eid: empid,
        },
        update: (cache) => {
          const exisitingEmployees = cache.readQuery({ query: GET_EMPLOYEES });
          const newEmployees = exisitingEmployees.getEmployees.filter(
            (e) => e.pk_employee_id !== empid
          );
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
    <div className={"form-container delete-employee"}>
      <Form
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
        className={"popup-form"}
      >
        <div className="form-title">
          <h1>Delete An Employee</h1>
        </div>
        <div className="form-main">
          <Form.Row>
            <Form.Group as={Col} md="12" controlId="validationCustom03">
              <Form.Label>EMPLOYEE</Form.Label>
              <DisplayEmployees defaultEmployee = {empid} onEmployeeSelected={onEmployeeSelected} />
              {empValidate}
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
          </Form.Row>
          <div className="buttons">
            <Button
              type="submit"
              variant="primary"
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

export {DisplayEmployees};
export default DeleteEmployeeForm;
