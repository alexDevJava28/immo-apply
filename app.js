// app.js

/**
 * Required External Modules
 */
const config = require('./src/config/env.json');
const express = require("express");
const path = require("path");
const { check, validationResult } = require('express-validator');
const db = require('./src/db/connection');
const apartApply = require('./src/simulators/apartApply');

/**
 * App Variables
 */
const app = express();
const serverConfig = config.server;

/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

/**
 * Routes Definitions
 */
app.get("/", async (req, res) => {
    let user = await db.collection("user").findOne();

    console.log(user);

    res.render("index", { 
        title: "Immo Apply",
        user: user,
    });
});

app.get("/history", async (req, res) => {
    let history = await db.collection("history").find().toArray();

    res.render("history", { 
        title: "History",
        history: history
    });
});

app.post("/save-credentials", [

    check('username').notEmpty().withMessage("Username is required!"),
    check('password').notEmpty().withMessage("Password is required!")

  ], (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.render('index', {
            errors: errors.mapped()
        });

        return;
    }

    const username = req.body.username;
    const password = req.body.password;

    let data = { 
        "username": username,
        "password": password
    } 
    
    db.collection('user').remove({});

    db.collection('user').insertOne(data, function(err, collection) { 
        if (err) throw err; 
        console.log("Credentials saved Successfully");       
    }); 

    res.redirect('/');
});

app.get("/run-apply", (req, res) => {
    apartApply.run();

    res.redirect('/');
});

/**
 * Server Activation
 */
app.listen(serverConfig.port, () => {
    console.log(`Listening to requests on http://localhost:${serverConfig.port}`);
});