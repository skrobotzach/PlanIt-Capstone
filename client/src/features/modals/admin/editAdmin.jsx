import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import { useDispatch } from "react-redux";
import { closeModal } from "../modalSlice";
import { gql, useMutation, useQuery } from "@apollo/client";
import Select from "react-select"
import "../modals.css";
import { GET_EMPLOYEES } from "../../../App"
import Picker from 'emoji-picker-react';


// Mutation to add an employee
const EDIT_EMPLOYEE = gql`
  mutation($id: Int, $fname: String!, $lname: String!, $office: Int) {
    editEmployee(id: $id, fname: $fname, lname: $lname, office1: $office) {
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
	const options = data.getOffices.map((office) => ({ label: office.name, value: office.pk_office_id }))
	let defaultValue
	if (props.defaultOffice === '') {
		defaultValue = []
	} else {
		defaultValue = options.filter(function (el) {
			return el.value === props.defaultOffice
		})
	}

	return (
		<Select
			key={props.defaultOffice}
			placeholder="Select an office"
			defaultValue={defaultValue}
			options={options}
			onChange={props.onOfficeSelected}
			required
		/>
	);
}



// The main Component of  AddEmployeeModal
function EditAdminForm() {
	// Initialize states used to track user's input
	const [validated, setValidated] = useState(false);
	const [firstname, setFirstname] = useState('');
	const [lastname, setLastname] = useState('');
	const [office, setOffice] = useState('');
	const [empid, setEmpid] = useState(null);
	const [chosenEmoji, setChosenEmoji] = useState(null);
	const dispatch = useDispatch();

	// Function as a parameter passed to DisplayOffices() function
	// Change Office state to option value selected
	function onOfficeSelected(target) {
		setOffice(target.value);
	}

	function onEmployeeSelected(employee) {
		setEmpid(parseInt(employee.pk_employee_id));
		setLastname(employee.last_name)
		setFirstname(employee.first_name)
		setOffice(employee.fk_office_id)
	}

	const onEmojiClick = (event, emojiObject) => {
		setChosenEmoji(emojiObject);
	};
	// Initialize creatEmployee used to call ADD_EMPLOYEE mutation
	const [editEmployee] = useMutation(EDIT_EMPLOYEE);

	// Submit handle
	const handleSubmit = (event) => {
		const form = event.currentTarget;
		if (form.checkValidity() === false) {
			event.preventDefault();
			event.stopPropagation();
		} else {
			console.log(empid)
			event.preventDefault();
			// editEmployee({
			// 	variables: {
			// 		id: empid,
			// 		fname: firstname,
			// 		lname: lastname,
			// 		office: parseInt(office),
			// 	},
			// 	update: (cache, { data: { editEmployee } }) => {
			// 		const exisitingEmployees = cache.readQuery({ query: GET_EMPLOYEES });
			// 		const newEmployees = [
			// 			...exisitingEmployees.getEmployees,
			// 			editEmployee,
			// 		];
			// 		cache.writeQuery({
			// 			query: GET_EMPLOYEES,
			// 			data: { getEmployees: newEmployees },
			// 		});
			// 	},
			// 	refetchQueries: [{ query: GET_EMPLOYEES }]
			// });
			dispatch(closeModal());
		}
		setValidated(true);
	};

	return (
		<div className={"form-container edit-admin"}>
			<Form
				noValidate
				validated={validated}
				onSubmit={handleSubmit}
				className={"popup-form"}
			>
				<div className="form-title">
					<h1>Admin</h1>
				</div>
				<div className="form-main">
					<Form.Row>
						<Form.Group as={Col} md="12" controlId="validationCustom03">
							<Form.Label>OFFICE</Form.Label>
							<DisplayOffices onOfficeSelected={onOfficeSelected} defaultOffice={office} />
							<Form.Control.Feedback type="invalid">
								Please select an office.
              </Form.Control.Feedback>
						</Form.Group>
					</Form.Row>

					<Form.Row>
						<div className="form-emoji">
							{chosenEmoji ? (
								<span>You chose: {chosenEmoji.emoji}</span>
							) : (
								<span>No emoji Chosen</span>
							)}
							<Picker onEmojiClick={onEmojiClick} />
						</div>
					</Form.Row>

					<Form.Row>
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
					</Form.Row>
				</div>
			</Form>
		</div>
	);
}



export default EditAdminForm
