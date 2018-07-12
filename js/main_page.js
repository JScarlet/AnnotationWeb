$(document).ready(function () {
    let data = 1;
    $.ajax({
        async: true,
        url: "http://10.141.221.75/getDocById/",
        type: "post",
        contentType: "application/json; charset=utf-8",
        data: data,
        error: function (xhr, status, errorThrown) {
            console.log("Error " + errorThrown);
            console.log("Status: " + status);
            console.log(xhr)
        },
        success: function(d){
            
        }
    });
});