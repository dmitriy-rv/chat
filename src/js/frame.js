if (window.addEventListener) {
//Слушатель прихода сообщения с главной страницы
  window.addEventListener("message", listener);
} else {
  // IE8
  window.attachEvent("onmessage", listener);
}

//Пока сосед не ввел ник, используем этот слушатель, без поиска второго ника в тексте
document.getElementById('button').addEventListener("click", send);
//Слушаем ввод ника. Если поле изменилось, отправляем новый ник соседу
document.getElementById('nickname').addEventListener("change", function() {sendNik()});

var textarea = document.getElementById('message'); 
//Слушаем поле ввода, чтобы активировать/дезактивировать кнопку
textarea.oninput = function() {
  if (textarea.value != ''){
    document.getElementById('button').classList.add("active");
  }else{
    document.getElementById('button').classList.remove("active");
  }
}

function listener(event) {
//Событие прихода сообщения с галвной страницы  

  if (event.origin != 'http://localhost:9000') {
    // игнорировать неизвестный домен
    return;
  }

  if (event.data.type == 'nik'){
    //Если пришел ник соседа, создаем нового слушателя с его ником
    var getNik = event.data.nik;
    document.getElementById('button').removeEventListener("click", send);
    document.getElementById('button').addEventListener("click", function() {send(getNik)});
  }else{
    //Иначе - письмо. Отображаем в лист сообщений
    var nik = document.getElementById('nickname').value;
    show(event.data, nik, 'get');
  }
}

function sendNik(){
  //Отправка сообщения с ником на основную страницу
  var win = window.parent;
  var nik = document.getElementById('nickname');
  
  var send = {
    type:'nik',
    nik:nik.value
  };

  win.postMessage(send, "http://localhost:9000"); 
}

function send(getNik){
  //Отправка введенного письма на основную страницу
  var win = window.parent;

  var textarea = document.getElementById('message');
  var nik = document.getElementById('nickname');

  
  
  if (textarea.value != ''){
  //Проверка, чтоб не отправить пустое сообщение
     var send = {
      type:'message',
      nik:saveText(nik.value),
      text:saveText(textarea.value)
    };

    if (typeof getNik != 'string'){
    //Если сосед не ввел ник, то его заменить на '', чтобы потом не искать ничего в сообщении
      show(send, '', 'send');
    }else{
      show(send, getNik, 'send');       
    }
 
    win.postMessage(send, "http://localhost:9000");

    //Приводим диалоговое окно в начальное состояние 
    textarea.value = '';
    document.getElementById('button').classList.remove("active");
  }
}



function show(data, nikGet, mod){
//Функция отрисовки сообщения
  var div = document.createElement('div');

  if (mod == 'get'){
  //Выбираем, откуда вызвана функция - наше сообщени или нет
    div.className = "alert get";
    var text = changeNik(data.nik, nikGet, data.text);
    //Ищем ники
  }else{
    div.className = "alert send";
    var text = changeNik(nikGet, data.nik, data.text);
  }

  text = showSmiles(text);
  //Заменяем смайлы
  
  div.innerHTML = '<span class="nik">'+data.nik+': </span>'+ text;
  //Формируем новый див и добавляем его в диалоговое окно
  document.getElementById('text').appendChild(div);

}

function changeNik(nik,nikGet, text){
//Функция отрисовки ника, если встречаетс в тексте
  var regNikSend = new RegExp('(^|\\s)'+nik+'(?=\\s|[.,!?]|$)', 'gi');
  var regNikGet = new RegExp('(^|\\s)'+nikGet+'(?=\\s|[.,!?]|$)', 'gi');
  
  if (nik == ''){
  //Если сосед не ввел ник, то не ищем его
    return text.replace(regNikGet, '<span class=nikGet>$&</span>');
  }

  return text.replace(regNikGet, '<span class=nikGet>$&</span>').replace(regNikSend, '<span class=nikSend>$&</span>');     
}


function showSmiles(text){
//Поиск и замена смайлов
  var smilies = {
    ':)':'smile',
    ":'(":'cry',
    ':(':'sad',
    ';)':'wink',
    ':*':'kiss',
  };

  return text.replace(/(:\))|(:\()|(:'\()|(;\))|(:\*)/g, function (match) {
    return '<div class="smilies '+smilies[match]+'"></div>';
  });
}

function saveText(text){
//Экранирование текста от инъекций, убираем <>&
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
