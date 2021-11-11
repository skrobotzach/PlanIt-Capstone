import { RTMClient } from '@slack/rtm-api'
import { SLACK_OATH_TOKEN, BOT_CHANNEL } from './constants'
import { WebClient } from '@slack/web-api'
const fetch = require('node-fetch')

const rtm = new RTMClient(SLACK_OATH_TOKEN);
const web = new WebClient(SLACK_OATH_TOKEN);

rtm.start()
	.catch(console.error);

rtm.on("ready", async () => {
	console.log('PlanIt bot started')
	sendMessage(BOT_CHANNEL, 'PlanIt bot is online')
});

rtm.on('slack_event', async (eventType, event) => {
	const debug = true
	if (debug === false) {
		console.log(eventType)
		console.log(event)
	}

	if (event && event.type === 'message') {
		const message = event.text.split(" ")

		const getEmployeesQuery = `{getEmployees {
			first_name
			last_name
			slack_userid
			tasks {
				start_date
				end_date
				hours
				project {
					name
			} } } }`;

		const options = {
			method: "post",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				query: getEmployeesQuery
			})
		}

		const getCurMonday = () => {
			var today = new Date()
			while (today.getDay() !== 1) {
				today.setDate(today.getDate() - 1);
			}
			today = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)
			// var date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
			return today;
		}

		const getFollowingMonday = (cur, m) => {
			cur.setDate(cur.getDate() + 7 * m)
			return cur
		}

		const doProject = ({ data }) => {
			console.log(message)
			let first = []
			let last = []
			let hours = []
			data.getEmployees.forEach(employee => {
				let flag = false
				let h = 0
				employee.tasks.forEach(task => {//projects.push(employee.tasks.project.name)
					if (task.project.name == message[2]) {
						flag = true
						h = task.hours
					}
				})
				if (flag) {
					first.push(employee.first_name)
					last.push(employee.last_name)
					hours.push(h)
				}
			})
			console.log(first, last, hours)
			if (hours.length === 0) {
				sendMessage(event.channel, 'This project does not exist')
			}
			else {
				let tasks = ""
				for (let i = 0; i < hours.length; i++) {
					tasks = tasks.concat(first[i], " ", last[i], " is assigned to ", hours[i].toString(), " hours\n")
				}
				console.log(tasks)
				sendMessage(event.channel,
					`This week the following people are working on the ${message[2]} project \n${tasks}`)
			}
		}

		const doPerson = ({ data }) => {
			console.log(message)
			let projects = []
			let hours = []
			let employeeFirst = ""
			let employeeLast = ""
			data.getEmployees.forEach(employee => {
				console.log(employee.first_name == message[2], employee.last_name == message[3], employee.first_name, message[2], employee.last_name, message[3])
				if (employee.first_name == message[2] && employee.last_name == message[3]) {
					employee.tasks.forEach(task => {
						hours.push(task.hours)
						projects.push(task.project.name)
					})
					employeeFirst = employee.first_name
					employeeLast = employee.last_name
				}

			})
			if (hours.length === 0) {
				sendMessage(event.channel, 'This person does not exist as an employee')
			}
			else {
				let tasks = ""
				for (let i = 0; i < hours.length; i++) {
					tasks = tasks.concat(projects[i], " for ", hours[i].toString(), " hours\n")
				}
				console.log(tasks)

				sendMessage(event.channel,
					`This week ${employeeFirst} ${employeeLast} is working on \n${tasks}`)
			}
		}

		const doPersonSlack = ({ data }) => {
			console.log(message)
			let projects = []
			let hours = []
			let slackID = message[2].slice(2, -1)
			console.log(slackID)
			let employeeFirst = ""
			let employeeLast = ""
			data.getEmployees.forEach(employee => {
				console.log(employee.first_name == message[2], employee.last_name == message[3], employee.first_name, message[2], employee.last_name, message[3])
				if (employee.slack_userid == slackID) {
					console.log("HERRRRE")
					employee.tasks.forEach(task => {
						hours.push(task.hours)
						projects.push(task.project.name)
					})
					employeeFirst = employee.first_name
					employeeLast = employee.last_name
				}

			})
			// If person has no tasks
			if (hours.length === 0) {
				sendMessage(event.channel, 'This person does not exist as an employee or does not have any tasks assigned to them')
			}
			else {
				let tasks = ""
				for (let i = 0; i < hours.length; i++) {
					tasks = tasks.concat(projects[i], " for ", hours[i].toString(), " hours\n")
				}
				console.log(tasks)

				sendMessage(event.channel,
					`This week ${employeeFirst} ${employeeLast} is working on \n${tasks}`)
			}
		}

		const doTimeline = ({ data }) => {
			console.log(message)
			let employeeFirst = ""
			let employeeLast = ""
			let tasks = "For the next month this employee is working on:"
			data.getEmployees.forEach(employee => {
				console.log(employee.first_name == message[2], employee.last_name == message[3], employee.first_name, message[2], employee.last_name, message[3])
				if (employee.first_name == message[2] && employee.last_name == message[3]) {
					for (let i = 1; i < 5; i++) {
						let m = getCurMonday()
						let projects = []
						let hours = []
						let monday = getFollowingMonday(m, i)
						employee.tasks.forEach(task => {
							if (task.start_date <= monday && task.end_date >= monday) {
								hours.push(task.hours)
								projects.push(task.project.name)
							}
						})
						tasks += monday + '\n'
						for (let i = 0; i < hours.length; i++) {
							tasks = tasks.concat(projects[i], " for ", hours[i].toString(), " hours\n")
						}
						tasks += '\n'
					}

					employeeFirst = employee.first_name
					employeeLast = employee.last_name
				}

			})
			if (hours.length === 0) {
				sendMessage(event.channel, 'This person does not exist as an employee')
			}
			else {
				sendMessage(event.channel,
					`${tasks}`)
			}

			if (message[0] == '\\pi') {
				console.log(message)
				if (message.length == 1 || (message.length == 2 && (message[1] == '-h' || message[1] == 'help'))) {
					helpMessage(event.channel)
				}
				else if (message.length == 3 && message[1] == 'project') {
					fetch(`http://localhost:5000/graphql`, options)
						.then(res => res.json())
						.then(doProject)
				}
				else if (message.length == 4 && message[1] == 'person') {
					fetch(`http://localhost:5000/graphql`, options)
						.then(res => res.json())
						.then(doPerson)
				}
				else if (message.length == 3 && message[1] == 'person') {
					fetch(`http://localhost:5000/graphql`, options)
						.then(res => res.json())
						.then(doPersonSlack)
				}
				else if (message[1] == 'timeline') {
					fetch(`http://localhost:5000/graphql`, options)
						.then(res => res.json())
						.then(doTimeline)
				}
			}
		}
	});


function helpMessage(channelId) {
	sendMessage(channelId,
		`PlanIt bot guide!
		Use the PlanIt Capacity Planning Tool from the comfort of Slack
		Usage: !pi [OPERATION] [...OPERATION_PARAMS]
		
		Operations:
			-h, help
			* Display the PlanIt bot usage guide 

			person [FIRST_NAME] [LAST_NAME]
			* Find out what projects someone has scheduled this week

			project [PROJECT_NAME]
			* Find out who is working on a certain project this week

			timeline [FIRST_NAME] [LAST_NAME]
			* Find out what projects someone has schedule this month
		`)
}

async function sendMessage(channel, message) {
	await web.chat.postMessage({
		channel: channel,
		text: message,
	});
}