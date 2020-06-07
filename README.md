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
                * Emit event `roomCreated`  to both connections.
            * Else push the current connection in the unpaired queue.
                * Emit event `addedToQueue` to the current socket.
    * **Logout**
        * If the connection is in the waiting queue then remove the connection from there.
        * If the connection is in any room
            * Determine the room id using rooms hashmap
            * Make the socket leave the room
            * Determine the pair socket id using room id
            * Get the pair socket connection using allPairs
            * Make the pair also leave the room
            * Emit event `roomDeleted` to both current socket and its pair.
            * Add pair to the waiting queue so that it can be joined into some new room with some other connection.
            * Remove instances of the currenct socket from allPair and rooms hashmap.

**Note:** In the above implementation the array queue will always contain a single element as, as soon as there is another idle connection it
would be paired with the available connection, but it has been kept an array to help reader get an intuitive idea of the waiting queue. Plus in the future if
application supports multiple connections in a room, then the queue might contain multiple entries.


## Project Testing
The test for the project have been written using the mocha testing framework, as of now the following test cases have been covered in the project.
* **Connect single socket client**: When a client logs into the system, he should be added to the waiting queue if no other connections are present, and the event 
    `addedToQueue` should be emitted.
* **Create room for 2 differenct socket IDs**: When there is an existing connection in the waiting queue the current connection should be paired with him and the
    `roomCreated` event should be emitted.
* **Add socket to queue if partner exits**: When the partner of the current connection exits the, and no other idle connection is present, the partner should be
    added to waiting queue and `addedToQueue` event should be emitted.
* **Delete room when connection logs out**: When the connection logs out, if it is in a room then the room should be deleted and `roomDeleted` event should
    be emitted.
* **Delete room when pair logs out**: When connection's pair logs out then their room should be deleted and connection should be notified by `roomDeleted` event.
* **Rejoin other random socket if current pair logs out**: If pair of current connection logs out their is another waiting connection in the queue, then the
    current connection must be joined to idle one and `roomCreated event must be emitted`
* **Connect idle sockets if their pairs logout**: If there are 2 socket pairs and one out of both of them log out, then both the left connections must pair with each
    other and `roomCreated` event must be emitted.

## Future Scope
The following features are in the scope of the project and can be implemented in the future,
 * **Chat Functionality**: Since we are already create rooms, we can support a `message` event in the handlers to support real time messaging among the connected
    clients.
* **Multiple Connections**: We might allow one to many connections in the future and could allow users to connect to multiple random clients instead of just one.
