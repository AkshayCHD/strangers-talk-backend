# Strangers Talk (Backend)

## Overview
The project is a websocket based realtime user management application, that allows users to randomly join a chat-room where both of them can 
interact in realtime. The project uses `socket.io` library to achieve realtime communication between users. 

## Getting Started
To run the project, perform the following steps
```
git clone https://github.com/AkshayCHD/strangers-talk-backend.git
cd strangers-talk-backend
npm install
node index.js
```
To run project test cases, 
```
node index.js

// Simulaneously use another terminal and run

npm test
```

## Implementation Algorithms
The implementation of the project can be explained using the following algorithms
* Initialize the following empty data-structures.
    * **allPairs**
        * type: Hashmap
        * purpose: To map all active socket connections to their socker ids.
    * **rooms**
        * type: Hashmap
        * purpose: To map the room addresses to which socket is joined, to the socket ids.
    * **queue**
        * type: array
        * purpose: To store the connections that havn't been paired up with any other connection.
* Handle events like user login, logout and disconnect and perform the following actions on their emission
    * **Login**
        * Save/Update the socket connection in the allPairs hashmap referenceable by the socket id.
        * Check if the first element of the queue is the same as current socket id.
            * Remove queue front if that is the case
        * Check for other unpaired socket connections in the queue
            * If there is a connection then pair the current connection with the available one(access using allPairs).
            * Else push the current connection in the unpaired queue.
    * **Logout**
        * If the connection is in the waiting queue then remove the connection from there.
        * If the connection is in any room
            * Determine the room id using rooms hashmap
            * Make the socket leave the room
            * Determine the pair socket id using room id
            * Get the pair socket connection using allPairs
            * Make the pair also leave the room
            * Add pair to the waiting queue so that it can be joined into some new room with some other connection.
            * Remove instances of the currenct socket from allPair and rooms hashmap.

**Note:** In the above implementation the array queue will always contain a single element as, as soon as there is another idle connection it
would be paired with the available connection, but it has been kept an array to help reader get an intuitive idea of the waiting queue. Plus in the future if
application supports multiple connections in a room, then the queue might contain multiple entries.
