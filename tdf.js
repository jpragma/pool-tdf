var tdfApp = angular.module('tdfApp', []);
tdfApp.controller('tdfController', function ($scope) {
    $scope.tables = [
        {name:'12 ft (gigantic)', tsf:1.25},
        {name:'10 ft (oversized)', tsf:1.10},
        {name:'9 ft (regulation)', tsf:1.00},
        {name:'8+ ft (pro 8) ', tsf:0.95},
        {name:'8 ft (home table)', tsf:0.90},
        {name:'6 or 7 ft (bar box)', tsf:0.85}
    ];
    $scope.selectedTable = $scope.tables[2];
    $scope.units = 'cm';

    var psfTable = [{ms: 86, psf: 1.55},{ms: 89, psf: 1.46},{ms: 92, psf: 1.38},{ms: 95, psf: 1.31},
        {ms: 98, psf: 1.25},{ms: 102, psf: 1.20},{ms: 105, psf: 1.15},{ms: 108, psf: 1.10},
        {ms: 111, psf: 1.05},{ms: 114, psf: 1.00},{ms: 121, psf: 0.95},{ms: 127, psf: 0.91},
        {ms: 133, psf: 0.88},{ms: 9999999999999, psf: 0.85}];

	var pafTable = [
		{mtDiff: 32, paf: [1.09, 1,14, 1.20]},
		{mtDiff: 25, paf: [1.07, 1.10, 1.14]},
		{mtDiff: 22, paf: [1.05, 1.07, 1.09]},
		{mtDiff: 19, paf: [1.03, 1.04, 1.05]},
		{mtDiff: 16, paf: [1.01, 1.02, 1.02]},
		{mtDiff: 13, paf: [1.00, 1.00, 1.00]},
		{mtDiff: 9, paf: [0.98, 0.98, 0.99]},
		{mtDiff: 6, paf: [0.96, 0.97, 0.98]},
		{mtDiff: 0, paf: [0.94, 0.95, 0.97]}
	];
	
	var plfTable = [
		{shelf: 57, plf: [1.07, 1.10, 1.15]},
		{shelf: 51, plf: [1.03, 1.05, 1.07]},
		{shelf: 44, plf: [1.01, 1.03, 1.03]},
		{shelf: 38, plf: [1.00, 1.00, 1.00]},
		{shelf: 32, plf: [0.97, 0.98, 0.99]},
		{shelf: 0, plf: [0.93, 0.95, 0.98]}
	];
	
	var tdfTable = [
		{tdf: 0.7, cls: 'too easy'},
		{tdf: 0.85, cls: 'very easy'},
		{tdf: 0.95, cls: 'easy'},
		{tdf: 1.05, cls: 'average'},
		{tdf: 1.15, cls: 'tough'},
		{tdf: 1.30, cls: 'very tough'},
		{tdf: 9999999, cls: 'too tough'}
	];
	
	var inchToMM = function(val) {
		var vals = val.split(' ');
		var dVal = parseFloat(vals[0]);
		
		if (vals.length > 1) {
			var valf = vals[1].split('/');
		 	dVal += parseFloat(valf[0])/parseFloat(valf[1]);
		}
		return Math.round(dVal * 25.4); 	
	};
	
	$scope.calculate = function () { 
	    var mouth = ($scope.units == 'cm') ? parseFloat($scope.mouth) * 10 : inchToMM($scope.mouth);
	   	var throat = ($scope.units == 'cm') ? parseFloat($scope.throat) * 10 : inchToMM($scope.throat);
    	var shelf = ($scope.units == 'cm') ? parseFloat($scope.shelf) * 10 : inchToMM($scope.shelf);

		var result = $scope.doCalc($scope.selectedTable, mouth, throat, shelf);
    	$scope.result = result;
	}
	
    $scope.doCalc = function (table, mouth, throat, shelf) {    	    	
    	var psf = psfTable[psfTable.length-1].psf;    	
    	for (var i=0; i < psfTable.length; i++) {
    		if (mouth <= psfTable[i].ms) { 
    			psf = psfTable[i].psf;
    			break;
    		}
    	}
    	var psfIdx = 1;
    	if (psf >= 1.1)
    		psfIdx = 2;
    	else if (psf <= 0.9)
    		psfIdx = 0;
    	
    	var mtDiff = mouth - throat;
    	var paf = pafTable[pafTable.length-1].paf;
    	for (var i=0; i<pafTable.length; i++) {
			if (mtDiff > pafTable[i].mtDiff) {
				paf = pafTable[i].paf;
				break;
			}    	
    	}
    	
    	var plf = plfTable[plfTable.length-1].plf;
    	for (var i=0; i<plfTable.length; i++) {
			if (shelf > plfTable[i].shelf) {
				plf = plfTable[i].plf;
				break;
			}    	
    	}

		var result = { tsf: table.tsf, psf: psf, paf: paf[psfIdx], plf: plf[psfIdx] };
		result.tdf = result.tsf * result.psf * result.paf * result.plf;

        var tdfClass = tdfTable[tdfTable.length - 1].cls;
        for (var i=0; i<tdfTable.length; i++) {
			if (result.tdf < tdfTable[i].tdf) {
				tdfClass = tdfTable[i].cls;
				break;
			}    	
    	}
    	result.tdfClass = tdfClass;
    	return result;
    };
    
});
