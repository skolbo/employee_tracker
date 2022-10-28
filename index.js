const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql2");

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "P4ssw0rd",
    database: "employeetracker_db",
  },
  console.log(`Connected to the employeetracker_db database.`)
);

// main menu
function mainMenu() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
          "View all employees",
          "Add an employee",
          "Update an employee role",
          "View all roles",
          "Add a role",
          "View all departments",
          "Add a department",
          "Quit",
        ],
      },
    ])
    .then((answers) => {
      if (answers.action == "View all employees") {
        viewAllEmployees();
      } else if (answers.action == "Add an employee") {
        addEmployee();
      } else if (answers.action == "Update an employee role") {
        updateEmployee();
      } else if (answers.action == "View all roles") {
        viewAllRoles();
      } else if (answers.action == "Add a role") {
        addRole();
      } else if (answers.action == "View all departments") {
        viewAllDepartments();
      } else if (answers.action == "Add a department") {
        addDepartment();
      } else {
        quit();
      }
    });
}

const viewAllEmployees = () =>
  new Promise((resolve, reject) => {
    db.query(
      'SELECT EMP.id, EMP.first_name, EMP.last_name, ROL.title AS job_title, DEPT.name AS department, ROL.salary, CONCAT(MAN.first_Name, " ",MAN.last_name) AS manager FROM employee AS EMP JOIN role AS ROL ON EMP.role_id = ROL.id LEFT JOIN employee as MAN ON EMP.manager_id = MAN.id JOIN department AS DEPT ON ROL.department_id = DEPT.id;',
      function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(console.table(results), mainMenu());
        }
      }
    );
  });

function addEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "emp_fname",
        message: "What is the employees first name?",
      },
      {
        type: "input",
        name: "emp_lname",
        message: "What is the employees last name?",
      },
      {
        type: "input",
        name: "emp_role",
        message: "What is the employees role ID?",
      },
      {
        type: "list",
        name: "emp_manager",
        message: "Who is the employees manager? (Enter Null if no manager)",
        choices: [
          "John Doe",
          "Ashley Rodriguez",
          "Kunal Singh",
          "Sarah Lourd",
          "Null",
        ],
      },
    ])
    .then((answers) => {
      let managerId = function () {
        if (answers.emp_manager === "John Doe") {
          return 1;
        } else if (answers.emp_manager === "Ashley Rodriguez") {
          return 3;
        } else if (answers.emp_manager === "Kunal Singh") {
          return 5;
        } else if (answers.emp_manager === "Sarah Lourd") {
          return 7;
        } else if (answers.emp_manager === "Null") {
          return "Null";
        }
      };

      db.query(
        `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("${
          answers.emp_fname
        }", "${answers.emp_lname}", ${answers.emp_role}, ${managerId(
          answers.emp_manager
        )});`,
        function (err, results) {
          console.log(`\nNew employee added\n`), mainMenu();
        }
      );
    });
}

function updateEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "allEmp",
        message: "Who would you like to update? (Enter the EmployeeID)",
      },
      {
        type: "input",
        name: "newRole",
        message: "What is their new role ID?",
      },
    ])
    .then((answers) => {
      db.query(
        `UPDATE employee SET role_id = ${answers.newRole} WHERE id = ${answers.allEmp};`,
        function (err, results) {
          console.log(`\nEmployee updated!\n`), mainMenu();
        }
      );
    });
}

const viewAllRoles = () =>
  new Promise((resolve, reject) => {
    db.query(
      "SELECT RO.id AS id, RO.title AS title, DE.name AS department, RO.salary AS salary FROM role RO JOIN department DE ON RO.department_id = DE.id;",
      function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(console.table(results), mainMenu());
        }
      }
    );
  });

function addRole() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "roleName",
        message: "What is the name of the role?",
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of the role?",
      },
      {
        type: "input",
        name: "dept",
        message: "What departmentID does the role fall under?",
      },
    ])
    .then((answers) => {
      db.query(
        `INSERT INTO role (title, salary, department_id) VALUES ("${answers.roleName}", ${answers.salary}, ${answers.dept});`,
        function (err, results) {
          console.log(`\nNew role added\n`), mainMenu();
        }
      );
    });
}

const viewAllDepartments = () =>
  new Promise((resolve, reject) => {
    db.query("SELECT * FROM department;", function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(console.table(results), mainMenu());
      }
    });
  });

function addDepartment() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "deptName",
        message: "What is the name of the department?",
      },
    ])
    .then((answers) => {
      db.query(
        `INSERT INTO department (name) VALUES ("${answers.deptName}");`,
        function (err, results) {
          console.log(`\nNew department added\n`), mainMenu();
        }
      );
    });
}

// entry point
function init() {
  console.log(`\n\nWELCOME TO THE COMPANY EMPLOYEE TRACKER\n\n`);
  mainMenu();
}

function quit() {
  process.exit(1);
}

// call entry point
init();
