export class CallingController {

    getLink(){
        return new Promise((resolve, reject) => {
    
          fetch('/getQR')  // URL of the API or resource
          .then(response => response.json())  // Convert response to JSON
          .then(data => {
            console.log(data.url);
            
            console.log(data.sessionlink);
            resolve(data);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
            reject(error);
          });
    
        })
    
    }
    


    ShowQr(){
        let userResponse = confirm("Do you want to proceed?");
        if (userResponse) {
          console.log("connect self.");
          console.log("show qr.");
          this.getLink().then(data => {
            console.log(data);
            this.createSession(data.sessionlink);
            document.getElementById('qrtoscan').src = data.url;
            document.getElementsByClassName('qrtoscanOuter')[0].style.display = "block";
            document.getElementsByClassName('closeqrbutton')[0].style.display = "block";
          }).catch(error => {
            console.log("error in get qr",error);
          })
          
        } else {
          console.log("cancel.");
        }
  
  
    };
  
    closeQr(){
  
        const qrtoscanOuter = document.getElementsByClassName('qrtoscanOuter')[0];
        const closeqrbutton = document.getElementsByClassName('closeqrbutton')[0];
        qrtoscanOuter.style.display = "none";
        closeqrbutton.style.display = "none";
  
    }
  
    showcamera(){
  
        const scanQrCode = document.getElementById('scanQrCode');
        const scanQrCodebtn = document.getElementsByClassName('closecamerabutton')[0];
        scanQrCode.style.display = "block";
        scanQrCodebtn.style.display = "block";
        
    }
  
    closeCamera(){
  
        const scanQrCode = document.getElementById('scanQrCode');
        const scanQrCodebtn = document.getElementsByClassName('closecamerabutton')[0];
        scanQrCode.style.display = "none";
        scanQrCodebtn.style.display = "none";
  
    }

    isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (error) {
            return false;
        }
    }

    joinRoomWithSession(){

        let sessionIdInput =  document.getElementById('sessionId').value;
        if ( sessionIdInput !== '' ){
          console.log("session id input ",sessionIdInput);
          this.createSession(sessionIdInput);
          document.getElementById('outer-join-room').style.display = "none";
        }else{
          alert('Enter Session Id')
        }

    }

    cancelJoinRoomWithSession(){
        document.getElementById('outer-join-room').style.display = "none";
    }

    JoinRoom(){
    
        // document.getElementById('qrtoscan').src = data.url;
        // document.getElementsByClassName('qrtoscanOuter')[0].style.display = "block";
        // document.getElementsByClassName('closeqrbutton')[0].style.display = "block";
        document.getElementById('outer-join-room').style.display = "flex";
        
    }

    createSession(session_hash=null) {

      try {
          // console.log(" check ready state: ",ws.readyState);
          if ( typeof ws !== 'undefined' ){

            console.log(" check ready state: ",ws.readyState);
            if ( ws.readyState == 1 ){
              alert( "Already Connected" );
            }
            

          }else{

          
            let sessionId = ""
            if ( session_hash != null ){
              sessionId = session_hash;
            }else{
              sessionId = document.getElementById('sessionId').value;
            }
          
            console.log("check session id: ",sessionId);
            let ConnectionString = sessionId.split('/').slice(1).join('/');
            console.log(window.location.hostname);

            if  ( this.isValidURL(ConnectionString) ){
              if ( window.location.protocol == "https:" ){
                ws = new WebSocket(`wss://${window.location.hostname}:${window.location.port}?sessionId=${ConnectionString}`);
              }else{
                ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}?sessionId=${ConnectionString}`);
              }
            }else{
              if ( window.location.protocol == "https:" ){
                ws = new WebSocket(`wss://${window.location.hostname}:${window.location.port}?sessionId=${sessionId}`);
              }else{
                ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}?sessionId=${sessionId}`);
              }
            }


            
            console.log(" after creating websocekt: ",ws);
            
            ws.addEventListener('open', () => {
              console.log('WebSocket connection opened');
            });

            ws.addEventListener('message', (message) => {

              console.log(message.data);

              message.data.text().then(text => {

                
                // console.log("parsed text: ",text);
                // console.log("parsed text type: ",typeof text);

                const messages1 = document.getElementById('messages');
                const message1 = document.createElement('li');

                try{
                  
                  const parsedMessage = JSON.parse(text);
                  console.log("parsed message: ",parsedMessage)
                  console.log("parsed message type : ",typeof parsedMessage)

                  if ( typeof parsedMessage === 'object' ){

                    this.handleSignalingData(parsedMessage);
  
                  }else{

                    message1.textContent = text;
                    message1.classList.add('blue');
                    message1.classList.add('custom-send2');          
                    messages1.appendChild(message1);

                  }

                }catch( error ){
                  console.log("parsed text: ",text)
                  console.log("parsed text type : ",typeof text)

                  message1.textContent = text;
                  message1.classList.add('blue');
                  message1.classList.add('custom-send2');          
                  messages1.appendChild(message1);

                }


                
                // console.log("parsed message: ",parsedMessage)
                // console.log("parsed message type : ",typeof parsedMessage)

              

                

                

              });

            });

            ws.addEventListener('close', (event) => {
              console.log('WebSocket connection closed:', event);
              console.log('Code:', event.code, 'Reason:', event.reason);
            });


            ws.addEventListener('error', (error) => {
              console.error('WebSocket error', error);
            });

          }
          

      } catch (error) {
          // console.log("Error: The object or property is not defined.");
          console.log(" check websocket error : ",error);
          return error;
      }


    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        ws.send(input.value);
        const messages = document.getElementById('messages');
        const message = document.createElement('li');
        message.textContent = input.value;
        message.classList.add('blue');
        message.classList.add('custom-send');
        messages.appendChild(message);
        input.value = '';
    }
        
    blobToJson(blob) {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
          try {
              const json = JSON.parse(reader.result);
              resolve(json);
          } catch (error) {
              reject(error);
          }
          };

          reader.onerror = () => {
          reject(reader.error);
          };

          reader.readAsText(blob);
      });
    }


    handleSignalingData(data) {
      switch (data.type) {
        case 'offer':
          this.handleOffer(data.offer);
          break;
        case 'answer':
          this.handleAnswer(data.answer);
          break;
        case 'candidate':
          this.handleCandidate(data.candidate);
          break;
        case 'callDisconnected':
          this.handleDisconnect();
          break;
        default:
          break;
      }
    }

    handleOffer(offer) {
      createPeerConnection();
      peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      peerConnection.createAnswer()
        .then(answer => {
          peerConnection.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: 'answer', answer }));
        })
        .catch(error => console.error('Error creating answer', error));
    }

    handleAnswer(answer) {
      peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    handleCandidate(candidate) {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    handleDisconnect(){
      // stop all the tracks and ICE candidates associated with the connection
      // Stopping the media tracks ensures that the user's camera and microphone are no longer active
      // After closing the connection, you may also want to remove any event listeners to prevent unwanted behavior

      console.log("opponent disconnect the call");

      if (peerConnection) {
        peerConnection.close();
        peerConnection.onicecandidate = null;
        peerConnection.ontrack = null;
        peerConnection.oniceconnectionstatechange = null;
      }

      // if (localStream) {
      //   localStream.getTracks().forEach(track => track.stop());
      // }

      // if (remoteStream) {
      //     remoteStream.getTracks().forEach(track => track.stop());
      // }

      remoteVideo.style.zIndex = "";
      localVideo.style.zIndex = "";
      remoteVideo.style.display = "none";
      remoteVideoCutButton.style.display = "none";

       
    } 
    


}

