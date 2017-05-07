(function () {
  'use strict'
  var Util = (function () {
    var prefix = 'html5_reader_';
    var StorageGetter = function (key) {
      return localStorage.getItem(prefix + key);
    }
    var StorageSetter = function (key, val) {
      return localStorage.setItem(prefix + key, val);
    }
    function getBackJsonP(url, callback) {
      // 获取JSONP跨域信息
      return $.jsonp({
        url: url,
        cache: true,
        callback: 'duokan_fiction_chapter',
        success: function(result) {
          var data= $.jquery.base64.decode(result);
          var json = decodeURIComponent(escape(data));
          callback(data);
        }
      })
    }
    return {
      StorageGetter: StorageGetter,
      StorageSetter: StorageSetter,
      getBackJsonP: getBackJsonP
    }
  })();
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
var RootContainer = $('#fiction_container');
var FontSize = 14;

function main() {
  // 项目的入口函数
  var readModel = ReadModel();
  readModel.init();
  EventHanlder();
}
function ReadModel() {
  // 实现阅读器相关数据交互请求的方法
  var Chapter_id;
  var init = function() {
    getFictionInfo(function() {
      getChapterContent(Chapter_id, function() {
         
      })
    })
  }
  var getFictionInfo = function(callback) {
    $.get('data/chapter.json', function () {
      // 处理获得章节内容信息
      Chapter_id = data.chapters[1].chapter_id;
      callback && callback();
    }, 'json');
  }
  var getChapterContent = function(chapter_id) {
    $.get('"data/data" + chapter_id + ".json"', function(data) {
      if(data.result == 0) {
        var url = data.jsonp;
        Util.getBackJsonP(url, function() {
          callback && callback(data);
        });
      }
    }, 'json')
  }
  return {
    init: init
  }
}
function ReadBaseFrame() {
  // UI结构页面渲染
}

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
}

main();