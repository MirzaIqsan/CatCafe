// Import the Express.js framework
const express = require('express');

//TODO: Include code for body-parser
const bodyParser = require("body-parser");
// Create an instance of the Express application. This app variable will be used to define routes and configure the server.
const app = express();

const mysql = require("mysql2")

//TODO: Include code for Middleware to parse request bodies
app.use(bodyParser.urlencoded({extended:true}));
// Specify the port for the server to listen on
const port = 3000;
app.use(express.static('public'));

const connection = mysql.createConnection({
    host: "mysql-mirzaiqsan.alwaysdata.net",
    user:"371289",
    password:"Mirz@blum@n1!",
    database:"mirzaiqsan_project"
})



//TODO: Include code to set EJS as the view engine
app.set("view engine","ejs");
// In-memory data for students
// let students = [
//   { id: 1, name: 'Mittens', age: "Male", price:3.5 , image: "Mittens.jpg"},
//   { id: 2, name: 'Patches', age: "Female", price: 3.8,image:"Patches.jpg" },
//   { id: 3, name: 'Smoky', age: "Male", price:3.5,image:"Smoky.jpg" },
//   { id: 4, name: 'Scotty', age: "Female", price:4.5,image:"Scotyy.jpg"}
// ];

// Routes for CRUD operations
// Route to retrieve and display all students
// app.get('/', function(req, res) {
    
//     res.render("index", {students: students});
// });

app.get("/",(req,res)=>{
    const sql = "SELECT * FROM students";
    connection.query( sql,(error,results)=>{
        if(error){
            console.error("Database query error:", error.message);
            return res.status(500).send("Error Retrieving products");
        }
        res.render("index",{students: results});
    });
});



// Route to get a specific student by ID
// app.get('/students/:id', function(req, res) {
    
//     const studentId = parseInt(req.params.id);
    
//     const student = students.find((student) => student.id === studentId);

    
//     if (student) {
        
//         res.render("studentInfo", {student})
//     } 
// });

app.get('/students/:id', function(req, res) {
    const studentId = req.params.id;
    // Query to fetch student from database
    const query = `SELECT * FROM students WHERE id = ?`;
    connection.query(query, [studentId], (err, results) => {
        if (err) {
            console.error('Error fetching student from database: ' + err.stack);
            return res.status(500).send('Error fetching student');
        }
        // Check if student with given ID exists
        if (results.length > 0) {
            const student = results[0];
            res.render("studentInfo", { student });
        } else {
            res.status(404).send('Student not found');
        }
    });
});



// Add a new student form
app.get('/addStudentForm', function(req, res) {
    //TODO: Insert code to render a view called "addStudent"
    res.render("addStudent");
});

// Add a new student

// app.post('/students', function(req, res) {
    
//     const { name, age, price } = req.body; 
//     const id = students[students.length - 1].id + 1;
//     const newStudent = { id, name, age, price }; 
//     students.push(newStudent);
//     res.redirect("/");
//   });
app.post('/students', function(req, res) {
    const { name, age, price } = req.body;
    // Query to insert a new student into the database
    const query = `INSERT INTO students (name, age, price) VALUES (?, ?, ?)`;
    connection.query(query, [name, age, price], (err, result) => {
        if (err) {
            console.error('Error inserting new student into database: ' + err.stack);
            return res.status(500).send('Error adding new student');
        }
        console.log('New student added with ID: ', result.insertId);
        res.redirect("/");
    });
});

// Update a student by ID - First Find the student
// app.get('/students/:id/update', function(req, res)  {
    
//     const studentId = parseInt(req.params.id);

//     const updateStudent = students.find(function(students){
//         return students.id === parseInt(studentId);
//     });
//     res.render("updateStudent",{updateStudent});
// });

app.get('/students/:id/update', function(req, res)  {
    const studentId = req.params.id; // Extract studentId from URL parameter

    // Query to fetch student from database
    const query = "SELECT * FROM students WHERE id = ?";
    connection.query(query, [studentId], (err, results) => {
        if (err) {
            console.error('Error fetching student from database: ' + err.stack);
            return res.status(500).send('Error fetching student');
        }

        if (results.length > 0) {
            const updateStudent = results[0]; // Assuming student ID is unique, so only one result
            res.render("updateStudent", { updateStudent });
        } else {
            res.status(404).send('Student not found');
        }
    });
});


// Update a student by ID - Update the student information
// app.post('/students/:id/update', function(req, res) {
//     //TODO: Insert code to update student information entered in updateStudent form
//     const studentId = parseInt(req.params.id);
//     const {studentName,age, weight} = req.body;
//     const updatedStudent = {id: studentId, name: studentName,age:age, price:weight};

//     students = students.map(student => {
//         if (student.id === studentId){
//             return {...student, ...updatedStudent};
//         }
//         return student;

//     });
//     res.redirect("/");
    
// });

app.post('/students/:id/update', (req, res) => {
    const studentId = parseInt(req.params.id);
    const { studentName, age, price, } = req.body;

    const query = "UPDATE students SET name = ?, age = ?, price = ? WHERE id = ?";
    connection.query(query, [studentName, age, price, studentId, ], (err, result) => {
        if (err) {
            console.error('Error updating student: ' + err.stack);
            return res.status(500).send('Error updating student');
        }
        console.log(`Student with ID ${studentId} updated successfully`);
        res.redirect('/');
    });
});




// Delete a student by ID
// app.get('/students/:id/delete', function(req, res) {
//     const studentId = parseInt(req.params.id);

//     // Filter out the deleted student
//     students = students.filter(students => students.id !== studentId);
//     //TODO: Insert code to Redirect back to index page after deleting the student
//     res.redirect("/")
// });

app.get('/students/:id/delete', (req, res) => {
    const studentId = parseInt(req.params.id);

    // Delete query
    const query = "DELETE FROM students WHERE id = ?";
    connection.query(query, [studentId], (err, result) => {
        if (err) {
            console.error('Error deleting student: ' + err.stack);
            return res.status(500).send('Error deleting student');
        }
        console.log(`Student with ID ${studentId} deleted successfully`);
        const resetQuery = "ALTER TABLE students AUTO_INCREMENT = 1";
        connection.query(resetQuery, (err, result) => {
            if (err) {
                console.error('Error resetting auto-increment: ' + err.stack);
                return res.status(500).send('Error resetting auto-increment');
            }
            console.log('Auto-increment reset successfully');

        res.redirect('/');
        });
    });
});


// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message when the server is successfully started
  console.log(`Server is running at http://localhost:${port}`);
});

