/* Node.JS entrypoint */
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const DataLoader = require('dataloader');
const path = require('path');
require('dotenv').config();


const typeDefs = require('./schema');
var db = require('./db.js');

const PORT = process.env.PORT || 5000;


// The root provides a resolver function for each API endpoint
const resolvers = {
	Query: {
		removeAllEmployees: () => {
			return db('employees').del();
		},
		removeAllTasks: () => {
			return db('tasks').del();
		},
		removeAllClients: () => {
			return db('clients').del();
		},
		removeAllProjects: () => {
			return db('jobs').del();
		},
		getEmployees: async (_, {offices, people}) => {
			if (offices && people){
				return await db('employees').select("*").whereIn("pk_employee_id", people).orWhereIn( "fk_office_id", offices).orderBy("last_name").where({active: "true"})
			}
			else if (offices){
				return await db('employees').select("*").whereIn("fk_office_id", offices).orderBy("last_name").where({active: "true"})
			}
			else if (people){
				return await db('employees').select("*").whereIn("pk_employee_id", people).orderBy("last_name").where({active: "true"})
			}
			else{
				return await db('employees').select("*").orderBy("last_name").where({active: "true"})
			}
			
		},
		getProjects: async () => {
			return await db('jobs').select("*").orderBy("name").where({active: "true"})
		},
		getClients: async () => {
			return await db('clients').select("*").orderBy("name").where({active: "true"})
		},
		getTasks: async () => {
			return await db('tasks').select("*")
		},
		getOffices: async () => {
			return await db('offices').select("*")
		},
		getEmployeeID: async (_, { fname, lname }) => {
			const lst = await db('employees').where({first_name: fname, last_name: lname}).select("pk_employee_id")
			return lst[0]["pk_employee_id"]
		},
		getProjectID: async (_, { name1 }) => {
			const lst = await db('jobs').where({name: name1}).select("pk_project_id")
			return lst[0]["pk_project_id"]
		},
		getClientID: async (_, { name1}) => {
			const lst = await db('employees').where({name: name1}).select("pk_client_id")
			return lst[0]["pk_client_id"]
		}
	},
	Mutation: {
		createClient: async (_, { cname }) => {
			const lst = await db('clients').returning("*").insert({ name: cname})
			return lst[0]
		},

		// Updated to return an employee object --- Shengtong Jin 
		createEmployee: async (_, { fname, lname, office1, slackid }) => {
			const lst = await db('employees').insert({  first_name: fname, last_name: lname, fk_office_id: office1, slack_userid: slackid}).returning('*')
			return lst[0]
		},

		createTask: async (_, { eid, pid, sdate, edate, hrs }) => {
			const lst = await db('tasks').returning("*").insert({ fk_employee_id: eid, fk_project_id: pid, start_date: sdate, end_date: edate, hours: hrs })
			return lst[0]
		},
		createProject: async (_, { name1, color, sold1, cid }) => {
			const lst = await db('jobs').returning("*").insert({ name: name1, project_color: color, sold: sold1, fk_client_id: cid })
			return lst[0]
		},
		editClient: async (_, { id, cname, active1 }) => {
			const lst = await db('clients').returning("*").where({ pk_client_id: id }).udpate({ name: cname, active: active1 })
			return lst[0]
		},
		editEmployee: async (_, { id, fname, lname, office1, slackid }) => {
			const lst = await db('employees').returning("*").where({ pk_employee_id: id }).update({ first_name: fname, last_name: lname, fk_office_id: office1, slack_userid: slackid})
			return lst[0]
		},
		// editTask: async (_, { eid, pid, sdate, edate, hrs, rid }) => {
      // const lst = await db('tasks').returning("*").where({ fk_employee_id: eid, fk_project_id: pid, start_date: sdate, end_date: edate }).update({ fk_employee_id: eid, fk_project_id: pid, start_date: sdate, end_date: edate, hours: hrs, role_id: rid })
    	editTask: async (_, { eid, pid, sdate, edate, newsdate, newedate, hrs}) => {
     		const lst = await db('tasks').returning("*").update({ fk_employee_id: eid, fk_project_id: pid, start_date: newsdate, end_date: newedate, hours: hrs}).where({ fk_employee_id: eid, fk_project_id: pid, start_date: sdate, end_date: edate })
			return lst[0]
		},
		editProject: async (_, { id, name1, color, sold1, cid }) => {
			const lst = await db('jobs').returning("*").where({ pk_project_id: id }).update({name: name1, project_color: color, sold: sold1, fk_client_id: cid })
			return lst[0]
		},
		removeClient: async (_, { id }) => {
			const lst = await db('clients').returning("*").where({ pk_client_id: id }).update({active: "false"})
			return lst[0]
		},
		removeEmployee: async (_, { id }) => {
			await db('tasks').where({fk_employee_id: id}).del();
			const lst = await db('employees').where({ pk_employee_id: id }).update({active: "false"})
			return lst[0]
		},
		removeTask: async (_, { eid, pid, sdate, edate }) => {
			const lst = await db('tasks').where({ fk_employee_id: eid, fk_project_id: pid, start_date: sdate, end_date: edate }).returning("*").del()
			return lst[0]
		},
		removeProject: async (_, { id }) => {
			await db('tasks').where({fk_project_id: id}).del();
			const lst = await db('jobs').returning("*").where({ pk_project_id: id }).update({active: "false"})
			return lst[0]
		},
	},
	Employee: {
		tasks: async (parent, _, ctx) => {
			return ctx.taskLoader.load(parent.pk_employee_id);
		},
		office: async (parent, _, ctx) => {
			return ctx.officeLoader.load(parent.fk_office_id);
		},
	},
	Task: {
		project: async (parent, _, ctx) => {
			return ctx.projectLoader.load(parent.fk_project_id);
		},
	},
	Project: {
		client: async (parent, _, ctx) => {
			return ctx.clientLoader.load(parent.fk_client_id);
		}
	}

};

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: () => {
		return {
			taskLoader: new DataLoader(async keys => {
				const tasks = await db('tasks').select("*").whereIn("fk_employee_id", keys).orderBy("hours", "desc").orderBy("start_date", "asc");

				const tasksMap = new Map();
				tasks.forEach(task => {
					if (tasksMap.has(task.fk_employee_id)) {
            tasksMap.get(task.fk_employee_id).push(task)
						// tasksMap[task.fk_employee_id].push(task)
					}
					else {
            // tasksMap[task.fk_employee_id] = [task]
            tasksMap.set(task.fk_employee_id,[task])
					}
				});
				return keys.map(key => tasksMap.get(key));
			}),
			projectLoader: new DataLoader(async keys => {
				const projects = await db('jobs').select("*").whereIn("pk_project_id", keys);

				const projectsMap = new Map();
				projects.forEach(project => {
					projectsMap[project.pk_project_id] = project
				});
				return keys.map(key => projectsMap[key]);
			}),
			clientLoader: new DataLoader(async keys => {
				const clients = await db('clients').select("*").whereIn("pk_client_id", keys);

				const clientsMap = new Map();
				clients.forEach(client => {
					clientsMap[client.pk_client_id] = client
				});
				return keys.map(key => clientsMap[key]);
			}),
			officeLoader: new DataLoader(async keys => {
				const offices = await db('offices').select("*").whereIn("pk_office_id", keys);

				const officesMap = new Map();
				offices.forEach(office => {
					officesMap[office.pk_office_id] = office
				});
				return keys.map(key => officesMap[key]);
			})
		};
	}
});

const app = express();

server.applyMiddleware({ app })
if (process.env.NODE_ENV === "production") {
	// serve static content
	// npm run build
	app.use(express.static(path.join(__dirname, "client/build")))
}

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "client/build/index.html"));
})

app.listen(PORT, () => console.log(`Running a GraphQL API server at http://localhost:${PORT}${server.graphqlPath}`));
