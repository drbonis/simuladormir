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
        $('#pgprin').on('pagebeforeshow', function(event){
            console.log('pagebeforeshow prin');
            $('#exam_submit').click(function(event){
                event.preventDefault();
                pgexam.npreg = parseInt($('#numpreg').val());
                $.when(pgprin.getQuestions(pgexam.npgreg, true)).done(function(q){
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
                return deferred.resolve({'success': true, 'questions': response});
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
    npreg: 20,
    questions: [],
    initialize: function() {
        $("#detalles").hide();
        pgexam.i = 0;
        pgexam.initialize_options(pgexam.i);
 
        $("#next_question").on('click',function(event){
            event.preventDefault();
            $('#respul .resp').removeClass('incorrecto correcto');  
            $("#detalles").hide();
            console.log(pgexam);
            console.log("pgexam");
            if(pgexam.i % 5 == 0 && pgexam.i > 0) {
                console.log("lanzo getQuestions en medio");
                $.when(pgprin.getQuestions(5, false)).done(function(q){
                    pgexam['questions'].push(q['questions']);
                    pgexam['questions'].splice(0,5);
                    console.log("convierto i = 0");
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
            console.log(pgexam['questions'].length-1, pgexam.i);
            respuesta = parseInt(String($(this).attr('id')).substr(2,1));
            console.log("i: "+pgexam.i);
            if(respuesta == pgexam['questions'][pgexam.i]['resp']){
                $(this).addClass('correcto');
                console.log("correcto");
            } else {
                $('#op'+String(pgexam['questions'][pgexam.i]['resp'])).addClass('correcto');
                $(this).addClass('incorrecto');
                console.log("Incorrecto!");
            }
            $('#op1').html(pgexam['questions'][pgexam.i]['responses'][0]+'%: '+$('#op1').html());
            $('#op2').html(pgexam['questions'][pgexam.i]['responses'][1]+'% : '+$('#op2').html());
            $('#op3').html(pgexam['questions'][pgexam.i]['responses'][2]+'% : '+$('#op3').html());
            $('#op4').html(pgexam['questions'][pgexam.i]['responses'][3]+'% : '+$('#op4').html());
            $('#op5').html(pgexam['questions'][pgexam.i]['responses'][4]+'% : '+$('#op5').html());
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