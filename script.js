let menu = document.querySelector('#menu-bar');
let navbar = document.querySelector('.navbar');

menu.onclick = () =>{

    menu.classList.toggle('fa fa-bars');
    navbar.classList.toggle('active');
}

window.onscroll = () =>
{

    menu.classList.toggle('fa fa-bars');
    navbar.classList.toggle('active');
}