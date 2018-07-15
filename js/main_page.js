let docText = [];
let currentSentenceIndex = 0;
let currentDocId = 0;
let unfinishedDocs = [];
let typeMap = new Map();
$(document).ready(function () {
    let doc_index = 1;
    $.ajax({
        async: true,
        url: "http://10.141.221.75/getUnfinishedDocs/",
        type: "post",
        contentType: "application/json; charset=utf-8",
        error: function (xhr, status, errorThrown) {
            console.log("Error " + errorThrown);
            console.log("Status: " + status);
            console.log(xhr)
        },
        success: function(d){
            unfinishedDocs = d["unfinished_doc_list"];
            // let doc_index = Math.floor(Math.random() * unfinishedDocs.length);
            // let data = {"doc_id": doc_index};
            currentDocId = doc_index;
            getDocById(doc_index);
        }
    });

});

function docNext(){
    if(currentDocId < unfinishedDocs[unfinishedDocs.length - 1]){
        cleanDocContent();
        cleanRadioBtns();
        let temp = currentDocId + 1;
        while(temp < unfinishedDocs[unfinishedDocs.length - 1] && $.inArray(temp, unfinishedDocs) === -1){
            temp += 1;
        }
        currentDocId = temp;
        getDocById(currentDocId);
    }

    if(currentDocId === unfinishedDocs[unfinishedDocs.length - 1]){
        $("#doc-next").attr("disabled", "true");
    }
    if(currentDocId !== 1){
        $("#doc-previous").removeAttr("disabled");
    }

}

function docPre(){
    if(currentDocId > 1){
        cleanDocContent();
        cleanRadioBtns();
        let temp = currentDocId - 1;
        while(temp > 1 && $.inArray(temp, unfinishedDocs) === -1){
            temp -= 1;
        }
        currentDocId = temp;
        getDocById(currentDocId);
    }

    if(currentDocId === 1){
        $("#doc-previous").attr("disabled", "true");
    }
    if(currentDocId !== unfinishedDocs[unfinishedDocs.length - 1]){
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
        getAnnotationType(currentDocId, currentSentenceIndex);
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
        getAnnotationType(currentDocId, currentSentenceIndex);
    }
    if(currentSentenceIndex === 0){
        $("#pre-sentence").attr("disabled", "true");
    }
    if(currentSentenceIndex !== length - 1){
        $("#next-sentence").removeAttr("disabled");
    }
}

function getAnnotationType(doc_id, sentence_index){
    let sentenceData = {"doc_id": doc_id, "sentence_id": sentence_index};
    $.ajax({
        async: true,
        url: "http://10.141.221.75/getAnnotationByIndex/",
        type: "post",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(sentenceData),
        error: function (xhr, status, errorThrown) {
            console.log("Error " + errorThrown);
            console.log("Status: " + status);
            console.log(xhr)
        },
        success: function(d){
            let annotationType = d["annotation_type"];
            if (annotationType !== -1){
                let radioName = "#optionsRadios" + annotationType;
                $(radioName).prop("checked", true);
            }
        }
    });
}

function  getDocById(doc_id){
    let data = {"doc_id": doc_id};
    $.ajax({
        async: true,
        url: "http://10.141.221.75/getDocById/",
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
                getAnnotationType(d[0].doc_id, d[0].sentence_index)
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
        let key = currentDocId + "-" + currentSentenceIndex;
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
        let temp = {"doc_id": docId, "sentence_index": sentenceId, "text": text, "type": type};
        data.push(temp);
    });
    return data;
}

function saveTypeData(){
    let data = transformTypeDataToJson();
    $.ajax({
        async: true,
        url: "http://10.141.221.75/saveSentenceAnnotation/",
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