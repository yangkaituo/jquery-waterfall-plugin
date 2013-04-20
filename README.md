jQuery-waterfall-plugin
=======================
简单的讲这个插件是基于绝对定位的瀑布流布局，当窗体的宽度发生变化时列数会随着改变。

代码思路：
--------

所谓绝对定位，就是依靠绘制每一个div的top和left来呈现的。

```` html

    #container {position:absolute}
                                                                                                                   
    <div style="top:**px; left:**px; height:**px"></div>

````

1. 依旧在页面加载完成后取得容器的宽度，然后根据每一个div的宽度计算出能够显示多少个列，以及列间距。

2. 根据列数初始化相应项数的数组，用来存放当前的top值。再绘制下一行div时，依旧找到最短的一项添加，同时更新它的数组项的top值。

3. 再加工完只一批数据之后，取到一个当前数组项里的最大值，用来更新整个容器的高度，等有了容器高度就可以绑定当前窗口的scroll事件，计算安全位置。等鼠标滚动到这个位置就可以加载第二批数据进行绘制了。

4. 同时对窗体的宽度进行监听，当窗体的宽度改变时，重复步骤一和步骤二，最后对当前容器内的所有div进行重绘（更改top和left值）。

代码部分:
--------

这个插件的代码分为两个部分，第一部分是开放的api其功能是，帮助使用者根据自己的需求来调用插件。比如图片接口的调用、每一个div最终的html代码的展示、在显示每一个div时的动画等等。

第二部分是插件的代码核心部分，包括getjson调取成功之后传递的数据的函数，然后对每一组div的top值和left值计算、scroll事件的绑定、窗体width事件的监听等等。

如何使用waterfall plugin:
------------------------

````JAVASCRIPT

$(document).ready(function() {
    var nextpage = 1;
    var debug = false;
    $('#ColumnContainer').WaterFall({
        debug: debug,    //console的开关
        col: 2,      // 最少显示的列数
        width: 230,      //每一个div的宽度
        colspan: 10,      //默认的列间距
        backtotop: '#BackToTop',    //backToTop 可选的
        notice: '#loadingPins'      //显示数据加载状态以及错误输出的id 可选的
        getImageData: function(callback) {     //调去json接口的方法
            //api接口的配置
            var api = {};   
                                                           
            $.getJSON(apiCall, function(data){
                 var items = [],  //从json取得数据最重会处理成一个数组来传递
                    hasNextPage = true;
                if (data.stat === "ok") {
                    $.each(data.photos.photo, function(i, photo) {
                        // 每一个div的高度随机算出                        
                        var height = Math.round(Math.random()*(300 - 180) + 180);
                               
                        // 数组中包裹的每一项是一个对象{}  
                        var item = {
                            'img_src' : img_src,
                            'a_href'  : a_href,
                            'title'   : title,
                            'img_height'  : height
                        };
                                                         
                        items.push(item);                     
                    })
                                                   
                    //如果当前页码大于所有页码则表示没有下页了                               
                    if (nextpage > api.per_page) {
                        hasNextPage = false;
                    }
                    //最终传递给callback函数的数据格式是[{},{},{}.....]          
                    callback(items, hasNextPage);
                                                         
                    nextpage = data.photos.page + 1;
                                         
                }else{              
                    callback(items, hasNextPage);
                }
            });     
        },
        // 数据加工好后调去展示html的方法          
        renderItemHtml: function(data) {
            var html = '';
            $.each(data, function(i, item) {
            // 不必多说了，你如何想展示自己的div html在这里show          
             html += '<div class="pin '+ item.data_col +' '+ item.data_id +'" style="'+'top:'+ item.top +'px;left:'+ item.left + 'px; height:'+ item.height +'px"></div>'; 
            });
            return html;
        }
   });
});

````


重点提示：
--------

1. $(document).ready(function() {}); 不能被忽略;

2. 传给callback的items的数据结构很重要，关系到最后rederItemHtml方法的展现形式.比如我传的是[{},{},{}...] 那么rederItemHtml的data 也是[{},{},{}...]。如果我传递的是{1:{},2:{},3:{}....} 那么data参数拿到的也是个对象，所以在用$.each的时候就不适合了。

有任何问题请与我联系：yangkaituo AT gmail.com

或访问我的: http://eclipseongoing.diandian.com/