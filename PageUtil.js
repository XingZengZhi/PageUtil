/**
 * Created by 邢增智 on 2018/4/11.
 */
;(function (global) {
    "use strict";

    var allowMax,
        allowMin,
        myparams,
        dataURL,
        tbContent,
        pagination,
        countPage,
        rowSize,
        number,
        nex,
        pre,
        h,
        _this;


    var PageUtil = function (config) {
        _this = this;
        //分页数
        allowMax = typeof config.allowMax == "undefined" ? 0 : config.allowMax;
        //初始化分页数量
        allowMin = typeof config.allowMin == "undefined" ? 4 : config.allowMin;
        //参数
        myparams = config.myparams;
        //请求数据地址
        dataURL = config.dataURL;
        countPage = typeof config.countPage == "undefined" ? $("#countPage") : config.countPage;
        rowSize = typeof config.rowSize == "undefined" ? $("#countPage") : config.rowSize;
        nex = typeof config.nex == "undefined" ? $("#nex") : config.nex;
        pre = typeof config.pre == "undefined" ? $("#pre") : config.pre;
        tbContent = typeof config.tbContent == "undefined" ? $("#tbContent") : config.tbContent;
        pagination = config.pagination;
    }

    PageUtil.prototype = {
        getPageDate:function () {
            $.post(dataURL,myparams, function (result) {
                if(typeof result != 'object'){
                    console.error("is not object.");
                    return;
                }
                countPage.html(result.countPage);
                rowSize.html(result.rowSize);
                tbContent.children().remove();
                var className = "";
                if(myparams.pageNumber == 1){
                    allowMax = result.countPage;//分页数
                    pagination.children().children(".number").parent().remove();//清除之前的分页按钮
                    for(var i = 1; i <= Math.min(allowMax, allowMin); i++){
                        className = myparams.pageNumber === i ? "active" : "";//判断当前是否时活动页
                        nex.before("<li class='"+ className +"'><a href='javascript:;' class='number'>"+ i +"</a></li>");
                    }
                    pagination.children().children(".number").on('click', _this.setPageNumber);//绑定分页按钮事件
                    if(allowMax <= allowMin){
                        nex.addClass("disabled");
                        pre.addClass("disabled");
                        nex.off('click', _this.rightFun);
                        pre.off('click', _this.leftFun);
                    }else{
                        nex.removeClass("disabled");
                        pre.addClass("disabled");
                        nex.on('click', _this.rightFun);
                        pre.on('click', _this.leftFun);
                    }
                }
                var ht = setResult(result);
                tbContent.append(ht);
            });
        },
        rightFun:function(e){
            var ind = parseInt(pagination.children().children(".number:last").text());
            var endInd = ind + allowMin > allowMax ? allowMax : ind + allowMin;
            if(!(ind === allowMax)){
                pagination.children().children(".number").remove();
            }
            /**
             * 索引等于最大页时禁用右翻页按钮，否则开启左翻页按钮
             */
            if(ind === allowMax){
                nex.off('click');
                nex.addClass("disabled");
                return;
            }else{
                pre.removeClass("disabled");
                nex.removeClass("disabled");
            }
            for(var i = ind + 1; i <= endInd; i++){
                nex.before("<li><a href='javascript:;' class='number'>"+ i +"</a></li>");
            }
            pagination.children().children(".number").on('click', _this.setPageNumber);
            e.stopPropagation();
        },
        leftFun:function(e){
            var ind = parseInt(pagination.children().children(".number:first").text());
            debugger;
            var startInd = ind - allowMin > 0 ? ind - allowMin : 1;
            if(!(ind === 1)){
                pagination.children().children(".number").remove();
            }
            /**
             * 索引等于最小页时禁用左翻页按钮，否则开启右翻页按钮
             */
            if(ind === 1){
                pre.off('click');
                pre.addClass("disabled");
                return;
            }else{
                nex.removeClass("disabled");
                pre.removeClass("disabled");
            }
            for(var i = startInd; i < ind; i++){
                nex.before("<li><a href='javascript:;' class='number'>"+ i +"</a></li>");
            }
            pagination.children().children(".number").on('click', _this.setPageNumber);
            e.stopPropagation();
        },
        setPageNumber:function(){
            $(this).parent().addClass("active").siblings().removeClass("active");
            myparams.pageNumber = parseInt($(this).text());
            _this.getPageDate();
        },
        setPageSize:function(pageSize){
            myparams.pageSize = pageSize;
            myparams.pageNumber = 1;
            _this.getPageDate();
        },
        setHtml:function (html) {
            h = html;
        }

    };

    function getHtml(){
        return h;
    }

    /**
     * 为模版设置数据
     * @param result   后台json
     * @returns {string} 返回设置数据后的模版
     */
    function setResult(result) {
        var hArray, newHtml = "";
        for (var i = 0;i<result.rows.length;i++){
            //添加序号属性
            result.rows[i].seriNum = i + ((myparams.pageNumber - 1) * myparams.pageSize) + 1;
            hArray = getHtml().split("${");
            //从1开始，是因为出去序号列
            for(var j = 1;j<hArray.length;j++){
                hArray[j] = result.rows[i][hArray[j].split("}")[0]] + hArray[j].split("}")[1];
            }
            newHtml += hArray.join("");
        }
        return newHtml;
    }

    global.PageUtil = PageUtil;

})(this);
