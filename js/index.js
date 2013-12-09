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
        //console.log('initialize app');
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
        //console.log("pgprin.initialize()");
        
        $('#pgprin').on('pagebeforeshow', function(event){
            $('#exam_submit').click(function(event){
                event.preventDefault();

                pgexam.npreg = parseInt($('#numpreg').val());
                pgexam.nickname = $('#nickname').val();
                //console.log("nickname: "+pgexam.nickname);
                //$.when(pgprin.getQuestions(pgexam.npreg, true)).done(function(q){
                $.when(pgprin.getQuestions(10, true)).done(function(q){
                    
                    if(q['success']) {
                        pgexam.questions = q['questions'];
                        pgexam.initialize();
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
                        //meter aqui mensaje error "fallo al cargar preguntas"
                        $.mobile.changePage("index.html",{
                            transition              : 'slide',
                            showLoadMsg             : false
                        });
                    }
                });


            });
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
            //url: env.hosturi+'.env/questiontest.json', 
            url: env.hosturi+"server/api/simulamir.php?f=getQuestions&n="+n+"&jsoncallback=?", type: "GET", dataType: 'jsonp',
            success: function(response){
                //console.log("exito ajax");
                return deferred.resolve({'success': true, 'questions': response['preguntas'].slice(0,n)});
            },
            error: function(request, status, error) {
                //console.log("fracaso ajax");
                //console.log(request);
                //console.log(status);
                //console.log(error);
                return deferred.resolve({'success':false, 'error': error, 'request': request, 'status':status});
            }
        });
        //console.log(env.hosturi);
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
    respondidaflag: false,
    questions: [],
    nickname: '',
    idexam: 0,
    initialize: function() {
        console.log("refresh pgexam");
        $('#pgexam').trigger('refresh');        
        $("#detalles").hide();
        pgexam.i = 0;
        pgexam.puntuacion = 0;
        pgexam.correctas = 0;
        pgexam.incorrectas = 0;
        pgexam.respondida = false;
        
        $.when(pgexam.addExam(pgexam.nickname)).done(function(r){
            pgexam.idexam = r['idexam'];
            console.log("pgexam.initialize_options");
            pgexam.initialize_options(pgexam.i);
            
            
            
        
        
        $("#next_question").on('click',function(event){
            event.preventDefault();
            pgexam.respondidaflag = false;
            $('#respul .resp').removeClass('incorrecto correcto');  
            $("#detalles").hide();
            if((pgexam.i+1) % 5 == 0 && pgexam.i > 0) {
                //console.log("lanzo getQuestions en medio");
                $.when(pgprin.getQuestions(5, false)).done(function(q){
                    //console.log("pgprin.getQuestions ejecutado");
                    pgexam['questions'] = pgexam['questions'].concat(q['questions']);
                    pgexam['questions'].splice(0,5);
                    pgexam.i=0;
                    //console.log(pgexam);
                });
            }
            pgexam.i++;
            pgexam.initialize_options(pgexam.i);
        });

        $('#respul .resp').on('click',function(d){

           if (!pgexam.respondidaflag) {
            pgexam.respondidaflag = true;
            $("#detalles").show();
            respuesta = parseInt(String($(this).attr('id')).substr(2,1));
            
            if(respuesta == pgexam['questions'][pgexam.i]['resp']){
                $(this).addClass('correcto');
                pgexam.correctas++;
                result = 1;
            } else {
                $('#op'+String(pgexam['questions'][pgexam.i]['resp'])).addClass('correcto');
                $(this).addClass('incorrecto');
                pgexam.incorrectas++;
                result = 0;
            }
            //console.log("pgexam.idexam");
            //console.log(pgexam);
            pgexam.addResponse(pgexam.idexam, parseInt(pgexam['questions'][pgexam.i]['id']), respuesta, result);

            mypuntuacion = (pgexam.correctas * 3 - pgexam.incorrectas) * 90 / pgexam.punref;
            pgexam.puntuacion = (mypuntuacion).toFixed(2);
            totalrespuestas = 1+pgexam['questions'][pgexam.i]['respuestas']['n_tot'];
            numrespuestas = [
                pgexam['questions'][pgexam.i]['respuestas']['n_op1'],
                pgexam['questions'][pgexam.i]['respuestas']['n_op2'],
                pgexam['questions'][pgexam.i]['respuestas']['n_op3'],
                pgexam['questions'][pgexam.i]['respuestas']['n_op4'],
                pgexam['questions'][pgexam.i]['respuestas']['n_op5']
            ];
            numrespuestas[respuesta - 1]+=1;
            porcentajes = [
                Math.round(100*numrespuestas[0]/totalrespuestas),
                Math.round(100*numrespuestas[1]/totalrespuestas),
                Math.round(100*numrespuestas[2]/totalrespuestas),
                Math.round(100*numrespuestas[3]/totalrespuestas),
                Math.round(100*numrespuestas[4]/totalrespuestas)
            ];

                        
            $("#puntuacion").find('.ui-btn-text').text(String(pgexam.puntuacion));
            $("#contadorcorrectas").find('.ui-btn-text').text(String(pgexam.correctas));
            $("#contadorincorrectas").find('.ui-btn-text').text(String(pgexam.incorrectas));
                        
            $('#op1').html($('#op1').html()+' <span class="resp_small_font">['+porcentajes[0]+'%]</span>');
            $('#op2').html($('#op2').html()+' <span class="resp_small_font">['+porcentajes[1]+'%]</span>');
            $('#op3').html($('#op3').html()+' <span class="resp_small_font">['+porcentajes[2]+'%]</span>');
            $('#op4').html($('#op4').html()+' <span class="resp_small_font">['+porcentajes[3]+'%]</span>');
            $('#op5').html($('#op5').html()+' <span class="resp_small_font">['+porcentajes[4]+'%]</span>');
        }
        });   
            
            
            
            
            
            
            
        });
        
        

    },
    
    initialize_options: function(i){
        
        //console.log('initialize_options');
        //console.log(pgexam['questions']);
        $("#enunciado").html(pgexam['questions'][pgexam.i]['enun']);
        $("#op1").html(pgexam['questions'][pgexam.i]['op1']);
        $("#op2").html(pgexam['questions'][pgexam.i]['op2']);
        $("#op3").html(pgexam['questions'][pgexam.i]['op3']);
        $("#op4").html(pgexam['questions'][pgexam.i]['op4']);
        $("#op5").html(pgexam['questions'][pgexam.i]['op5']);
        
        imgname = pgexam['questions'][pgexam.i]['url'];
        if(imgname != 'null.jpg') {
            $('#imagendiv').attr('style','display:block');
            $('#imagen').attr('src',env.hosturi+'server/pregimg/'+imgname);
        } else {
            $('#imagendiv').attr('style','display:none');
            $('#imagen').attr('src','');
        }
        
    },
        
    calculaTop: function() {
        //console.log("ejecuto pgexam.punref");
        //console.log("pgpunt.top10");
        //console.log(pgpunt.top10);
        t = pgpunt.top10;
        if (t.length < 10) {
            prom = 1;
        } else {
            prom = Math.round(((t[0]['c'] * 3 - t[0]['i']) + (t[1]['c'] * 3 - t[1]['i']) + (t[2]['c'] * 3 - t[2]['i']) +(t[3]['c'] * 3 - t[3]['i']) + (t[4]['c'] * 3 - t[4]['i']) + (t[5]['c'] * 3 - t[5]['i']) + (t[6]['c'] * 3 - t[6]['i']) + (t[7]['c'] * 3 - t[7]['i']) + (t[8]['c'] * 3 - t[8]['i']) + (t[9]['c'] * 3 - t[9]['i'])) / 10,4);
        }
        //prom = ((t[0]['c'] - 3 * t[0]['i']));
        //console.log("puntuacion referencia");
        //console.log(prom);
        pgexam.punref = prom;  
        //console.log(pgexam);

    },
    
    addExam: function(nickname){
        var deferred = $.Deferred();
        
        $.ajax({
            //url: env.hosturi+'.env/toppunt.json', 
            url: env.hosturi+"server/api/simulamir.php?f=addExam&nickname="+nickname+"&jsoncallback=?", type: "GET", dataType: 'jsonp',
            success: function(response){
                return deferred.resolve({'success': true, 'idexam': response['idexam']});
            },
            error: function(request, status, error) {
                return deferred.resolve({'success':false, 'error': error, 'request': request, 'status':status});
            }
        });

        return deferred.promise();
    },
    addResponse: function(idexam, idpreg, op, result){
        //var deferred = $.Deferred();
        
        $.ajax({
            //url: env.hosturi+'.env/toppunt.json', 
            url: env.hosturi+"server/api/simulamir.php?f=addResponse&idexam="+idexam+"&idpreg="+idpreg+"&op="+op+"&result="+result+"&jsoncallback=?", type: "GET", dataType: 'jsonp',
            success: function(response){
                //console.log("exito ajax addResponse");
                return {'success': true, 'idresp': response['idresp']};
                //return deferred.resolve({'success': true, 'idresp': response['idresp']});
            },
            error: function(request, status, error) {
                //console.log("fracaso ajax addResponse");
                //console.log(request);
                //console.log(status);
                //console.log(error);
                return {'success':false, 'error': error, 'request': request, 'status':status};
                //return deferred.resolve({'success':false, 'error': error, 'request': request, 'status':status});
            }
        });

        //return deferred.promise();
    }
    
}  

var pgpunt = {
    top10 : [],
    top100 : [],
    
    preinitialize: function() {
        //console.log("pgpunt initialize");
        $.when(this.getTopPuntos(10)).done(function(response){
            if(response['success']){
                pgpunt.top10 = response['top'];
            }
            //console.log("getTopPuntos10");
            //console.log(response);
            //console.log("pgpunt.top10");
            //console.log(pgpunt.top10);

            //console.log("ahora lanzo calculaTop");
            pgexam.calculaTop();
        });
        $.when(this.getTopPuntos(100)).done(function(response){
            //console.log(response);
            if(response['success']){
                pgpunt.top100 = response['top'];
            }
        });
        
  
    },
    
    initialize: function(){
        $('#pgpunt').on('pagebeforeshow',function(event){
            //console.log("TOPLIST");
            //console.log(pgpunt.top100.length);
            for (i=0; i<pgpunt.top10.length; ++i) {
                $('#toplist').html($('#toplist').html()+'<li class="hallfame">'+pgpunt.top100[i]['name']+' / '+pgpunt.top100[i]['netas']+' / '+pgpunt.top100[i]['c']+' / '+pgpunt.top100[i]['i']+'</li>');
            }
            $('#toplist').listview('refresh');
            
        });  
    },
    
    getTopPuntos: function(n) {

        var deferred = $.Deferred();
        
        $.ajax({
            //url: env.hosturi+'.env/toppunt.json', 
            url: env.hosturi+"server/api/simulamir.php?f=getTop&n="+n+"&jsoncallback=?", type: "GET", dataType: 'jsonp',
            success: function(response){
                //console.log("exito ajax");
                return deferred.resolve({'success': true, 'top': response['top'].slice(0,n)});
            },
            error: function(request, status, error) {
                //console.log("fracaso ajax");
                //console.log(request);
                //console.log(status);
                //console.log(error);
                return deferred.resolve({'success':false, 'error': error, 'request': request, 'status':status});
            }
        });
        //console.log(env.hosturi);
        return deferred.promise();
    }
};

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