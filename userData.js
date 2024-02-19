// usersData.js

const userData = [
        {
            "id": 1,
            "username": "user1",
            "password": "password1",
            "devices": [
                {
                    "applianceId": "endpoint-001-56",
                    "manufacturerName": "AnnantaLabs",
                    "modelName": "Smart Switch",
                    "friendlyName": "Switch Zavx user1",
                    "friendlyDescription": "Switch that can only be turned on/off",
                    "actions": [
                        "turnOn",
                        "turnOff"
                    ],
                    "additionalApplianceDetails": {}
                },
                {
                    "applianceId": "endpoint-002-56",
                    "manufacturerName": "AnnantaLabs",
                    "modelName": "Smart Light",
                    "friendlyName": "Light Zavx user1",
                    "friendlyDescription": "002 Light that is dimmable and can change color and color temperature",
                    "actions": [
                        "turnOn",
                        "turnOff",
                        "setPercentage",
                        "incrementPercentage",
                        "decrementPercentage",
                        "setColor",
                        "setColorTemperature",
                        "incrementColorTemperature",
                        "decrementColorTemperature"
                    ],
                    "additionalApplianceDetails": {}
                }
            ]
        },
        {
            "id": 2,
            "username": "user2",
            "password": "password2",
            "devices": [
                {
                    "applianceId": "endpoint-003",
                    "manufacturerName": "Sample Manufacturer",
                    "modelName": "Smart White Light",
                    "friendlyName": "White Light Zavx user2",
                    "friendlyDescription": "003 Light that is dimmable and can change color temperature only",
                    "actions": [
                        "turnOn",
                        "turnOff",
                        "setPercentage",
                        "incrementPercentage",
                        "decrementPercentage",
                        "setColorTemperature",
                        "incrementColorTemperature",
                        "decrementColorTemperature"
                    ],
                    "additionalApplianceDetails": {}
                }
            ]
        }
    ];
    
module.exports = userData;
    