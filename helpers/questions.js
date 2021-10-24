const questions = [
    {
        type: "list",
        message: "What would you like to do?",
        name: "initAction",
        choices: [
            "View All Departments",
            "View All Roles",
            "View All Employees",
            "Add Department",
            "Add Role",
            "Add Employee",
            "Update Employee Role",
            "Delete Employee",
            "Delete Department",
            "Quit",
        ]
    }];

    module.exports = questions;