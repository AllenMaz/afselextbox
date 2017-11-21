/**
 * Created by Allen on 2017/11/20.
 */
;
(function ($) {
    $.fn.extend({
        initafselectbox:function (config) {
            var renderdom = this[0];  //渲染dom
            var defaultoption = config.defaultoption; //默认选项{key:'',value:'select data'}
            if(!defaultoption ||
                defaultoption.key == undefined  || defaultoption.key ==null ||
                defaultoption.value == undefined || defaultoption.value ==null){
                defaultoption = {key:'',value:'select data'};
            }
            var height = config.height?config.height:'34'; //高度,默认高度34px
            var width = config.width?config.width:'auto'; //宽度，默认auto
            var selectevent = config.select; //选择事件

            var keyfield = config.keyfield?config.keyfield:''; //key字段,‘单个值’或['数组']
            var valuefield = config.valuefield?config.valuefield:''; //value字段,‘单个值’或['数组']
            var searchfield = config.searchfield?config.searchfield:'';//search字段,‘单个值’或['数组']

            /*数据格式
             [{
             code:'code',
             name:'value',
             desc:'描述'
             }];
             */
            var data = config.data?config.data:[]; //选择框数据

            if(renderdom){

                renderdom.setAttribute("data-keyfield",keyfield);
                renderdom.setAttribute("data-valuefield",valuefield);
                renderdom.setAttribute("data-searchfield",searchfield);

                $(renderdom).addClass("afselectbox afselextbox-default-skin");
                var afselexthtml = '';
                afselexthtml += '<span class="afselectboxvalue">'+defaultoption.key+'</span>';
                afselexthtml += '<span class="afselectboxtext">'+defaultoption.value+'</span>';
                afselexthtml += '<div class="afselectboxlist afselectboxhide">';
                afselexthtml += '<div class="afselectboxlist-inner">';

                var searchshowclss = searchfield ==''?'afselectboxhide':'';
                afselexthtml += '<div class="afselectboxoptionsearch '+searchshowclss+'">';
                afselexthtml += '<input type="text" placeholder="输入关键词">';
                afselexthtml += '<div class="afselectboxsearchbtn">清空</div>';
                afselexthtml += '</div>';
                afselexthtml += '<div class="afselectoptionlist"></div>';
                afselexthtml += '</div>';
                afselexthtml += '</div>';

                renderdom.innerHTML = afselexthtml;
                renderdom.onclick = function (e) {
                    //隐藏其它下拉框
                    $(".afselectbox").not(this).find(".afselectboxlist")
                        .removeClass("afselectboxshow").addClass("afselectboxhide");
                    var selectshow = $(this).find(".afselectboxlist").hasClass("afselectboxshow");
                    if(selectshow)
                        //隐藏下拉
                        $(this).find(".afselectboxlist").removeClass("afselectboxshow").addClass("afselectboxhide");
                    else
                        //显示下拉
                        $(this).find(".afselectboxlist").removeClass("afselectboxhide").addClass("afselectboxshow");
                };
                //阻止子元素向上冒泡
                $(renderdom).find(".afselectboxoptionsearch").click(function(event) {
                    event.stopPropagation();
                });
                //加载数据,生成选项
                $(this).renderafselectbox(data,selectevent);

                //宽高设置
                var renderdomWidth = $(renderdom).outerWidth();
                var listwidth = renderdomWidth-6;
                if(width != 'auto')
                    listwidth = width;
                var listinnerwidth = listwidth+20;
                $(renderdom).find(".afselectboxlist").width(listwidth);
                $(renderdom).find(".afselectboxlist-inner").width(listinnerwidth);
                $(renderdom).find(".afselectboxoptionsearch").width(listwidth);

                //过滤数据
                $(renderdom).find(".afselectboxoptionsearch input").bind('input propertychange', function() {
                    //过滤数据
                    $(renderdom).filterafselectbox($(this).val());
                });
                
                $(renderdom).find(".afselectboxsearchbtn").click(function () {
                    $(renderdom).find(".afselectboxoptionsearch input").val('');
                    $(renderdom).filterafselectbox($(this).val());
                });
            }

        },
        //渲染数据
        renderafselectbox:function (data,selectevent) {
            var renderdom = this;
            var keyfields = $(renderdom).attr("data-keyfield").split(',');
            var valuefields = $(renderdom).attr("data-valuefield").split(',');

            //加载数据,生成选项
            for(var i=0;i<data.length;i++){
                var propertylength = Object.getOwnPropertyNames(data[i]).length ;
                var optionwidth = (1/(propertylength-keyfields.length))*100;
                var optiondom = document.createElement("div");
                optiondom.setAttribute("class","afselectboxgridoption");
                var key = '';
                var value = '';
                var optioncolumnhtml ='';
                for(var attr in data[i]){

                    var iskey = false;
                    for(var j=0;j<keyfields.length;j++){
                        if(attr == keyfields[j])
                        {
                            iskey = true;
                            if(key !='')
                                key +=',';

                            key += data[i][attr];
                        }
                    }
                    for(var j=0;j<valuefields.length;j++){
                        if(attr == valuefields[j])
                        {
                            if(value !='')
                                value +=',';

                            value += data[i][attr];
                        }
                    }
                    if(!iskey)
                        optioncolumnhtml += '<div class="afselectboxoption" data-attr="'+attr+'" style="width:'+optionwidth+'%;">'+data[i][attr]+'</div>';

                }
                optiondom.innerHTML = optioncolumnhtml;
                optiondom.setAttribute("data-key",key);
                optiondom.setAttribute("data-value",value);
                optiondom.onclick = (function (selectevent) {

                    return function () {

                        var key = $(this).attr("data-key");
                        var value = $(this).attr("data-value");
                        $(this).closest(".afselectbox").find(".afselectboxvalue").html(key);
                        $(this).closest(".afselectbox").find(".afselectboxtext").html(value);

                        if(selectevent != undefined)
                            selectevent(key,value);
                        //清空查询条件
                        $(renderdom).find(".afselectboxoptionsearch input").val('');
                        $(renderdom).filterafselectbox($(this).val());
                    };

                }(selectevent));

                $(renderdom).find(".afselectoptionlist").append(optiondom);

            }
        },
        //过滤数据
        filterafselectbox:function (searchvalue) {
            var renderdom = this;
            var searchfield = $(renderdom).attr("data-searchfield");
            if(searchfield){
                var searchfields = $(renderdom).attr("data-searchfield").split(',');
                $(renderdom).find(".afselectoptionlist .afselectboxgridoption").each(function () {
                    var optioncolumns = $(this).find(".afselectboxoption");
                    var showoption = false;

                    for(var i=0;i<optioncolumns.length;i++){
                        var optionattr = $(optioncolumns[i]).attr("data-attr");
                        var optionvalue = $(optioncolumns[i]).html();
                        for(var j=0;j<searchfields.length;j++){
                            if(searchfields[j] == optionattr && optionvalue.indexOf(searchvalue) >-1)
                            {
                                showoption = true;
                                break;
                            }
                        }
                        if(showoption)
                            break;
                    }
                    if(showoption)
                        $(this).removeClass("hideoption");
                    else
                        $(this).addClass("hideoption")

                });
            }

        }

    });



})(window.jQuery);
