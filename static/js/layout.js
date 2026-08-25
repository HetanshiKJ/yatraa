document.addEventListener("DOMContentLoaded", ()=>{
    fetch("user_header.html")
    .then(response => response.text())
    .then(data =>{
        let header = document.getElementById("header-placeholder");
        console.log(header);        document.getElementById("header-placeholder").innerHTML = data;
    });
    fetch("user_footer.html")
    .then(response => response.text())
    .then(data =>{
        document.getElementById("footer-placeholder").innerHTML = data;
    });
})