/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

$.ajaxSetup({ cache:false });

var app = {
    // Application Constructor
    initialize: function() {
        console.log('initialize app');
        this.bindEvents();
        
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        
        if(id === 'deviceready') {
            
            $('#deviceready').on('click', function(){
                $.mobile.changePage("prin.html",{
                    transition              : 'slide',
                    showLoadMsg             : true
                });
            });
            

        }
        

    }
};

var pgprin = {
    initialize: function () {
        console.log("pgprin.initialize()");
        console.log(pgexam.punref);
        pgexam.calculaTop();
        
        $('#pgprin').on('pagebeforeshow', function(event){
            console.log('pagebeforeshow prin');
            $('#exam_submit').click(function(event){
                event.preventDefault();
                pgexam.npreg = parseInt($('#numpreg').val());
                //$.when(pgprin.getQuestions(pgexam.npreg, true)).done(function(q){
                $.when(pgprin.getQuestions(10, true)).done(function(q){
                    if(q['success']) {
                        pgexam.questions = q['questions'];
                        $.mobile.changePage("exam.html",{
                                allowSamePageTransition : false,
                                transition              : 'slide',
                                showLoadMsg             : true,
                                reloadPage              : true,
                                changeHash              : false,
                                crossDomain             : true,
                                data                    : $('#numpreg').val(),
                                type                    : "post"
                        });
                    } else {
                        console.log('Error al recuperar preguntas');
                    }
                });


            });
        });
        
        $('#pgprin').on('pageshow', function(event){
            console.log('pageshow pgprin');
        });
        },
        
    getQuestions: function(n,roll) {
        if(roll) {
        var interval = setInterval(function() {
            $.mobile.loading('show', {text: "Cargando preguntas", textVisible: true, theme: "e"});
            clearInterval(interval);
        },1);   
        }
        var deferred = $.Deferred();
        
        $.ajax({
            url: env.hosturi+'.env/questiontest.json', 
            success: function(response){
                console.log("exito ajax");
                return deferred.resolve({'success': true, 'questions': response.slice(0,n)});
            },
            error: function(request, status, error) {
                console.log("fracaso ajax");
                console.log(request);
                console.log(status);
                console.log(error);
                return deferred.resolve({'success':false, 'error': error, 'request': request, 'status':status});
            }
        });
        console.log(env.hosturi);
        return deferred.promise();
    }
      
};




var pgexam = {
    i: 0,
    npreg: 0,
    correctas: 0,
    incorrectas: 0,
    punref: 0,
    puntuacion: 0,
    questions: [],
    initialize: function() {
        $("#detalles").hide();
        pgexam.i = 0;
        pgexam.initialize_options(pgexam.i);
 
        $("#next_question").on('click',function(event){
            event.preventDefault();
            $('#respul .resp').removeClass('incorrecto correcto');  
            $("#detalles").hide();
            if((pgexam.i+1) % 5 == 0 && pgexam.i > 0) {
                console.log("lanzo getQuestions en medio");
                $.when(pgprin.getQuestions(5, false)).done(function(q){
                    pgexam['questions'] = pgexam['questions'].concat(q['questions']);
                    pgexam['questions'].splice(0,5);
                    pgexam.i=0;
                    console.log(pgexam);
                });
            }
            pgexam.i++;
            pgexam.initialize_options(pgexam.i);
        });
        

    },
    
    initialize_options: function(i){
        
        console.log('initialize_options');
        console.log(pgexam['questions']);
        $("#enunciado").html(pgexam['questions'][pgexam.i]['enun']);
        $("#op1").html(pgexam['questions'][pgexam.i]['options'][0]);
        $("#op2").html(pgexam['questions'][pgexam.i]['options'][1]);
        $("#op3").html(pgexam['questions'][pgexam.i]['options'][2]);
        $("#op4").html(pgexam['questions'][pgexam.i]['options'][3]);
        $("#op5").html(pgexam['questions'][pgexam.i]['options'][4]);
        
        $('#respul .resp').on('click',function(d){
            $('#respul .resp').removeClass('incorrecto correcto');    
            if(pgexam.i>=pgexam['questions'].length-1) {
                $("#next_question").hide();
            } 
            $("#detalles").show();
            
            $('#respul .resp').unbind('click');

            respuesta = parseInt(String($(this).attr('id')).substr(2,1));

            if(respuesta == pgexam['questions'][pgexam.i]['resp']){
                $(this).addClass('correcto');
                pgexam.correctas++;
                console.log("correcto");
            } else {
                $('#op'+String(pgexam['questions'][pgexam.i]['resp'])).addClass('correcto');
                $(this).addClass('incorrecto');
                pgexam.incorrectas++;
                console.log("Incorrecto!");
            }
            console.log(pgexam);
            mypuntuacion = (pgexam.correctas * 3 - pgexam.incorrectas) * 90 / pgexam.punref;
            pgexam.puntuacion = (mypuntuacion).toFixed(4);
            
            $("#puntuacion").find('.ui-btn-text').text(String(pgexam.puntuacion));
            $("#contadorcorrectas").find('.ui-btn-text').text(String(pgexam.correctas));
            $("#contadorincorrectas").find('.ui-btn-text').text(String(pgexam.incorrectas));
                        
            $('#op1').html($('#op1').html()+' ['+pgexam['questions'][pgexam.i]['responses'][0]+'%]');
            $('#op2').html($('#op2').html()+' ['+pgexam['questions'][pgexam.i]['responses'][1]+'%]');
            $('#op3').html($('#op3').html()+' ['+pgexam['questions'][pgexam.i]['responses'][2]+'%]');
            $('#op4').html($('#op4').html()+' ['+pgexam['questions'][pgexam.i]['responses'][3]+'%]');
            $('#op5').html($('#op5').html()+' ['+pgexam['questions'][pgexam.i]['responses'][4]+'%]');
        });   
    },
    
    getTopPuntos: function() {
        
        /*var deferred = $.Deferred();
        
        $.ajax({
            url: env.hosturi+'.env/toppuntos.json', 
            success: function(response){
                console.log("exito ajax");
                return deferred.resolve({'success': true, 'toppuntos': response});
            },
            error: function(request, status, error) {
                console.log("fracaso ajax");
                console.log(request);
                console.log(status);
                console.log(error);
                return deferred.resolve({'success':false, 'error': error, 'request': request, 'status':status});
            }
        });
        return deferred.promise();*/
        
        return {'success': true, 'toppuntos': [
                {'name': 'Juan López', 'c': 10, 'i': 50},
                {'name': 'Pedro Portillo', 'c': 20, 'i': 50},
                {'name': 'Luis Alfonso', 'c': 30, 'i': 50},
                {'name': 'Manuel Díez', 'c': 40, 'i': 50},
                {'name': 'Julio Bonis', 'c': 50, 'i': 50},
                {'name': 'Antonio Pérez', 'c': 50, 'i': 50},
                {'name': 'Manuel Díez', 'c': 40, 'i': 50},
                {'name': 'Juancho Popo', 'c': 30, 'i': 50},
                {'name': 'Tiranías', 'c': 20, 'i': 50},
                {'name': 'Leviatán', 'c': 10, 'i': 50}
            ]}
    }, 
    
    calculaTop: function() {
        console.log("ejecuto pgexam.punref");
        $.when(pgexam.getTopPuntos()).done(function(response) {
            if(response['success']) {
                t = response['toppuntos'];
                prom = Math.round(((t[0]['c'] * 3 - t[0]['i']) + (t[1]['c'] * 3 - t[1]['i']) + (t[2]['c'] * 3 - t[2]['i']) +(t[3]['c'] * 3 - t[3]['i']) + (t[4]['c'] * 3 - t[4]['i']) + (t[5]['c'] * 3 - t[5]['i']) + (t[6]['c'] * 3 - t[6]['i']) + (t[7]['c'] * 3 - t[7]['i']) + (t[8]['c'] * 3 - t[8]['i']) + (t[9]['c'] * 3 - t[9]['i'])) / 10,4);
                //prom = ((t[0]['c'] - 3 * t[0]['i']));
                console.log(prom);
                pgexam.punref = prom;  
                console.log(pgexam);
            } else {
                pgexam.punref = 0;
                console.log(pgexam);
            }
        });

    
    }
    
}    

/*
var exam2 = {
    getQuestions: function (n) {
        var interval = setInterval(function(){
            $.mobile.loading( 'show', {text: "Recuperando mensajes", textVisible: true, theme: "e"});
            clearInterval(interval);
        },1); 

        var deferred = $.Deferred();

        $.ajax({
            url: api_url+"?f=getQuestions&num="+n+"&jsoncallback=?", type: "GET", dataType: 'jsonp',
            success: function(response) {  
                $.mobile.loading( 'hide');
                //alert(JSON.stringify(response));            
                return deferred.resolve(response);
            },
            error: function(request, status, error) {
                $.mobile.loading( 'hide');
                return deferred.resolve({'success':false, 'error': error, 'request': request, 'status':status });
            }
        }); 
        return deferred.promise();
    }  
};
*/