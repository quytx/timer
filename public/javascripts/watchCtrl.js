var myTimer = angular.module('myTimer',['ui.bootstrap']);

myTimer.controller('StopWatchCtrl', ['$scope', '$timeout', '$interval',function($scope, $timeout, $interval) {
  $scope.jobs = jobs;
  $scope.timeout = {};
  $scope.sum = {};
  $scope.converter = false;
  $scope.autoSave = {};
  $scope.activeJobs = [];

  $scope.getIndex = function(job) {
    for (var i = 0; i < $scope.jobs.length; i++) {
      if ($scope.jobs[i].jobname == job.jobname) {
        return i;
      }
    }
    return -1;
  }

  var count = function(index) {
    var currJob = $scope.jobs[index];
    currJob.secs++;
    if (currJob.secs >= 60) {
      currJob.secs = 0;
      currJob.mins++;
      if (currJob.mins >= 60) {
        currJob.mins = 0;
        currJob.hours++;
      }
    }
    $scope.timeout[index] = $timeout(function() {
      count(index);
    }, 1000);
  }
  
  $scope.start = function(index) {
    console.log(index);
    $timeout(function() {
      count(index);
    }, 1000);
    $scope.activeJobs.push($scope.jobs[index].jobname);
    // Start auto save
    $scope.autoSave[index] = $scope.autoSync(index); // *********** AUTO SAVE ************
  };
  
  $scope.stop = function(index) {
    $timeout.cancel($scope.timeout[index]);

    if ($scope.autoSave[index]) {   // *********** AUTO SAVE ************
      // console.log("stop auto saved for index " + index);  // *********** AUTO SAVE ************
      $interval.cancel($scope.autoSave[index]); // *********** AUTO SAVE ************
      $scope.autoSave[index] = undefined; // *********** AUTO SAVE ************
    }   // *********** AUTO SAVE ************

    $scope.syncJob(index);
  };

  $scope.reset = function(index) {
    $timeout.cancel($scope.timeout[index]);

    if ($scope.autoSave[index]) {   // *********** AUTO SAVE ************
      // console.log("stop auto saved for index " + index);  // *********** AUTO SAVE ************
      $interval.cancel($scope.autoSave[index]); // *********** AUTO SAVE ************
      $scope.autoSave[index] = undefined; // *********** AUTO SAVE ************
    }   // *********** AUTO SAVE ************

    var currJob = $scope.jobs[index];
    currJob.hours = 0;
    currJob.mins = 0;
    currJob.secs = 0;
  };

  $scope.deleteJob = function(index) {
    if ($scope.autoSave[index]) {   // *********** AUTO SAVE ************
      // console.log("stop auto saved for index " + index);  // *********** AUTO SAVE ************
      $interval.cancel($scope.autoSave[index]); // *********** AUTO SAVE ************
      $scope.autoSave[index] = undefined; // *********** AUTO SAVE ************
    }   // *********** AUTO SAVE ************
    $.post("/deletejob", { username: user.username, jobname: $scope.jobs[index].jobname }).done(function(data) {
      location.reload();
    });
  };


  /********************** AUTO SAVE *********************/
  var getData = function(user_name, job_name) {
    var currJob;
    for (var i = 0; i < $scope.jobs.length; i++) {
      if ($scope.jobs[i].jobname == job_name) {
        currJob =  $scope.jobs[i];
        break;
      }
    }
    return {
      username: user_name,
      jobname: job_name,
      h: currJob.hours,
      m: currJob.mins, 
      s: currJob.secs
    }
  }

  $scope.isActive = function(job) {
    return $scope.activeJobs.indexOf(job.jobname) > -1;
  }

  $scope.autoSync = function(index) {
    var user_name = user.username;
    var job_name = $scope.jobs[index].jobname;

    // Set interval
    var intervalObject = $interval(function() {
      var data = getData(user_name, job_name);
      // console.log(data);
      $.post("/autosync", data).done(function(res) {
        // console.log("auto saved: index " + index);
        // To-do: update last time saved
        // location.reload();
      });
    }, 10000);

    return intervalObject;
  }
  /*************** END AUTO SAVE **************************/

  $scope.syncJob = function(index) {
    var currJob = $scope.jobs[index];
    var data = {
      username: user.username,
      jobname: currJob.jobname,
      h: currJob.hours, 
      m: currJob.mins, 
      s: currJob.secs
    };
    $.post("/syncjob", data).done(function(data) {
      location.reload();
    });
  }

  $scope.resetAll = function() {
    var r = confirm("Are you sure?");
    if (r) {
      var data = {
        username: user.username
      };
      $.post("/reset", data).done(function(data) {
        location.reload();
      });
    }
  }

  $scope.sumTotal = function(jobs) {
    var h = 0, m = 0, s = 0, hrs = 0;
    for (var i = 0; i < jobs.length; i++) {
      h += jobs[i].hours;
      m += jobs[i].mins;
      s += jobs[i].secs;
    }
    hrs = (h + m/60 + s/3600).toFixed(2);
    $scope.sum = {
      h: h,
      m: m,
      s: s,
      hrs: hrs
    };
    return $scope.sum;
  }

  // $scope.syncAllJob = function() {
  //   for (var i = 0; i < $scope.jobs.length; i++) {
  //     $scope.syncJob(i);
  //   }
  // }
}]);