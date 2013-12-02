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
        if(id == 'deviceready') {
            self.location = 'prin.html';
            pgprin.initialize();
        }
        

    }
};

var pgprin = {
     initialize: function () {
        console.log("prin initialize");
        console.log($('#pgprin'));
        $('#pgprin').on('pagebeforeshow', function(event){
            console.log('pagebofeshow prin');
            $('#exam_submit').click(function(event){
                event.preventDefault();  
                //alert($('#numpreg').val());
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
            });
        });
        }
};
    
    


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