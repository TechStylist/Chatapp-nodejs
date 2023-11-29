const express = require('express');
const PORT = 3000
const app = express();
const http = require('http');
const { connect } = require('http2');
const server = http.createServer(app)
const { Server } = require("socket.io");
const io = new Server(server);


server.listen(PORT, () => {
console.log(`Server started on port ${PORT}`);
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

let count=0;
io.on('connection', (socket) => {
    count++;
    console.log(`${count} user connected`)
    var onlineusers=`${count}`;
    io.emit("onlineuser",onlineusers-1)

    socket.on('message',function(msg){
        socket.broadcast.emit('message',msg);
    })
    
    socket.on('disconnect', ()=>{
        count--;
        console.log(`1 disconnected from user ,Currently connected user ${count}`);
      });
})