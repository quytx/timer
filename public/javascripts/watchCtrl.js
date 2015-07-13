var myTimer = angular.module('myTimer',[]);

myTimer.controller('StopWatchCtrl', ['$scope', '$timeout', function($scope, $timeout) {
  $scope.jobs = jobs;
  $scope.timeout = {};
  $scope.sum = {};
 
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
    $timeout(function() {
      count(index);
    }, 1000);
  };
  
  $scope.stop = function(index) {
    $timeout.cancel($scope.timeout[index]);
    $scope.syncJob(index);
  };

  $scope.reset = function(index) {
    $timeout.cancel($scope.timeout[index]);
    var currJob = $scope.jobs[index];
    currJob.hours = 0;
    currJob.mins = 0;
    currJob.secs = 0;
  };

  $scope.deleteJob = function(index) {
    $.post("/deletejob", { username: user.username, jobname: $scope.jobs[index].jobname }).done(function(data) {
      location.reload();
    });
  };

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
    var r = confirm("Aer you sure?");
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