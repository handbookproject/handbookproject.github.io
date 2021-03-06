var api = 'https://api.github.com/repos/handbookproject/learninghub/contents/';

var back = '?client_id=e1ef2a75f08bb92c2994&client_secret=f056f7a7661acbc1c4474adbedfbfb88d99c59c0';

angular.module('handbook', [])

    .controller('ExploreController', function ($sce, $scope, $http) {
        $scope.task = 'Train';
        $scope.path = '';
        $scope.subTopics = [];
        $scope.books = [];
        $scope.showContents = false;
        $scope.showDesc = false;
        $scope.getContents = function () {
            $scope.showContents = false;
            $scope.showDesc = false;
            $http.get(api + $scope.path + back).success(function (response) {
                $scope.subTopics = [];
                $scope.books = [];
                for (var i = 0; i < response.length; i++) {
                    if (response[i].type == 'dir') $scope.subTopics.push(response[i]);
                    else if (response[i].type == 'file') {
                        if(response[i].name != 'description.md') $scope.books.push(response[i]);
                    }
                }
                if ($scope.subTopics) {
                    $scope.subTopics.sort(function (a, b) {
                        if (+a.name.split('.')[0] > +b.name.split('.')[0]) return 1;
                        if (+a.name.split('.')[0] < +b.name.split('.')[0]) return -1;
                        return 0;
                    });
                }
                if ($scope.books) {
                    $scope.books.sort(function (a, b) {
                        if (+a.name.split('.')[0] > +b.name.split('.')[0]) return 1;
                        if (+a.name.split('.')[0] < +b.name.split('.')[0]) return -1;
                        return 0;
                    });
                }
                $scope.showContents = true;
            });
            $http({
                method: 'GET',
                url: api + $scope.path + '/description.md' + back,
                headers: {
                    'Accept': 'application/vnd.github.v3.html+json'
                }
            }).success(function (data) {
                $scope.desc = $sce.trustAsHtml(data);
                $scope.showDesc = true;
            }).error(function() {
                $scope.showDesc = false;
            });
        };
        $scope.setPath = function (path) {
            $scope.path = path;
            $scope.getContents();
        };
        $scope.getContents();
    })

    .controller('ReadController', function ($sce, $scope, $http, $rootScope) {
        $scope.showBook = false;
        $scope.file = {};
        $scope.getFile = function () {
            $scope.showBook = false;
            var type = $scope.file.path.split('.').pop();
            if (type == 'mp4') {
                $scope.html = $sce.trustAsHtml('<div class="embed-responsive embed-responsive-4by3"><video width="320" height="240" controls><source src="' + $scope.file._links.html.replace('blob', 'raw') + '" type="video/mp4">Your browser does not support the video tag.</video></div>');
                $scope.showBook = true;
            }
            else if (type == 'pdf') {
                $scope.html = $sce.trustAsHtml('<div class="embed-responsive embed-responsive-4by3"><iframe src="https://docs.google.com/gview?url=' + $scope.file._links.html.replace('blob', 'raw') + '&embedded=true"></iframe></div>');
                $scope.showBook = true;
            }
            else if (type == 'md') {

                $http({
                    method: 'GET',
                    url: api + $scope.file.path + back,
                    headers: {
                        'Accept': 'application/vnd.github.v3.html+json'
                    }
                }).success(function (data) {
                    $scope.html = $sce.trustAsHtml(data);
                    $scope.showBook = true;
                });

            } else {
                $scope.html = $sce.trustAsHtml('<h3>Format not supported. Not yet.</h3>');
                $scope.showBook = true;
            }
        };
        $rootScope.setFile = function (file) {
            $scope.file = file;
            $scope.getFile();
        };
        $rootScope.setFile({ path: 'README.md', name: 'README.md' });
    })
    
    .filter('stripExtension', function() {
        return function(input) {
            return input.split('.').slice(0,-1).join('.');
        }
    });
