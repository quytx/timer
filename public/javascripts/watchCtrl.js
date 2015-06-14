var myTimer = angular.module('myTimer',[]);

myTimer.controller('StopWatchCtrl', ['$scope', '$timeout', function($scope, $timeout) {
  $scope.jobs = jobs;
  $scope.timeout = {};
 
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
    var data = {
      username: user.username
    };
    $.post("/reset", data).done(function(data) {
      location.reload();
    });
  }

  // $scope.syncAllJob = function() {
  //   for (var i = 0; i < $scope.jobs.length; i++) {
  //     $scope.syncJob(i);
  //   }
  // }
}]);