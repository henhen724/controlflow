# Wi-DAQ

## Non-npm dependencies
Wi-DAQ requires a mongoDB database and a MQTT broker.  You can download mongoDB [here](https://docs.mongodb.com/manual/administration/install-community/) and mosquitto, one of the most popular MQTT brokers, [here](https://mosquitto.org/download/).  Both of these will allow you to run the broker and database locally.  You can also run these using cloud services like [Mongo Atlas](https://www.mongodb.com/cloud/atlas/register) and [Scale Grid](https://scalegrid.io/mongodb.html) for the database and [Rightech](https://www.rightech.io/mqtt-broker), [Cloud MQTT](https://www.cloudmqtt.com/), and a __private__ [Shifter.io](https://shiftr.io/) instance for the broker.

_Note: While you can run Wi-DAQ on a MQTT broker with other trafic, you can not run multiple Wi-DAQ instances on the same MQTT broker.  In addition, anyone with access to this MQTT broker will have access to all live data and control. __DO NOT USE A INSECURE MQTT BROKER.___

## MongoDB Pre-Installation
In addition to creating a mongoDB database, you will also need to add an number of collections to the database for Wi-DAQ to work.  Please create empty collections with the following names:
- alarms
- buffer-info
- data
- devices
- notifications
- users

How to create collection depends on how you are running the database.  If you're running mongoDB locally, [this page](https://docs.mongodb.com/manual/reference/method/db.createCollection/) explains how to do it.  If you're cloud based database, some googling will quickly show you how to create new collections.

## Installation
- Once you have a mongoDB server and an MQTT broker and have configured the database appropriately run:
```
$ git clone https://github.com/henhen724/Wi-DAQ.git
```
_Note: There will be a package version soon instalable though npm, yarn and possibly other package managers._
- Now you need to define a number of enviroment varibles to tell Wi-DAQ how to connect to you're database and broker.  The simiplest way to do this is using a .env file, see [.env.example](.env.example).  Once you've defined all you're enviroment varibles in the .env file, change the file name to .env.local and Wi-DAQ will automatically load the file and set the enviroment varibles.  Make sure it defines the following varibles:
    - MONGODB_URI
        - A URL/URI which resolves to your database.  If you're running mongoDB locally this will usally be `mongodb://localhost:27017/<name of my database>`.
    - MONGODB_USERNAME
        - The username for your mongoDB server.
    - MONGODB_PASSWORD
        - The password for your mongoDB server.
    - MQTT_URI
        - A URL/URI which resolves to your MQTT broker.  If you're running this locally, this will usally be `mqtt://localhost:1883`.
    - MQTT_USERNAME
        - The username for your MQTT broker.
    - MQTT_PASSWORD
        - The password for your MQTT broker.
    - TOKEN_SECRET
        - Any string, preferably between 64-256 charaters long.
 
 