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


var app = {
    deviceready: function() {

        // wire buttons to functions

		$('#listButton').on('touchstart', function(){
    		app.list();
		});
		
		$('#sendButton').on('touchstart', function(){
    		app.sendData();
		});
		
		$('#disconnectButton').on('touchstart', function(){
    		app.disconnect();
		});
		
    	app.list();
    },
    list: function() {
    	habilitarCarregamento();
        
        bluetoothSerial.list(app.ondevicelist, app.generateFailureFunction("List Failed"));
    },
    connect: function() {
    	var device = arguments[0];

        alert("Connecting..."+device);
        console.log("Requesting connection to " + device);
        bluetoothSerial.connect(device, app.onconnect, app.ondisconnect);
        bluetoothSerial.subscribe("\n", app.onmessage, app.generateFailureFunction("Subscribe Failed"));
    },
    disconnect: function(event) {
        if (event) {
            event.preventDefault();
        }

        app.setStatus("Disconnecting...");
        bluetoothSerial.disconnect(app.ondisconnect);
    },
    sendData: function(event) {
    	event.preventDefault();

        var text = message.value + "\n";
        var success = function () {
            //messages.value = "";
            messages.value += ("Us: " + text);
            messages.scrollTop = messages.scrollHeight;
        };

        bluetoothSerial.write(text, success);
        bluetoothSerial.subscribe("\n", app.onmessage, app.generateFailureFunction("Subscribe Failed"));
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
        
        $('ul').html(deviceList);
        
        console.log(deviceList);

        if (devices.length === 0) {

            alert('sem devices');
        }
        
 	    $('li').on('touchstart', function(){
	        app.connect(this.id);
	    });

        desabilitarCarregamento();
    },
    onconnect: function() {
        alert("Conectado");
    },
    ondisconnect: function(reason) {
        var details = "";
        if (reason) {
            details += ": " + JSON.stringify(reason);
        }
        connection.style.display = "block";
        app.enable(connectButton);
        chat.style.display = "none";
        app.setStatus("Disconnected");
    },
    onmessage: function(message) {
		alert(message);
        messages.value += "Them: " + message+"\n";
        messages.scrollTop = messages.scrollHeight;
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
            app.setStatus(message + details);
        };
        return func;
    }
};