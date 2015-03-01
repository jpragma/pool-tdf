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
    $scope.units = 'inch';

    var psfTable = [{ms: 86, psf: 1.55},{ms: 89, psf: 1.46},{ms: 92, psf: 1.38},{ms: 95, psf: 1.31},
        {ms: 98, psf: 1.25},{ms: 102, psf: 1.20},{ms: 105, psf: 1.15},{ms: 108, psf: 1.10},
        {ms: 111, psf: 1.05},{ms: 114, psf: 1.00},{ms: 121, psf: 0.95},{ms: 127, psf: 0.91},
        {ms: 133, psf: 0.88},{ms: 9999999999999, psf: 0.85}];

	var pafTable = [
		{mtDiff: 32, paf: [1.09, 1.14, 1.20]},
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
		return dVal * 25.4;
	};
	
	$scope.calculate = function () { 
	    var mouth = ($scope.units == 'cm') ? parseFloat($scope.mouth) * 10 : inchToMM($scope.mouth);
	   	var throat = ($scope.units == 'cm') ? parseFloat($scope.throat) * 10 : inchToMM($scope.throat);
    	var shelf = ($scope.units == 'cm') ? parseFloat($scope.shelf) * 10 : inchToMM($scope.shelf);

		var result = $scope.doCalc($scope.selectedTable, mouth, throat, shelf);
    	$scope.result = result;
	}
	
    $scope.doCalc = function (table, mouth, throat, shelf) {
        var mtDiff = Math.round(mouth - throat);
        mouth = Math.round(mouth);
        throat = Math.round(throat);
        shelf = Math.round(shelf);

    	var psf = psfTable[psfTable.length-1].psf;    	
    	for (var i=0; i < psfTable.length; i++) {
    		if (mouth <= psfTable[i].ms) { 
    			psf = psfTable[i].psf;
    			break;
    		}
    	}

    	var pafCol = pafTable[pafTable.length-1].paf;
    	for (var i=0; i<pafTable.length; i++) {
			if (mtDiff > pafTable[i].mtDiff) {
				pafCol = pafTable[i].paf;
				break;
			}    	
    	}
        var paf = pafCol[1];
        if (psf >= 1.1)
            paf = pafCol[2];
        else if (psf <= 0.9)
            paf = pafCol[0];
    	
    	var plfCol = plfTable[plfTable.length-1].plf;
    	for (var i=0; i<plfTable.length; i++) {
			if (shelf > plfTable[i].shelf) {
				plfCol = plfTable[i].plf;
				break;
			}    	
    	}
        var plf = 0;
        if (psf <= 0.9)
            plf = plfCol[0];
        else if (psf < 1.1 && paf < 1.1)
            plf = plfCol[1];
        else if (psf >= 1.1 || paf >= 1.1)
            plf = plfCol[2];

		var result = { tsf: table.tsf, psf: psf, paf: paf, plf: plf };
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




    var testData = [
        {t:[1,1.1],s:['4',1.2],a:['3 1/4',1.02],l:['1 7/8',1.03],r:1.39, id:'fictitious tough 10'},
        {t:[2,1.0],s:['3 7/8',1.25],a:['3 1/4',1.00],l:['2 1/8',1.07],r:1.34, id: 'fictitious example B'},
        {t:[2,1.0],s:['3 7/8',1.25],a:['3 6/8',0.97],l:['0 3/4',0.98],r:1.19, id: 'Bonus Ball'},
        {t:[2,1.0],s:['4 1/8',1.15],a:['3 2/8',1.05],l:['1',0.98],r:1.18, id: 'Mark Gregory Centennial'},
        {t:[1,1.1],s:['5 1/2',0.85],a:['3 1/2',1.09],l:['2 1/2',1.15],r:1.17, id:'converted snooker'},
        {t:[2,1.0],s:['4 1/8',1.15],a:['3 3/8',1.02],l:['1 3/8',0.99],r:1.16, id:'Qaddiction Diamond'},
        {t:[2,1.0],s:['4',1.2],a:['3 5/8',0.98],l:['1',0.98],r:1.15, id:'rexus31'},
        {t:[2,1.0],s:['4',1.2],a:['3 3/4',0.97],l:['1',0.98],r:1.14, id:'FatBoy GC'},
        {t:[2,1.0],s:['4',1.2],a:['3 3/4',0.97],l:['0 7/8',0.98],r:1.14, id:'TATE GC'},
        {t:[2,1.0],s:['4 3/16',1.1],a:['3 12/16',0.99],l:['1 7/8',1.03],r:1.12, id:'pocket unknown'},
        {t:[5,0.85],s:['4 1/8',1.15],a:['2 7/8',1.14],l:['1 3/8',0.99],r:1.10, id:'Neil bar box'},
        {t:[2,1.0],s:['4 1/2',1.0],a:['3 1/2',1.07],l:['1 3/4',1.0],r:1.07, id:'typical Pro-Cut Diamond'},
        {t:[2,1.0],s:['4 1/4',1.1],a:['4',0.97],l:['0 15/16',0.98],r:1.05, id:'Pool Hustler GC'},


        {t:[2,1.0],s:['4 1/2',1.0],a:['3',1.14],l:['2 1/2',1.15],r:1.31, id:'Isaac fictitious A'}
    ];

    $scope.unitTestErrors = [];
    var assert = function(t, msg, a, b) {
        if (a != b) {
            $scope.unitTestErrors.push("Table '" + t + "' " + msg + " " + a + " != " + b);
        }
    };

    $scope.runUnitTest = function() {
        for (var i=0; i<testData.length; i++) {
            var o = testData[i];
            var result = $scope.doCalc($scope.tables[o.t[0]], inchToMM(o.s[0]), inchToMM(o.a[0]), inchToMM(o.l[0]));
            assert(o.id, "TSF", result.tsf, o.t[1]);
            assert(o.id, "PSF", result.psf, o.s[1]);
            assert(o.id, "PAF", result.paf, o.a[1]);
            assert(o.id, "PLF", result.plf, o.l[1]);
        }
    };

    
});
