var clientServerHost = localStorage.getItem("clientServerHost");
var blockchainServerHost = localStorage.getItem("blockchainServerHost");
if (clientServerHost == null) {
	clientServerHost = "http://127.0.0.1:5000";
}
if (blockchainServerHost == null) {
	blockchainServerHost = "http://127.0.0.1:7777";
}


//-----------------------------------------评论tab-----------------------------------------
//-----------------------------------------request-----------------------------------------
//发送评论
function registerUserComment(wallet_id, password, ref_id, comment_score, comment_content,doc_type){
    var comment_data = {
        "comment_ref_id": ref_id,
        "comment_score": comment_score,
        "comment_content": comment_content,
        "comment_doc_type": doc_type
    }
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST", 
            dataType: "json",
            contentType: "application/json",
            url: clientServerHost + "/comment/registerComment",
            data: JSON.stringify({
                "wallet_id": wallet_id,
                "password": password,
                "comment_data": comment_data
            }),
            success: function(response){
                if(response.code === 200){
                    resolve(response.data);
                } else {
                    reject(response.message);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        });
    })
}
//按ref_id分页查询评论数据
function queryCommentDataByRefId(ref_id, page, pageSize){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: blockchainServerHost + "/comment/queryCommentsByRefID",
            data: JSON.stringify({
                "ref_id": ref_id,
                "page": page,
                "page_size": pageSize
            }),
            success: function(response){
                console.log("Comment data by ref_id:", response);
                if(response.result != null && response.result != undefined){
                    try {
                        const data = JSON.parse(response.result);
                        if(data.comment_infos && Array.isArray(data.comment_infos)){
                            resolve({
                                comment_infos: data.comment_infos,
                                total: data.total,
                                page: data.page,
                                page_size: data.page_size
                            });
                        } else {
                            reject("Comment data is not found");
                        }
                    } catch(e) {
                        reject("Failed to parse comment data: " + e.message);
                    }
                }else{
                    reject("Comment data is null");
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}



//-----------------------------------------激励机制tab-----------------------------------------
//初始化incentive trend chart
function initIncentiveTrendChart(trend_data){
    var chart = echarts.init(document.getElementById('cti-incentive-trend-chart'));
    console.log("Trend data:", trend_data);
    var option = {
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                return params[0].name + '<br/>' +
                       '积分: ' + params[0].value;
            }
        },
        grid: {
            left: '1%',
            right: '4%',
            bottom: '3%',
            top: '4%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: trend_data.map(item => item.date),
            axisLine: {
                lineStyle: {
                    color: '#285191'
                }
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#285191'
                }
            }
        },
        series: [{
            name: '积分',
            type: 'line',
            data: trend_data.map(item => item.value),
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {
                color: '#285191'
            },
            lineStyle: {
                color: '#285191',
                width: 2
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0,
                        color: 'rgba(40, 81, 145, 0.3)'
                    }, {
                        offset: 1,
                        color: 'rgba(40, 81, 145, 0.05)'
                    }]
                }
            }
        }]
    };
    chart.setOption(option);
}

//处理incentive trend data
function proccessIncentiveTrendData(raw_data){
    var trend_data = [];
    for(var i = 0; i < raw_data.length; i++){
        trend_data.push({
            date: raw_data[i].create_time,
            value: raw_data[i].incentive_value
        });
    }
    //按时间排序
    trend_data.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
    });
    return trend_data;
}   
//查询积分趋势
function queryIncentiveTrend(ref_id){
    queryAllIncentiveEventData(ref_id).then(function(response){
        console.log("Incentive data:", response);
        var trend_data = proccessIncentiveTrendData(response.incentive_infos);
        initIncentiveTrendChart(trend_data);
    });
}
//-----------------------------------------request-----------------------------------------
//查询所有积分激励数据
function queryAllIncentiveEventData(ref_id){
    return queryIncentiveEventDataByRefId(ref_id, 1, 100000000);
}

//分页查询积分激励数据
function queryIncentiveEventDataByRefId(ref_id, page, pageSize, sort='create_time'){
    return new Promise(function(resolve, reject){
        $.ajax({
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            url: blockchainServerHost + "/incentive/queryDocIncentiveInfoWithPagination",
            data: JSON.stringify({
                "ref_id": ref_id,
                "doc_type": "cti",
                "page": page,
                "page_size": pageSize,
                "sort": sort
            }),
            success: function(response){
                if(response.result!=null&&response.result!=undefined){
                    var data = JSON.parse(response.result)
                    console.log("Incentive data by ref_id:", data);
                    resolve(data);
                }
                reject({})
            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                reject(errorThrown);
            }
        })
    })
}