const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const questions = require('./helpers/questions');
const util = require('util');

const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // TODO: Add MySQL password
      password: 'QAWGY5-fizkux-cohqiz?!',
      database: 'tracker_db',
    },
    console.log(`Connected to the tracker_db database.`)
);

// fixes errors with unhandled awaits
db.query = util.promisify(db.query);

init();

async function init() {
    const { initAction } = await inquirer.prompt(questions);
    switch (initAction) {
      case "View All Departments":
        viewDepartment();
        break;
      case "View All Roles":
        viewRole();
        break;
      case "View All Employees":
        viewEmployee();
        break;
      case "Add Department":
        addDepartment();
        break;
      case "Add Role":
        addRole();
        break;
      case "Add Employee":  
        addEmployee();
        break;
      case "Update Employee Role":
        updateRole();
        break;  
      case "Delete Employee":
        delEmployee();
        break;  
      case "Delete Department":
        delDepartment();
        break;  
      case "Quit":
          process.exit(0);
        break;
      default:
          break;   
    }
}

const viewDepartment = () => {
  const viewDept = `SELECT * FROM department`

  db.query(viewDept, (err, result) => {
    if (err) {
      console.log(err)
    }
    console.table(result);
    return init();
  })
}

const viewRole = () => {
  const viewRoles = `SELECT role.title, role.department_id AS id, department.name AS department, role.salary FROM role 
  INNER JOIN department ON role.department_id = department.id ORDER BY title ASC`

  db.query(viewRoles, (err, result) => {
    if (err) {
      console.log(err)
    }
    console.table(result)
    return init();
  });
}

const viewEmployee = () => {
  const viewEmployees = `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department
  FROM ((employee INNER JOIN role ON employee.role_id = role.id) INNER JOIN department ON role.department_id = department.id) ORDER BY department`

  db.query(viewEmployees, (err, result) => {
    if (err) {
      console.log(err)
    }
    console.table(result)
    return init();
  });
}

async function addDepartment() {
  const newDept = await inquirer.prompt({
    type: 'input',
    message: 'What department would you like to add?',
    name: 'department'
  });

  const result = newDept.department
  
  db.query(`INSERT INTO department SET ?`, {name: result}, (err, result) => {
    if (err) {
      console.log(err)
    }
    console.log('new department added!')
    return init();
  })
}

async function addRole() {
  const departments = await db.query(
    'SELECT name, id FROM department'
  )

  const newRole = await inquirer.prompt([
    {
      type: 'list',
      message: 'Which department will this role belong to?',
      name: 'location',
      // return an updated array of departments to choose from
      choices: departments.map((row) => ({name: row.name, value: row.id}))
    },
    {
      type: 'input',
      message: 'What is the name of role being added?',
      name: 'title'
    },
    {
      type: 'number',
      message: 'What is the salary of this role?',
      name: 'salary'
    }
  ]);

  db.query(`INSERT INTO role (title, salary, department_id) VALUES ('${newRole.title}', '${newRole.salary}', '${newRole.location}')`, (err, result) => {
    if (err) {
      console.log(err)
    }
    console.log('new role added!')
    return init();
  })
}

async function addEmployee() {
  const jobTitles = await db.query(
    'SELECT title, id FROM role'
  )

  const isManager = await db.query(
    'SELECT manager_name FROM managers'
  )

  const newEmployee = await inquirer.prompt([
    {
      type: 'input',
      message: 'What is your first name?',
      name: 'firstName'
    },
    {
      type: 'input',
      message: 'What is your last name?',
      name: 'lastName'
    },
    {
      type: 'list',
      message: 'What is your job title?',
      name: 'jobName',
      choices: jobTitles.map((row) => ({name: row.title, value: row.id})),
    },
    {
      type: 'list',
      message: 'Who is your manager?',
      name: 'manager',
      choices: isManager.map((row) => ({name: row.manager_name})), 
    }
  ]);

  db.query(`INSERT INTO employee SET ?`, {
    first_name: newEmployee.firstName, last_name: newEmployee.lastName, role_ID: newEmployee.jobName, manager_id: false}, (err, result) => {
    if (err) {
      console.log(err)
    }
    console.log('new employee added!')
    return init();
  }) 
}

async function updateRole() {
  const findEmployee = await db.query(
    `SELECT first_name AS firstName, last_name AS lastName, id FROM employee`
  )

  const findRoles = await db.query(
    `SELECT id, title, salary FROM role`
  )

  const assignRole = await inquirer.prompt([
    {
      type: 'list',
      message: `Which employee's role would you like to update?`,
      name: 'employee',
      choices: findEmployee.map((row) => ({name: row.firstName + " " + row.lastName, value: row.id}))
    },
    {
      type: 'list',
      message: 'Which new role would you like to assign?',
      name: 'assign',
      choices: findRoles.map((row) => ({name: row.title, value: row.id}))
    }
  ]);

  db.query(`UPDATE employee SET role_id = ${assignRole.assign} WHERE  id = ${assignRole.employee}`, (err, result) => {
    if (err) {
      console.log(err)
    }
    console.log('role updated!')
    return init();
  })
}

async function delEmployee () {
  const getEmployee = await db.query(
    `SELECT first_name AS firstName, last_name AS lastName FROM employee`
  )

  const chooseEmployee = await inquirer.prompt({
    type: 'list',
    message: 'Which employee would you like to remove?',
    name: 'employee',
    choices: getEmployee.map((row) => ({name: row.firstName + ' ' + row.lastName}))
  });

  const selectedEmployee = chooseEmployee.employee.split(" ");
    console.log(selectedEmployee);

  db.query(`DELETE FROM employee WHERE first_name = ? AND last_name = ?`, selectedEmployee, (err, result) => {
    if (err) {
      console.log(err)
    }
    console.log('employee deleted!')
    return init();
  })
}

async function delDepartment () {
  const getDepartment = await db.query(
    `SELECT name AS departments FROM department`
  )

  const chooseDepartment = await inquirer.prompt({
    type: 'list',
    message: 'Which department would you like to remove?',
    name: 'dept',
    choices: getDepartment.map((row) => ({name: row.departments}))
  });

  const rmDept = chooseDepartment.dept

  db.query(`DELETE FROM department WHERE ?`, {name: rmDept}, (err, result) => {
    if (err) {
      console.log(err)
    }
    console.log('department deleted!')
    return init();
  })
}

