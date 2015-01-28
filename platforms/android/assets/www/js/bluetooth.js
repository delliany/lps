/*
    Chat Example for Bluetooth Serial PhoneGap Plugin
    http://github.com/don/BluetoothSerial
    Copyright 2013 Don Coleman
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

/* jshint quotmark: false, unused: vars */
/* global cordova, bluetoothSerial, listButton, connectButton, sendButton, disconnectButton */
/* global chatform, deviceList, message, messages, statusMessage, chat, connection */

var nome = '';
var app = {
    deviceready: function() {
    	app.list();
    },
    list: function() {
    	habilitarCarregamento();
        
        bluetoothSerial.list(app.ondevicelist, app.generateFailureFunction("List Failed"));
    },
    connect: function() {
    	var device = arguments[0];

        console.log("Requesting connection to " + device);
        bluetoothSerial.connect(device, app.onconnect, app.ondisconnect);
        bluetoothSerial.read(app.onmessage, app.generateFailureFunction("Read Failed"));
        bluetoothSerial.connectPlayer(app.onconnectplayer, function(){
        	alert('erro');
        });
    },
    disconnect: function(event) {
        if (event) {
            event.preventDefault();
        }

        app.setStatus("Disconnecting...");
        bluetoothSerial.disconnect(app.ondisconnect);
    },
    sendData: function() {

        var perolas = arguments[0];
        var success = function () 
        {
            console.log('esperando jogador fazer sua jogada ');
            $('.botao_passar').hide();
            
            if(!ultimaPerola){
                habilitarCarregamento('Esperando '+nome+' fazer sua jogada...');
            }
        };

        bluetoothSerial.write(perolas, success);
        bluetoothSerial.read(app.onmessage, app.generateFailureFunction("Read Failed"));
        return false;
    },
    ondevicelist: function(devices) {
        var deviceList = '';

        devices.forEach(function(device) 
		{
            if (device.hasOwnProperty("uuid")) {
				deviceList += '<li id="'+device.uuid+'">'+device.name+'</li>';
            } else if (device.hasOwnProperty("address")) {
				deviceList += '<li id="'+device.address+'">'+device.name+'</li>';
            } 
        });
        
        $('.bluetooth ul').html(deviceList);
        
        console.log(deviceList);

        if (devices.length === 0) {

            alert('sem devices');
        }
        
 	    $('.bluetooth li').on('touchstart', function(){
	        app.connect(this.id);
	    });

		var altura = $('.bluetooth ul').height();
		$('.bluetooth ul').css('margin-top','-'+(altura/2)+'px');

        desabilitarCarregamento();
    },
    onconnect: function(deviceName) {
        
    	nome = deviceName;
//    	alert('esperando '+deviceName+' conectarsse');
    	habilitarCarregamento('Esperando '+deviceName+' conectar...');
    },
    onconnectplayer: function() {
        
    	navigator.notification.activityStop();
    	//window.location = 'jogo.html?jogo=jogador&nome='+nome;
    	$('.titulo').text('Eu x '+nome);
		mostrarJogo();
    },
    ondisconnect: function(reason) {
        var details = "";
        if (reason) {
            details += ": " + JSON.stringify(reason);
        }

        alert("Disconnected "+details);
    },
    onmessage: function(message) {

    	navigator.notification.activityStop();
    	
    	if(message.indexOf("msg") != -1){
    		var msg = message.split('#');
    		
			$('#popup').show();
			$('#tituloMsg').text(msg[0].slice(message.indexOf("=")+1));
			$('#imgMsg').attr('src',msg[1]);
    		
    	}else{
    		
    		var perolas = message.split(';');
    		
    		for(var i=0; i<perolas.length-1; i++)
    		{
    			var linha = perolas[i].slice(0,1);
    	    	var coluna = perolas[i].slice(1);
    	    	
    			retirarPerola(parseInt(linha), parseInt(coluna));
    		}
    		
    		$('.botao_passar').show();
    	}
    },
    setStatus: function(message) { // setStatus
        console.log(message);

        window.clearTimeout(app.statusTimeout);
        statusMessage.innerHTML = message;
        statusMessage.className = 'fadein';

        // automatically clear the status with a timer
        app.statusTimeout = setTimeout(function () {
            statusMessage.className = 'fadeout';
        }, 5000);
    },
    enable: function(button) {
        button.className = button.className.replace(/\bis-disabled\b/g,'');
    },
    disable: function(button) {
        if (!button.className.match(/is-disabled/)) {
            button.className += " is-disabled";
        }
    },
    generateFailureFunction: function(message) {
        var func = function(reason) { // some failure callbacks pass a reason
            var details = "";
            if (reason) {
                details += ": " + JSON.stringify(reason);
            }
            alert(message + details);
        };
        return func;
    }
};