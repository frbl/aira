var data = [];

var freq_waar_was_ik = {};
var freq_wat_deed_ik = {};
var freq_dagdeel = {'Ochtend':0,'Middag':0,'Avond':0};
var freq_bijzonder = {'Nee, niets':0,'Ja, iets positiefs':0,'Ja, iets neutraals':0,'Ja, iets negatiefs':0};
var freq_gezelschap = {};
var freq_drukte = {'Veel te druk':0,'Lekker druk':0,'Neutraal':0,'Lekker rustig':0,'Veel te rustig':0};
var freq_slaapduur = {};
var means_beweging = {'Ochtend':0,'Middag':0,'Avond':0};
var means_plezierigheid_activiteit = {};
var means_eigenwaarde = {};
var means_vanslag = {'Nee, niets':0,'Ja, iets positiefs':0,'Ja, iets neutraals':0,'Ja, iets negatiefs':0};
var means_opgewektheid = {'Veel te druk':0,'Lekker druk':0,'Neutraal':0,'Lekker rustig':0,'Veel te rustig':0};
var means_tekort_schieten = {'Veel te druk':0,'Lekker druk':0,'Neutraal':0,'Lekker rustig':0,'Veel te rustig':0};
var means_opgewektheid_dagritme = {'Ochtend':0,'Middag':0,'Avond':0};
var means_ontspanning_dagritme = {'Ochtend':0,'Middag':0,'Avond':0};
var means_somberheid_dagritme = {'Ochtend':0,'Middag':0,'Avond':0};
var means_onrust_dagritme = {'Ochtend':0,'Middag':0,'Avond':0};

var sd_beweging = {};
var sd_vanslag = {};
var sd_opgewektheid = {};
var sd_tekort_schieten = {};
var sd_opgewektheid_dagritme = {};
var sd_ontspanning_dagritme = {};
var sd_somberheid_dagritme = {};
var sd_onrust_dagritme = {};

var data_waar_was_ik = [];
var data_wat_deed_ik = [];
var data_slaapduur = [];
var data_gezelschap = [];
var data_plezierigheid_activiteit = [];
var data_eigenwaarde = [];
var data_beweging = [];
var data_vanslag = [];
var data_opgewektheid = [];
var data_tekort_schieten = [];
var data_positief_dagritme = [];
var data_negatief_dagritme = [];

function calculate_data(presupplied_data) {
    if (presupplied_data != null) {
        data = presupplied_data;
    } else {
        data = DiaryDataCacher.get_basic_outcome();
    }
    if (data === null || data === undefined) return;
    freq_waar_was_ik = {};
    freq_wat_deed_ik = {};
    freq_dagdeel = {'Ochtend':0,'Middag':0,'Avond':0};
    freq_bijzonder = {'Nee, niets':0,'Ja, iets positiefs':0,'Ja, iets neutraals':0,'Ja, iets negatiefs':0};
    freq_gezelschap = {};
    freq_drukte = {'Veel te druk':0,'Lekker druk':0,'Neutraal':0,'Lekker rustig':0,'Veel te rustig':0};
    freq_slaapduur = {};
    means_beweging = {'Ochtend':0,'Middag':0,'Avond':0};
    means_plezierigheid_activiteit = {};
    means_eigenwaarde = {};
    means_vanslag = {'Nee, niets':0,'Ja, iets positiefs':0,'Ja, iets neutraals':0,'Ja, iets negatiefs':0};
    means_opgewektheid = {'Veel te druk':0,'Lekker druk':0,'Neutraal':0,'Lekker rustig':0,'Veel te rustig':0};
    means_tekort_schieten = {'Veel te druk':0,'Lekker druk':0,'Neutraal':0,'Lekker rustig':0,'Veel te rustig':0};
    means_opgewektheid_dagritme = {'Ochtend':0,'Middag':0,'Avond':0};
    means_ontspanning_dagritme = {'Ochtend':0,'Middag':0,'Avond':0};
    means_somberheid_dagritme = {'Ochtend':0,'Middag':0,'Avond':0};
    means_onrust_dagritme = {'Ochtend':0,'Middag':0,'Avond':0};

    sd_beweging = {};
    sd_vanslag = {};
    sd_opgewektheid = {};
    sd_tekort_schieten = {};
    sd_opgewektheid_dagritme = {};
    sd_ontspanning_dagritme = {};
    sd_somberheid_dagritme = {};
    sd_onrust_dagritme = {};

    data_waar_was_ik = [];
    data_wat_deed_ik = [];
    data_slaapduur = [];
    data_gezelschap = [];
    data_plezierigheid_activiteit = [];
    data_eigenwaarde = [];
    data_beweging = [];
    data_vanslag = [];
    data_opgewektheid = [];
    data_tekort_schieten = [];
    data_positief_dagritme = [];
    data_negatief_dagritme = [];

    // Compute frequencies
    data.forEach(function(value) {
        // Proportions 'Waar was ik'
        if(value.waar_was_ik==null) { 0 } else{ (freq_waar_was_ik[value.waar_was_ik]==undefined) ? freq_waar_was_ik[value.waar_was_ik]=1 : freq_waar_was_ik[value.waar_was_ik]+=1; }
        // Proportions 'Wat deed ik'
        if(value.wat_deed_ik==null) { 0 } else{ (freq_wat_deed_ik[value.wat_deed_ik]==undefined) ? freq_wat_deed_ik[value.wat_deed_ik]=1 : freq_wat_deed_ik[value.wat_deed_ik]+=1; }
        // Proportions 'Dagdeel'
        if(value.dagdeel==null) { 0 } else{ (freq_dagdeel[value.dagdeel]==undefined) ? freq_dagdeel[value.dagdeel]=1 : freq_dagdeel[value.dagdeel]+=1; }
        // Proportions 'Bijzonder'
        if(value.is_er_iets_bijzonders_gebeurd==null) { 0 } else{ (freq_bijzonder[value.is_er_iets_bijzonders_gebeurd]==undefined) ? freq_bijzonder[value.is_er_iets_bijzonders_gebeurd]=1 : freq_bijzonder[value.is_er_iets_bijzonders_gebeurd]+=1; }
        // Proportions 'Gezelschap'
        if(value.ik_was_het_afgelopen_dagdeel_grotendeels==null) { 0 } else{ (freq_gezelschap[value.ik_was_het_afgelopen_dagdeel_grotendeels]==undefined) ? freq_gezelschap[value.ik_was_het_afgelopen_dagdeel_grotendeels]=1 : freq_gezelschap[value.ik_was_het_afgelopen_dagdeel_grotendeels]+=1; }
        // Proportions 'Drukte'
        if(value.drukte==null) { 0 } else{ (freq_drukte[value.drukte]==undefined) ? freq_drukte[value.drukte]=1 : freq_drukte[value.drukte]+=1; }
        // Proportions 'Slaapduur'
        if(value.slaapduur==null) { 0 } else{ (freq_slaapduur[value.slaapduur]==undefined) ? freq_slaapduur[value.slaapduur]=1 : freq_slaapduur[value.slaapduur]+=1; }

        // Means 'Plezierigheid activiteit'
        if(value.plezierigheid_activiteit==null) { 0 } else { (means_plezierigheid_activiteit[value.wat_deed_ik]==undefined) ? means_plezierigheid_activiteit[value.wat_deed_ik]= +value.plezierigheid_activiteit : means_plezierigheid_activiteit[value.wat_deed_ik]+= +value.plezierigheid_activiteit; }
        // Means 'Eigenwaarde'
        if(value.eigenwaarde==null) { 0 } else { (means_eigenwaarde[value.waar_was_ik]==undefined) ? means_eigenwaarde[value.waar_was_ik]= +value.eigenwaarde : means_eigenwaarde[value.waar_was_ik]+= +value.eigenwaarde; }
        // Means 'Beweging'
        if(value.beweging==null) { 0 } else { (means_beweging[value.dagdeel]==undefined) ? means_beweging[value.dagdeel]= +value.beweging : means_beweging[value.dagdeel]+= +value.beweging; }
        // Means 'Van Slag'
        if(value.ik_ben_van_slag==null) { 0 } else { (means_vanslag[value.is_er_iets_bijzonders_gebeurd]==undefined) ? means_vanslag[value.is_er_iets_bijzonders_gebeurd]= +value.ik_ben_van_slag : means_vanslag[value.is_er_iets_bijzonders_gebeurd]+= +value.ik_ben_van_slag; }
        // Means 'Opgewektheid'
        if(value.opgewektheid==null) { 0 } else { (means_opgewektheid[value.drukte]==undefined) ? means_opgewektheid[value.drukte]= +value.opgewektheid : means_opgewektheid[value.drukte]+= +value.opgewektheid; }
        // Means 'Tekort schieten'
        if(value.tekortschieten==null) { 0 } else { (means_tekort_schieten[value.drukte]==undefined) ? means_tekort_schieten[value.drukte]= +value.tekortschieten : means_tekort_schieten[value.drukte]+= +value.tekortschieten; }
        // Means 'Opgewektheid dagritme'
        if(value.opgewektheid==null) { 0 } else { (means_opgewektheid_dagritme[value.dagdeel]==undefined) ? means_opgewektheid_dagritme[value.dagdeel]= +value.opgewektheid : means_opgewektheid_dagritme[value.dagdeel]+= +value.opgewektheid; }
        // Means 'Ontspanning dagritme'
        if(value.ontspanning==null) { 0 } else { (means_ontspanning_dagritme[value.dagdeel]==undefined) ? means_ontspanning_dagritme[value.dagdeel]= +value.ontspanning : means_ontspanning_dagritme[value.dagdeel]+= +value.ontspanning; }
        // Means 'Somberheid dagritme'
        if(value.somberheid==null) { 0 } else { (means_somberheid_dagritme[value.dagdeel]==undefined) ? means_somberheid_dagritme[value.dagdeel]= +value.somberheid : means_somberheid_dagritme[value.dagdeel]+= +value.somberheid; }
        // Means 'Onrust dagritme'
        if(value.onrust==null) { 0 } else { (means_onrust_dagritme[value.dagdeel]==undefined) ? means_onrust_dagritme[value.dagdeel]= +value.onrust : means_onrust_dagritme[value.dagdeel]+= +value.onrust; }
    });

    // Compute mean
    for(var mean in means_beweging) { means_beweging[mean] = means_beweging[mean]/freq_dagdeel[mean];} //mean == dagdeel
    for(var mean in means_vanslag) { means_vanslag[mean] = means_vanslag[mean]/freq_bijzonder[mean];}
    for(var mean in means_opgewektheid) { means_opgewektheid[mean] = means_opgewektheid[mean]/freq_drukte[mean];}
    for(var mean in means_tekort_schieten) { means_tekort_schieten[mean] = means_tekort_schieten[mean]/freq_drukte[mean];}
    for(var mean in means_opgewektheid_dagritme) { means_opgewektheid_dagritme[mean] = means_opgewektheid_dagritme[mean]/freq_dagdeel[mean];}
    for(var mean in means_ontspanning_dagritme) { means_ontspanning_dagritme[mean] = means_ontspanning_dagritme[mean]/freq_dagdeel[mean];}
    for(var mean in means_somberheid_dagritme) { means_somberheid_dagritme[mean] = means_somberheid_dagritme[mean]/freq_dagdeel[mean];}
    for(var mean in means_onrust_dagritme) { means_onrust_dagritme[mean] = means_onrust_dagritme[mean]/freq_dagdeel[mean];}

    // Compute sd
    data.forEach(function(value) {
        if(value.beweging==null) { 0 } else{ (sd_beweging[value.dagdeel]==undefined) ? sd_beweging[value.dagdeel]=Math.pow(+value.beweging - means_beweging[value.dagdeel],2) : sd_beweging[value.dagdeel]+=Math.pow( +value.beweging - means_beweging[value.dagdeel],2); }
        if(value.ik_ben_van_slag==null) { 0 } else{ (sd_vanslag[value.is_er_iets_bijzonders_gebeurd]==undefined) ? sd_vanslag[value.is_er_iets_bijzonders_gebeurd]=Math.pow(+value.ik_ben_van_slag - means_vanslag[value.is_er_iets_bijzonders_gebeurd],2) : sd_vanslag[value.is_er_iets_bijzonders_gebeurd]+=Math.pow( +value.ik_ben_van_slag - means_vanslag[value.is_er_iets_bijzonders_gebeurd],2); }
        if(value.opgewektheid==null) { 0 } else{ (sd_opgewektheid[value.drukte]==undefined) ? sd_opgewektheid[value.drukte]=Math.pow(+value.opgewektheid - means_opgewektheid[value.drukte],2) : sd_opgewektheid[value.drukte]+=Math.pow( +value.opgewektheid - means_opgewektheid[value.drukte],2); }
        if(value.tekortschieten==null) { 0 } else{ (sd_tekort_schieten[value.drukte]==undefined) ? sd_tekort_schieten[value.drukte]=Math.pow(+value.tekortschieten - means_tekort_schieten[value.drukte],2) : sd_tekort_schieten[value.drukte]+=Math.pow( +value.tekortschieten - means_tekort_schieten[value.drukte],2); }
        if(value.opgewektheid==null) { 0 } else{ (sd_opgewektheid_dagritme[value.dagdeel]==undefined) ? sd_opgewektheid_dagritme[value.dagdeel]=Math.pow(+value.opgewektheid - means_opgewektheid_dagritme[value.dagdeel],2) : sd_opgewektheid_dagritme[value.dagdeel]+=Math.pow( +value.opgewektheid - means_opgewektheid_dagritme[value.dagdeel],2); }
        if(value.ontspanning==null) { 0 } else{ (sd_ontspanning_dagritme[value.dagdeel]==undefined) ? sd_ontspanning_dagritme[value.dagdeel]=Math.pow(+value.ontspanning - means_ontspanning_dagritme[value.dagdeel],2) : sd_ontspanning_dagritme[value.dagdeel]+=Math.pow( +value.ontspanning - means_ontspanning_dagritme[value.dagdeel],2); }
        if(value.somberheid==null) { 0 } else{ (sd_somberheid_dagritme[value.dagdeel]==undefined) ? sd_somberheid_dagritme[value.dagdeel]=Math.pow(+value.somberheid - means_somberheid_dagritme[value.dagdeel],2) : sd_somberheid_dagritme[value.dagdeel]+=Math.pow( +value.somberheid - means_somberheid_dagritme[value.dagdeel],2); }
        if(value.onrust==null) { 0 } else{ (sd_onrust_dagritme[value.dagdeel]==undefined) ? sd_onrust_dagritme[value.dagdeel]=Math.pow(+value.onrust - means_onrust_dagritme[value.dagdeel],2) : sd_onrust_dagritme[value.dagdeel]+=Math.pow( +value.onrust - means_onrust_dagritme[value.dagdeel],2); }
    });


    for(var temp in sd_beweging) { sd_beweging[temp] = Math.sqrt(sd_beweging[temp]/freq_dagdeel[temp]);  }
    for(var temp in sd_vanslag) { sd_vanslag[temp] = Math.sqrt(sd_vanslag[temp]/freq_bijzonder[temp]);  }
    for(var temp in sd_opgewektheid) { sd_opgewektheid[temp] = Math.sqrt(sd_opgewektheid[temp]/freq_drukte[temp]);  }
    for(var temp in sd_tekort_schieten) { sd_tekort_schieten[temp] = Math.sqrt(sd_tekort_schieten[temp]/freq_drukte[temp]);  }
    for(var temp in sd_opgewektheid_dagritme) { sd_opgewektheid_dagritme[temp] = Math.sqrt(sd_opgewektheid_dagritme[temp]/freq_dagdeel[temp]);  }
    for(var temp in sd_ontspanning_dagritme) { sd_ontspanning_dagritme[temp] = Math.sqrt(sd_ontspanning_dagritme[temp]/freq_dagdeel[temp]);  }
    for(var temp in sd_somberheid_dagritme) { sd_somberheid_dagritme[temp] = Math.sqrt(sd_somberheid_dagritme[temp]/freq_dagdeel[temp]);  }
    for(var temp in sd_onrust_dagritme) { sd_onrust_dagritme[temp] = Math.sqrt(sd_onrust_dagritme[temp]/freq_dagdeel[temp]);  }

    // Arrange frequencies and means

    for(var prop in freq_waar_was_ik) {
        data_waar_was_ik.push({'name':prop,'value':freq_waar_was_ik[prop]})
    }

    for(var prop in freq_wat_deed_ik) {
        data_wat_deed_ik.push({'name':prop,'value':freq_wat_deed_ik[prop]})
    }

    for(var prop in freq_slaapduur) {
        data_slaapduur.push({'name':prop,'value':freq_slaapduur[prop]})
    }

    for(var prop in freq_gezelschap) {
        data_gezelschap.push({'name':prop,'value':freq_gezelschap[prop]})
    }

    for(var mean in means_plezierigheid_activiteit) {
        means_plezierigheid_activiteit[mean] = means_plezierigheid_activiteit[mean]/freq_wat_deed_ik[mean];
        data_plezierigheid_activiteit.push({'activiteit':mean,'plezier': means_plezierigheid_activiteit[mean],'frequency':Math.log(freq_wat_deed_ik[mean])})
    }

    for(var mean in means_eigenwaarde) {
        means_eigenwaarde[mean] = means_eigenwaarde[mean]/freq_waar_was_ik[mean];
        data_eigenwaarde.push({'name':mean,'value': means_eigenwaarde[mean],'frequency':Math.log(freq_waar_was_ik[mean])})
    }

    for(var dagdeel in means_beweging) {
        data_beweging.push({'name':dagdeel,'value': means_beweging[dagdeel],'frequency':freq_dagdeel[dagdeel],'sd':sd_beweging[dagdeel]})
    }

    for(var mean in means_vanslag) {
        data_vanslag.push({'name':mean,'value': means_vanslag[mean],'frequency':freq_bijzonder[mean],'sd':sd_vanslag[mean]})
    }

    for(var mean in means_opgewektheid) {
        data_opgewektheid.push({'name':mean,'value': means_opgewektheid[mean],'frequency':freq_drukte[mean],'sd':sd_opgewektheid[mean]})
    }

    for(var mean in means_tekort_schieten) {
        data_tekort_schieten.push({'name':mean,'value': means_tekort_schieten[mean],'frequency':freq_drukte[mean],'sd':sd_tekort_schieten[mean]})
    }

    for(var mean in means_opgewektheid_dagritme) {
        data_positief_dagritme.push({'name':mean,'opgewektheid': means_opgewektheid_dagritme[mean],'ontspanning': means_ontspanning_dagritme[mean],'frequency':freq_dagdeel[mean],'sd_opgewektheid':sd_opgewektheid_dagritme[mean],'sd_ontspanning':sd_ontspanning_dagritme[mean]})
    }

    for(var mean in means_somberheid_dagritme) {
        data_negatief_dagritme.push({'name':mean,'somberheid': means_somberheid_dagritme[mean],'onrust': means_onrust_dagritme[mean],'frequency':freq_dagdeel[mean],'sd_somberheid':sd_somberheid_dagritme[mean],'sd_onrust':sd_onrust_dagritme[mean]})
    }


}

/*
 * Render functions
 *
 */


//
//-- 1 - Waar was ik
// Render waar_was_ik pie chart
function render_pieWaar() {
    var plotPie = hgiPie().mapping(['name','value']);
    d3.select('#pieWaar').datum(data_waar_was_ik).call(plotPie);
}

// Render wat_deed_ik pie chart
function render_pieWat() {
    var plotPie = hgiPie().mapping(['name','value']);
    d3.select('#pieWat').datum(data_wat_deed_ik).call(plotPie);
}

// Render plezierigheid_activiteit bubble chart
function render_bubbleActiviteit() {
    var plotBubble = hgiBubble().mapping(['plezier','activiteit']).weightMapping('frequency').xDomain([0,100]).orderBubbles(true).yAxis(false).xLabel('Plezierigheid activiteit');
    d3.select('#bubbleActiviteit').datum(data_plezierigheid_activiteit).call(plotBubble);
}


//
//-- 2 - Positieve en negatieve gevoelens
// Render 'Positieve gevoelens' line chart
function render_linePositief() {
    var plotLine = hgiLine().mapping(['meetmoment','opgewektheid','ontspanning']).yDomain([0,100]).legend(['Opgewektheid','Ontspanning']).yTicks(5).xLabel('Meetmoment').yLabel('Positieve gevoelens');
    //plotLine.overlayScale(0.75).overlayOffset(11);
    d3.select('#linePositief').datum(data).call(plotLine);
}

// Render 'Negatieve gevoelens' chart
function render_lineNegatief() {
    var plotLine = hgiLine().mapping(['meetmoment','somberheid','onrust']).yDomain([0,100]).legend(['Somberheid','Onrust']).yTicks(5).xLabel('Meetmoment').yLabel("Negatieve gevoelens");
    d3.select('#lineNegatief').datum(data).call(plotLine);
}


//
//-- 3 - Dagritmes
//
// Render positieve gevoelens paired histogram chart
function render_pairedPositief() {
    var histPG = hgiPairedHistogram().mapping(['name','opgewektheid','ontspanning']).errorMapping(['sd_opgewektheid','sd_ontspanning']).yDomain([0,100]).addLabels(false).addError(true).yTicks(5).legend(['Opgewektheid','Ontspanning']);
    d3.select('#pairedPositief').datum(data_positief_dagritme).call(histPG);
}

// Render negatieve gevoelens paired histogram chart
function render_pairedNegatief() {
    var histPG = hgiPairedHistogram().mapping(['name','somberheid','onrust']).errorMapping(['sd_somberheid','sd_onrust']).yDomain([0,100]).addLabels(false).addError(true).yTicks(5).legend(['Somberheid','Onrust']);
    d3.select('#pairedNegatief').datum(data_negatief_dagritme).call(histPG);
}

// Render slaap histogram
function render_histSlaap() {
    var histG = hgiHistogram().height(350).margin({top: 20, right: 50, bottom: 90, left: 50}).mapping(['datum','slaapkwaliteit']).yDomain([0,100]).rotateXScale(true).yTicks(5).yLabel('Slaapkwaliteit');
    d3.select('#histSlaap').datum(data).call(histG);
}

// Render gezelschap pie chart
function render_pieSlaap() {
    var plotPie = hgiPie().mapping(['name','value']).pieColor(d3.scale.category10());
    d3.select('#pieSlaap').datum(data_slaapduur).call(plotPie);
}




//
//-- 4 - Eigenwaarde
// Render eigenwaarde line chart
function render_lineEigenwaarde() {
    var plotLine = hgiLine().mapping(['meetmoment','piekeren','eigenwaarde']).yDomain([0,100]).legend(['Gepieker','Eigenwaarde']).xLabel('Meetmoment').yTicks(5);
    d3.select('#lineEigenwaarde').datum(data).call(plotLine);
}

// Render eigenwaarde bubble chart
function render_bubbleEigenwaarde() {
    var plotBubble = hgiBubble().mapping(['value','name']).weightMapping('frequency').xDomain([0,100]).orderBubbles(true).yAxis(false).xLabel('Eigenwaarde');
    d3.select('#bubbleEigenwaarde').datum(data_eigenwaarde).call(plotBubble);
}




//
//-- 5 - Gezelschap
// Render gezelschap pie chart
function render_pieGezelschap() {
    var plotPie = hgiPie().mapping(['name','value']);
    d3.select('#pieGezelschap').datum(data_gezelschap).call(plotPie);
}

// Render opgewektheid bar chart
function render_barOpgewektheid() {
    var plotBar = hgiBar().mapping(['name','value']).errorMapping('sd').freqMapping('frequency').xDomain([0,100]).addError(true).addFrequencies(true).xLabel('Opgewektheid');
    d3.select('#barOpgewektheid').datum(data_opgewektheid).call(plotBar);
}

// Render opgewektheid bar chart
function render_barTekortSchieten() {
    var plotBar = hgiBar().mapping(['name','value']).errorMapping('sd').freqMapping('frequency').xDomain([0,100]).addError(true).addFrequencies(true).xLabel('Ik heb het gevoel tekort te schieten');
    d3.select('#barTekortSchieten').datum(data_tekort_schieten).call(plotBar);
}




//
//-- 6 - Bijzondere gebeurtenissen

// Render bar chart van slag
function render_barBijzonder() {
    var plotBar = hgiBar().margin({'top': 20, 'right': 20, 'bottom': 40, 'left': 110}).mapping(['name','value']).errorMapping('sd').freqMapping('frequency').title('Is er iets bijzonders gebeurd?').xDomain([0,100]).xLabel('Ik ben van slag').addError(true).addFrequencies(true);
    d3.select('#barBijzonder').datum(data_vanslag).call(plotBar);
}

// Render eigenwaarde line chart
function render_lineOngemak() {
    var plotLine = hgiLine().margin({'top': 20, 'right': 140, 'bottom': 40, 'left': 50}).mapping(['meetmoment','ik_ben_van_slag','lichamelijk_ongemak']).yDomain([0,100]).legend(['Ik ben van slag','Lichamelijk ongemak']).yTicks(5).xTicks(5).xLabel('Meetmoment');
    d3.select('#lineOngemak').datum(data).call(plotLine);
}

//
//-- 7 - Bijzondere gebeurtenissen
// Render 'Beweging' line chart
function render_lineBeweging() {
    var plotLine = hgiLine().margin({'top': 20, 'right': 100, 'bottom': 40, 'left': 50}).mapping(['meetmoment','beweging','buiten_zijn']).yDomain([0,100]).legend(['Beweging','Buiten zijn']).yTicks(5).xLabel('Meetmoment');
    d3.select('#lineBeweging').datum(data).call(plotLine);
}

// Render 'Beweging' bar chart
function render_barBeweging() {
    var plotHist = hgiHistogram().mapping(['name','value']).errorMapping('sd').yDomain([0,100]).addLabels(false).addError(true).yTicks(5).yLabel('Beweging');
    d3.select('#barBeweging').datum(data_beweging).call(plotHist);
}

// Render 'Somberheid - beweging' scatter
function render_scatterSomber() {
    var plotS = hgiScatter().mapping(['beweging','somberheid']).addLOESS(true).xLabel('Beweging').yLabel('Somberheid').yTicks(5).xTicks(5);
    d3.select('#scatterSomber').datum(data).call(plotS);
}



//
//-- 8 - Eigen factor
// Render 'Eigen factor' line chart
function render_lineHoeGaatHet() {
    var plotLine = hgiLine().width(625).margin({'top': 20, 'right': 130, 'bottom': 40, 'left': 50}).mapping(['meetmoment','uw_eigen_factor','hoe_gaat_het_met_u']).yDomain([0,100]).legend(['Uw eigen factor','Hoe gaat het met u?']).yTicks(5).xLabel('Meetmoment');
    d3.select('#lineHoeGaatHet').datum(data).call(plotLine);
}

// Render 'Eigen factor' scatter
function render_scatterHoeGaatHet() {
    var plotS = hgiScatter().mapping(['uw_eigen_factor','hoe_gaat_het_met_u']).addLOESS(true).xLabel('Uw eigen factor').yLabel('Hoe gaat het met u?').xTicks(5).yTicks(5);
    d3.select('#scatterHoeGaatHet').datum(data).call(plotS);
}

// Render 'Eigen factor' scatter
function render_scatterOnrust() {
    var plotS = hgiScatter().mapping(['uw_eigen_factor','onrust']).addLOESS(true).xLabel('Uw eigen factor').yLabel('Onrust').xTicks(5).yTicks(5);
    d3.select('#scatterOnrust').datum(data).call(plotS);
}



//
//-- 9 - Netwerk
function render_netGelijk() {
    var plotN = hgiNetwork().maxStrokeWidth(5).minStrokeWidth(1).linkDistance(65).linkStrength(2).doWeightedCharge(true).gravity(0.1).friction(0.8);
    d3.select('#netGelijk').datum(data_undirectedNetwerk).call(plotN);
}

function render_netDynamisch(location) {
    var plotN = hgiNetwork().doStaticLayout(true).maxStrokeWidth(4).minStrokeWidth(1).isDirectedGraph(true).linkDistance(175).linkStrength(2).charge(-3000).gravity(0.3).friction(0.6);
    if (location === undefined) location = "#netDynamisch";

    d3.select(location).datum(data_directedNetwerk).call(plotN);
}

