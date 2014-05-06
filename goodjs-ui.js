angular.module('goodow.ui',[
    'goodow.ui.services',
    'goodow.ui.svg'
])
/* Services */

var serviceModule;
// Demonstrate how to register services
// In this case it is a simple value service.
(function(window,angular,undefined){
  /**
    * how to create a service?
      1.value method
      2.provider method
      3.factory method
      4.service method
    */

//        var options = {debug:true, forkLocal:true};
//        var bus = new window.good.channel.WebSocketBus("http://test.goodow.com:8080/eventbus", options);
//      var RealtimeService = function(){
//
//      };
//    RealtimeService.prototype = {
//      bindOnOpenHandler : function(onOpenHandler) {
//      bus.registerHandler("@goodow.bus.onOpen", onOpenHandler);
//      return this;
//      },
//    bindOnCloseHandler : function(onCloseHandler) {
//      bus.registerHandler("@goodow.bus.onClose", onCloseHandler);
//      return this;
//      },
//    bindOnErrorHandler : function(onErrorHandler) {
//      bus.registerHandler("@goodow.bus.onError", onErrorHandler);
//      return this;
//      },
//    bindOnMessageHandler : function(channel,onMessageHandler) {
//      var self_ = this;
//      var handlerRegistration = bus.registerHandler(channel, onMessageHandler);
//      return this;
//      },
//      publish : function(channel,obj) {
//      var self_ = this;
//     bus.publish(channel,obj);
//     return this;
//      },
//      close:function(){
//        if (bus) {
//        bus.close();
//      }
//      }
//      // ,send:function(channel,obj,callback){
//      //   var message = bus.send(channel,obj,callback);
//      //   message.reply(obj);
//      // }
//    }

  serviceModule = angular.module('goodow.ui.services', [])
  .factory('goodowConstant', function(){
    return {
      SVG_SID:'someaddress.s',
      SERVER:'http://test.goodow.com:8080/eventbus'
    }
  })
  .factory('realtimeService',['goodowConstant',function(goodowConstant){
          var options = {debug:true, forkLocal:true};
          return function(){
              var bus = new window.good.channel.WebSocketBus(goodowConstant.SERVER, options);
              return bus;
          }
      }])
  .factory('goodowUtil', function(){
          function transform(element,value){
              element.style('-webkit-transform',value)
                  .style('-moz-transform',value)
                  .style('-o-transform',value)
                  .style('transform',value);
          }
          return {
              'transform':transform
          };
      })
  .factory('graphService', ['goodowUtil',function(goodowUtil){
          var linefn = d3.svg.line()
                .x(function(d){return d[0];})
                .y(function(d){return d[1];})
                .interpolate('linear');
          var svgHeight = null;
          var svgWidth = null;
          var rectGenerator = function(config,svgElement){
              //Really needed?
              if(config.type !== 'rect')
                  return;
//              var linear_scale_y = d3.scale.linear().range([0,svgHeight]).domain([0,config.y]);
//              var linear_scale_x = d3.scale.linear().range([0,svgWidth]).domain([0,config.x]);
              var rect = svgElement.append('g').append('rect');
              rect.attr('fill',config.fill)
                  .attr('stroke',config.stroke)
                  .attr('stroke-width',config['stroke-width'])
                  .attr('stroke-linecap',"round");
//              rect.attr('x',linear_scale_x(config.x))
//                  .attr('y',linear_scale_y(config.y))
              rect.attr('x',config.x)
                  .attr('y',config.y)
                  .attr('width',config.width)
                  .attr('height',config.height);
              if (config.transform) {
                  goodowUtil.transform(rect,'rotate(' + config.transform.rotate + 'deg)');
              }

          };

          var ellipseGenerator = function(config,svgElement) {
              var ellipse = svgElement.append('g').append('ellipse');
              ellipse.attr('fill', config.fill)
                  .attr('stroke', config.stroke)
                  .attr('stroke-width', config['stroke-width'])
                  .attr('stroke-linecap', "round");
              ellipse.attr('cx', config.cx)
                      .attr('cy', config.cy)
                      .attr('rx', config.rx)
                      .attr('ry', config.ry);
                  if (config.transform) {
//                      ellipse.style('-webkit-transform', 'rotate(' + config.transform.rotate + 'deg)')
//                          .style('-moz-transform', 'rotate(' + config.transform.rotate + 'deg)')
//                          .style('-o-transform', 'rotate(' + config.transform.rotate + 'deg)')
//                          .style('transform', 'rotate(' + config.transform.rotate + 'deg)');
                      goodowUtil.transform(ellipse,'rotate(' + config.transform.rotate + 'deg)');
                  }
          }

          var pathGenerator = function(config,svgElement){
              var path  = svgElement.append('g').append('path');
              path.attr('stroke',config.stroke)
                  .attr('stroke-width',config['stroke-width'])
                  .attr('fill','none')
                  .attr('stroke-linecap',"round");
              if(angular.isArray(config.d)&&config.d.length >= 2){
                  path.attr('d',linefn(config.d));
              }
              if (config.transform) {
                  goodowUtil.transform(path,'rotate(' + config.transform.rotate + 'deg)');
              }
          }
    var factoryMap = {
        'ellipse':ellipseGenerator,
        'path':pathGenerator,
        'rect':rectGenerator
        //...
    }



    //CanvasElement
    return {
        //通过数据画出图形
        drawGraph : function(config){
            var fn = factoryMap[config.type];
            var svgElement = d3.select('#mysvg');
            svgHeight = svgElement.property('height').animVal.value;
            svgWidth = svgElement.property('width').animVal.value;

            if(angular.isFunction(fn)){
                fn.call(null,config,svgElement);
            }else{
                throw new Error(fn +' is not a function');
            }
        }
        //d3 api  line gengerator 统一由service提供
        ,lineFunction : function(name){
            return linefn;
        }
    }

  }]);
//  serviceModule.provider('testService',function(){
//     var data = 12;
//     this.$get = function(){
//       return {
//         say:function(data){
//             if(this.data){
//               alert(this.data);
//          }else{
//           alert(data);
//          }
//         }
//       }
//     };
//     this.setData = function(data){
//       data = data;
//     }
//  });
//  serviceModule.config(['testServiceProvider',function(testServiceProvider) {
//      testServiceProvider.setData('hello world');
//  }]);
})(window,angular);

'use strict';

/* Controllers */

angular.module('goodow.ui.svg', ['goodow.ui.services'])
.controller('SVGController', ['$scope','realtimeService','goodowConstant','$log',function($scope,realtimeService,goodowConstant,$log) {
        var self_ = this;
        /**
         *  bind realtime-socket callback handler
         */
//        realtimeService.bindOnOpenHandler(function(message){
//            $log.log('Open At' + new Date().toString());
//        }).bindOnCloseHandler(function(message){
//            console.log('Close At' + new Date().toString());
//        }).bindOnMessageHandler(goodowConstant.SVG_SID,function(message){
//          $scope.$apply(function($scope){
//            //接收到推送数据
//            $scope.data = message.body();
//          });
//        }).bindOnErrorHandler(function(message){
//
//        });
        var bus = realtimeService();
        bus.registerHandler("@goodow.bus.onOpen", function(message) {

            console.log("Opened at: " + new Date().toString());
        });

        bus.registerHandler("@goodow.bus.onClose", function(message) {

            console.log("Closed at: " + new Date().toString());
        });

        bus.registerHandler("@goodow.bus.onError", function(error) {

        });

        var handlerRegistration = bus.registerHandler(goodowConstant.SVG_SID, function(message) {
            $scope.$apply(function($scope){
            //接收到推送数据
            $scope.data = message.body();
          });
        });

        $scope.$watch('sendData',function(){
           if($scope.sendData){
               bus.publish(goodowConstant.SVG_SID,$scope.sendData);
           }
        });
  }])

/* Directives */

.directive('goodowcanvas', ['realtimeService','goodowConstant','graphService',function(realtimeService,goodowConstant,graphService) {
        // d3 linear generator
    var lineFunction = graphService.lineFunction();
    //invoked when mousedown init,what will be inserted into SVG element,use default config
	var initDrawPen = function(config){
		var myCanvas = d3.select('#mysvg').append('g');
        var graph = myCanvas.append(config.type)
                .attr('fill',config.fill)
				.attr('stroke',config.stroke)
				.attr('stroke-width',config.stroke_width)
				.attr('stroke-dasharray',config.stroke_dasharray)
				.attr('stroke-linecap',"round");
        return graph;
	};

    //will be invoked when Mouse up,fill the graph use comstom config
	function paint(d3ele,configuration){
		var self_ = this;
		if(configuration.type == 'rect'){
			d3ele.attr('width',configuration.width)
				  .attr('height',configuration.height)
				  .attr('x',configuration.startX)
				  .attr('y',configuration.startY);
		}else if(configuration.type == 'ellipse'){
			d3ele.attr('rx',configuration.rx)
				  .attr('ry',configuration.ry)
				  .attr('cx',configuration.startX)
				  .attr('cy',configuration.startY);
		}else if(configuration.type == 'path'){
			d3ele.attr('d',lineFunction(configuration.d));
		}
		
	}
	

	var link = function(scope,element,attr){
		//mouse move default config
		var defaultConfig = {
			'fill':'none',
			'stroke':'blue',
			'stroke_width':1,
			'stroke_dasharray':'1,2',
			canDraw:false,
			hasDrawFinish:true
		}


		// var ellipseConfig = angular.extend({},defaultConfig);
		var configuration;
			configuration = angular.extend({},defaultConfig);



		scope.$watch('data',function(){
			var data = scope.data;
			var configuration_;
			for(var p in data){
                configuration_ = angular.extend({},data[p]);
				configuration_.type = p;
                graphService.drawGraph(configuration_);
		}

		});
        //
		var ellipse,rect,path;

//		BindAction
        //DOM element
        var svgElement = element.find('svg')[0];
		d3.select(svgElement).on('mousedown',function(){
         //DOM element
		 var self_ = this;
		 //left mouse down
		 if(d3.event.which == 1){
             switch (scope.shape){
                 case 'ellipse':
                     configuration.type = 'ellipse';
                     configuration.rx = 0 ;
                     configuration.ry = 0;
                     configuration.tempX = d3.event.offsetX;
                     configuration.tempY = d3.event.offsetY;
                     configuration.canDraw = true;
                     configuration.hasDrawFinish = false;
                     ellipse = initDrawPen(configuration);
                     break;
                 case 'rect':
                     configuration.type = 'rect';
                     configuration.width = 0 ;
                     configuration.height = 0;
                     configuration.startX = configuration.tempX = d3.event.offsetX;
                     configuration.startY = configuration.tempY = d3.event.offsetY;
                     configuration.canDraw = true;
                     configuration.hasDrawFinish = false;
                     rect = initDrawPen(configuration);
                     break;
                 case 'path':
                     configuration.type = 'path';
                     configuration.d = [];
                     //
                     configuration.d.push([d3.event.offsetX,d3.event.offsetY]);
                     configuration.canDraw = true;
                     configuration.hasDrawFinish = false;
                     path = initDrawPen(configuration);
                     break;

             }
		 }

		 d3.select(self_).on('mouseup',function(){
				var self_ = this;
				if(d3.event.which == 1){
					d3.select(self_).attr('style','cursor:default');
					configuration.canDraw = false;
					configuration.hasDrawFinish = true;
					var sendData = {};
				if(configuration.type == 'rect'){
					rect.attr('fill',scope.fill)
						  .attr('stroke-width',scope.stroke_width)
						  .attr('stroke',scope.stroke)
						   .attr('stroke-dasharray','');
					sendData.rect = {};
					sendData.rect['x'] = configuration.startX;
					sendData.rect['y'] = configuration.startY;
					sendData.rect['width'] = configuration.width;
					sendData.rect['height'] = configuration.height;
					sendData.rect['fill'] = scope.fill;
					sendData.rect['stroke'] = scope.stroke;
					sendData.rect['stroke-width'] = scope.stroke_width;
				}else if(configuration.type == 'ellipse'){
					ellipse.attr('fill',scope.fill)
						  .attr('stroke-width',scope.stroke_width)
						  .attr('stroke',scope.stroke)
						   .attr('stroke-dasharray','');
					sendData.ellipse = {};
					sendData.ellipse['cx'] = configuration.startX;
					sendData.ellipse['cy'] = configuration.startY;
					sendData.ellipse['rx'] = configuration.rx;
					sendData.ellipse['ry'] = configuration.ry;
					sendData.ellipse['fill'] = scope.fill;
					sendData.ellipse['stroke'] = scope.stroke;
					sendData.ellipse['stroke-width'] = scope.stroke_width;
				}else if(configuration.type == 'path'){
					console.log(JSON.stringify(configuration.d));
					var path_stroke_width = (scope.stroke_width == undefined||scope.stroke_width==0)?1:scope.stroke_width;
					var path_stroke = scope.stroke==undefined?'black':scope.stroke;
					path.attr('d',lineFunction(configuration.d))
					.attr('stroke-width',path_stroke_width)
						  .attr('stroke',path_stroke)
						  .attr('fill','none')
						  .attr('stroke-dasharray','');
					sendData.path = {};
					sendData.path['d'] = configuration.d;
					sendData.path['fill'] = scope.fill;
					sendData.path['stroke'] = path_stroke;
					sendData.path['stroke-width'] = path_stroke_width;
				}

				}
//                 realtimeService.publish(goodowConstant.SVG_SID,sendData);
                 scope.$apply(function(scope){
                     scope.sendData = sendData;
                 });
				 d3.select(self_).on('mousemove',null).on('mouseup',null);
			}).on('mousemove',function(){
				if(!configuration.canDraw)
					return;
				var self_ = this;
				d3.select(self_).attr('style','cursor:crosshair');
				var endX = d3.event.offsetX;
				var endY = d3.event.offsetY;
				if(configuration.type == 'rect'){
					configuration.width = endX - configuration.tempX;
					configuration.height = endY - configuration.tempY;
				if(configuration.width<0){
					configuration.startX = endX;
					configuration.width = Math.abs(configuration.width);
				}
				if(configuration.height<0){
					configuration.startY = endY;
					configuration.height = Math.abs(configuration.height);
				}
				paint(rect,configuration);
				}else if(configuration.type == 'ellipse'){
					configuration.rx = Math.abs(endX - configuration.tempX)/2;
					configuration.ry = Math.abs(endY - configuration.tempY)/2;
					configuration.startX = configuration.tempX + (endX - configuration.tempX)/2;
					configuration.startY = configuration.tempY + (endY - configuration.tempY)/2;
				paint(ellipse,configuration);
				}else if(configuration.type == 'path'){
					configuration.d.push([d3.event.offsetX,d3.event.offsetY]);
					path.attr('d',lineFunction(configuration.d));
				}
				//reset configuration
				// configuration = null;
			   });
			});
		//destory handler
		element.on('$destroy', function() {
        //close connnection
        realtimeService.close();
      });
	}

    return {
    	restrict:'E',
    	controller:'SVGController',
    	'link':link,
    	templateUrl:'partials/canvasDirective.html'
    }
  }])
.run(['$templateCache',function($templateCache){
  $templateCache.put('partials/canvasDirective.html','<div class="nav" id="draw_menu" >'+
      '<input type="radio" name="path" ng-model="shape" value="line"/>  zhi'+
            '<input type="radio" name="path" ng-model="shape" value="path2"/> jian'+
            '<input type="radio" name="path" ng-model="shape" value="path3"/> qu'+
            '<input type="radio" name="path" ng-model="shape" value="path4"/>  zhe'+
            '<input type="radio" name="path" ng-model="shape" value="path5"/> hu'+
            '<input type="radio" name="path" ng-model="shape" value="path"/> ziyou'+
            '<input type="radio"  ng-model="shape" value="rect"/>  juxing'+
            '<input type="radio"  ng-model="shape" value="ellipse"/> tuoyuan'+
            '<input type="text" name="basic" ng-model="stroke" id="border_color"/>RGB or name ：边框颜色'+
        '<input type="text" name="basic" ng-model="fill" id="fill_color"/>RGB or name :填充颜色'+
        '<input type="text" name="basic" ng-model="stroke_width" id="border_width"/>Number'+
      '</div><svg id="mysvg"></svg>');
}]);
  // .controller('MyCtrl2', [function() {

  // }]);
