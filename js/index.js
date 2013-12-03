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
                alert(env.hosturi+'.env/questiontest.json');
                $.when(pgprin.getQuestions(pgexam.npgreg)).done(function(q){
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
        
    getQuestions: function(n) {
        var interval = setInterval(function() {
            $.mobile.loading('show', {text: "Cargando preguntas", textVisible: true, theme: "e"});
            clearInterval(interval);
        },1);   
        
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
    npreg: 20,
    questions: '',
    initialize: function() {
        var i = 0;
        pgexam.initialize_options(i);
        $("#enunciado").html(this['questions'][0]['enun']);
        $("#op1").html(this['questions'][0]['op1']);
        $("#op2").html(this['questions'][0]['op2']);
        $("#op3").html(this['questions'][0]['op3']);
        $("#op4").html(this['questions'][0]['op4']);
        $("#op5").html(this['questions'][0]['op5']);

                

        
        $("#next_question").on('click',function(event){
            event.preventDefault();
            pgexam.reset_responses();
            i++;
            $("#enunciado").html(pgexam['questions'][i]['enun']);
            $("#op1").html(pgexam['questions'][i]['op1']);
            $("#op2").html(pgexam['questions'][i]['op2']);
            $("#op3").html(pgexam['questions'][i]['op3']);
            $("#op4").html(pgexam['questions'][i]['op4']);
            $("#op5").html(pgexam['questions'][i]['op5']);
            pgexam.initialize_options(i);
        });
        

    },
    
    initialize_options: function(i){
        console.log('initialize_options');
        $('#respul .resp').on('click',function(d){
            pgexam.reset_responses();
            $('#respul .resp').unbind('click');
            if(i<pgexam['questions'].length-1) {
                original_classes = $(this).attr('class');
                respuesta = parseInt(String($(this).attr('id')).substr(2,1));
                if(respuesta == pgexam['questions'][i]['resp']){
                    $(this).attr('class',original_classes+" correcto");
                    console.log("correcto");
                } else {
                    $('#op'+String(pgexam['questions'][i]['resp'])).attr('class',$('#op'+String(pgexam['questions'][i]['resp'])).attr('class')+" correcto");
                    $(this).attr('class',original_classes+" incorrecto");
                    console.log("Incorrecto!");
                }
            } else {
                $("#next_question").attr('style','display:none');
                respuesta = parseInt(String($(this).attr('id')).substr(2,1));
                if(respuesta === pgexam['questions'][i]['resp']){
                    $(this).attr('class',original_classes+" correcto");
                    console.log("correcto");
                } else {
                    $('#op'+String(pgexam['questions'][i]['resp'])).attr('class',$('#op'+String(pgexam['questions'][i]['resp'])).attr('class')+" correcto");
                    $(this).attr('class',original_classes+" incorrecto");
                    console.log("Incorrecto!");
                }
            }
            
        });   
    },
    
    
    reset_responses: function() {
        $('#op1').removeClass('incorrecto correcto');
        $('#op2').removeClass('incorrecto correcto');
        $('#op3').removeClass('incorrecto correcto');
        $('#op4').removeClass('incorrecto correcto');
        $('#op5').removeClass('incorrecto correcto');
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