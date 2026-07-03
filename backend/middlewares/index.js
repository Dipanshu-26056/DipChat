const express = require('express')
const app = express()
const port = 3000

// loading middlewares into the app
// inbuilt middleware
app.use(express.json());
// that help us to pasrse json file

const loggingMiddleware = function (req,res,next){
    console.log('Logging kar raha hun')
    next();
app.use(loggingMiddleware);
}

// creation of a middleware
const authMiddleware = function (req,res,next){
    console.log('auth kar rha hun')
    next();

// loading middleware into application
app.use(authMiddleware);

}
const validationMiddleware = function (req,res,next){
    console.log('validation kar raha hun');
    next();

}
app.use(validationMiddleware);

app.get('/', (req, res) => {
    console.log("Main router handler hun");
    console.log(req.body);
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})