(function () {
  'use strict';
  var Util = (function () {
    var prefix = 'ficiton_reader_';
    var StorageGetter = function (key) {
      return localStorage.getItem(prefix + key);
    }
    var StorageSetter = function (key, val) {
      return localStorage.setItem(prefix + key, val);
    }
    //数据解密
    function getBSONP(url, callback) {
      return $.jsonp({
        url: url,
        cache: true,
        callback: "duokan_fiction_chapter",
        success: function (result) {
          var data = $.base64.decode(result);
          var json = decodeURIComponent(escape(data));
          callback(json);
        }
      });

    };

    return {
      getBSONP: getBSONP,
      StorageGetter: StorageGetter,
      StorageSetter: StorageSetter
    }
  })();

  //获得阅读器内容的方法
  function ReaderModel(id_, cid_, onChange_) {
    var Title = "";

    var Fiction_id = id_;

    var Chapter_id = cid_;

    if (Util.StorageGetter(Fiction_id + 'last_chapter')) {
      Chapter_id = Util.StorageGetter(Fiction_id + 'last_chapter');
    }

    if (!Chapter_id) {
      Chapter_id = 1;
    }
    var Chapters = [];

    var init = function () {
      getFictionInfoPromise.then(function (d) {
        gotoChapter(Chapter_id);
      });
      /*
       getFictionInfo(function() {
       gotoChapter(Chapter_id);
       });
       */
    }
    var gotoChapter = function (chapter_id) {
      Chapter_id = chapter_id;
      getCurChapterContent();
    };

    //获得当前章节内容
    var getCurChapterContent = function () {
      $.get("data/data" + Chapter_id + ".json", function (data) {

        if (data.result == 0) {
          var url = data.jsonp;
          Util.getBSONP(url, function (data) {
            $('#init_loading').hide();
            onChange_ && onChange_(data);
          });
        } else {

        }
      }, 'json');
      return;

    };

    var getFictionInfoPromise = new Promise(function (resolve, reject) {
      $.get("data/chapter.json", function (data) {
        if (data.result == 0) {
          Title = data.title;
          $('#nav_title').html('返回书架');
          window.ChaptersData = data.chapters;
          window.chapter_data = data.chapters;
          for (var i = 0; i < data.chapters.length; i++) {
            Chapters.push({
              "chapter_id": data.chapters[i].chapter_id,
              "title": data.chapters[i].title
            })
          }
          resolve(Chapters);
        } else {
          reject(data);
        }
      }, 'json');
    });

    //获得上一章内容
    var prevChapter = function () {
      Chapter_id = parseInt(Chapter_id);
      if (Chapter_id < 1) {
        return Chapter_id = 1;
      }
      var cid = Chapter_id + 1;
      gotoChapter(cid);
      // Util.StorageSetter(Fiction_id + 'last_chapter', Chapter_id);
    };

    //获得下一章内容
    var nextChapter = function () {
      Chapter_id = parseInt(Chapter_id);
      if (Chapter_id == Chapters.length - 1) {
        return
      }
      var cid = Chapter_id - 1;
      gotoChapter(cid);
      // Util.StorageSetter(Fiction_id + 'last_chapter', Chapter_id);
    };

    return {
      init: init,
      go: gotoChapter,
      prev: prevChapter,
      next: nextChapter,
      getChapter_id: function () {
        return Chapter_id;
      }
    };
  }

  // 添加基本的页面文字内容框架
  function ReadBaseFrame(container) {
    function parseChapterData(jsonData) {
      var jsonObj = JSON.parse(jsonData);
      var html = "<h4>" + jsonObj.t + "</h4>";
      for (var i = 0; i < jsonObj.p.length; i++) {
        html += "<p>" + jsonObj.p[i] + "</p>";
      }
      return html;
    }

    return function (data) {
      container.html(parseChapterData(data));
    };
  }

  function main() {
    // 获取fiction_id 和 chapter_id
    var RootContainer = $('#fiction_container');

    var Fiction_id, Chapter_id;

    // 绑定事件
    var ScrollLock = false;
    var Doc = document;
    var Screen = Doc.body;
    var Win = $(window);

    //是否是夜间模式
    var NightMode = false;

    //初始化的字体大小
    var InitFontSize;

    //dom节点的缓存
    var Dom = {
      bottom_tool_bar: $('#bottom_tool_bar'),
      nav_title: $('#nav_title'),
      bk_container: $('#bk-container'),
      night_button: $('#night-button'),
      next_button: $('#next_button'),
      prev_button: $('#prev_button'),
      back_button: $('#back_button'),
      top_nav: $('#top-nav'),
      bottom_nav: $('.bottom_nav'),
      // FSX
      topNav: $('#js_top_nav'),
      bottomNav: $('.bottom_nav'),
      dayNightSwitchButton: $('#night_button'),
      fontContainer: $('.nav-pannel-bk'),
      fontButton: $('#font-button'),
      changeBackGround: $('.bg-container-list'),
      // bookList: $('#book_list')
    }

    // 程序初始化
    var readerUIFrame = ReadBaseFrame(RootContainer);

    //获得章节数据，展示
    var readerModel = ReaderModel(Fiction_id || 13359, Chapter_id, function (data) {
      readerUIFrame(data);
      Dom.bottom_tool_bar.show();
      setTimeout(function () {
        ScrollLock = false;
        Screen.scrollTop = 0;
      }, 20);
    });

    //阅读器数据内容展示
    readerModel.init();
    var EventHanlder = function () {
      // 绑定交互事件
      $('#action_mid').click(function () {
        if ($("#js_top_nav").css('display') == "none") {
          $("#js_top_nav").show();
          $(".bottom-nav").show();
        } else {
          $("#js_top_nav").hide();
          $(".bottom-nav").hide();
          $('.nav-pannel').hide();
          $('.nav-pannel-bk').hide();
          $('#book_list').hide();
        };
      });
      Win.scroll(function () {
        $("#js_top_nav").hide();
        $(".bottom-nav").hide();
        $('.nav-pannel').hide();
        $('.nav-pannel-bk').hide();
        $('#book_list').hide();
      });
      $('#font_button').click(function () {
        if ($('.nav-pannel-bk').css('display') == 'none') {
          $('.nav-pannel').show();
          $('.nav-pannel-bk').show();
          Dom.fontButton.addClass('current')
        }
        else {
          $('.nav-pannel').hide();
          $('.nav-pannel-bk').hide();
          Dom.fontButton.removeClass('current')
        }
      });

      $('#big_font').click(function () {
        // 放大字体
        if (FontSize < 18) {
          FontSize = 18;
        }
        if (FontSize >= 18) {
          FontSize++;
        }
        if (FontSize > 25) {
          FontSize = 25;
        }
        RootContainer.css('font-size', FontSize);
        Util.StorageSetter('font-size', FontSize);
      });
      $('#small_font').click(function () {
        // 缩小字体
        if (FontSize > 12) {
          FontSize = 12;
        }
        RootContainer.css('font-size', FontSize);
        Util.StorageSetter('font-size', FontSize);
      });
      $('#normal_font').click(function () {
        // 还原标准字体
        if (!(FontSize = 14)) {
          FontSize = 14;
        }
        RootContainer.css('font-size', FontSize);
        Util.StorageSetter('font-size', FontSize);
      });
      Dom.dayNightSwitchButton.click(function () {
        // 切换夜间模式和正常模式时背景色的敏感程度
        if ($('#day_icon').css('display') == 'none') {
          $('#day_icon').show();
          $('#night_icon').hide();
          $('.nav-pannel-bk').hide();
          $('#fiction_container').css('background', '#000').css('color', '#f7ff16');
        }
        else {
          $('#day_icon').hide();
          $('#night_icon').show();
          $('#fiction_container').css('background', '#F4F4CB').css('color', '#000');
        }
      });
      Dom.changeBackGround.click(function () {
        // 切換背景色
        $(this).addClass('newColor');
        var newBackGround = $('.newColor').css('background-color');
        $('body').css('background-color', '');
        $('div.m-read-content').css('background-color', newBackGround);
        $(this).removeClass('newColor');
      });
      $('#prev_button').click(function () {
        // 向上翻页，获得上一章节
        readerModel.next();
      });
      $('#next_button').click(function () {
        // 向下翻页，获得下一章节
        readerModel.prev();
      });
      $('#menu_button').click(function () {
        if ($('#book_list').css('display') == 'none') {
          $('#book_list').show();
        } else {
          $('#book_list').hide();
        }
      });

      $('li.chapter-name').click(function () {
        $('.book-list').hide();
        // return Chapter_id = parseInt(Math.random()*5, 10);
      })
    }

    var readUI = ReadBaseFrame();
    readerModel.init();
    EventHanlder();

  }
  // function readerModel(id_, cid_, onChange_) {function main() {
  //   // 项目的入口函数
  //   readerModel = readerModel();
  //   readUI = ReadBaseFrame();
  //   readerModel.init(function (data) {
  //     readUI(data);
  //   });
  //   EventHanlder();

  // }





  return main();
})()