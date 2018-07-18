let docText = [];
let currentSentenceIndex = 0;
let currentDocIndex = 0;
let totalDocIds = [];
let typeMap = new Map();
let username = sessionStorage.getItem("username");
console.log(username);
$(document).ready(function () {
    let doc_index = 0;
    $.ajax({
        async: true,
        url: "http://bigcode.fudan.edu.cn/kg/getDocIdList/",
        type: "post",
        contentType: "application/json; charset=utf-8",
        error: function (xhr, status, errorThrown) {
            console.log("Error " + errorThrown);
            console.log("Status: " + status);
            console.log(xhr)
        },
        success: function(d){
            totalDocIds = d["doc_id_list"];
            currentDocIndex = doc_index;
            getDocById(totalDocIds[currentDocIndex]);
        }
    });

});

function docNext(){
    if(currentDocIndex < totalDocIds.length - 1){
        cleanDocContent();
        cleanRadioBtns();
        currentDocIndex = currentDocIndex + 1;
        getDocById(totalDocIds[currentDocIndex]);
        radioBtnDisplay(currentDocIndex, currentSentenceIndex);
        titleDisplay(currentDocIndex, currentSentenceIndex);
    }

    if(currentDocIndex === totalDocIds.length - 1){
        $("#doc-next").attr("disabled", "true");
    }
    if(currentDocIndex !== 0){
        $("#doc-previous").removeAttr("disabled");
    }

}

function docPre(){
    if(currentDocIndex > 0){
        cleanDocContent();
        cleanRadioBtns();
        currentDocIndex = currentDocIndex - 1;
        getDocById(totalDocIds[currentDocIndex]);
        radioBtnDisplay(currentDocIndex, currentSentenceIndex);
        titleDisplay(currentDocIndex, currentSentenceIndex);
    }

    if(currentDocIndex === 0){
        $("#doc-previous").attr("disabled", "true");
    }
    if(currentDocIndex !== totalDocIds.length - 1){
        $("#doc-next").removeAttr("disabled");
    }

}

function sentenceNext(){
    let length = docText.length;
    if(currentSentenceIndex < length - 1){
        currentSentenceIndex += 1;
        $(".sentence-panel-scroll").html(docText[currentSentenceIndex]);
        $("#next-sentence").removeAttr("disabled");
        cleanRadioBtns();
        getAnnotationCount(totalDocIds[currentDocIndex], currentSentenceIndex);
        radioBtnDisplay(currentDocIndex, currentSentenceIndex);
        titleDisplay(currentDocIndex, currentSentenceIndex);
    }
    if(currentSentenceIndex === length - 1){
        $("#next-sentence").attr("disabled", "true");
    }
    if(currentSentenceIndex !== 0){
        $("#pre-sentence").removeAttr("disabled");
    }
}

function sentencePrevious(){
    let length = docText.length;
    if(currentSentenceIndex > 0){
        currentSentenceIndex -= 1;
        $(".sentence-panel-scroll").html(docText[currentSentenceIndex]);
        $("#pre-sentence").removeAttr("disabled");
        cleanRadioBtns();
        getAnnotationCount(totalDocIds[currentDocIndex], currentSentenceIndex);
        radioBtnDisplay(currentDocIndex, currentSentenceIndex);
        titleDisplay(currentDocIndex, currentSentenceIndex);
    }
    if(currentSentenceIndex === 0){
        $("#pre-sentence").attr("disabled", "true");
    }
    if(currentSentenceIndex !== length - 1){
        $("#next-sentence").removeAttr("disabled");
    }
}

function getAnnotationCount(doc_id, sentence_index){
    let sentenceData = {"doc_id": doc_id, "sentence_id": sentence_index};
    $.ajax({
        async: true,
        url: "http://bigcode.fudan.edu.cn/kg/getAnnotationCountByIndex/",
        type: "post",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(sentenceData),
        error: function (xhr, status, errorThrown) {
            console.log("Error " + errorThrown);
            console.log("Status: " + status);
            console.log(xhr)
        },
        success: function(d){
            let annotationCount = d["annotation_count"];
            // console.log(annotationCount);
            if (annotationCount === -1){
                annotationCount = 0;
                // console.log(annotationCount);
            }
            $("#annotation-count").html(annotationCount);
        }
    });
}

function getDocById(doc_id){
    let data = {"doc_id": doc_id};
    $.ajax({
        async: true,
        url: "http://bigcode.fudan.edu.cn/kg/getDocById/",
        type: "post",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        error: function (xhr, status, errorThrown) {
            console.log("Error " + errorThrown);
            console.log("Status: " + status);
            console.log(xhr)
        },
        success: function(d){
            console.log(d);
            console.log(d.length);
            if(d.length > 0){
                docText = [];
                for(let i = 0; i < d.length; i++){
                    let data = {
                        "sentenceId": "sentence-" + d[i].sentence_index,
                        "sentence": d[i].text
                    };
                    console.log(data);
                    $("#template").tmpl(data).appendTo(".doc-panel-scroll");
                    docText.push(d[i].text)
                }
                $(".sentence-panel-scroll").html(d[0].text);
                currentSentenceIndex = 0;
                currentDocIndex = $.inArray(doc_id, totalDocIds);
                getAnnotationCount(d[0].doc_id, d[0].sentence_index);
                titleDisplay(currentDocIndex, currentSentenceIndex);
                if(currentDocIndex !== length - 1){
                    $("#next-sentence").removeAttr("disabled");
                }
                if(currentDocIndex !== 0){
                    $("#doc-previous").removeAttr("disabled");
                }
                if(currentSentenceIndex !== length - 1){
                    $("#next-sentence").removeAttr("disabled");
                }
                if(currentSentenceIndex !== 0){
                    $("#pre-sentence").removeAttr("disabled");
                }
            }
        }
    });
}

function cleanRadioBtns(){
    for(let i = 0; i < 3; i++){
        let radioName = "#optionsRadios" + i;
        $(radioName).prop("checked", false);
    }
}

function cleanDocContent(){
    $(".doc-panel-scroll").children().remove();
}

$(function(){
    $(":radio").click(function(){
        // console.log($(this).val());
        let index = $(this).val().split("-")[1];
        console.log(index);
        let key = totalDocIds[currentDocIndex] + "-" + currentSentenceIndex;
        typeMap.set(key, index);

        console.log(typeMap);
        // console.log(typeof typeMap);
        // console.log(JSON.stringify(typeMap));
        console.log(MapToJson(typeMap));
    });
});

/**
 * @return {string}
 */
function MapToJson(m) {
    let str = '{';
    let i = 1;
    m.forEach(function (item, key, mapObj) {
        if (mapObj.size === i) {
            str += '"' + key + '":"' + item + '"';
        } else {
            str += '"' + key + '":"' + item + '",';
        }
        i++;
    });
    str += '}';
    //console.log(str);
    return str;
}

function transformTypeDataToJson(){
    let data = [];
    typeMap.forEach(function (value, key, map) {
        let docSentenceIdArray = key.split("-");
        let docId = docSentenceIdArray[0];
        let sentenceId = docSentenceIdArray[1];
        let text = docText[sentenceId];
        let type = value;
        console.log("docId: " + docId + ", sentenceId: " + sentenceId + ", text: " + text + ", type: " + type);
        let temp = {"doc_id": docId, "sentence_index": sentenceId, "text": text, "type": type, "username": username};
        data.push(temp);
    });
    return data;
}

function saveTypeData(){
    let data = transformTypeDataToJson();
    $.ajax({
        async: true,
        url: "http://bigcode.fudan.edu.cn/kg/saveSentenceAnnotation/",
        type: "post",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(data),
        error: function (xhr, status, errorThrown) {
            console.log("Error " + errorThrown);
            console.log("Status: " + status);
            console.log(xhr)
        },
        success: function(d){
            if(d === "save successful"){
                alert("save successful");
            }
        }
    });
}

function radioBtnDisplay(currentDocIndex, currentSentenceIndex){
    let key = totalDocIds[currentDocIndex] + "-" + currentSentenceIndex;
    if(typeMap.has(key)){
        let value = typeMap.get(key);
        let radioName = "#optionsRadios" + value;
        $(radioName).prop("checked", true);
    }
}

function titleDisplay(currentDocIndex, currentSentenceIndex){
    $("#doc-id").html(totalDocIds[currentDocIndex]);
    $("#sentence-id").html(currentSentenceIndex);
}

function jumpClick(){
    cleanDocContent();
    cleanRadioBtns();
    let doc_id = $("input[class='form-control']").val();
    let idoc_id = parseInt(doc_id);
    if(!isNaN(idoc_id)){
        getDocById(idoc_id);
    }else {
        alert(doc_id + " is not a number");
    }
}