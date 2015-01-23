package com.megster.cordova;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.LOG;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

/**
 * PhoneGap Plugin for Serial Communication over Bluetooth
 */
public class BluetoothSerial extends CordovaPlugin {

    // actions
    private static final String LIST = "list";
    private static final String CONNECT = "connect";
    private static final String CONNECT_INSECURE = "connectInsecure";
    private static final String DISCONNECT = "disconnect";
    private static final String WRITE = "write";
    private static final String AVAILABLE = "available";
    private static final String READ = "read";
    private static final String READ_UNTIL = "readUntil";
    private static final String SUBSCRIBE = "subscribe";
    private static final String CONNECT_PLAYER = "connectPlayer";
    private static final String SUBSCRIBE_RAW = "subscribeRaw";
    private static final String UNSUBSCRIBE_RAW = "unsubscribeRaw";
    private static final String IS_ENABLED = "isEnabled";
    private static final String IS_CONNECTED = "isConnected";
    private static final String CLEAR = "clear";

    // callbacks
    private CallbackContext connectCallback;
    private CallbackContext testePlayerCallback;
    private CallbackContext dataAvailableCallback;
    private CallbackContext rawDataAvailableCallback;
    private CallbackContext readCallback;
    private CallbackContext listCallback;

    private BluetoothAdapter bluetoothAdapter;
    private BluetoothSerialService bluetoothSerialService;

    // Debugging
    private static final String TAG = "BluetoothSerial";
    private static final boolean D = true;

    // Message types sent from the BluetoothSerialService Handler
    public static final int MESSAGE_STATE_CHANGE = 1;
    public static final int MESSAGE_READ = 2;
    public static final int MESSAGE_WRITE = 3;
    public static final int MESSAGE_DEVICE_NAME = 4;
    public static final int MESSAGE_TOAST = 5;
    public static final int MESSAGE_READ_RAW = 6;

    // Key names received from the BluetoothChatService Handler
    public static final String DEVICE_NAME = "device_name";
    public static final String TOAST = "toast";
    private Set<BluetoothDevice> found_devices;
    private Context context;

    StringBuffer buffer = new StringBuffer();
    private String delimiter;

    
	public void initialize(CordovaInterface cordova, CordovaWebView webView) {
		super.initialize(cordova, webView);
		context = this.cordova.getActivity().getBaseContext();

		// Register for broadcasts when a device is discovered
		IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
		context.registerReceiver(mReceiver, filter);

		// Register for broadcasts when discovery starts
		filter = new IntentFilter(BluetoothAdapter.ACTION_DISCOVERY_STARTED);
		context.registerReceiver(mReceiver, filter);

		// Register for broadcasts when discovery has finished
		filter = new IntentFilter(BluetoothAdapter.ACTION_DISCOVERY_FINISHED);
		context.registerReceiver(mReceiver, filter);

		// Register for broadcasts when connectivity state changes
		filter = new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION);
		context.registerReceiver(mReceiver, filter);
	}
    
    @Override
    public boolean execute(String action, CordovaArgs args, CallbackContext callbackContext) throws JSONException {

        LOG.d(TAG, "action = " + action);
        
        found_devices = new HashSet<BluetoothDevice>();

        if (bluetoothAdapter == null) {
            bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        }

        if (bluetoothSerialService == null) {
            bluetoothSerialService = new BluetoothSerialService(mHandler);
        }

        boolean validAction = true;

        if (action.equals(LIST)) {

        	listCallback = callbackContext;
        	
			if (bluetoothAdapter.isDiscovering()) {
				bluetoothAdapter.cancelDiscovery();
			}

			Log.i(TAG, "Discovering devices...");
			bluetoothAdapter.startDiscovery();
			
            //listBondedDevices(callbackContext);

        } else if (action.equals(CONNECT)) {

            boolean secure = true;

            connect(args, secure, callbackContext);

        } else if (action.equals(CONNECT_INSECURE)) {

            // see Android docs about Insecure RFCOMM http://goo.gl/1mFjZY
            boolean secure = false;
            connect(args, false, callbackContext);

        } else if (action.equals(DISCONNECT)) {

            connectCallback = null;
            bluetoothSerialService.stop();
            callbackContext.success();

        } else if (action.equals(WRITE)) {

        	if (bluetoothSerialService.getState() == BluetoothSerialService.STATE_CONNECTED) {
                
            	byte[] data = args.getArrayBuffer(0);
                bluetoothSerialService.write(data);
                readCallback = callbackContext;
                callbackContext.success();
            }

        } else if (action.equals(AVAILABLE)) {

            callbackContext.success(available());

        } else if (action.equals(READ)) {

        	//readCallback = callbackContext;
        	testePlayerCallback = callbackContext;

        } else if (action.equals(READ_UNTIL)) {

            String interesting = args.getString(0);
            callbackContext.success(readUntil(interesting));

        }  else if (action.equals(CONNECT_PLAYER)) {

        	Log.i("delly", "aqui");
        	testePlayerCallback = callbackContext;

        } else if (action.equals(SUBSCRIBE_RAW)) {

            rawDataAvailableCallback = callbackContext;

            PluginResult result = new PluginResult(PluginResult.Status.OK);
            callbackContext.sendPluginResult(result);

        } else if (action.equals(UNSUBSCRIBE_RAW)) {

            rawDataAvailableCallback = null;

            callbackContext.success();

        } else if (action.equals(IS_ENABLED)) {

            if (bluetoothAdapter.isEnabled()) {
                callbackContext.success();
            } else {
                callbackContext.error("Bluetooth is disabled.");
            }

        } else if (action.equals(IS_CONNECTED)) {

            if (bluetoothSerialService.getState() == BluetoothSerialService.STATE_CONNECTED) {
                callbackContext.success();
            } else {
                callbackContext.error("Not connected.");
            }

        } else if (action.equals(CLEAR)) {

            buffer.setLength(0);
            callbackContext.success();

        } else {

            validAction = false;

        }

        return validAction;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (bluetoothSerialService != null) {
            bluetoothSerialService.stop();
        }
    }
    
	private final BroadcastReceiver mReceiver = new BroadcastReceiver() {
		public void onReceive(Context context, Intent intent) {

			String action = intent.getAction();
			JSONArray deviceList = new JSONArray();
			Log.i(TAG, "Action: " + action);

			if (BluetoothDevice.ACTION_FOUND.equals(action)) {

				BluetoothDevice device = intent
						.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
				Log.i(TAG, "Device found " + device.getName() + " "
						+ device.getBondState() + " " + device.getAddress());


		        found_devices.add(device);
	            
			} else if (BluetoothAdapter.ACTION_DISCOVERY_STARTED.equals(action)) {
				Log.i(TAG, "Discovery started");

			} else if (BluetoothAdapter.ACTION_DISCOVERY_FINISHED
					.equals(action)) {
				Log.i(TAG, "Discovery finilized");

		        Set<BluetoothDevice> bondedDevices = bluetoothAdapter.getBondedDevices();

		        for (BluetoothDevice device : bondedDevices) 
		        {
		            JSONObject json = new JSONObject();
		            
		            try {
			            json.put("name", device.getName());
			            json.put("address", device.getAddress());
			            json.put("id", device.getAddress());
			            
			            if (device.getBluetoothClass() != null) {
			                json.put("class", device.getBluetoothClass().getDeviceClass());
			            }
			            
			            deviceList.put(json);
			            
					} catch (JSONException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
		        }
		        
				for (BluetoothDevice device : found_devices) 
				{
					Log.i(TAG, device.getName() + " " + device.getAddress()
							+ " " + device.getBondState());
					JSONObject json = new JSONObject();
					
		            try {
		            	
						json.put("id", device.getAddress());
			            json.put("name", device.getName());
			            json.put("address", device.getAddress());
			            
				        if (device.getBluetoothClass() != null) {
				            json.put("class", device.getBluetoothClass().getDeviceClass());
				        }
				        
			            deviceList.put(json);
			            
					} catch (JSONException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}

				PluginResult result = new PluginResult(PluginResult.Status.OK,deviceList);
				listCallback.sendPluginResult(result);
			}
		}
	};
	
    private void listBondedDevices(CallbackContext callbackContext) throws JSONException {
        JSONArray deviceList = new JSONArray();
        Set<BluetoothDevice> bondedDevices = bluetoothAdapter.getBondedDevices();


    	
        for (BluetoothDevice device : bondedDevices) {
            JSONObject json = new JSONObject();
            json.put("name", device.getName());
            json.put("address", device.getAddress());
            json.put("id", device.getAddress());
            if (device.getBluetoothClass() != null) {
                json.put("class", device.getBluetoothClass().getDeviceClass());
            }
            deviceList.put(json);
        }
        callbackContext.success(deviceList);
    }

    private void connect(CordovaArgs args, boolean secure, CallbackContext callbackContext) throws JSONException {
        String macAddress = args.getString(0);
        BluetoothDevice device = bluetoothAdapter.getRemoteDevice(macAddress);

        if (device != null) {
            bluetoothSerialService.connect(device);
            callbackContext.success(device.getName());

        } else {
        	
            callbackContext.error("Could not connect to " + macAddress);
        }
    }

    // The Handler that gets information back from the BluetoothSerialService
    // Original code used handler for the because it was talking to the UI.
    // Consider replacing with normal callbacks
    private final Handler mHandler = new Handler() {

         public void handleMessage(Message msg) {
             switch (msg.what) {
                 case MESSAGE_READ:

                    byte[] readBuf = (byte[]) msg.obj;
                    // construct a string from the valid bytes in the buffer
                    String readMessage = new String(readBuf, 0, msg.arg1);
                    Log.i("message",readMessage);

                    if (readCallback != null) {
                        PluginResult result = new PluginResult(PluginResult.Status.OK, readMessage);
                        result.setKeepCallback(true);
                        readCallback.sendPluginResult(result);
                    }

                    break;
                 case MESSAGE_READ_RAW:
                    if (rawDataAvailableCallback != null) {
                        byte[] bytes = (byte[]) msg.obj;
                        sendRawDataToSubscriber(bytes);
                    }
                    break;
                 case MESSAGE_STATE_CHANGE:

                    if(D) Log.i(TAG, "MESSAGE_STATE_CHANGE: " + msg.arg1);
     
                    switch (msg.arg1) {
                        case BluetoothSerialService.STATE_CONNECTED:
                            Log.i(TAG, "BluetoothSerialService.STATE_CONNECTED");
                            
                            notifyConnectionSuccess();
                            
                            break;
                        case BluetoothSerialService.STATE_CONNECTING:
                            Log.i(TAG, "BluetoothSerialService.STATE_CONNECTING");
                            break;
                        case BluetoothSerialService.STATE_LISTEN:
                            Log.i(TAG, "BluetoothSerialService.STATE_LISTEN");
                            break;
                        case BluetoothSerialService.STATE_NONE:
                            Log.i(TAG, "BluetoothSerialService.STATE_NONE");
                            break;
                    }
                    break;
                case MESSAGE_WRITE:
                      byte[] writeBuf = (byte[]) msg.obj;
                      String writeMessage = new String(writeBuf);
                      Log.i(TAG, "Wrote: " + writeMessage);
                    break;
                case MESSAGE_DEVICE_NAME:
                    Log.i(TAG, msg.getData().getString(DEVICE_NAME));
                    break;
                case MESSAGE_TOAST:
                    String message = msg.getData().getString(TOAST);
                    notifyConnectionLost(message);
                    break;
             }
         }
    };

    private void notifyConnectionLost(String error) {
        if (testePlayerCallback != null) {
        	testePlayerCallback.error(error);
        	testePlayerCallback = null;
        }
    }

    private void notifyConnectionSuccess() {
        if (testePlayerCallback != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK);
            testePlayerCallback.sendPluginResult(result);
        }
    }

    private void sendRawDataToSubscriber(byte[] data) {
        if (data != null && data.length > 0) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, data);
            result.setKeepCallback(true);
            rawDataAvailableCallback.sendPluginResult(result);
        }
    }

    private void sendDataToSubscriber() {
        String data = readUntil(delimiter);

        if (data != null && data.length() > 0) {

            PluginResult result = new PluginResult(PluginResult.Status.OK, data);
            dataAvailableCallback.sendPluginResult(result);

            sendDataToSubscriber();
        }
    }

    private int available() {
        return buffer.length();
    }

    private String read() {
        int length = buffer.length();
        String data = buffer.substring(0, length);
        buffer.delete(0, length);
        return data;
    }

    private String readUntil(String c) {
        String data = "";
        int index = buffer.indexOf(c, 0);
        if (index > -1) {
            data = buffer.substring(0, index + c.length());
            buffer.delete(0, index + c.length());
        }
        return data;
    }
}
