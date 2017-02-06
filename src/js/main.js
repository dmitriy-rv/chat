if (window.addEventListener) {
//Слушатель входящих сообщений
  window.addEventListener("message", listener);
} else {
  // IE8
  window.attachEvent("onmessage", listener);
}

function listener(event) {
//Обработчик входящих сообщений
  if (event.origin != 'http://localhost:9000') {
    // игнорировать неизвестный домен
    return;
  }

  var frame = event.source.frameElement.name;
  //Определяем отправителя
  
  if (event.data.type == 'message'){
  //Если пришло сообщение, а не ник. сохраняем его
    saveSession(event.data);
  }
  
  send(event.data,frame);
}

function send(data,frame){
//Отправляем полученное сообщение собеседнику. 
//т.к. окон всего 2, то выбираем получателя как не отправителя
	if (frame == 'frame1'){
		var win = window.frames[1];
 	}else{
  	var win = window.frames[0];
  };
  
  win.postMessage(data, "http://localhost:9000");
}

function saveSession(data){
//Сохраняем сообщение в sessionStorage. ключ - порядковый номер	
	if (window.sessionStorage){
		var index = sessionStorage.length + 1;
		sessionStorage.setItem(index, JSON.stringify(data));		
	}
}