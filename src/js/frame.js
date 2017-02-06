var app = angular.module('app', []);
app.controller('MainCtrl', MainCtrl);

function MainCtrl () {

  var main = this;
  main.getNik = '';
  main.activeButton = false;
  main.nickname = '';

  main.listener = function(event) {
  //Событие прихода сообщения с галвной страницы  

    if (event.origin != 'http://localhost:9000') {
      // игнорировать неизвестный домен
      return;
    }

    if (event.data.type == 'nik'){
      //Если пришел ник соседа, создаем нового слушателя с его ником
      main.getNik = event.data.nik;
    }else{
      //Иначе - письмо. Отображаем в лист сообщений
      main.show(event.data, main.nickname, 'get');
    }
  }


  if (window.addEventListener) {
  //Слушатель прихода сообщения с главной страницы
    window.addEventListener("message", main.listener);
  } else {
    // IE8
    window.attachEvent("onmessage", main.listener);
  }



  main.changeButton = function(){
  //Слушаем поле ввода, чтобы активировать/дезактивировать кнопку
    if (main.message != ''){
      main.activeButton = true;
    }else{
      main.activeButton = false;
    }
  }

  main.sendNik = function(){
  //Отправка сообщения с ником на основную страницу
    var win = window.parent
    
    var send = {
      type:'nik',
      nik:main.saveText(main.nickname)
    };

    win.postMessage(send, "http://localhost:9000"); 
  }


  main.changeNik = function(nik,nikGet, text){
  //Функция отрисовки ника, если встречаетс в тексте
    var regNikSend = new RegExp('(^|\\s)'+nik+'(?=\\s|[,.?!]|$)', 'gi');
    var regNikGet = new RegExp('(^|\\s)'+nikGet+'(?=\\s|[,.?!]|$)', 'gi');
    
    if (nik == ''){
    //Если сосед не ввел ник, то не ищем его
      return text.replace(regNikGet, '<span class=nikGet>$&</span>');
    }

    return text.replace(regNikGet, '<span class=nikGet>$&</span>').replace(regNikSend, '<span class=nikSend>$&</span>');     
  }


  main.showSmiles = function(text){
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

  main.saveText = function(text){
  //Экранирование текста от инъекций, убираем <>&
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }


  main.show = function(data, nikGet, mod){
  //Функция отрисовки сообщения
    var div = angular.element("<div>");
    var parent = angular.element(document.querySelector("#text"));

    if (mod == 'get'){
    //Выбираем, откуда вызвана функция - наше сообщени или нет
      
      div.addClass("alert get");
      var text = main.changeNik(data.nik, nikGet, data.text);
      //Ищем ники

    }else{

      div.addClass("alert send");
      var text = main.changeNik(nikGet, data.nik, data.text);
    }

    text = main.showSmiles(text);
    //Заменяем смайлы
    
    var content = angular.element('<span class="nik">'+data.nik+': </span>'+ text);
    //Формируем новый див и добавляем его в диалоговое окно
    div.append(content);
    parent.append(div);

  }

  main.send = function(getNik){
  //Отправка введенного письма на основную страницу
    var win = window.parent;
  
    if (main.message != ''){
    //Проверка, чтоб не отправить пустое сообщение
       var send = {
        type:'message',
        nik:main.saveText(main.nickname),
        text:main.saveText(main.message)
      };

      main.show(send, getNik, 'send');       
   
      win.postMessage(send, "http://localhost:9000");

      //Приводим диалоговое окно в начальное состояние 
      main.message = '';
      main.activeButton = false;
    }
  }
}