let docText = [];
let currentSentenceIndex = 0;
let currentDocId = 0;
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
            let unfinished_docs = d["unfinished_doc_list"];
            // let doc_index = Math.floor(Math.random() * unfinished_docs.length);
            let data = {"doc_id": doc_index};
            currentDocId = doc_index;
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
    });

});

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

function cleanRadioBtns(){
    for(let i = 0; i < 3; i++){
        let radioName = "#optionsRadios" + i;
        $(radioName).prop("checked", false);
    }
}