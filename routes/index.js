var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();


router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
          return res.render("register", {info: "Sorry. That username already exists. Try again."});
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});


router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// Add new job
router.post('/addjob', function(req, res) {
    if (req.body.jobname == '') {
        res.writeHead(400, 'Job name cannot be blank', {'content-type' : 'text/plain'});
        res.end();
        return;
    }
    Account.findOne({'username': req.body.username}, function(err, account) {
        if (err) {
            console.log("no account found!");
        } else {
            account.jobs.push({'jobname': req.body.jobname, "hours": 0, "mins": 0, "secs": 0});
            account.save();
            console.log("Added client: " + req.body.jobname);
            res.writeHead(200, 'Added', {'content-type' : 'text/plain'});
            res.end();
        }
    });
    
});

// Delete a job based on job name
router.post('/deletejob', function(req, res) {
    // console.log(req.body);
    if (req.body.jobname == '') {
        res.writeHead(400, 'Job name cannot be blank', {'content-type' : 'text/plain'});
        res.end();
        return;
    }
    Account.findOne({'username': req.body.username}, function(err, account) {
        if (err) {
            console.log("no account found!");
        } else {
            for (var i = 0; i < account.jobs.length; i++) {
                if (account.jobs[i].jobname == req.
                    body.jobname) {
                    account.jobs.splice(i, 1);
                    account.save();
                    console.log("Removed client: " + req.body.jobname);
                    res.writeHead(200, 'Added', {'content-type' : 'text/plain'});
                    res.end();
                    return;
                }
            }
            res.writeHead(400, 'Job not found', {'content-type' : 'text/plain'});
            res.end();
        }
    }); 
});

// Sync a job based on job name
router.post('/syncjob', function(req, res) {
    console.log(req.body);

    if (req.body.jobname == '') {
        res.writeHead(400, 'Job name cannot be blank', {'content-type' : 'text/plain'});
        res.end();
        return;
    }
    Account.findOne({'username': req.body.username}, function(err, account) {
        if (err) {
            console.log("no account found!");
        } else {
            console.log("found: " + req.body.jobname);
            for (var i = 0; i < account.jobs.length; i++) {
                if (account.jobs[i].jobname == req.
                    body.jobname) {
                    account.jobs[i].hours = parseInt(req.body.h);
                    account.jobs[i].mins = parseInt(req.body.m);
                    account.jobs[i].secs = parseInt(req.body.s);
                    account.markModified('jobs'); 
                    account.save(function(error) {
                        if (error) {
                            console.log("failed to save");
                        } else {
                            console.log("saved!");
                        }
                    });
                    // console.log("after saving: ");
                    // console.log(account);
                    res.writeHead(200, 'Job ' + account.jobs[i].jobname + ' Synced', {'content-type' : 'text/plain'});
                    res.end();
                    return;
                }
            }
            res.writeHead(400, 'Job not found', {'content-type' : 'text/plain'});
            res.end();
        }
    }); 
});

// Reset
router.post('/reset', function(req, res) {
    console.log(req.body);

    if (req.body.jobname == '') {
        res.writeHead(400, 'Job name cannot be blank', {'content-type' : 'text/plain'});
        res.end();
        return;
    }
    Account.findOne({'username': req.body.username}, function(err, account) {
        if (err) {
            console.log("no account found!");
            res.writeHead(400, 'Job not found', {'content-type' : 'text/plain'});
            res.end();
        } else {
            console.log("found: " + req.body.jobname);
            for (var i = 0; i < account.jobs.length; i++) {
                account.jobs[i].hours = 0;
                account.jobs[i].mins = 0;
                account.jobs[i].secs = 0;
                account.markModified('jobs'); 
                account.save(function(error) {
                    if (error) {
                        console.log("failed to save");
                    } else {
                        console.log("saved!");
                    }
                });
            }
            res.writeHead(200, 'Jobs Synced', {'content-type' : 'text/plain'});
            res.end();
            return;
        }   
    }); 
});


module.exports = router;
