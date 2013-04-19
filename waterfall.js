/**
 * @name jQuery waterfall plugin
 * @version 1.0.1
 * @create 2013.4.16
 * @lastmodified 2013.4.19
 * @description Based on jQuery 1.4+
 * @author Kaito  (yangkaituo@gmail.com)
 */
(function($) {

/**
 * @constructor  内部工具，用来配置显示状态信息、错误信息
 * @param        pin:需要显示内容的指定id 
 * @param        debug:需要传入接口的debug配置
 * @private      hash对象 是根据i来配置相应的显示内容，没有则表示默认(数据加载中)
 * @return       function
 * @param        根据相应的数字来显示相应的状态
 */
	var Tools = function(pin, debug) {
		var hash = {
			0: '',
			1: '',
			2: "<span>接口异常</span>",
			3: "<span>数据加载完成</span>",
			4: "<span>配置不完善</span>"
		};

		return function(i) {
		if(debug && console) console.log(i);
				i == 1 ? $(pin).removeClass('top').addClass("bottom").show() : i == 2 ?
					$(pin).html(hash[i]) : i == 3 ?
						$(pin).html(hash[i]).show() : i == 4 ?
							$(pin).html(hash[i]).show() : pin.hide();				
			}
	};
/**
 * function   检查传入的option接口是否可用
 * @param     提供的option接口
 * @return    返回一个布尔值 如果为true 表示有错误，程序停止执行。
 */	
	var checkApiTools = function(api) {
		var key = false;

		if (typeof api !== 'object') {
			if(api.debug && console) console.log('bug in here!');
			key = true;
		}
		
		if (! api.hasOwnProperty('getImageData') && api.hasOwnProperty('col') && 
			  api.hasOwnProperty('width') && api.hasOwnProperty('colspan')) {
			  	if(api.debug && console) console.log('bug in here!');
				key = true;					  
		}
		
		if ( typeof api.getImageData !== 'function') {
				if(api.debug && console) console.log('bug in here!');
				key = true;
		}
		
		if ( typeof api.col !== 'number' || api.col == 0 ) {
				if(api.debug && console) console.log('bug in here!');
				key = true;
		}
		
		if ( typeof api.width !== 'number' || api.width == 0 ) {
				if(api.debug && console) console.log('bug in here!');
				key = true;
		}
		
		if ( typeof api.colspan !== 'number' || api.colspan == 0 ) {
				if(api.debug && console) console.log('bug in here!');
				key = true;
		}
		
		if ( typeof api.backtotop !== 'string' || (! /^\#/.test(api.backtotop))) {
				if(api.debug && console) console.log('bug in here!');
				key = true
		}
		
		if ( typeof api.notice !== 'string' || (! /^\#/.test(api.notice))) {
				if(api.debug && console) console.log('bug in here!');
				key = true
		}
		
		return key;
	}
	
/**
 * @class  waterfall
 * @constructor 
 * @param     提供的option接口
 * @param     需要加载waterfall数据的id的jQuery实例
 * @param     new Tools的实例
 */	
var waterfall = function(api, This, tools) {
	var cols, colspan, width, settings;
	
	// 设置接口的默认配置
	// 与传入的option合并
	// @return 一个object
	settings = $.extend({
		cols: 2,
		colspan: 10,
		width: 230,
		debug: false,
		backtotop: '#BackToTop',
		notice: '#loadingPins'
	}, api);
	
	// 窗体宽度并处初始化列数(cols), 计算列间距(colspan)
	// @return 一个新的被重新计算过的option object	
	var init = (function(o) {
			width = This.width();
			if(o.debug && console) console.log('width' + width);
			o.min_width = o.col * (o.width + 10);
			if(o.debug && console) console.log('最小宽度 ' + o.min_width);
	        
	        // 当窗体宽度小于最小宽度则用最小宽度，colspan则用默认值，反之则重新计算
			if (width > o.min_width) {
				o.cols = Math.floor(width/o.width);		
				o.colspan = Math.floor((width - o.cols * o.width) / (o.cols - 1));		
			}
			
			$(o.notice).show();
			return o;
	}(settings));	
	
	if(settings.debug && console) console.dir(settings);
	if(settings.debug && console) console.log('实际列 ' + settings.cols);
	if(settings.debug && console) console.log('实际列间距 ' + settings.colspan);
	
	//当窗体的宽度被改变时调用这个函数，并重新计算列数(cols)和列间距(colspan) 
	//并且调用WF的reflow方法，进行重绘
	//@param  WF的实例
	function reSize(WaterFall) {		
		var newWidth =  This.width();
		if(settings.debug && console) console.log('new width ' + newWidth);
		
		var o = {};
		if (newWidth > settings.min_width) {			
			o.cols = Math.floor(newWidth / settings.width);			
			o.colspan = Math.floor((newWidth - settings.cols * settings.width) / (settings.cols - 1));
		}
			
		if(settings.debug && console) console.log(o);
		settings = $.extend(settings, o);
		if(settings.debug && console) console.dir(settings);	
		
		WaterFall.reflow();
	}
	
	/**
	 * @class  waterfall
	 * @constructor
	 * @private   name: _getShortestColumnNumber  function  找到存放top值最小的一项
	 * @private   name: _getTop  function 取div的top值  @param 列项
	 * @private   name: _updateColumnHeight  function  更新array中相应项的top值
	 *            @param  列项和高度
	 * @private   name: _getLeft   function  取div的left值  @param 列项
	 * @private   name: _getHeightestColumn  function 找到存放top值最大的一项
	 * @return    name: readyImage  method   @param 需要加工的数据
	 * @return    name: reflow  method   重绘
	 */
	var WF = function() {
		var colsHeight = [];     // 用来存放每一列top值的数组
	
	    //根据列数初始化数组 default 0    
		var init = (function() {
			for(var i = 0; i < settings.cols; i++) {
				colsHeight[i] = 0;
			}	
		})();
		if(settings.debug && console) console.log('init array' + colsHeight);
	
		var _getShortestColumnNumber = function() {
			var ret = 0;
			for (var i = 0; i < settings.cols; i++) {
				if (colsHeight[i] < colsHeight[ret]) {
					ret = i;
				}
			}
			return ret;
		};
	
		var _getTop = function(col) {
			return colsHeight[col];
		};
	
		var _updateColumnHeight = function(col, height){		
			height += 30;
			colsHeight[col] += height;
		};
	
		var _getLeft = function(col) {
			return col * (settings.width + settings.colspan);
		};
	
		var _getHeightestColumn = function() {
			var max = 0;
			for (var i = 0; i < settings.cols; i++) {
				if (colsHeight[i] > max) {
					max = colsHeight[i];
				}
			}
			return max + 46;
		};
		
		return {
			readyImage: function(data) { 
				if (!data) {
					return;
				}
				
				$.each(data, function(i, item) {
														
					item.col      = _getShortestColumnNumber();
					item.top      = _getTop(item.col);
					item.left     = _getLeft(item.col);
					item.height   = item.img_height + 42;
					item.data_col = 'data_col_' + item.col;
					item.data_id  = 'data_' + item.top + item.left;        		    
        		    
					_updateColumnHeight(item.col, item.height);	
				
					This.css({
						height: _getHeightestColumn()
					});
								
				});
				
				var html = settings.renderItemHtml(data);

				This.append(html);					
			},
			reflow: function() {
					var newCols = settings.cols;
					var newColspan = settings.colspan;
		
			        if (settings.debug && console) console.log('new colspan: ' + newColspan);
		        
					for(var i = 0; i < newCols; i++) {
						colsHeight[i] = 0;
					}
		
					This.children().each(function(i, e){
						var item = $(e);
			
						var height = item.css('height');
							height = height.replace('px', '');
							height = parseInt(height);
							
						var col = _getShortestColumnNumber();
						var left = _getLeft(col);
						var top = _getTop(col);
			
						if (settings.debug && console) console.log('id:'+ i + ' col:' + col + ' left: ' + left + 'top: ' + top + ' height='+height);
						item.css({
							left: left,
							top: top
						});
						
						_updateColumnHeight(col, height);	
			
					});
		
					This.css({
						height: _getHeightestColumn()
					});
	   
			}
			
		};	
	};
	
	/**
	 * object
	 * @return  start method 绑定scroll事件 
	 *          Dynamic load waterfall items by monitor window scroll.
	 * @return  pause method 解除绑定
	 */
	var switch_bind = {
		start: function() {			
			var self = this;
			$(window).bind("scroll", function(){
				var exper_scroll = $(window).scrollTop();
				if(settings.debug && console) console.log('scroll top:' + exper_scroll);

				var exper_height = This.height();
				if(settings.debug && console) console.log('exper height:' + exper_height);
	
				var window_height = $(window).height();
				if(settings.debug && console) console.log('window height:' + window_height);

				if (exper_height -  (exper_scroll + window_height) < 20 ) {
					if(settings.debug && console) console.log("i am here ");
				
					tools(1);
					settings.getImageData(callback);
					self.pause();			
				}
			});
		},
	
		pause: function() {
			$(window).unbind('scroll');
		}

	};

	var wf = new WF();
	
	/**
	 * 当getJson 成功的获取数据后调用callback function
	 * @param    取得的数据 array
	 * @param    是否还有下一页  布尔值
	 * @method   end方法
	 */		
	var callback = function(items, hasNextPage) {
	
		this.end = function() {
			if(settings.debug && console) console.log('i am ending');
			switch_bind.pause(); 
		};
	
		if (! hasNextPage) {
			tools(3); 
			this.end();
			return;
		}

		if (!items) {
			tools(2); 
			this.end();
			return
		}
	    
	    // 数据检查成功后隐藏
		$(settings.notice).hide(); 
		// back to top 显示
		$(settings.backtotop).show();	
		
		// 调用加载数据方法	
		wf.readyImage(items);
		// 绑定scroll方法
		switch_bind.start(); 
	};
	
	// 调用方法取得下一批数据
	settings.getImageData(callback);
	
	// 对窗口宽度监听
	$(window).resize(function (){reSize(wf)});
	
	// 为back to top绑定方法
	$(settings.backtotop).bind('click', function() {
		$(settings.backtotop).scrollTop(0);
	});
};

/**
 * 绑定waterfall在$
 * @param 提供option接口  
 * @param 需要加载waterfall数据的id的jQuery实例
 * @param new Tools的实例
*/
$.WaterFall = function(option, This, tools) {
	$.data(This, 'WaterFall', new waterfall(option, This, tools));
	return This;
}

/**
 * 在$.prototype上绑定waterfall
 */
$.fn.WaterFall = function(option) {	
	var key = checkApiTools(option);
	var tools = new Tools(option.notice, option.debug);
	
	if (key) {
		tools(4);
		return;
	}
	$.WaterFall(option, this, tools);
}
}(jQuery));
