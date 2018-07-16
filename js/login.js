function login(){
    let name = $("input[class='form-control']").val();
    if(name !== ""){
        sessionStorage.setItem("username", name);
        window.location.href = "main_page.html";
    }else {
        alert("please input a non empty name");
    }
}