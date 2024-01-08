#!/usr/bin/sh

# Use this script is you know what it does
# Just to give you an idea, this helps me start the whole project
# in just one command.
#
# 1. Checks if all binaries required for this project is installed
# 2. Starts all the daemon(mongodb, redis and rabbitmq)
# 3. Runs client and server in two different terminal 

# THIS SCRIPT WILL ONLY WORK IN LINUX AND MAC(maybe, I don't have a Mac to test). Sorry, no Windows support


# start daemon
echo "Inside $PWD"
echo "Starting Daemon: mongodb redis rabbitmq"
echo "Password Needed for Starting Daemon..."
sudo systemctl start mongodb redis rabbitmq

# # start project
cd $PWD && node server & PIDSTARTSERVER=$!
cd $PWD && npm start & PIDSTARTCLIENT=$!

# # this starts both process in parallal and you will get errors and warnings
# # of both command(i.e. `npm start` and `node server`) in the same terminal window
wait $PIDSTARTSERVER
wait $PIDSTARTCLIENT