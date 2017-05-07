(function () {
  'use strict'
  var Util = (function () {
    var prefix = 'fiction_reader_';
    var StorageGetter = function (key) {
      return localStorage.getItem(prefix + key);
    }
    var StorageSetter = function (key, val) {
      return localStorage.setItem(prefix + key, val);
    }
    var getBackJsonP = function (url, callback) {
      // 获取JSONP跨域信息
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
      getBackJsonP: getBackJsonP,
      StorageGetter: StorageGetter,
      StorageSetter: StorageSetter
    }
  })();


  var Dom = {
    topNav: $('#js_top_nav'),
    bottomNav: $('.bottom_nav'),
    dayNightSwitchButton: $('#night_button'),
    fontContainer: $('.nav-pannel-bk'),
    fontButton: $('#font-button'),
    changeBackGround: $('.bg-container-list')
  }
  var Win = $(window);
  var Doc = $(document);
  var readModel;
  var readUI;
  var RootContainer = $('#fiction_container');
  var FontSize = 14;

  function ReadModel(id_, cid_, onChange_) {
    // 实现阅读器相关数据交互请求的方法
    var ChapterTotal;
    var Title = "";

    var Fiction_id = id_;

    var Chapter_id = cid_;
    var Chapters = [];
    if (!Chapter_id) {
      Chapter_id = 1;
    }

    var init = function (UIcallback) {
      // getFictionInfo(function () {
      //   getChapterContent(Chapter_id, function (data) {
      //     UIcallback && UIcallback(data);
      //   })
      getFictionInfoPromise().then(function () {
        return getChapterContent();
      }).then(function () {
        UIcallback && UIcallback(data);
      })
    }
    // var getFictionInfo = function (callback) {
    //   $.get('data/chapter.json', function (data) {
    //     // 处理获得章节内容信息
    //     Chapter_id = Util.StorageGetter('last_chapter_id');
    //     if (Chapter_id == null) {
    //       Chapter_id = data.chapters[1].chapter_id;
    //     };
    //     ChapterTotal = data.chapters.length;
    //     callback && callback();
    //   }, 'json');
    // }

    var getFictionInfoPromise = function () {
      return new Promise(function (resolve, reject) {
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
        // $.get('data/chapter.json', function (data) {
        //   // 处理获得章节内容信息
        //   if (data.result == 0) {
        //     Util.StorageGetter('last_chapter_id');
        //     if (Chapter_id == null) {
        //       Chapter_id = data.chapters[1].chapter_id;
        //     };
        //     ChapterTotal = data.chapters.length;
        //     resolve();
        //   } else {
        //     reject();
        //   }
        // }, 'json');
      })
    }


    var getChapterContent = function (Chapter_id, callback) {
      $.get("data/data" + Chapter_id + ".json", function (data) {
        if (data.result == 0) {
          var url = data.jsonp;
          Util.getBackJsonP(url, function (data) {
            $('#init_loading').hide();
            onChange_ && onChange_(data);
          });
        } else {

        }
      }, 'json');
      return;

      // $.get("data/data" + Chapter_id + ".json", function (data) {
      //   if (data.result == 0) {
      //     var url = data.jsonp;
      //     Util.getBackJsonP(url, function (data) {
      //       callback && callback(data);
      //       // $('#init_loading').hide();
      //       //	onChange_ && onChange_(data);
      //     });
      //   } else {

      //   }
      // }, 'json')
    };

    // var getChapterContentPromise = function () {
    //   return new Promise(function (resolve, reject) {
    //     $.get("data/data" + Chapter_id + ".json", function (data) {
    //       if (data.result == 0) {
    //         var url = data.jsonp;
    //         Util.getBackJsonP(url, function (data) {
    //           // callback && callback(data);
    //           resolve(data);
    //         });
    //       } else {
    //         reject({ msg: 'fail' });
    //       }
    //     }, 'json');
    //   });
    // };


    var prevChapter = function () {
      // 向上翻页
      Chapter_id = parseInt(Chapter_id, 10);
      if (Chapter_id == 0) {
        return;
      }
      Chapter_id -= 1;
      getChapterContent(Chapter_id, UIcallback);
      Util.StorageSetter('last_chapter_id', Chapter_id);
    }
    var nextChapter = function () {
      // 向下翻页
      Chapter_id = parseInt(Chapter_id, 10);
      if (Chapter_id == ChapterTotal) {
        return;
      }
      Chapter_id += 1;
      getChapterContent(Chapter_id, UIcallback);
      Util.StorageSetter('last_chapter_id', Chapter_id);
    }
    return {
      init: init,
      prevChapter: prevChapter,
      nextChapter: nextChapter
    }
  }
  function ReadBaseFrame(container) {
    // UI结构页面渲染，文本内容
    function parseChapterData(jsonData) {
      var jsonObj = parseJSON(jsonData);
      var html = "<h4>" + jsonObj.t + "</h4>";
      for (var i = 0; i < jsonObj.p.length; i++) {
        html += "<p>" + jsonObj.p[i] + "</p>";
      }
      return html;
    }

    return function (data) {
      container.html(parseChapterData(data));
    };
    // return function (jsonData) {
    //   $("#fiction_container").appenChild(parseChapterData(jsonData));
    // };
  }

  function main() {
    // 项目的入口函数
    var Fiction_id, Chapter_id;
    var ScrollLock = false;
    var Screen = Doc.body;
    var NightMode = false;
    var readerUIFrame = ReadBaseFrame(RootContainer);

    readModel = ReadModel(Fiction_id || 13359, Chapter_id, function (data) {
      readerUIFrame(data);
      Dom.bottom_tool_bar.show();
      setTimeout(function () {
        ScrollLock = false;
        Screen.scrollTop = 0;
      }, 20);
    });


    readUI = ReadBaseFrame();
    readModel.init();
    EventHanlder();

  }
  // function ReadModel(id_, cid_, onChange_) {function main() {
  //   // 项目的入口函数
  //   readModel = ReadModel();
  //   readUI = ReadBaseFrame();
  //   readModel.init(function (data) {
  //     readUI(data);
  //   });
  //   EventHanlder();

  // }


  function EventHanlder() {
    // 绑定交互事件
    $('#action_mid').click(function () {
      if (Dom.topNav.css('display') == "none") {
        Dom.topNav.show();
        Dom.bottomNav.show();
      } else {
        Dom.topNav.hide();
        Dom.bottomNav.hide();
        $('.nav-pannel').hide();
        $('.nav-pannel-bk').hide();
      };
    });
    Win.scroll(function () {
      Dom.topNav.hide();
      Dom.bottomNav.hide();
      $('.nav-pannel').hide();
      $('.nav-pannel-bk').hide();
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
      readModel.prevChapter(function () {
        readUI(data);
      });
    });
    $('#next_button').click(function () {
      // 向下翻页，获得下一章节
      readModel.nextChapter(function () {
        readUI(data);
      });
    });
  }



  return main();
})()