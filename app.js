const bodyParser = require('body-parser');
const express = require('express');
const jwt = require('jsonwebtoken');

//for id
var user_id = 1;
var task_id = 1;

const app = express();
const port = process.env.PORT || 4041;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

//to store in memory
var user = [];
var task = [];

app.post('/register', (req, res) => {
    const { email , password } = req.body;
    if  (email && password) {
        id = user_id;
        user.push({ id , email , password });
        //incrementing the id for next use
        user_id = user_id + 1;
        res.json({user});
    }
});

app.post('/login', (req, res) => {
    const { email , password } = req.body;
    //finidng user with this email to get id
    const filter_user = user.find((each_user) => each_user.email === email);
    const user_to_login = {
        id: filter_user.id,
        email: email,
        password: password,
    };
    jwt.sign({user: user_to_login} , "secretkey" , (err, jwt) => {
        res.json({
            jwt
        });   
    });
});

app.get('/user', verifyToken ,(req, res) => {
    jwt.verify(req.token, 'secretkey' , (err , authData) => {
        if(err) {
            res.sendStatus(403)//forbidden code status
        } else {
            res.json({
                //accessing the object
                user:{
                    id: authData.user.id ,
                    email: authData.user.email
                }
            });
        }
    })
});

app.post('/create-task',(req, res) => {
    const { name } = req.body;
    id = task_id;
    //to access the given jwt and store it
    const token = req.headers['authorization']
    task.push({ token , id , name });
    task_id = task_id + 1;
    //console.log("same" , task);
    res.json({
        task:{
            id: id ,
            name: name
        }
    });
});


app.get('/list-task',(req, res) => {
    const token = req.headers['authorization']
    //to customize return
    const tasks = task.map((each_task) => { 
        if(each_task.token === token)
        {
            return {
                id: each_task.id ,
                name: each_task.name
            }
        }
    });
    //console.log("same" , tasks);
    res.json({
        tasks
    });
});



function verifyToken(req , res , next){
    const bearerHeader = req.headers['authorization']
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1]
        req.token = bearerToken
        next()
    } else {
        res.sendStatus(403)
    }
}

app.listen(port, () => {
    console.log('server is running on port: ${port}');
});