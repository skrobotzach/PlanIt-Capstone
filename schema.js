/* Blueprint for our data to enforce data structure
Used by Apollo server */
const { gql } = require('apollo-server-express');

const typeDefs = gql`
	# Schema goes here
	type Query {
		removeAllEmployees: String
		removeAllClients: String
		removeAllProjects: String
		removeAllTasks: String
		getTasks: [Task]
		getEmployees(offices: [Int], people: [Int]): [Employee]
		getProjects: [Project]
		getOffices:[Office]
		getClients: [Client]
		getEmployeeID(fname: String!, lname: String!): Int
		getClientID(name1: String!): Int
		getProjectID(name1: String): Int
	}

	type Mutation {
		createClient(cname: String): Client
		createEmployee(fname: String!, lname: String!, office1: Int, slackid: String!): Employee
		createTask(eid: Int, pid: Int, sdate: String, edate: String, hrs: Int): Task
		createProject(name1: String, color: String, sold1: Boolean, cid: Int): Project
		editClient(id: Int, cname: String, active1: Boolean): Client
		editEmployee(id: Int, fname: String!, lname: String!, office1: Int, slackid: String!): Employee
		editTask(eid: Int, pid: Int, sdate: String, edate: String, newsdate: String, newedate: String, hrs: Int): Task
		editProject(id: Int, name1: String, color: String, sold1: Boolean, cid: Int): Project
		removeClient(id: Int): Client
		removeEmployee(id: Int): Employee
		removeTask(eid: Int, pid: Int, sdate: String, edate: String): Task
		removeProject(id: Int): Project
	}

	type Employee {
		pk_employee_id: Int!
		first_name: String!
		last_name: String!
		slack_userid: String
		fk_office_id: Int
		office: Office
		tasks: [Task]
	}

	type Task {
		project: Project
		start_date: String
		end_date: String
		hours: Int
		fk_project_id: Int
		fk_employee_id: Int
	}

	type Project {
		pk_project_id: Int!
		fk_client_id: Int
		client: Client
		name: String
		project_color: String
		sold: Boolean
	}

	type Client {
		pk_client_id: Int!
		name: String!
		active: Boolean
	}


	 type Office {
		pk_office_id: Int
		name: String
	}
`;

module.exports = typeDefs



